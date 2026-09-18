import React, { useEffect, useState } from 'react';
import TipoSituacaoDistribuicaoService from '../../services/TipoSituacaoDistribuicaoService';
import TipoSituacaoProcessoService from '../../services/TipoSituacaoProcessoService';
import { TipoSituacaoDistribuicao, TipoSituacaoProcesso } from '../../types';

type TipoCatalogo = 'processo' | 'distribuicao';
type Situacao = TipoSituacaoProcesso | TipoSituacaoDistribuicao;

interface SituacaoCatalogoProps {
  tipo: TipoCatalogo;
}

const SituacaoCatalogo: React.FC<SituacaoCatalogoProps> = ({ tipo }) => {
  const [dados, setDados] = useState<Situacao[]>([]);
  const [filtro, setFiltro] = useState('');
  const [formAberto, setFormAberto] = useState(false);
  const [editando, setEditando] = useState<Situacao | null>(null);
  const [nome, setNome] = useState('');
  const [situacaoFinal, setSituacaoFinal] = useState(false);
  const [carregando, setCarregando] = useState(false);

  const carregar = async (valor = filtro): Promise<void> => {
    setCarregando(true);
    try {
      setDados(tipo === 'processo'
        ? await TipoSituacaoProcessoService.listar(valor, false)
        : await TipoSituacaoDistribuicaoService.listar(valor, false));
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => { void carregar(''); }, [tipo]);

  const abrirNovo = (): void => {
    setEditando(null);
    setNome('');
    setSituacaoFinal(false);
    setFormAberto(true);
  };

  const abrirEdicao = (item: Situacao): void => {
    setEditando(item);
    setNome(tipo === 'processo'
      ? (item as TipoSituacaoProcesso).nmTipoSituacaoProcesso
      : (item as TipoSituacaoDistribuicao).nmTipoSituacaoDistribuicao);
    setSituacaoFinal(item.blSituacaoFinal === 'S');
    setFormAberto(true);
  };

  const salvar = async (): Promise<void> => {
    const nomeNormalizado = nome.trim();
    if (!nomeNormalizado) {
      window.alert('Informe o nome da situação.');
      return;
    }

    if (tipo === 'processo') {
      const dadosProcesso = { nmTipoSituacaoProcesso: nomeNormalizado, blSituacaoFinal: situacaoFinal ? 'S' : 'N' } as const;
      if (editando) await TipoSituacaoProcessoService.atualizar((editando as TipoSituacaoProcesso).idTipoSituacaoProcesso, dadosProcesso);
      else await TipoSituacaoProcessoService.cadastrar(dadosProcesso);
    } else {
      const dadosDistribuicao = { nmTipoSituacaoDistribuicao: nomeNormalizado, blSituacaoFinal: situacaoFinal ? 'S' : 'N' } as const;
      if (editando) await TipoSituacaoDistribuicaoService.atualizar((editando as TipoSituacaoDistribuicao).idTipoSituacaoDistribuicao, dadosDistribuicao);
      else await TipoSituacaoDistribuicaoService.cadastrar(dadosDistribuicao);
    }

    setFormAberto(false);
    setEditando(null);
    await carregar();
  };

  const desativar = async (item: Situacao): Promise<void> => {
    if (item.blAtivo !== 'S') return;
    if (tipo === 'processo') await TipoSituacaoProcessoService.desativar((item as TipoSituacaoProcesso).idTipoSituacaoProcesso);
    else await TipoSituacaoDistribuicaoService.desativar((item as TipoSituacaoDistribuicao).idTipoSituacaoDistribuicao);
    await carregar();
  };

  const nomeDaSituacao = (item: Situacao): string => tipo === 'processo'
    ? (item as TipoSituacaoProcesso).nmTipoSituacaoProcesso
    : (item as TipoSituacaoDistribuicao).nmTipoSituacaoDistribuicao;

  return (
    <div className="administracao-table-card">
      <div className="administracao-catalog-toolbar">
        <input className="administracao-form-input" type="search" value={filtro} onChange={(event) => setFiltro(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') void carregar(); }} placeholder="Pesquisar situação" />
        <button type="button" className="administracao-button administracao-button--secondary" onClick={() => void carregar()}>Pesquisar</button>
        <button type="button" className="administracao-button administracao-button--primary" onClick={abrirNovo}>+ Nova situação</button>
      </div>
      {formAberto && (
        <div className="administracao-form-card administracao-form-card--inline">
          <div className="administracao-form-header">
            <div><p className="administracao-form-subtitle">Catálogo de situações</p><h2>{editando ? 'Editar situação' : 'Cadastrar situação'}</h2></div>
            <button type="button" className="administracao-icon-button" onClick={() => setFormAberto(false)}>Cancelar</button>
          </div>
          <div className="administracao-form-grid">
            <div className="administracao-form-row"><label className="administracao-form-label" htmlFor={`nome-situacao-${tipo}`}>Nome</label><input id={`nome-situacao-${tipo}`} className="administracao-form-input" maxLength={150} value={nome} onChange={(event) => setNome(event.target.value)} /></div>
          </div>
          <div className="administracao-form-actions"><button type="button" className="administracao-button administracao-button--secondary" onClick={() => setFormAberto(false)}>Cancelar</button><button type="button" className="administracao-button administracao-button--primary" onClick={() => void salvar()}>Salvar</button></div>
        </div>
      )}
      <table className="administracao-table">
        <thead><tr><th>Nome</th><th>Situação final?</th><th>Status</th><th>Ações</th></tr></thead>
        <tbody>
          {carregando ? <tr><td colSpan={4}>Carregando situações...</td></tr> : dados.length === 0 ? <tr><td colSpan={4}>Nenhuma situação encontrada.</td></tr> : dados.map((item) => (
            <tr key={tipo === 'processo' ? (item as TipoSituacaoProcesso).idTipoSituacaoProcesso : (item as TipoSituacaoDistribuicao).idTipoSituacaoDistribuicao}>
              <td><strong>{nomeDaSituacao(item)}</strong></td>
              <td>{item.blSituacaoFinal === 'S' ? 'Sim' : 'Não'}</td>
              <td><span className={`administracao-status administracao-status--${item.blAtivo === 'S' ? 'ativo' : 'inativo'}`}>{item.blAtivo === 'S' ? 'Ativo' : 'Inativo'}</span></td>
              <td className="administracao-actions-cell"><button type="button" className="administracao-icon-button" onClick={() => abrirEdicao(item)}>Editar</button><button type="button" className="administracao-icon-button administracao-icon-button--danger" disabled={item.blAtivo !== 'S'} onClick={() => void desativar(item)}>{item.blAtivo === 'S' ? 'Inativar' : 'Inativo'}</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SituacaoCatalogo;

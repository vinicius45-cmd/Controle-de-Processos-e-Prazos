import React, { useEffect, useState } from 'react';
import UnidadeHierarquiaService from '../../services/UnidadeHierarquiaService';
import UnidadeService from '../../services/UnidadeService';
import { Unidade, UnidadeHierarquia } from '../../types';

const hoje = (): string => new Date().toISOString().slice(0, 10);

const HierarquiaCatalogo: React.FC = () => {
  const [unidades, setUnidades] = useState<Unidade[]>([]);
  const [unidadeSelecionada, setUnidadeSelecionada] = useState<number | null>(null);
  const [historico, setHistorico] = useState<UnidadeHierarquia[]>([]);
  const [vigente, setVigente] = useState<UnidadeHierarquia | null>(null);
  const [formAberto, setFormAberto] = useState(false);
  const [superior, setSuperior] = useState<number | null>(null);
  const [inicio, setInicio] = useState(hoje());
  const [carregando, setCarregando] = useState(false);
  const [hierarquiasVigentes, setHierarquiasVigentes] = useState<UnidadeHierarquia[]>([]);

  const carregarUnidades = async (): Promise<void> => {
    const [listaUnidades, listaHierarquias] = await Promise.all([
      UnidadeService.listar('', false),
      UnidadeHierarquiaService.listarVigentes()
    ]);
    setUnidades(listaUnidades);
    setHierarquiasVigentes(listaHierarquias);
  };

  const carregarHistorico = async (idUnidade: number): Promise<void> => {
    setCarregando(true);
    try {
      const [historicoAtual, vigentes] = await Promise.all([
        UnidadeHierarquiaService.historicoDaUnidade(idUnidade),
        UnidadeHierarquiaService.vigentesDaUnidade(idUnidade)
      ]);
      setHistorico(historicoAtual);
      setVigente(vigentes[0] ?? null);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => { void carregarUnidades(); }, []);
  useEffect(() => {
    if (unidadeSelecionada) void carregarHistorico(unidadeSelecionada);
    else {
      setHistorico([]);
      setVigente(null);
    }
  }, [unidadeSelecionada]);

  const abrirNovoVinculo = (): void => {
    setSuperior(vigente?.idUnidadeSuperior ?? null);
    setInicio(hoje());
    setFormAberto(true);
  };

  const salvarVinculo = async (): Promise<void> => {
    if (!unidadeSelecionada || !inicio) return;
    if (vigente && vigente.idUnidadeSuperior === superior) {
      window.alert('A unidade já possui este vínculo vigente.');
      return;
    }
    if (vigente && inicio <= vigente.dtInicioVigencia) {
      window.alert('O início do novo vínculo deve ser posterior ao início do vínculo vigente.');
      return;
    }
    await UnidadeHierarquiaService.cadastrar({ idUnidade: unidadeSelecionada, idUnidadeSuperior: superior, dtInicioVigencia: inicio });
    setFormAberto(false);
    await carregarUnidades();
    await carregarHistorico(unidadeSelecionada);
  };

  const encerrarVinculo = async (): Promise<void> => {
    if (!vigente) return;
    const fim = window.prompt('Informe a data final da vigência (AAAA-MM-DD):', hoje());
    if (!fim) return;
    if (fim < vigente.dtInicioVigencia) {
      window.alert('A data final não pode ser anterior ao início da vigência.');
      return;
    }
    await UnidadeHierarquiaService.encerrar(vigente.idUnidadeHierarquia, fim);
    await carregarUnidades();
    await carregarHistorico(unidadeSelecionada as number);
  };

  const nomeUnidade = (id: number | null | undefined): string => {
    if (!id) return 'Nenhuma (unidade raiz)';
    const unidade = unidades.find((item) => item.idUnidade === id);
    return unidade ? `${unidade.sgUnidade} - ${unidade.nmUnidade}` : `Unidade ${id}`;
  };

  const filhosDe = (idUnidadeSuperior: number | null): Unidade[] => hierarquiasVigentes
    .filter((item) => (item.idUnidadeSuperior ?? null) === idUnidadeSuperior)
    .map((item) => unidades.find((unidade) => unidade.idUnidade === item.idUnidade))
    .filter((unidade): unidade is Unidade => Boolean(unidade && unidade.blAtivo === 'S'));

  const renderArvore = (idUnidadeSuperior: number | null, nivel = 0): React.ReactNode => filhosDe(idUnidadeSuperior).map((unidade) => (
    <li key={unidade.idUnidade} style={{ marginLeft: `${nivel * 1.25}rem` }}>
      <strong>{unidade.sgUnidade}</strong> - {unidade.nmUnidade}
      {filhosDe(unidade.idUnidade).length > 0 && <ul>{renderArvore(unidade.idUnidade, nivel + 1)}</ul>}
    </li>
  ));

  return (
    <div className="administracao-table-card">
      <div className="administracao-catalog-toolbar">
        <label className="administracao-form-label" htmlFor="unidade-hierarquia">Unidade</label>
        <select id="unidade-hierarquia" className="administracao-form-select" value={unidadeSelecionada ?? ''} onChange={(event) => setUnidadeSelecionada(event.target.value ? Number(event.target.value) : null)}>
          <option value="">Selecione uma unidade</option>
          {unidades.map((unidade) => <option key={unidade.idUnidade} value={unidade.idUnidade}>{unidade.sgUnidade} - {unidade.nmUnidade}</option>)}
        </select>
        {unidadeSelecionada && <button type="button" className="administracao-button administracao-button--primary" onClick={abrirNovoVinculo}>+ Novo vínculo</button>}
      </div>

      {unidadeSelecionada && (
        <>
          <div className="administracao-form-card administracao-form-card--inline">
            <div className="administracao-form-header"><div><p className="administracao-form-subtitle">Hierarquia atual</p><h2>{nomeUnidade(unidadeSelecionada)}</h2></div>{vigente && <button type="button" className="administracao-icon-button administracao-icon-button--danger" onClick={() => void encerrarVinculo()}>Encerrar vigência</button>}</div>
            {carregando ? <p>Carregando hierarquia...</p> : <p>Unidade superior: <strong>{nomeUnidade(vigente?.idUnidadeSuperior)}</strong> {vigente ? `desde ${vigente.dtInicioVigencia}` : ' (unidade raiz)'}</p>}
          </div>

          {formAberto && <div className="administracao-form-card administracao-form-card--inline"><div className="administracao-form-header"><div><p className="administracao-form-subtitle">Novo vínculo histórico</p><h2>Definir unidade superior</h2></div><button type="button" className="administracao-icon-button" onClick={() => setFormAberto(false)}>Cancelar</button></div><div className="administracao-form-grid"><div className="administracao-form-row"><label className="administracao-form-label" htmlFor="nova-unidade-superior">Unidade superior</label><select id="nova-unidade-superior" className="administracao-form-select" value={superior ?? ''} onChange={(event) => setSuperior(event.target.value ? Number(event.target.value) : null)}><option value="">Nenhuma (unidade raiz)</option>{unidades.filter((item) => item.blAtivo === 'S' && item.idUnidade !== unidadeSelecionada).map((item) => <option key={item.idUnidade} value={item.idUnidade}>{item.sgUnidade} - {item.nmUnidade}</option>)}</select></div><div className="administracao-form-row"><label className="administracao-form-label" htmlFor="inicio-vigencia">Início da vigência</label><input id="inicio-vigencia" className="administracao-form-input" type="date" value={inicio} onChange={(event) => setInicio(event.target.value)} /></div></div><div className="administracao-form-actions"><button type="button" className="administracao-button administracao-button--secondary" onClick={() => setFormAberto(false)}>Cancelar</button><button type="button" className="administracao-button administracao-button--primary" onClick={() => void salvarVinculo()}>Criar vínculo</button></div></div>}

          <h2 className="administracao-form-subtitle">Histórico</h2>
          <table className="administracao-table"><thead><tr><th>Unidade superior</th><th>Início</th><th>Fim</th><th>Situação</th></tr></thead><tbody>{historico.length === 0 ? <tr><td colSpan={4}>Nenhum vínculo cadastrado.</td></tr> : historico.map((item) => <tr key={item.idUnidadeHierarquia}><td>{nomeUnidade(item.idUnidadeSuperior)}</td><td>{item.dtInicioVigencia}</td><td>{item.dtFimVigencia ?? '-'}</td><td>{item.blVigente === 'S' ? 'Vigente' : 'Encerrada'}</td></tr>)}</tbody></table>
        </>
      )}

      <div className="administracao-form-card administracao-form-card--inline">
        <div className="administracao-form-header"><div><p className="administracao-form-subtitle">Estrutura organizacional</p><h2>Árvore vigente</h2></div></div>
        {unidades.length === 0 ? <p>Nenhuma unidade disponível.</p> : <ul>{renderArvore(null)}</ul>}
      </div>
    </div>
  );
};

export default HierarquiaCatalogo;

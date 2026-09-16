import React, { useEffect, useState } from 'react';
import DistribuicaoSituacaoService from '../../services/DistribuicaoSituacaoService';
import ProcessoDistribuicaoService from '../../services/ProcessoDistribuicaoService';
import ProcessoSituacaoService from '../../services/ProcessoSituacaoService';
import TipoSituacaoDistribuicaoService from '../../services/TipoSituacaoDistribuicaoService';
import TipoSituacaoProcessoService from '../../services/TipoSituacaoProcessoService';
import UnidadeService from '../../services/UnidadeService';
import { DistribuicaoSituacao, ProcessoDistribuicao, ProcessoSituacao, TipoSituacaoDistribuicao, TipoSituacaoProcesso, Unidade } from '../../types';

interface HistoricoProcessoProps {
  idProcesso: number | string;
  aba: 'historico' | 'movimentacoes';
}

const HistoricoProcesso: React.FC<HistoricoProcessoProps> = ({ idProcesso, aba }) => {
  const [situacoes, setSituacoes] = useState<ProcessoSituacao[]>([]);
  const [distribuicoes, setDistribuicoes] = useState<ProcessoDistribuicao[]>([]);
  const [situacoesDistribuicao, setSituacoesDistribuicao] = useState<DistribuicaoSituacao[]>([]);
  const [tiposProcesso, setTiposProcesso] = useState<TipoSituacaoProcesso[]>([]);
  const [tiposDistribuicao, setTiposDistribuicao] = useState<TipoSituacaoDistribuicao[]>([]);
  const [unidades, setUnidades] = useState<Unidade[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [novoTipoProcesso, setNovoTipoProcesso] = useState<number | null>(null);
  const [novaDataProcesso, setNovaDataProcesso] = useState(new Date().toISOString().slice(0, 10));
  const [novaUnidade, setNovaUnidade] = useState<number | null>(null);
  const [novaDataDistribuicao, setNovaDataDistribuicao] = useState(new Date().toISOString().slice(0, 10));
  const [novoTipoDistribuicao, setNovoTipoDistribuicao] = useState<number | null>(null);

  useEffect(() => {
    let ativo = true;
    const carregar = async (): Promise<void> => {
      setCarregando(true);
      const [historico, listaDistribuicoes, listaTiposProcesso, listaTiposDistribuicao, listaUnidades] = await Promise.all([
        ProcessoSituacaoService.listarPorProcesso(idProcesso),
        ProcessoDistribuicaoService.listarPorProcesso(idProcesso),
        TipoSituacaoProcessoService.listar('', false),
        TipoSituacaoDistribuicaoService.listar('', false),
        UnidadeService.listar('', false)
      ]);
      const detalhesDistribuicoes = await Promise.all(listaDistribuicoes.map((item) => DistribuicaoSituacaoService.listarPorDistribuicao(item.idDistribuicao)));
      if (!ativo) return;
      setSituacoes(historico);
      setDistribuicoes(listaDistribuicoes);
      setSituacoesDistribuicao(detalhesDistribuicoes.flat());
      setTiposProcesso(listaTiposProcesso);
      setTiposDistribuicao(listaTiposDistribuicao);
      setUnidades(listaUnidades);
      setCarregando(false);
    };
    void carregar();
    return () => { ativo = false; };
  }, [idProcesso]);

  if (carregando) return <div className="detalhes-processo__placeholder"><p>Carregando histórico...</p></div>;

  const nomeSituacaoProcesso = (id: number): string => tiposProcesso.find((item) => item.idTipoSituacaoProcesso === id)?.nmTipoSituacaoProcesso ?? `Situação ${id}`;
  const nomeSituacaoDistribuicao = (id: number): string => tiposDistribuicao.find((item) => item.idTipoSituacaoDistribuicao === id)?.nmTipoSituacaoDistribuicao ?? `Situação ${id}`;
  const nomeUnidade = (id: number): string => unidades.find((item) => item.idUnidade === id)?.sgUnidade ?? `Unidade ${id}`;

  const registrarSituacaoProcesso = async (): Promise<void> => {
    if (!novoTipoProcesso || !novaDataProcesso) return;
    const anterior = situacoes.find((item) => !item.dtFim);
    const nova = await ProcessoSituacaoService.cadastrar({ idProcesso, idTipoSituacaoProcesso: novoTipoProcesso, dtInicio: novaDataProcesso });
    setSituacoes((atual) => [...atual.map((item) => item.idProcessoSituacao === anterior?.idProcessoSituacao ? { ...item, dtFim: novaDataProcesso } : item), nova]);
    setNovoTipoProcesso(null);
  };

  const registrarDistribuicao = async (): Promise<void> => {
    if (!novaUnidade || !novoTipoDistribuicao || !novaDataDistribuicao) return;
    const nova = await ProcessoDistribuicaoService.cadastrar({ idProcesso, idUnidade: novaUnidade, dtDistribuicao: novaDataDistribuicao });
    await DistribuicaoSituacaoService.cadastrar({ idDistribuicao: nova.idDistribuicao, idTipoSituacaoDistribuicao: novoTipoDistribuicao, dtInicio: novaDataDistribuicao });
    setDistribuicoes((atual) => [...atual, nova]);
    setSituacoesDistribuicao((atual) => [...atual, { idDistribuicaoSituacao: Date.now(), idDistribuicao: nova.idDistribuicao, idTipoSituacaoDistribuicao: novoTipoDistribuicao, dtInicio: novaDataDistribuicao, dtFim: null }]);
    setNovaUnidade(null);
    setNovoTipoDistribuicao(null);
  };

  if (aba === 'historico') {
    return <div className="detalhes-processo__placeholder"><h3>Histórico de situações</h3><div className="administracao-catalog-toolbar"><select className="administracao-form-select" value={novoTipoProcesso ?? ''} onChange={(event) => setNovoTipoProcesso(event.target.value ? Number(event.target.value) : null)}><option value="">Nova situação</option>{tiposProcesso.filter((item) => item.blAtivo === 'S').map((item) => <option key={item.idTipoSituacaoProcesso} value={item.idTipoSituacaoProcesso}>{item.nmTipoSituacaoProcesso}</option>)}</select><input className="administracao-form-input" type="date" value={novaDataProcesso} onChange={(event) => setNovaDataProcesso(event.target.value)} /><button type="button" className="administracao-button administracao-button--primary" onClick={() => void registrarSituacaoProcesso()}>Registrar situação</button></div><table className="administracao-table"><thead><tr><th>Situação</th><th>Início</th><th>Fim</th><th>Observação</th></tr></thead><tbody>{situacoes.length === 0 ? <tr><td colSpan={4}>Nenhuma situação registrada.</td></tr> : situacoes.map((item) => <tr key={item.idProcessoSituacao}><td>{nomeSituacaoProcesso(item.idTipoSituacaoProcesso)}</td><td>{item.dtInicio}</td><td>{item.dtFim ?? 'Vigente'}</td><td>{item.dsObservacao ?? '-'}</td></tr>)}</tbody></table></div>;
  }

  return <div className="detalhes-processo__placeholder"><h3>Distribuições do processo</h3><div className="administracao-catalog-toolbar"><select className="administracao-form-select" value={novaUnidade ?? ''} onChange={(event) => setNovaUnidade(event.target.value ? Number(event.target.value) : null)}><option value="">Unidade destinatária</option>{unidades.filter((item) => item.blAtivo === 'S').map((item) => <option key={item.idUnidade} value={item.idUnidade}>{item.sgUnidade} - {item.nmUnidade}</option>)}</select><select className="administracao-form-select" value={novoTipoDistribuicao ?? ''} onChange={(event) => setNovoTipoDistribuicao(event.target.value ? Number(event.target.value) : null)}><option value="">Situação inicial</option>{tiposDistribuicao.filter((item) => item.blAtivo === 'S').map((item) => <option key={item.idTipoSituacaoDistribuicao} value={item.idTipoSituacaoDistribuicao}>{item.nmTipoSituacaoDistribuicao}</option>)}</select><input className="administracao-form-input" type="date" value={novaDataDistribuicao} onChange={(event) => setNovaDataDistribuicao(event.target.value)} /><button type="button" className="administracao-button administracao-button--primary" onClick={() => void registrarDistribuicao()}>Distribuir</button></div><table className="administracao-table"><thead><tr><th>Unidade</th><th>Distribuição</th><th>Recebimento</th><th>Situação atual</th></tr></thead><tbody>{distribuicoes.length === 0 ? <tr><td colSpan={4}>Nenhuma distribuição registrada.</td></tr> : distribuicoes.map((item) => { const historico = situacoesDistribuicao.filter((situacao) => situacao.idDistribuicao === item.idDistribuicao); const atual = historico.find((situacao) => !situacao.dtFim) ?? historico[historico.length - 1]; return <tr key={item.idDistribuicao}><td>{nomeUnidade(item.idUnidade)}</td><td>{item.dtDistribuicao}</td><td>{item.dtRecebimento ?? '-'}</td><td>{atual ? nomeSituacaoDistribuicao(atual.idTipoSituacaoDistribuicao) : '-'}</td></tr>; })}</tbody></table></div>;
};

export default HistoricoProcesso;

import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, Clock3, Eye, MoreVertical, Plus, Users, X } from 'lucide-react';
import ProcessoDistribuicaoService from '../../services/ProcessoDistribuicaoService';
import DistribuicaoSituacaoService from '../../services/DistribuicaoSituacaoService';
import TipoSituacaoDistribuicaoService from '../../services/TipoSituacaoDistribuicaoService';
import UnidadeService from '../../services/UnidadeService';
import { DistribuicaoSituacao, ProcessoDistribuicao, TipoSituacaoDistribuicao, Unidade } from '../../types';

interface LinhaDistribuicao {
  id: number;
  idDistribuicao?: number;
  unidade: string;
  distribuidoEm: string;
  prazo: string;
  situacao: string;
  situacaoTipo: 'concluido' | 'aguardando' | 'acompanhamento';
  retorno: string;
  controle: string;
}

const distribuicoesIniciais: LinhaDistribuicao[] = [
  { id: 1, unidade: 'AJL', distribuidoEm: '29/08/2026', prazo: '01/09/2026', situacao: 'Concluído', situacaoTipo: 'concluido', retorno: '01/09/2026', controle: 'Respondido' },
  { id: 2, unidade: 'SUOP', distribuidoEm: '29/08/2026', prazo: '02/09/2026', situacao: 'Aguardando retorno', situacaoTipo: 'aguardando', retorno: '—', controle: 'Atrasado' },
  { id: 3, unidade: 'SUFISA', distribuidoEm: '30/08/2026', prazo: '04/09/2026', situacao: 'Em acompanhamento', situacaoTipo: 'acompanhamento', retorno: '—', controle: '2 dias' }
];

interface DistribuicoesProcessoProps {
  idProcesso: number | string;
}

const formatarData = (valor?: string | null): string => {
  if (!valor) return '—';
  const data = new Date(valor);
  return Number.isNaN(data.getTime()) ? valor : data.toLocaleDateString('pt-BR');
};

const DistribuicoesProcesso: React.FC<DistribuicoesProcessoProps> = ({ idProcesso }) => {
  const [linhas, setLinhas] = useState<LinhaDistribuicao[]>(distribuicoesIniciais);
  const [unidades, setUnidades] = useState<Unidade[]>([]);
  const [tiposSituacao, setTiposSituacao] = useState<TipoSituacaoDistribuicao[]>([]);
  const [selecionada, setSelecionada] = useState<LinhaDistribuicao>(distribuicoesIniciais[1]);
  const [mostrarCadastro, setMostrarCadastro] = useState(false);
  const [novaUnidade, setNovaUnidade] = useState('');
  const [novoPrazo, setNovoPrazo] = useState('');
  const [novaSituacao, setNovaSituacao] = useState('');

  useEffect(() => {
    let ativo = true;
    const carregar = async (): Promise<void> => {
      try {
        const [distribuicoes, listaUnidades, listaTipos] = await Promise.all([
          ProcessoDistribuicaoService.listarPorProcesso(idProcesso),
          UnidadeService.listar('', false),
          TipoSituacaoDistribuicaoService.listar('', false)
        ]);
        if (!ativo) return;
        setUnidades(listaUnidades);
        setTiposSituacao(listaTipos);
        if (distribuicoes.length === 0) return;
        const carregadas = await Promise.all(distribuicoes.map(async (item): Promise<LinhaDistribuicao> => {
          const historico = await DistribuicaoSituacaoService.listarPorDistribuicao(item.idDistribuicao);
          const atual = historico.find((situacao) => !situacao.dtFim) ?? historico[historico.length - 1];
          const unidade = listaUnidades.find((itemUnidade) => itemUnidade.idUnidade === item.idUnidade);
          const nomeSituacao = listaTipos.find((tipo) => tipo.idTipoSituacaoDistribuicao === atual?.idTipoSituacaoDistribuicao)?.nmTipoSituacaoDistribuicao ?? 'Aguardando retorno';
          const tipo = nomeSituacao.toLowerCase().includes('concl') ? 'concluido' : nomeSituacao.toLowerCase().includes('acompan') ? 'acompanhamento' : 'aguardando';
          return { id: item.idDistribuicao, idDistribuicao: item.idDistribuicao, unidade: unidade?.sgUnidade ?? `Unidade ${item.idUnidade}`, distribuidoEm: formatarData(item.dtDistribuicao), prazo: formatarData(item.dtConclusao), situacao: nomeSituacao, situacaoTipo: tipo, retorno: formatarData(item.dtRecebimento), controle: tipo === 'concluido' ? 'Respondido' : 'Atrasado' };
        }));
        setLinhas(carregadas);
        setSelecionada(carregadas[0]);
      } catch {
        if (ativo) setLinhas(distribuicoesIniciais);
      }
    };
    void carregar();
    return () => { ativo = false; };
  }, [idProcesso]);

  const resumo = useMemo(() => ({
    total: linhas.length,
    respondidas: linhas.filter((linha) => linha.situacaoTipo === 'concluido').length,
    pendentes: linhas.filter((linha) => linha.situacaoTipo !== 'concluido').length,
    atrasadas: linhas.filter((linha) => linha.controle === 'Atrasado').length
  }), [linhas]);

  const registrarDistribuicao = (): void => {
    if (!novaUnidade) return;
    const nova: LinhaDistribuicao = {
      id: Date.now(),
      unidade: novaUnidade,
      distribuidoEm: new Date().toLocaleDateString('pt-BR'),
      prazo: novoPrazo ? formatarData(novoPrazo) : '—',
      situacao: novaSituacao || 'Aguardando retorno',
      situacaoTipo: 'aguardando',
      retorno: '—',
      controle: 'Pendente'
    };
    setLinhas((atual) => [...atual, nova]);
    setSelecionada(nova);
    setMostrarCadastro(false);
    setNovaUnidade('');
    setNovoPrazo('');
    setNovaSituacao('');
  };

  return (
    <section className="distribuicoes-processo" aria-label="Distribuições do processo">
      <div className="distribuicoes-processo__toolbar">
        <div className="distribuicoes-processo__metrics">
          <div><Users size={18} /><strong>{resumo.total}</strong><span>unidades acionadas</span></div>
          <div><CheckCircle2 size={18} /><strong>{resumo.respondidas}</strong><span>respondeu</span></div>
          <div><Clock3 size={18} /><strong>{resumo.pendentes}</strong><span>pendentes</span></div>
          <div><AlertTriangle size={18} /><strong>{resumo.atrasadas}</strong><span>atrasada</span></div>
        </div>
        <button type="button" className="distribuicoes-processo__add" onClick={() => setMostrarCadastro((atual) => !atual)}><Plus size={15} /> Registrar distribuição</button>
      </div>

      {mostrarCadastro && (
        <div className="distribuicoes-processo__register">
          <select value={novaUnidade} onChange={(event) => setNovaUnidade(event.target.value)}>
            <option value="">Unidade</option>
            {unidades.map((unidade) => <option key={unidade.idUnidade} value={unidade.sgUnidade}>{unidade.sgUnidade} - {unidade.nmUnidade}</option>)}
          </select>
          <input type="date" value={novoPrazo} onChange={(event) => setNovoPrazo(event.target.value)} />
          <select value={novaSituacao} onChange={(event) => setNovaSituacao(event.target.value)}>
            <option value="">Situação inicial</option>
            {tiposSituacao.map((tipo) => <option key={tipo.idTipoSituacaoDistribuicao} value={tipo.nmTipoSituacaoDistribuicao}>{tipo.nmTipoSituacaoDistribuicao}</option>)}
          </select>
          <button type="button" onClick={registrarDistribuicao}>Registrar</button>
          <button type="button" aria-label="Cancelar registro" onClick={() => setMostrarCadastro(false)}><X size={15} /></button>
        </div>
      )}

      <div className="distribuicoes-processo__body">
        <div className="distribuicoes-processo__table-wrap">
          <table className="distribuicoes-processo__table">
            <thead><tr><th>Unidade</th><th>Distribuído em</th><th>Prazo</th><th>Situação</th><th>Retorno</th><th>Controle</th><th /></tr></thead>
            <tbody>{linhas.map((linha) => (
              <tr key={linha.id} className={selecionada.id === linha.id ? 'is-selected' : ''} onClick={() => setSelecionada(linha)}>
                <td><button type="button" className="distribuicoes-processo__unit-link" onClick={() => setSelecionada(linha)}>{linha.unidade}</button></td>
                <td>{linha.distribuidoEm}</td><td>{linha.prazo}</td>
                <td><span className={`distribuicoes-processo__status distribuicoes-processo__status--${linha.situacaoTipo}`}>{linha.situacao}</span></td>
                <td>{linha.retorno}</td>
                <td><span className={`distribuicoes-processo__control distribuicoes-processo__control--${linha.controle === 'Respondido' ? 'ok' : linha.controle === 'Atrasado' ? 'late' : 'pending'}`}>{linha.controle}</span></td>
                <td><button type="button" className="distribuicoes-processo__row-action" aria-label="Mais ações"><MoreVertical size={16} /></button></td>
              </tr>
            ))}</tbody>
          </table>
          <div className="distribuicoes-processo__note"><Eye size={15} /> Clique em uma unidade para ver detalhes e atualizar a situação.</div>
        </div>

        <aside className="distribuicoes-processo__details">
          <button type="button" className="distribuicoes-processo__details-close" aria-label="Fechar detalhes"><X size={15} /></button>
          <h3>{selecionada.unidade}</h3>
          <dl>
            <dt>Distribuído em</dt><dd>{selecionada.distribuidoEm}</dd>
            <dt>Prazo da unidade</dt><dd>{selecionada.prazo}</dd>
            <dt>Recebimento</dt><dd>{selecionada.retorno}</dd>
            <dt>Conclusão</dt><dd>{selecionada.situacaoTipo === 'concluido' ? selecionada.retorno : '—'}</dd>
          </dl>
          <div className="distribuicoes-processo__details-section"><strong>SITUAÇÃO ATUAL</strong><span className={`distribuicoes-processo__status distribuicoes-processo__status--${selecionada.situacaoTipo}`}>{selecionada.situacao}</span></div>
          <div className="distribuicoes-processo__details-alert"><AlertTriangle size={14} /> Prazo da unidade vencido há 1 dia</div>
          <div className="distribuicoes-processo__details-section"><strong>Ações</strong><div className="distribuicoes-processo__details-actions"><button type="button">Editar dados</button><button type="button">Atualizar situação</button></div></div>
          <div className="distribuicoes-processo__details-section"><strong>Histórico</strong><ol><li><b>{selecionada.prazo}</b><span>{selecionada.situacao.toUpperCase()}</span><small>Maria Silva</small></li><li><b>{selecionada.distribuidoEm}</b><span>PENDENTE</span><small>Maria Silva</small></li></ol></div>
        </aside>
      </div>
    </section>
  );
};

export default DistribuicoesProcesso;

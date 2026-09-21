import { api } from '../config/api';
import { localMockProcessosSituacoes } from '../config/mock';
import { ProcessoSituacao } from '../types';

type DadosSituacao = Pick<ProcessoSituacao, 'idProcesso' | 'idTipoSituacaoProcesso' | 'dtInicio' | 'dsObservacao'>;

export const ProcessoSituacaoService = {
  async listarPorProcesso(idProcesso: number | string): Promise<ProcessoSituacao[]> {
    try {
      const { data } = await api.get<ProcessoSituacao[]>(`/processos-situacoes/processo/${idProcesso}`);
      return data;
    } catch {
      return localMockProcessosSituacoes.filter((item) => String(item.idProcesso) === String(idProcesso));
    }
  },

  async cadastrar(dados: DadosSituacao): Promise<ProcessoSituacao> {
    try {
      const { data } = await api.post<ProcessoSituacao>('/processos-situacoes', dados);
      return data;
    } catch {
      const anterior = localMockProcessosSituacoes.find((item) => String(item.idProcesso) === String(dados.idProcesso) && !item.dtFim);
      if (anterior) anterior.dtFim = dados.dtInicio;
      const item: ProcessoSituacao = {
        idProcessoSituacao: Math.max(...localMockProcessosSituacoes.map((value) => value.idProcessoSituacao), 0) + 1,
        ...dados,
        dtFim: null
      };
      localMockProcessosSituacoes.push(item);
      return item;
    }
  }
};

export default ProcessoSituacaoService;

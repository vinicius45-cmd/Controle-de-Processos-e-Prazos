import { api, isMockApi } from '../config/api';
import { localMockProcessosSituacoes } from '../config/mock';
import { ProcessoSituacao } from '../types';

type DadosSituacao = Pick<ProcessoSituacao, 'idProcesso' | 'idTipoSituacaoProcesso' | 'dtInicio' | 'dsObservacao'>;

export const ProcessoSituacaoService = {
  async listarPorProcesso(idProcesso: number | string): Promise<ProcessoSituacao[]> {
    try {
      const { data } = await api.get<ProcessoSituacao[]>(`/processos-situacoes/processo/${idProcesso}`);
      return data;
    } catch (error) {
      if (!isMockApi) throw error;
      return localMockProcessosSituacoes.filter((item) => String(item.idProcesso) === String(idProcesso));
    }
  },

  async buscar(idProcessoSituacao: number | string): Promise<ProcessoSituacao> {
    try {
      const { data } = await api.get<ProcessoSituacao>(`/processos-situacoes/${idProcessoSituacao}`);
      return data;
    } catch (error) {
      if (!isMockApi) throw error;
      const item = localMockProcessosSituacoes.find((value) => String(value.idProcessoSituacao) === String(idProcessoSituacao));
      if (!item) throw new Error('Situação de processo não encontrada');
      return item;
    }
  },

  async atual(idProcesso: number | string): Promise<ProcessoSituacao> {
    try {
      const { data } = await api.get<ProcessoSituacao>(`/processos-situacoes/processo/${idProcesso}/atual`);
      return data;
    } catch (error) {
      if (!isMockApi) throw error;
      const item = localMockProcessosSituacoes.find((value) => String(value.idProcesso) === String(idProcesso) && !value.dtFim);
      if (!item) throw new Error('Situação atual do processo não encontrada');
      return item;
    }
  },

  async cadastrar(dados: DadosSituacao): Promise<ProcessoSituacao> {
    try {
      const { data } = await api.post<ProcessoSituacao>('/processos-situacoes', dados);
      return data;
    } catch (error) {
      if (!isMockApi) throw error;
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

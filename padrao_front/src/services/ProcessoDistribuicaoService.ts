import { api, isMockApi } from '../config/api';
import { localMockProcessosDistribuicoes } from '../config/mock';
import { ProcessoDistribuicao } from '../types';

type DadosDistribuicao = Pick<ProcessoDistribuicao, 'idProcesso' | 'idUnidade' | 'dtDistribuicao' | 'dsObservacao'>;

export const ProcessoDistribuicaoService = {
  async listarPorProcesso(idProcesso: number | string): Promise<ProcessoDistribuicao[]> {
    try {
      const { data } = await api.get<ProcessoDistribuicao[]>(`/processos-distribuicoes/processo/${idProcesso}`);
      return data;
    } catch (error) {
      if (!isMockApi) throw error;
      return localMockProcessosDistribuicoes.filter((item) => String(item.idProcesso) === String(idProcesso));
    }
  },

  async listarPendentes(idUnidade: number): Promise<ProcessoDistribuicao[]> {
    try {
      const { data } = await api.get<ProcessoDistribuicao[]>(`/processos-distribuicoes/unidade/${idUnidade}/pendentes`);
      return data;
    } catch (error) {
      if (!isMockApi) throw error;
      return localMockProcessosDistribuicoes.filter((item) => item.idUnidade === idUnidade && !item.dtConclusao);
    }
  },

  async buscar(idDistribuicao: number | string): Promise<ProcessoDistribuicao> {
    try {
      const { data } = await api.get<ProcessoDistribuicao>(`/processos-distribuicoes/${idDistribuicao}`);
      return data;
    } catch (error) {
      if (!isMockApi) throw error;
      const item = localMockProcessosDistribuicoes.find((value) => String(value.idDistribuicao) === String(idDistribuicao));
      if (!item) throw new Error('Distribuição não encontrada');
      return item;
    }
  },

  async cadastrar(dados: DadosDistribuicao): Promise<ProcessoDistribuicao> {
    try {
      const { data } = await api.post<ProcessoDistribuicao>('/processos-distribuicoes', dados);
      return data;
    } catch (error) {
      if (!isMockApi) throw error;
      const item: ProcessoDistribuicao = {
        idDistribuicao: Math.max(...localMockProcessosDistribuicoes.map((value) => value.idDistribuicao), 0) + 1,
        ...dados,
        dtRecebimento: null,
        dtConclusao: null
      };
      localMockProcessosDistribuicoes.push(item);
      return item;
    }
  },

  async atualizar(idDistribuicao: number | string, dados: Partial<DadosDistribuicao>): Promise<ProcessoDistribuicao> {
    try {
      const { data } = await api.patch<ProcessoDistribuicao>(`/processos-distribuicoes/${idDistribuicao}`, dados);
      return data;
    } catch (error) {
      if (!isMockApi) throw error;
      const item = localMockProcessosDistribuicoes.find((value) => String(value.idDistribuicao) === String(idDistribuicao));
      if (!item) throw new Error('Distribuição não encontrada');
      Object.assign(item, dados);
      return item;
    }
  }
};

export default ProcessoDistribuicaoService;

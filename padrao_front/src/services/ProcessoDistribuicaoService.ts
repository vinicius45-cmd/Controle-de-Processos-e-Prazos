import { api } from '../config/api';
import { localMockProcessosDistribuicoes } from '../config/mock';
import { ProcessoDistribuicao } from '../types';

type DadosDistribuicao = Pick<ProcessoDistribuicao, 'idProcesso' | 'idUnidade' | 'dtDistribuicao' | 'dsObservacao'>;

export const ProcessoDistribuicaoService = {
  async listarPorProcesso(idProcesso: number | string): Promise<ProcessoDistribuicao[]> {
    try {
      const { data } = await api.get<ProcessoDistribuicao[]>(`/processos-distribuicoes/processo/${idProcesso}`);
      return data;
    } catch {
      return localMockProcessosDistribuicoes.filter((item) => String(item.idProcesso) === String(idProcesso));
    }
  },

  async cadastrar(dados: DadosDistribuicao): Promise<ProcessoDistribuicao> {
    try {
      const { data } = await api.post<ProcessoDistribuicao>('/processos-distribuicoes', dados);
      return data;
    } catch {
      const item: ProcessoDistribuicao = {
        idDistribuicao: Math.max(...localMockProcessosDistribuicoes.map((value) => value.idDistribuicao), 0) + 1,
        ...dados,
        dtRecebimento: null,
        dtConclusao: null
      };
      localMockProcessosDistribuicoes.push(item);
      return item;
    }
  }
};

export default ProcessoDistribuicaoService;

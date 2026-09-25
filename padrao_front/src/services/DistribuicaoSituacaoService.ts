import { api, isMockApi } from '../config/api';
import { localMockDistribuicoesSituacoes } from '../config/mock';
import { DistribuicaoSituacao } from '../types';

type DadosSituacao = Pick<DistribuicaoSituacao, 'idDistribuicao' | 'idTipoSituacaoDistribuicao' | 'dtInicio' | 'dsObservacao'>;

export const DistribuicaoSituacaoService = {
  async listarPorDistribuicao(idDistribuicao: number): Promise<DistribuicaoSituacao[]> {
    try {
      const { data } = await api.get<DistribuicaoSituacao[]>(`/distribuicoes-situacoes/distribuicao/${idDistribuicao}`);
      return data;
    } catch (error) {
      if (!isMockApi) throw error;
      return localMockDistribuicoesSituacoes.filter((item) => item.idDistribuicao === idDistribuicao);
    }
  },

  async buscar(idDistribuicaoSituacao: number | string): Promise<DistribuicaoSituacao> {
    try {
      const { data } = await api.get<DistribuicaoSituacao>(`/distribuicoes-situacoes/${idDistribuicaoSituacao}`);
      return data;
    } catch (error) {
      if (!isMockApi) throw error;
      const item = localMockDistribuicoesSituacoes.find((value) => String(value.idDistribuicaoSituacao) === String(idDistribuicaoSituacao));
      if (!item) throw new Error('Situação da distribuição não encontrada');
      return item;
    }
  },

  async atual(idDistribuicao: number | string): Promise<DistribuicaoSituacao> {
    try {
      const { data } = await api.get<DistribuicaoSituacao>(`/distribuicoes-situacoes/distribuicao/${idDistribuicao}/atual`);
      return data;
    } catch (error) {
      if (!isMockApi) throw error;
      const item = localMockDistribuicoesSituacoes.find((value) => String(value.idDistribuicao) === String(idDistribuicao) && !value.dtFim);
      if (!item) throw new Error('Situação atual da distribuição não encontrada');
      return item;
    }
  },

  async cadastrar(dados: DadosSituacao): Promise<DistribuicaoSituacao> {
    try {
      const { data } = await api.post<DistribuicaoSituacao>('/distribuicoes-situacoes', dados);
      return data;
    } catch (error) {
      if (!isMockApi) throw error;
      const anterior = localMockDistribuicoesSituacoes.find((item) => item.idDistribuicao === dados.idDistribuicao && !item.dtFim);
      if (anterior) anterior.dtFim = dados.dtInicio;
      const item: DistribuicaoSituacao = {
        idDistribuicaoSituacao: Math.max(...localMockDistribuicoesSituacoes.map((value) => value.idDistribuicaoSituacao), 0) + 1,
        ...dados,
        dtFim: null
      };
      localMockDistribuicoesSituacoes.push(item);
      return item;
    }
  }
};

export default DistribuicaoSituacaoService;

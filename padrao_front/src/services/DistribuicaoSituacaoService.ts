import { api } from '../config/api';
import { localMockDistribuicoesSituacoes } from '../config/mock';
import { DistribuicaoSituacao } from '../types';

type DadosSituacao = Pick<DistribuicaoSituacao, 'idDistribuicao' | 'idTipoSituacaoDistribuicao' | 'dtInicio' | 'dsObservacao'>;

export const DistribuicaoSituacaoService = {
  async listarPorDistribuicao(idDistribuicao: number): Promise<DistribuicaoSituacao[]> {
    try {
      const { data } = await api.get<DistribuicaoSituacao[]>(`/distribuicoes-situacoes/distribuicao/${idDistribuicao}`);
      return data;
    } catch {
      return localMockDistribuicoesSituacoes.filter((item) => item.idDistribuicao === idDistribuicao);
    }
  },

  async cadastrar(dados: DadosSituacao): Promise<DistribuicaoSituacao> {
    try {
      const { data } = await api.post<DistribuicaoSituacao>('/distribuicoes-situacoes', dados);
      return data;
    } catch {
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

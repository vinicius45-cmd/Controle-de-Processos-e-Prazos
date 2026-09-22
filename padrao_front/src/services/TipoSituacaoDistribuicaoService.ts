import { api, isMockApi } from '../config/api';
import { localMockTiposSituacaoDistribuicao } from '../config/mock';
import { TipoSituacaoDistribuicao } from '../types';

type DadosTipoSituacaoDistribuicao = Pick<TipoSituacaoDistribuicao, 'nmTipoSituacaoDistribuicao' | 'blSituacaoFinal'>;

export const TipoSituacaoDistribuicaoService = {
  async listar(filtro = '', apenasAtivos = true): Promise<TipoSituacaoDistribuicao[]> {
    try {
      const { data } = await api.get<TipoSituacaoDistribuicao[]>('/dom-tipo-situacao-distribuicao');
      return data;
    } catch (error) {
      if (!isMockApi) throw error;
      const termo = filtro.trim().toLowerCase();
      return localMockTiposSituacaoDistribuicao.filter((item) => (
        (!apenasAtivos || item.blAtivo === 'S') &&
        (!termo || item.nmTipoSituacaoDistribuicao.toLowerCase().includes(termo))
      ));
    }
  },

  async cadastrar(dados: DadosTipoSituacaoDistribuicao): Promise<TipoSituacaoDistribuicao> {
    try {
      const { data } = await api.post<TipoSituacaoDistribuicao>('/tipos-situacao-distribuicao', { ...dados, blAtivo: 'S' });
      return data;
    } catch (error) {
      if (!isMockApi) throw error;
      const item: TipoSituacaoDistribuicao = {
        idTipoSituacaoDistribuicao: Math.max(...localMockTiposSituacaoDistribuicao.map((value) => value.idTipoSituacaoDistribuicao), 0) + 1,
        ...dados,
        blAtivo: 'S'
      };
      localMockTiposSituacaoDistribuicao.push(item);
      return item;
    }
  },

  async atualizar(id: number, dados: DadosTipoSituacaoDistribuicao): Promise<TipoSituacaoDistribuicao> {
    try {
      const { data } = await api.put<TipoSituacaoDistribuicao>(`/tipos-situacao-distribuicao/${id}`, dados);
      return data;
    } catch (error) {
      if (!isMockApi) throw error;
      const index = localMockTiposSituacaoDistribuicao.findIndex((item) => item.idTipoSituacaoDistribuicao === id);
      if (index < 0) throw new Error('Situação de distribuição não encontrada');
      localMockTiposSituacaoDistribuicao[index] = { ...localMockTiposSituacaoDistribuicao[index], ...dados };
      return localMockTiposSituacaoDistribuicao[index];
    }
  },

  async desativar(id: number): Promise<void> {
    try {
      await api.patch(`/tipos-situacao-distribuicao/${id}/desativar`);
    } catch (error) {
      if (!isMockApi) throw error;
      const item = localMockTiposSituacaoDistribuicao.find((value) => value.idTipoSituacaoDistribuicao === id);
      if (item) item.blAtivo = 'N';
    }
  }
};

export default TipoSituacaoDistribuicaoService;

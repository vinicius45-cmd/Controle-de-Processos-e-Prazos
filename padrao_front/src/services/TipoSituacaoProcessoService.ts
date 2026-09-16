import { api } from '../config/api';
import { localMockTiposSituacaoProcesso } from '../config/mock';
import { TipoSituacaoProcesso } from '../types';

type DadosTipoSituacaoProcesso = Pick<TipoSituacaoProcesso, 'nmTipoSituacaoProcesso' | 'blSituacaoFinal'>;

export const TipoSituacaoProcessoService = {
  async listar(filtro = '', apenasAtivos = true): Promise<TipoSituacaoProcesso[]> {
    try {
      const { data } = await api.get<TipoSituacaoProcesso[]>('/tipos-situacao-processo', { params: { filtro, ...(apenasAtivos ? { blAtivo: 'S' } : {}) } });
      return data;
    } catch {
      const termo = filtro.trim().toLowerCase();
      return localMockTiposSituacaoProcesso.filter((item) => (
        (!apenasAtivos || item.blAtivo === 'S') &&
        (!termo || item.nmTipoSituacaoProcesso.toLowerCase().includes(termo))
      ));
    }
  },

  async cadastrar(dados: DadosTipoSituacaoProcesso): Promise<TipoSituacaoProcesso> {
    try {
      const { data } = await api.post<TipoSituacaoProcesso>('/tipos-situacao-processo', { ...dados, blAtivo: 'S' });
      return data;
    } catch {
      const item: TipoSituacaoProcesso = {
        idTipoSituacaoProcesso: Math.max(...localMockTiposSituacaoProcesso.map((value) => value.idTipoSituacaoProcesso), 0) + 1,
        ...dados,
        blAtivo: 'S'
      };
      localMockTiposSituacaoProcesso.push(item);
      return item;
    }
  },

  async atualizar(id: number, dados: DadosTipoSituacaoProcesso): Promise<TipoSituacaoProcesso> {
    try {
      const { data } = await api.put<TipoSituacaoProcesso>(`/tipos-situacao-processo/${id}`, dados);
      return data;
    } catch {
      const index = localMockTiposSituacaoProcesso.findIndex((item) => item.idTipoSituacaoProcesso === id);
      if (index < 0) throw new Error('Situação de processo não encontrada');
      localMockTiposSituacaoProcesso[index] = { ...localMockTiposSituacaoProcesso[index], ...dados };
      return localMockTiposSituacaoProcesso[index];
    }
  },

  async desativar(id: number): Promise<void> {
    try {
      await api.patch(`/tipos-situacao-processo/${id}/desativar`);
    } catch {
      const item = localMockTiposSituacaoProcesso.find((value) => value.idTipoSituacaoProcesso === id);
      if (item) item.blAtivo = 'N';
    }
  }
};

export default TipoSituacaoProcessoService;

import { api, isMockApi } from '../config/api';
import { localMockTiposAssunto } from '../config/mock';
import { TipoAssunto } from '../types';

type DadosTipoAssunto = Pick<TipoAssunto, 'idUnidade' | 'nmTipoAssunto'>;

export const TipoAssuntoService = {
  async listar(idUnidade?: number, filtro = '', apenasAtivos = true): Promise<TipoAssunto[]> {
    try {
      const { data } = await api.get<TipoAssunto[]>('/dom-tipo-assunto');
      return data;
    } catch (error) {
      if (!isMockApi) throw error;
      const termo = filtro.trim().toLowerCase();
      return localMockTiposAssunto.filter((item) => (
        (!apenasAtivos || item.blAtivo === 'S') && (!idUnidade || item.idUnidade === idUnidade) && (!termo || item.nmTipoAssunto.toLowerCase().includes(termo))
      ));
    }
  },
  async cadastrar(dados: DadosTipoAssunto): Promise<TipoAssunto> {
    try { const { data } = await api.post<TipoAssunto>('/dom-tipo-assunto', { ...dados, blAtivo: 'S' }); return data; } catch (error) { if (!isMockApi) throw error;
      const item = { idTipoAssunto: Math.max(...localMockTiposAssunto.map((x) => x.idTipoAssunto), 0) + 1, ...dados, blAtivo: 'S' as const }; localMockTiposAssunto.push(item); return item;
    }
  },
  async atualizar(id: number, dados: DadosTipoAssunto): Promise<TipoAssunto> {
    try { const { data } = await api.patch<TipoAssunto>(`/dom-tipo-assunto/${id}`, dados); return data; } catch (error) { if (!isMockApi) throw error;
      const index = localMockTiposAssunto.findIndex((item) => item.idTipoAssunto === id); if (index < 0) throw new Error('Tipo de assunto não encontrado'); localMockTiposAssunto[index] = { ...localMockTiposAssunto[index], ...dados }; return localMockTiposAssunto[index];
    }
  },
  async alterarStatus(id: number, blAtivo: 'S' | 'N'): Promise<void> {
    try { await api.patch(`/dom-tipo-assunto/${id}/status`, { blAtivo }); } catch (error) { if (!isMockApi) throw error; const item = localMockTiposAssunto.find((x) => x.idTipoAssunto === id); if (item) item.blAtivo = blAtivo; }
  }
};

export default TipoAssuntoService;
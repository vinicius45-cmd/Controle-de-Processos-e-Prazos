import { api } from '../config/api';
import { localMockTiposDocumento } from '../config/mock';
import { TipoDocumento } from '../types';

type DadosTipoDocumento = Pick<TipoDocumento, 'nmTipoDocumento'>;

export const TipoDocumentoService = {
  async listar(filtro = '', apenasAtivos = true): Promise<TipoDocumento[]> {
    try { const { data } = await api.get<TipoDocumento[]>('/tipos-documento', { params: { filtro, ...(apenasAtivos ? { blAtivo: 'S' } : {}) } }); return data; } catch {
      const termo = filtro.trim().toLowerCase(); return localMockTiposDocumento.filter((item) => (!apenasAtivos || item.blAtivo === 'S') && (!termo || item.nmTipoDocumento.toLowerCase().includes(termo)));
    }
  },
  async cadastrar(dados: DadosTipoDocumento): Promise<TipoDocumento> {
    try { const { data } = await api.post<TipoDocumento>('/tipos-documento', { ...dados, blAtivo: 'S' }); return data; } catch {
      const item = { idTipoDocumento: Math.max(...localMockTiposDocumento.map((x) => x.idTipoDocumento), 0) + 1, ...dados, blAtivo: 'S' as const }; localMockTiposDocumento.push(item); return item;
    }
  },
  async atualizar(id: number, dados: DadosTipoDocumento): Promise<TipoDocumento> {
    try { const { data } = await api.put<TipoDocumento>(`/tipos-documento/${id}`, dados); return data; } catch {
      const index = localMockTiposDocumento.findIndex((item) => item.idTipoDocumento === id); if (index < 0) throw new Error('Tipo de documento não encontrado'); localMockTiposDocumento[index] = { ...localMockTiposDocumento[index], ...dados }; return localMockTiposDocumento[index];
    }
  },
  async desativar(id: number): Promise<void> {
    try { await api.patch(`/tipos-documento/${id}/desativar`); } catch { const item = localMockTiposDocumento.find((x) => x.idTipoDocumento === id); if (item) item.blAtivo = 'N'; }
  }
};

export default TipoDocumentoService;
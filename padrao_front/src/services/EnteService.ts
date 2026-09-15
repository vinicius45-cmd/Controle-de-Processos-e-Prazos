import { api } from '../config/api';
import { localMockEntes } from '../config/mock';
import { Ente } from '../types';

export const EnteService = {
  async listar(filtro = '', apenasAtivos = true): Promise<Ente[]> {
    try {
      const { data } = await api.get<Ente[]>('/entes', {
        params: { filtro, ...(apenasAtivos ? { blAtivo: 'S' } : {}) }
      });
      return data;
    } catch {
      const termo = filtro.trim().toLowerCase();
      return localMockEntes.filter((ente) => (
        (!apenasAtivos || ente.blAtivo === 'S') &&
        (!termo || `${ente.nmEnte} ${ente.sgEnte}`.toLowerCase().includes(termo))
      ));
    }
  },

  async cadastrar(dados: Pick<Ente, 'nmEnte' | 'sgEnte'>): Promise<Ente> {
    try {
      const { data } = await api.post<Ente>('/entes', {
        ...dados,
        blAtivo: 'S'
      });
      return data;
    } catch {
      const novoEnte: Ente = {
        idEnte: Math.max(...localMockEntes.map((ente) => ente.idEnte), 0) + 1,
        ...dados,
        blAtivo: 'S'
      };
      localMockEntes.push(novoEnte);
      return novoEnte;
    }
  },

  async atualizar(idEnte: number, dados: Pick<Ente, 'nmEnte' | 'sgEnte'>): Promise<Ente> {
    try {
      const { data } = await api.put<Ente>(`/entes/${idEnte}`, dados);
      return data;
    } catch {
      const indice = localMockEntes.findIndex((ente) => ente.idEnte === idEnte);
      if (indice < 0) throw new Error('Ente não encontrado');
      localMockEntes[indice] = { ...localMockEntes[indice], ...dados };
      return localMockEntes[indice];
    }
  },

  async visualizarAtivos(): Promise<void> {
    try {
      await api.get(`/entes/ativos`);
    } catch {}
  },

  async visualizarEntes(): Promise<void> {
    try {
      await api.get(`/entes`);
    } catch {}
  },

  async visualizarIds(): Promise<void> {
    try {
      await api.get(`/entes/:id`);
    } catch {}
  },

  async visualizarSiglas(): Promise<void> {
    try {
      await api.get(`/entes/sigla/:sigla`);
    } catch {}
  }
};

export default EnteService;
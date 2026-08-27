import { api } from '../config/api';
import { Operadora } from '../types';

import { localMockOperadoras } from '../config/mock';


export const OperadoraService = {
  async listar(filtro: string): Promise<Operadora[]> {
    try {
      const { data } = await api.get<Operadora[]>('/operadoras', { 
        params: { nmOperadora: filtro } 
      });
      return data;
    } catch (e) {
      // Fallback para Dados Mockados no Boilerplate se a API estiver offline
      console.warn('API Offline. Retornando dados mockados do Boilerplate SEMOB.');
      if (!filtro) return localMockOperadoras;
      return localMockOperadoras.filter(op => op.nmOperadora.toLowerCase().includes(filtro.toLowerCase()));
    }
  },

  async cadastrar(nmOperadora: string): Promise<Operadora> {
    try {
      const { data } = await api.post<Operadora>('/operadoras', { nmOperadora });
      // Update local mock list too
      localMockOperadoras.push(data);
      return data;
    } catch (e) {
      console.warn('API Offline. Criando operadora no cache local do Boilerplate.');
      const newOp: Operadora = {
        idOperadora: Math.floor(Math.random() * 900) + 600,
        nmOperadora
      };
      localMockOperadoras.push(newOp);
      return newOp;
    }
  }
};
export default OperadoraService;

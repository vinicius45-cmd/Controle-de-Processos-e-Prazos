import { api } from '../config/api';
import { Linha } from '../types';

export const LinhaService = {
  async listar(): Promise<Linha[]> {
    const { data } = await api.get<Linha[]>('/linhas');
    return data;
  }
};

export default LinhaService;
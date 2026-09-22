import { api, isMockApi } from '../config/api';
import { localMockUnidades } from '../config/mock';
import { Unidade } from '../types';

type DadosUnidade = Pick<Unidade, 'nmUnidade' | 'sgUnidade' | 'idUnidadeSuperior'>;

export const UnidadeService = {
  async listar(filtro = '', apenasAtivas = true): Promise<Unidade[]> {
    try {
      const { data } = await api.get<Unidade[]>(apenasAtivas ? '/unidades/ativas' : '/unidades');
      return data;
    } catch (error) {
      if (!isMockApi) throw error;
      const termo = filtro.trim().toLowerCase();
      return localMockUnidades.filter((unidade) => (
        (!apenasAtivas || unidade.blAtivo === 'S') &&
        (!termo || `${unidade.nmUnidade} ${unidade.sgUnidade}`.toLowerCase().includes(termo))
      ));
    }
  },

  async cadastrar(dados: DadosUnidade): Promise<Unidade> {
    try {
      const { data } = await api.post<Unidade>('/unidades', { ...dados, blAtivo: 'S' });
      return data;
    } catch (error) {
      if (!isMockApi) throw error;
      const novaUnidade: Unidade = {
        idUnidade: Math.max(...localMockUnidades.map((item) => item.idUnidade), 0) + 1,
        ...dados,
        blAtivo: 'S'
      };
      localMockUnidades.push(novaUnidade);
      return novaUnidade;
    }
  },

  async atualizar(idUnidade: number, dados: DadosUnidade): Promise<Unidade> {
    try {
      const { data } = await api.patch<Unidade>(`/unidades/${idUnidade}`, dados);
      return data;
    } catch (error) {
      if (!isMockApi) throw error;
      const indice = localMockUnidades.findIndex((item) => item.idUnidade === idUnidade);
      if (indice < 0) throw new Error('Unidade não encontrada');
      localMockUnidades[indice] = { ...localMockUnidades[indice], ...dados };
      return localMockUnidades[indice];
    }
  },

  async desativar(idUnidade: number): Promise<void> {
    try {
      await api.patch(`/unidades/${idUnidade}/desativar`);
    } catch (error) {
      if (!isMockApi) throw error;
      const unidade = localMockUnidades.find((item) => item.idUnidade === idUnidade);
      if (unidade) unidade.blAtivo = 'N';
    }
  }
};

export default UnidadeService;
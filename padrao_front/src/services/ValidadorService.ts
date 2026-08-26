import { Validador } from '../types';

export const ValidadorService = {
  // Função que simula a busca de dados em uma API
  getValidadores: async (): Promise<Validador[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { idValidador: 1, numeroSerie: 'VAL12345', prefixoOnibus: '22014', status: 'ATIVO' },
          { idValidador: 2, numeroSerie: 'VAL67890', prefixoOnibus: '33045', status: 'INATIVO' },
          { idValidador: 3, numeroSerie: 'VAL54321', prefixoOnibus: '11022', status: 'ATIVO' },
        ]);
      }, 800); // 800 milissegundos de espera fingindo carregar
    });
  }
};
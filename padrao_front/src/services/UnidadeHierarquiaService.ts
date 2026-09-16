import { api } from '../config/api';
import { localMockUnidadesHierarquia } from '../config/mock';
import { UnidadeHierarquia } from '../types';

type DadosHierarquia = Pick<UnidadeHierarquia, 'idUnidade' | 'idUnidadeSuperior' | 'dtInicioVigencia'>;

const possuiCicloLocal = (idUnidade: number, idUnidadeSuperior: number | null | undefined): boolean => {
  let atual = idUnidadeSuperior;
  const visitados = new Set<number>();
  while (atual) {
    if (atual === idUnidade) return true;
    if (visitados.has(atual)) return true;
    visitados.add(atual);
    atual = localMockUnidadesHierarquia.find((item) => item.idUnidade === atual && item.blVigente === 'S')?.idUnidadeSuperior;
  }
  return false;
};

export const UnidadeHierarquiaService = {
  async listarVigentes(): Promise<UnidadeHierarquia[]> {
    try {
      const { data } = await api.get<UnidadeHierarquia[]>('/unidades-hierarquias/vigentes');
      return data;
    } catch {
      return localMockUnidadesHierarquia.filter((item) => item.blVigente === 'S');
    }
  },

  async historicoDaUnidade(idUnidade: number): Promise<UnidadeHierarquia[]> {
    try {
      const { data } = await api.get<UnidadeHierarquia[]>(`/unidades-hierarquias/unidade/${idUnidade}`);
      return data;
    } catch {
      return localMockUnidadesHierarquia.filter((item) => item.idUnidade === idUnidade);
    }
  },

  async vigentesDaUnidade(idUnidade: number): Promise<UnidadeHierarquia[]> {
    try {
      const { data } = await api.get<UnidadeHierarquia[]>(`/unidades-hierarquias/unidade/${idUnidade}/vigentes`);
      return data;
    } catch {
      return localMockUnidadesHierarquia.filter((item) => item.idUnidade === idUnidade && item.blVigente === 'S');
    }
  },

  async subordinadas(idUnidadeSuperior: number): Promise<UnidadeHierarquia[]> {
    try {
      const { data } = await api.get<UnidadeHierarquia[]>(`/unidades-hierarquias/superior/${idUnidadeSuperior}/subordinadas`);
      return data;
    } catch {
      return localMockUnidadesHierarquia.filter((item) => item.idUnidadeSuperior === idUnidadeSuperior && item.blVigente === 'S');
    }
  },

  async cadastrar(dados: DadosHierarquia): Promise<UnidadeHierarquia> {
    if (dados.idUnidadeSuperior === dados.idUnidade) throw new Error('Uma unidade não pode ser superior a ela mesma.');
    if (possuiCicloLocal(dados.idUnidade, dados.idUnidadeSuperior)) throw new Error('O vínculo criaria um ciclo na hierarquia organizacional.');
    try {
      const { data } = await api.post<UnidadeHierarquia>('/unidades-hierarquias', { ...dados, blVigente: 'S' });
      return data;
    } catch {
      const item: UnidadeHierarquia = {
        idUnidadeHierarquia: Math.max(...localMockUnidadesHierarquia.map((value) => value.idUnidadeHierarquia), 0) + 1,
        ...dados,
        dtFimVigencia: null,
        blVigente: 'S'
      };
      localMockUnidadesHierarquia.push(item);
      return item;
    }
  },

  async encerrar(idUnidadeHierarquia: number, dtFimVigencia: string): Promise<void> {
    try {
      await api.patch(`/unidades-hierarquias/${idUnidadeHierarquia}/encerrar`, { dtFimVigencia });
    } catch {
      const item = localMockUnidadesHierarquia.find((value) => value.idUnidadeHierarquia === idUnidadeHierarquia);
      if (item) {
        item.dtFimVigencia = dtFimVigencia;
        item.blVigente = 'N';
      }
    }
  }
};

export default UnidadeHierarquiaService;
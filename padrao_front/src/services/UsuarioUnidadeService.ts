import { api } from '../config/api';
import { UsuarioUnidade } from '../types';

type DadosUsuarioUnidade = Pick<UsuarioUnidade, 'idUsuario' | 'idUnidade' | 'dtInicioVigencia'>;

export const UsuarioUnidadeService = {
  async listar(): Promise<UsuarioUnidade[]> {
    const { data } = await api.get<UsuarioUnidade[]>('/usuarios-unidades');
    return data;
  },

  async listarPorUnidade(idUnidade: number | string): Promise<UsuarioUnidade[]> {
    const { data } = await api.get<UsuarioUnidade[]>(`/usuarios-unidades/unidade/${idUnidade}/ativos`);
    return data;
  },

  async listarPorUsuario(idUsuario: number | string): Promise<UsuarioUnidade[]> {
    const { data } = await api.get<UsuarioUnidade[]>(`/usuarios-unidades/usuario/${idUsuario}/ativos`);
    return data;
  },

  async buscar(idUsuarioUnidade: number | string): Promise<UsuarioUnidade> {
    const { data } = await api.get<UsuarioUnidade>(`/usuarios-unidades/${idUsuarioUnidade}`);
    return data;
  },

  async cadastrar(dados: DadosUsuarioUnidade): Promise<UsuarioUnidade> {
    const { data } = await api.post<UsuarioUnidade>('/usuarios-unidades', dados);
    return data;
  },

  async desativar(idUsuarioUnidade: number | string): Promise<void> {
    await api.patch(`/usuarios-unidades/${idUsuarioUnidade}/desativar`);
  }
};

export default UsuarioUnidadeService;
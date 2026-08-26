import { create } from 'zustand';
import { AuthState } from '../types';

export const useAuthStore = create<AuthState>((set) => ({
  usuario: {
    id: 'developer',
    idUsuario: 1,
    nome: 'Desenvolvedor SEMOB',
    email: 'developer@semob.df.gov.br',
    matricula: '12345-6',
    cargo: 'Auditor Técnico',
    departamento: 'SUOP',
    rotasPermitidas: [],
    permissoesServicos: {}
  },
  autenticado: true,
  setUsuario: (usuario) => set({ usuario, autenticado: !!usuario }),
  logout: () => set({ usuario: null, autenticado: false })
}));

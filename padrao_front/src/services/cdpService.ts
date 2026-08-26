import { api } from '../config/api';
import { CdpUsuario, LoginResponse } from '../types';

import { MOCK_CDP_USERS, getMockPermissionTree } from '../config/mock';


export const cdpService = {
  // Login LDAP
  async login(nickname: string, passwordPlana: string): Promise<LoginResponse> {
    try {
      const response = await api.post<LoginResponse>('/auth-ldap/auth/ldap/login', {
        email: nickname.trim(),
        password: passwordPlana
      });
      return response.data;
    } catch (e) {
      console.warn('[CDP API Offline] Emulando resposta de Login LDAP baseada no nickname.');
      
      const found = MOCK_CDP_USERS.find(u => u.nickname.toLowerCase() === nickname.toLowerCase());
      if (found) {
        return {
          ok: true,
          token: `mock-jwt-token-for-${nickname}-${Date.now()}`,
          user: found.nickname
        };
      } else {
        return {
          ok: false,
          message: 'Usuário ou senha incorretos no LDAP (Tente: admin, auditor.silva, preposto.carvalho, sem.acesso)'
        };
      }
    }
  },

  // Search User list by nickname
  async getUsuarios(): Promise<CdpUsuario[]> {
    try {
      const response = await api.get<CdpUsuario[]>('/CDP/api/usuarios');
      return response.data;
    } catch (e) {
      console.warn('[CDP API Offline] Retornando lista de usuários CDP mockados.');
      return MOCK_CDP_USERS;
    }
  },

  // Fetch full permissions tree for a user
  async getPermissoesTree(idUsuario: number): Promise<any> {
    try {
      const response = await api.get('/CDP/api/usuarios/me/permissoes', {
        headers: { 'x-user-id': idUsuario.toString() }
      });
      return response.data;
    } catch (e) {
      console.warn(`[CDP API Offline] Retornando árvore de permissões mockada para idUsuario ${idUsuario}.`);
      return getMockPermissionTree(idUsuario);
    }
  }
};
export default cdpService;

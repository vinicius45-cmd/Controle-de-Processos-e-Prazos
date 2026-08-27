import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Usuario, AuthContextType } from '../types';
import { cdpService } from '../services/cdpService';
import { tokenStore } from '../services/tokenStore';
import { setupApiInterceptors } from '../core/apiInterceptor';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_USER_KEY = 'sim_usuario_data';
const STORAGE_TOKEN_KEY = 'sim_auth_token';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(() => {
    const userSalvo = localStorage.getItem(STORAGE_USER_KEY);
    const tokenSalvo = localStorage.getItem(STORAGE_TOKEN_KEY);

    if (userSalvo && tokenSalvo) {
      try {
        const parsed = JSON.parse(userSalvo);
        tokenStore.setToken(tokenSalvo);
        
        const finalUserId = parsed.idUsuario ? parsed.idUsuario.toString() : parsed.id;
        tokenStore.setUserId(finalUserId);
        
        return parsed;
      } catch {
        return null;
      }
    }
    return null;
  });

  const [erroLogin, setErroLogin] = useState<string | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(false);

  // Initialize interceptors with functions accessing tokenStore
  useEffect(() => {
    setupApiInterceptors(
      () => tokenStore.getToken(),
      () => tokenStore.getUserId()
    );

    // Listen to expiration events triggered by axios response interceptor
    const handleAuthExpired = () => {
      console.warn('[useAuth] Capturado evento auth:expired. Efetuando logout...');
      fazerLogout();
    };

    window.addEventListener('auth:expired', handleAuthExpired);
    return () => {
      window.removeEventListener('auth:expired', handleAuthExpired);
    };
  }, []);

  const fazerLogin = async (usuarioInput: string, senhaInput: string) => {
    setErroLogin(null);
    setLoadingAuth(true);

    try {
      // 1. LDAP Authentication call
      const authData = await cdpService.login(usuarioInput, senhaInput);
      
      if (authData.ok && authData.token) {
        const nickname = authData.user || usuarioInput.split('@')[0];
        
        // 2. Fetch CDP users
        const cdpUsuarios = await cdpService.getUsuarios();
        const matchedUser = cdpUsuarios.find(
          (u) => u.nickname.toLowerCase() === nickname.toLowerCase()
        );

        if (!matchedUser) {
          throw new Error(`Usuário '${nickname}' autenticado no LDAP, mas não cadastrado no CDP.`);
        }

        const idUsuario = matchedUser.idUsuario || 999;
        let rotasPermitidas: string[] = [];
        let permissoesServicos: Record<string, 'LEITURA' | 'ESCRITA'> = {};

        // 3. Fetch permission tree for user
        const tree = await cdpService.getPermissoesTree(idUsuario);
        if (tree && tree.sistemas) {
          tree.sistemas.forEach((sis: any) => {
            sis.modulos?.forEach((mod: any) => {
              // Add module route
              if (mod.rota) {
                rotasPermitidas.push(mod.rota);
                permissoesServicos[mod.rota] = 'LEITURA';
              }
              // Add service endpoints
              mod.servicos?.forEach((serv: any) => {
                if (serv.endpoint) {
                  rotasPermitidas.push(serv.endpoint);
                  const tipo = serv.dsTipo || 'LEITURA';
                  // Overwrite to ESCRITA if any is ESCRITA
                  if (permissoesServicos[serv.endpoint] !== 'ESCRITA') {
                    permissoesServicos[serv.endpoint] = tipo as 'LEITURA' | 'ESCRITA';
                  }
                }
              });
            });
          });
        }

        const loggedUser: Usuario = {
          id: nickname,
          idUsuario: matchedUser.idUsuario,
          nome: matchedUser.pessoaAd?.nome || matchedUser.nickname,
          email: matchedUser.pessoaAd?.email || `${nickname}@semob.df.gov.br`,
          matricula: matchedUser.pessoaAd?.matriculaPessoaAd?.toString() || 'N/A',
          cargo: matchedUser.pessoaAd?.cargo || 'Colaborador',
          departamento: matchedUser.pessoaAd?.departamento || 'SEMOB',
          rotasPermitidas,
          permissoesServicos
        };

        // 4. Save tokens and user details
        tokenStore.setToken(authData.token);
        tokenStore.setUserId(idUsuario.toString());
        localStorage.setItem(STORAGE_TOKEN_KEY, authData.token);
        localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(loggedUser));
        
        setUsuario(loggedUser);
      } else {
        const errorMsg = authData.message || 'Credenciais LDAP incorretas.';
        setErroLogin(errorMsg);
        throw new Error(errorMsg);
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Falha ao conectar com o servidor de autenticação.';
      setErroLogin(errorMsg);
      throw err;
    } finally {
      setLoadingAuth(false);
    }
  };

  const fazerLogout = () => {
    setUsuario(null);
    setErroLogin(null);
    tokenStore.clear();
    localStorage.removeItem(STORAGE_TOKEN_KEY);
    localStorage.removeItem(STORAGE_USER_KEY);
  };

  // Helper checking for granular endpoints
  const temAcesso = (endpoint: string, nivelRequerido: 'LEITURA' | 'ESCRITA' = 'LEITURA'): boolean => {
    // If show dev modules is true or user is the super admin, bypass
    const isDev = import.meta.env.VITE_SHOW_DEV_MODULOS === 'true';
    if (isDev || usuario?.id === 'admin') {
      return true;
    }

    if (!usuario || !usuario.permissoesServicos) {
      return false;
    }

    const nivelUsuario = usuario.permissoesServicos[endpoint];
    if (!nivelUsuario) {
      return false;
    }

    if (nivelRequerido === 'ESCRITA') {
      return nivelUsuario === 'ESCRITA';
    }

    return true; // Any level (LEITURA or ESCRITA) satisfies LEITURA
  };

  const temEscrita = (endpoint: string): boolean => {
    return temAcesso(endpoint, 'ESCRITA');
  };

  // Helper allowing developer to override permissions dynamically in control board
  const mockOverridePermissions = (rotas: string[], servicos: Record<string, 'LEITURA' | 'ESCRITA'>) => {
    if (!usuario) return;
    const updated = {
      ...usuario,
      rotasPermitidas: rotas,
      permissoesServicos: servicos
    };
    setUsuario(updated);
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(updated));
  };

  // Real-time permission polling (every 15 seconds)
  useEffect(() => {
    if (!usuario || !usuario.idUsuario) return;

    const interval = setInterval(async () => {
      try {
        console.log('[Auth Polling] Verificando se houve alterações de privilégios no CDP...');
        const tree = await cdpService.getPermissoesTree(usuario.idUsuario!);
        
        let novasRotas: string[] = [];
        let novasPermissoes: Record<string, 'LEITURA' | 'ESCRITA'> = {};

        if (tree && tree.sistemas) {
          tree.sistemas.forEach((sis: any) => {
            sis.modulos?.forEach((mod: any) => {
              if (mod.rota) {
                novasRotas.push(mod.rota);
                novasPermissoes[mod.rota] = 'LEITURA';
              }
              mod.servicos?.forEach((serv: any) => {
                if (serv.endpoint) {
                  novasRotas.push(serv.endpoint);
                  const tipo = serv.dsTipo || 'LEITURA';
                  if (novasPermissoes[serv.endpoint] !== 'ESCRITA') {
                    novasPermissoes[serv.endpoint] = tipo as 'LEITURA' | 'ESCRITA';
                  }
                }
              });
            });
          });
        }

        // Compare route lists and permission mappings
        const changed =
          JSON.stringify(novasRotas.sort()) !== JSON.stringify([...usuario.rotasPermitidas].sort()) ||
          JSON.stringify(novasPermissoes) !== JSON.stringify(usuario.permissoesServicos);

        if (changed) {
          console.log('[Auth Polling] Permissões alteradas no CDP! Atualizando estado local...');
          const updated = {
            ...usuario,
            rotasPermitidas: novasRotas,
            permissoesServicos: novasPermissoes
          };
          setUsuario(updated);
          localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(updated));
          
          // Trigger a notification or custom event if needed
          window.dispatchEvent(new CustomEvent('auth:permissions_updated', { detail: updated }));
        } else {
          console.log('[Auth Polling] Permissões em sincronia.');
        }
      } catch (err) {
        console.error('[Auth Polling] Erro ao buscar árvore de permissões durante o polling:', err);
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [usuario]);

  return (
    <AuthContext.Provider
      value={{
        usuario,
        estaAutenticado: !!usuario,
        erroLogin,
        loadingAuth,
        fazerLogin,
        fazerLogout,
        temAcesso,
        temEscrita,
        mockOverridePermissions
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  return context;
};

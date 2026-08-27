import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { modulos_sistema as fullRegistry } from '../config/modules';
import { ModuloConfig, ModulesContextType } from '../types';
import { useAuth } from './useAuth';

const ModulesContext = createContext<ModulesContextType | undefined>(undefined);

export const ModulesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { estaAutenticado, usuario } = useAuth();
  const [modulos, setModulos] = useState<ModuloConfig[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    function resolveModules() {
      if (!estaAutenticado || !usuario) {
        setModulos([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const rotasPermitidas = usuario.rotasPermitidas || [];
        const isDevMode = import.meta.env.VITE_SHOW_DEV_MODULOS === 'true';

        const filtered = fullRegistry.filter((mod) => {
          // 1. Dash and Apps are always public
          if (mod.id === 'dash' || mod.id === 'apps') return true;

          // 2. CDP is always open for super admin
          if (mod.id === 'cdp' && usuario.id === 'admin') return true;

          // 3. Show all if in dev modules mode
          if (isDevMode) return true;

          // 4. Check access to main module route
          const temAcessoModulo = rotasPermitidas.includes(mod.rota);

          // 5. Or check if user has access to at least one submenu route
          const temAcessoSubMenu = mod.subMenus?.some(
            (sub) => sub.rota && rotasPermitidas.includes(sub.rota)
          );

          return temAcessoModulo || temAcessoSubMenu;
        });

        setModulos(filtered);
      } catch (err) {
        console.error('[useModules] Erro ao filtrar módulos:', err);
        // Fallback to public modules
        setModulos(fullRegistry.filter((m) => m.id === 'dash'));
      } finally {
        setLoading(false);
      }
    }

    resolveModules();

    // Listen to custom permission change events to update modules instantly
    const handlePermissionsUpdated = () => {
      resolveModules();
    };

    window.addEventListener('auth:permissions_updated', handlePermissionsUpdated);
    return () => {
      window.removeEventListener('auth:permissions_updated', handlePermissionsUpdated);
    };
  }, [estaAutenticado, usuario]);

  return (
    <ModulesContext.Provider value={{ modulos, loading }}>
      {children}
    </ModulesContext.Provider>
  );
};

export const useModules = () => {
  const context = useContext(ModulesContext);
  if (!context) throw new Error('useModules deve ser usado dentro de um ModulesProvider');
  return context;
};
export default useModules;

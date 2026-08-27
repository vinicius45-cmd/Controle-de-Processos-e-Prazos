import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthProvider } from '../hooks/useAuth';
import { ModulesProvider } from '../hooks/useModules';

import { AppContextType, FormCadastro } from '../types';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [activeModuleId, setActiveModuleId] = useState<string>('dash');
  const [activeSubMenuId, setActiveSubMenuId] = useState<string | null>(null);
  const [processoSelecionado, setProcessoSelecionado] = useState<FormCadastro | null>(null);
  const [modoVisualizacaoProcesso, setModoVisualizacaoProcesso] = useState<'editar' | 'visualizar' | null>(null);
  
  // Responsive sidebar open state: closed by default on mobile, open on desktop
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);

  const toggleTheme = () => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  
  const navegarPara = (moduleId: string, subMenuId: string | null = null) => {
    setActiveModuleId(moduleId);
    setActiveSubMenuId(subMenuId);

    if (typeof window !== 'undefined') {
      window.history.pushState({ moduleId, subMenuId }, '', window.location.pathname);
    }
    
    // Auto collapse sidebar on mobile after navigating
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  const toggleSidebar = () => setSidebarOpen(prev => !prev);

  const definirProcessoSelecionado = (processo: FormCadastro | null, modo: 'editar' | 'visualizar' | null = null) => {
    setProcessoSelecionado(processo);
    setModoVisualizacaoProcesso(modo);
  };

  // Resize listener to adapt sidebar state
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    const handlePopState = (event: PopStateEvent) => {
      const state = event.state as { moduleId?: string; subMenuId?: string | null } | null;
      if (state?.moduleId) {
        setActiveModuleId(state.moduleId);
        setActiveSubMenuId(state.subMenuId ?? null);
      }
    };

    if (typeof window !== 'undefined') {
      const initialState = window.history.state as { moduleId?: string; subMenuId?: string | null } | null;
      if (initialState?.moduleId) {
        setActiveModuleId(initialState.moduleId);
        setActiveSubMenuId(initialState.subMenuId ?? null);
      } else {
        window.history.replaceState({ moduleId: activeModuleId, subMenuId: activeSubMenuId }, '', window.location.pathname);
      }
      window.addEventListener('resize', handleResize);
      window.addEventListener('popstate', handlePopState);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  return (
    <AppContext.Provider value={{ 
      theme, 
      toggleTheme, 
      activeModuleId, 
      activeSubMenuId, 
      navegarPara,
      sidebarOpen,
      toggleSidebar,
      setSidebarOpen,
      processoSelecionado,
      modoVisualizacaoProcesso,
      definirProcessoSelecionado
    }}>
      <AuthProvider>
        <ModulesProvider>
          <div 
            className={theme === 'dark' ? 'dark' : ''} 
            style={{ 
              minHeight: '100vh', 
              background: 'var(--semob-bg)', 
              color: 'var(--semob-text)', 
              transition: 'background-color 0.3s, color 0.3s' 
            }}
          >
            {children}
          </div>
        </ModulesProvider>
      </AuthProvider>
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp deve ser usado dentro de um AppProvider');
  return context;
};
export default AppProvider;

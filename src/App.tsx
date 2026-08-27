import React from 'react';
import AppProvider, { useApp } from './app/AppProvider';
import { Button } from './components/Button';
import { ContentArea } from './components/ContentArea';
import { Headerbar } from './components/Headerbar';
import { MenuItem, Sidebar } from './components/Sidebar';
import { useAuth } from './hooks/useAuth';
import { useModules } from './hooks/useModules';
import { useSemAcesso } from './hooks/useSemAcesso';
import { LoginScreen } from './screens/LoginScreen';
import {
  Building2,
  Bus,
  CreditCard,
  FileText,
  FilePenLine,
  Key,
  LayoutDashboard,
  Lock,
  LucideIcon,
  Route,
  Server,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Terminal,
  Users,
  ClipboardList,
  FileCheck2,
  Bell,
  Settings
} from 'lucide-react';

const sidebarIconMap = {
  LayoutDashboard,
  Building2,
  Shield,
  ShieldCheck,
  Server,
  Users,
  Key,
  Route,
  Bus,
  FileText,
  FilePenLine,
  CreditCard,
  Lock,
  Terminal,
  ClipboardList,
  FileCheck2,
  Bell,
  Settings
} satisfies Record<string, LucideIcon>;

const getSidebarIcon = (iconName?: string): LucideIcon => {
  if (iconName && iconName in sidebarIconMap) {
    return sidebarIconMap[iconName as keyof typeof sidebarIconMap];
  }

  return Shield;
};

const LoadingSpinner: React.FC = () => (
  <div className="app-loading">
    <div className="app-loading__spinner" />
    <span>Carregando módulo...</span>
  </div>
);

const LockScreen: React.FC = () => {
  const { usuario, fazerLogout } = useAuth();

  return (
    <div className="lock-screen">
      <div className="lock-screen__card glassmorphism animate-scale-up">
        <div className="lock-screen__icon">
          <ShieldAlert size={36} />
        </div>
        <h2>Acesso não Autorizado</h2>
        <p>
          Olá, <strong>{usuario?.nome}</strong>. Sua autenticação com o LDAP ocorreu com sucesso,
          mas você não possui perfis ou permissões de módulos configurados no CDP.
        </p>
        <div className="lock-screen__notice">
          Entre em contato com o administrador do sistema para liberar seu perfil.
        </div>
        <Button variant="danger" style={{ width: '100%' }} onClick={fazerLogout}>
          Voltar para o Login
        </Button>
      </div>
    </div>
  );
};

const MainLayoutShell: React.FC = () => {
  const { modulos } = useModules();
  const {
    activeModuleId,
    activeSubMenuId,
    navegarPara,
    sidebarOpen,
    toggleSidebar
  } = useApp();

  const activeModule = modulos.find((module) => module.id === activeModuleId);
  const activeSubmenu = activeModule?.subMenus?.find((submenu) => submenu.id === activeSubMenuId);
  const ViewComponent = activeSubmenu ? activeSubmenu.componente : activeModule?.componente ?? null;
  const currentPath = activeSubmenu?.rota ?? activeModule?.rota ?? 'dashboard';
  const sidebarItems: MenuItem[] = modulos.flatMap((module) => {
    if (module.subMenus?.length) {
      return module.subMenus.map((submenu) => ({
        id: submenu.id,
        label: submenu.titulo,
        icon: getSidebarIcon(submenu.icone),
        path: submenu.rota ?? module.rota
      }));
    }

    return [{
      id: module.id,
      label: module.nome,
      icon: getSidebarIcon(module.icone),
      path: module.rota
    }];
  });

  const handleSidebarNavigate = (path: string) => {
    const moduleMatch = modulos.find((module) => module.rota === path);
    if (moduleMatch) {
      navegarPara(moduleMatch.id, null);
      return;
    }

    for (const module of modulos) {
      const submenuMatch = module.subMenus?.find((submenu) => submenu.rota === path);
      if (submenuMatch) {
        navegarPara(module.id, submenuMatch.id);
        return;
      }
    }
  };

  return (
    <div className="app-shell">
      <Sidebar
        currentPath={currentPath}
        isMobileOpen={sidebarOpen}
        items={sidebarItems}
        onCloseMobile={toggleSidebar}
        onNavigate={handleSidebarNavigate}
      />

      <div className="app-shell__workspace">
        <Headerbar />
        <ContentArea fallback={<LoadingSpinner />} viewComponent={ViewComponent} />
        <footer className="app-footer">
          Secretaria de Estado de Mobilidade do Distrito Federal • SEMOB-DF • 2026
        </footer>
      </div>
    </div>
  );
};

const AppContent: React.FC = () => {
  const { estaAutenticado } = useAuth();
  const { bloqueado } = useSemAcesso();

  if (!estaAutenticado) {
    return <LoginScreen />;
  }

  if (bloqueado) {
    return <LockScreen />;
  }

  return <MainLayoutShell />;
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
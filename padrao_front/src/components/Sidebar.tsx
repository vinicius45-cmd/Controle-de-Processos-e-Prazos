import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ClipboardList,
  FilePenLine,
  Home,
  LucideIcon,
  LogOut,
  Settings,
  X
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export type MenuItem = {
  id: string;
  label: string;
  icon: LucideIcon;
  path: string;
};

export interface SidebarProps {
  items: MenuItem[];
  currentPath: string;
  onNavigate: (path: string, item: MenuItem) => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  title?: string;
}

export const processSidebarItems: MenuItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/dashboard' },
  { id: 'meus-processos', label: 'Meus Processos', icon: ClipboardList, path: '/meus-processos' },
  { id: 'cadastro-processo', label: 'Cadastro de Processo', icon: FilePenLine, path: '/cadastro-processo' },
  { id: 'administracao', label: 'Administração', icon: Settings, path: '/administracao' }
];

const normalizePath = (path: string): string => (path.startsWith('/') ? path : `/${path}`);

export const Sidebar: React.FC<SidebarProps> = ({
  items,
  currentPath,
  onNavigate,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const { fazerLogout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);

      if (mobile) {
        setCollapsed(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const sidebarClasses = [
    'app-sidebar',
    collapsed ? 'app-sidebar--collapsed' : '',
    isMobile ? 'app-sidebar--mobile' : '',
    isMobile && isMobileOpen ? 'app-sidebar--open' : ''
  ].filter(Boolean).join(' ');

  const normalizedCurrentPath = normalizePath(currentPath);
  const brandTitle = 'SEMOB-DF';
  const brandSubtitle = 'Gestão de Processos';

  return (
    <>
      {isMobile && isMobileOpen && (
        <button
          aria-label="Fechar menu lateral"
          className="app-sidebar__overlay"
          onClick={onCloseMobile}
          type="button"
        />
      )}

      <aside aria-label="Menu principal" className={sidebarClasses}>
        {isMobile && (
          <button
            aria-label="Fechar menu"
            className="app-sidebar__icon-button app-sidebar__icon-button--close"
            onClick={onCloseMobile}
            type="button"
          >
            <X size={20} />
          </button>
        )}

        {(!collapsed || isMobile) && (
          <header className="app-sidebar__brand-text">
            <strong>{brandTitle}</strong>
            <span>{brandSubtitle}</span>
          </header>
        )}

        <nav className="app-sidebar__nav">
          {items.map((item) => {
            const Icon = item.icon;
            const normalizedItemPath = normalizePath(item.path);
            const isActive = normalizedCurrentPath === normalizedItemPath;

            return (
              <React.Fragment key={item.id}>
                {item.id === 'administracao' && !collapsed && (
                  <span className="app-sidebar__section-label">ADMINISTRAÇÃO</span>
                )}
                <button
                  aria-current={isActive ? 'page' : undefined}
                  className={[
                    'app-sidebar__item',
                    isActive ? 'app-sidebar__item--active' : ''
                  ].filter(Boolean).join(' ')}
                  onClick={() => onNavigate(item.path, item)}
                  title={collapsed && !isMobile ? item.label : undefined}
                  type="button"
                >
                  <span className="app-sidebar__item-icon">
                    {item.id === 'dashboard' ? (
                      <span className="app-sidebar__dashboard-icon" aria-hidden="true">
                        <i /><i /><i /><i />
                      </span>
                    ) : (
                      <Icon aria-hidden="true" size={22} strokeWidth={1.8} />
                    )}
                  </span>

                  {(!collapsed || isMobile) && (
                    <span className="app-sidebar__item-label">{item.label}</span>
                  )}
                </button>
              </React.Fragment>
            );
          })}
        </nav>

        <div className="app-sidebar__user">
          <div className="app-sidebar__user-avatar">MS</div>
          {(!collapsed || isMobile) && (
            <div className="app-sidebar__user-copy">
              <strong>Maria Silva</strong>
              <span>ASSAD</span>
            </div>
          )}
          {!isMobile && (
            <button aria-label="Abrir perfil" className="app-sidebar__user-toggle" type="button">
              <ArrowLeft size={16} strokeWidth={2} />
            </button>
          )}
        </div>

        {!collapsed && (
          <button className="app-sidebar__logout" onClick={fazerLogout} type="button">
            <LogOut aria-hidden="true" size={17} strokeWidth={2} />
            <span>Sair</span>
          </button>
        )}
      </aside>
    </>
  );
};

export default Sidebar;

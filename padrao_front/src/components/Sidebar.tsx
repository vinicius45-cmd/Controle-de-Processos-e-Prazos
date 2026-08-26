import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Bell,
  ClipboardList,
  FileCheck2,
  FilePenLine,
  FileText,
  Home,
  LucideIcon,
  Settings,
  X
} from 'lucide-react';

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
  { id: 'pendencias', label: 'Pendências', icon: FileText, path: '/pendencias' },
  { id: 'para-assinatura', label: 'Para Assinatura', icon: FileCheck2, path: '/para-assinatura' },
  { id: 'relatorios', label: 'Relatórios', icon: ClipboardList, path: '/relatorios' },
  { id: 'alertas', label: 'Alertas', icon: Bell, path: '/alertas' },
  { id: 'administracao', label: 'Administração', icon: Settings, path: '/administracao' }
];

const normalizePath = (path: string): string => (path.startsWith('/') ? path : `/${path}`);

export const Sidebar: React.FC<SidebarProps> = ({
  items,
  currentPath,
  onNavigate,
  isMobileOpen = false,
  onCloseMobile,
  title = 'CONTROLE DE PROCESSOS E PRAZOS'
}) => {
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
  const titleLines = title.split(' ');
  const firstTitleLine = titleLines.slice(0, 2).join(' ');
  const secondTitleLine = titleLines.slice(2).join(' ');

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
        <header className="app-sidebar__brand">
          <div className="app-sidebar__brand-mark" aria-hidden="true">
            <FileText size={23} strokeWidth={1.8} />
          </div>

          {(!collapsed || isMobile) && (
            <div className="app-sidebar__brand-copy">
              <strong>{firstTitleLine}</strong>
              <strong>{secondTitleLine}</strong>
            </div>
          )}

          {isMobile && (
            <button
              aria-label="Fechar menu"
              className="app-sidebar__icon-button"
              onClick={onCloseMobile}
              type="button"
            >
              <X size={20} />
            </button>
          )}
        </header>

        <nav className="app-sidebar__nav">
          {items.map((item) => {
            const Icon = item.icon;
            const normalizedItemPath = normalizePath(item.path);
            const isActive = normalizedCurrentPath === normalizedItemPath;

            return (
              <button
                aria-current={isActive ? 'page' : undefined}
                className={[
                  'app-sidebar__item',
                  isActive ? 'app-sidebar__item--active' : ''
                ].filter(Boolean).join(' ')}
                key={item.id}
                onClick={() => onNavigate(item.path, item)}
                title={collapsed && !isMobile ? item.label : undefined}
                type="button"
              >
                <span className="app-sidebar__item-icon">
                  <Icon aria-hidden="true" size={18} strokeWidth={1.9} />
                </span>

                {(!collapsed || isMobile) && (
                  <span className="app-sidebar__item-label">{item.label}</span>
                )}
              </button>
            );
          })}
        </nav>

        {!isMobile && (
          <button
            aria-label={collapsed ? 'Expandir menu lateral' : 'Recolher menu lateral'}
            className="app-sidebar__collapse"
            onClick={() => setCollapsed((current) => !current)}
            type="button"
          >
            <ArrowLeft aria-hidden="true" size={17} strokeWidth={2} />
            {!collapsed && <span>Recolher menu</span>}
          </button>
        )}
      </aside>
    </>
  );
};

export default Sidebar;

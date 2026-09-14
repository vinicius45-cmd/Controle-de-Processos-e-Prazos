import React from 'react';
import {
  Bell,
  HelpCircle,
  LogIn,
  Menu,
} from 'lucide-react';
import { useApp } from '../app/AppProvider';
import { useAuth } from '../hooks/useAuth';
import { useModules } from '../hooks/useModules';

export const Headerbar: React.FC = () => {
  const { fazerLogout } = useAuth();
  const { activeModuleId, activeSubMenuId, toggleSidebar, navegarPara } = useApp();
  const { modulos } = useModules();
  const activeModule = modulos.find((module) => module.id === activeModuleId);
  const activeSubmenu = activeModule?.subMenus?.find((submenu) => submenu.id === activeSubMenuId);
  const titleDisplay = activeSubmenu
    ? `${activeModule?.nome ?? 'Sistema'} / ${activeSubmenu.titulo}`
    : activeModule?.nome === 'Dashboard' ? 'Processos' : activeModule?.nome ?? 'Processos';

  return (
    <header className="app-header app-header--compact">
      <div className="app-header__title-group">
        <button
          aria-label="Abrir menu"
          className="app-header__menu-button show-mobile-flex"
          onClick={toggleSidebar}
          type="button"
        >
          <Menu size={21} />
        </button>
        <div>
          <h1 className="app-header__title">{titleDisplay}</h1>
        </div>
      </div>

      <div className="app-header__actions">
        <button
          aria-label="Ir para alertas"
          className="app-header__icon-button"
          onClick={() => navegarPara('alertas')}
          type="button"
        >
          <span className="app-header__notification-icon"><Bell size={19} /><b>3</b></span>
        </button>

        <span className="app-header__action-divider" aria-hidden="true" />

        <button
          aria-label="Ajuda"
          className="app-header__icon-button"
          onClick={() => undefined}
          type="button"
        >
          <HelpCircle size={20} />
        </button>

        <span className="app-header__action-divider" aria-hidden="true" />

        <button aria-label="Sair do sistema" className="app-header__icon-button" onClick={fazerLogout} type="button">
          <LogIn size={20} />
        </button>
      </div>
    </header>
  );
};

export default Headerbar;

import React from 'react';
import {
  Bell,
  ChevronDown,
  HelpCircle,
  Menu,
} from 'lucide-react';
import { useApp } from '../app/AppProvider';
import { useAuth } from '../hooks/useAuth';
import { useModules } from '../hooks/useModules';

export const Headerbar: React.FC = () => {
  const { fazerLogout, usuario } = useAuth();
  const { activeModuleId, activeSubMenuId, toggleSidebar, navegarPara } = useApp();
  const { modulos } = useModules();
  const activeModule = modulos.find((module) => module.id === activeModuleId);
  const activeSubmenu = activeModule?.subMenus?.find((submenu) => submenu.id === activeSubMenuId);
  const titleDisplay = activeSubmenu
    ? `${activeModule?.nome ?? 'Sistema'} / ${activeSubmenu.titulo}`
    : activeModule?.nome === 'Dashboard' ? 'Processos' : activeModule?.nome ?? 'Processos';
  const mostrarTitulo = activeModuleId !== 'cadastro-processo';
  const telaCadastro = activeModuleId === 'cadastro-processo';

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
        {telaCadastro ? (
          <button
            className="process-header__back"
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent('processo:voltar-lista'))}
          >
            <span aria-hidden="true">←</span> Voltar para Processos
          </button>
        ) : mostrarTitulo ? <div><h1 className="app-header__title">{titleDisplay}</h1></div> : null}
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

        <div className="app-header__profile">
          <button aria-label="Menu do usuário" className="app-header__profile-button" onClick={fazerLogout} type="button">
            <span className="app-header__user-copy">
              <strong>{usuario?.nome ?? 'Maria Silva'}</strong>
              <small>{usuario?.departamento ?? 'ASSAD'}</small>
            </span>
            <ChevronDown size={15} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Headerbar;

import React, { useEffect, useRef, useState } from 'react';
import {
  Bell,
  ChevronDown,
  ChevronUp,
  LogOut,
  Menu,
  Moon,
  Search,
  Sun
} from 'lucide-react';
import { useApp } from '../app/AppProvider';
import { useAuth } from '../hooks/useAuth';
import { useModules } from '../hooks/useModules';

const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0 || !parts[0]) {
    return 'US';
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

export const Headerbar: React.FC = () => {
  const { usuario, fazerLogout } = useAuth();
  const { theme, toggleTheme, activeModuleId, activeSubMenuId, toggleSidebar, navegarPara } = useApp();
  const { modulos } = useModules();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current?.contains(event.target as Node) === false) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeModule = modulos.find((module) => module.id === activeModuleId);
  const activeSubmenu = activeModule?.subMenus?.find((submenu) => submenu.id === activeSubMenuId);
  const titleDisplay = activeSubmenu
    ? `${activeModule?.nome ?? 'Sistema'} / ${activeSubmenu.titulo}`
    : activeModule?.nome ?? 'Sistema de Gestão';

  return (
    <header className="app-header">
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
          <span className="app-header__eyebrow">Página atual</span>
          <h1 className="app-header__title">{titleDisplay}</h1>
        </div>
      </div>

      <form className="app-header__search" role="search">
        <Search aria-hidden="true" size={18} />
        <input aria-label="Buscar no sistema" placeholder="Buscar processos, prazos ou módulos" type="search" />
      </form>

      <div className="app-header__actions">
        <button
          aria-label="Ir para alertas"
          className="app-header__icon-button"
          onClick={() => navegarPara('alertas')}
          type="button"
        >
          <Bell size={19} />
        </button>

        <button
          aria-label={theme === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro'}
          className="app-header__icon-button"
          onClick={toggleTheme}
          type="button"
        >
          {theme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}
        </button>

        {usuario && (
          <div className="app-header__profile" ref={dropdownRef}>
            <button
              aria-expanded={dropdownOpen}
              className="app-header__profile-button"
              onClick={() => setDropdownOpen((current) => !current)}
              type="button"
            >
              <span className="app-header__avatar">{getInitials(usuario.nome)}</span>
              <span className="app-header__user-copy hide-mobile">
                <strong>{usuario.nome.split(' ')[0]}</strong>
                <small>{usuario.cargo}</small>
              </span>
              {dropdownOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </button>

            {dropdownOpen && (
              <div className="app-header__dropdown">
                <div className="app-header__dropdown-user">
                  <strong>{usuario.nome}</strong>
                  <span>{usuario.email}</span>
                </div>

                <dl className="app-header__meta">
                  <div>
                    <dt>Matrícula</dt>
                    <dd>{usuario.matricula}</dd>
                  </div>
                  <div>
                    <dt>Perfil</dt>
                    <dd>{usuario.cargo}</dd>
                  </div>
                  <div>
                    <dt>Departamento</dt>
                    <dd>{usuario.departamento}</dd>
                  </div>
                </dl>

                <button className="app-header__logout" onClick={fazerLogout} type="button">
                  <LogOut size={15} />
                  Sair do sistema
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Headerbar;

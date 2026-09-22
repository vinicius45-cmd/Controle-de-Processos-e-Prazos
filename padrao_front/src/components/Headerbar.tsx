import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Bell,
  ChevronDown,
  HelpCircle,
} from 'lucide-react';
import { useApp } from '../app/AppProvider';
import { useAuth } from '../hooks/useAuth';

export const Headerbar: React.FC = () => {
  const { fazerLogout, usuario } = useAuth();
  const { activeModuleId, navegarPara } = useApp();
  const [cadastroFormularioAberto, setCadastroFormularioAberto] = useState(false);
  const telaCadastro = activeModuleId === 'cadastro-processo';
  const mostrarTituloProcessos = ['dashboard', 'meus-processos', 'administracao'].includes(activeModuleId ?? '');
  const mostrarBotaoRetorno = telaCadastro && cadastroFormularioAberto;

  useEffect(() => {
    const atualizarEstadoFormulario = (event: Event) => {
      setCadastroFormularioAberto((event as CustomEvent<{ aberto: boolean }>).detail.aberto);
    };

    window.addEventListener('cadastro:formulario-estado', atualizarEstadoFormulario);
    return () => window.removeEventListener('cadastro:formulario-estado', atualizarEstadoFormulario);
  }, []);

  useEffect(() => {
    if (!telaCadastro) {
      setCadastroFormularioAberto(false);
    }
  }, [telaCadastro]);

  return (
    <header className="app-header app-header--compact">
      <div className="app-header__title-group">
        {mostrarBotaoRetorno ? (
          <button
            className="process-header__back"
            type="button"
            onClick={() => {
              if (telaCadastro) {
                window.dispatchEvent(new CustomEvent('processo:voltar-lista'));
                return;
              }

              navegarPara('dashboard');
            }}
          >
            <ArrowLeft aria-hidden="true" size={18} strokeWidth={2} /> Voltar para Processos
          </button>
        ) : mostrarTituloProcessos || telaCadastro ? (
          <h1 className="app-header__title">Processos</h1>
        ) : null}
      </div>

      <div className="app-header__actions">
        <button
          aria-label="Ir para o painel"
          className="app-header__icon-button"
          onClick={() => navegarPara('dashboard')}
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

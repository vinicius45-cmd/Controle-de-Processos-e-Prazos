import React, { useState } from 'react';
import { Eye, EyeOff, FileText, Lock, User } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface LoginCredentials {
  usuario: string;
  senha: string;
  lembrar: boolean;
}

type LoginFieldName = keyof LoginCredentials;

const initialCredentials: LoginCredentials = {
  usuario: '',
  senha: '',
  lembrar: false
};

export const LoginScreen: React.FC = () => {
  const { fazerLogin, erroLogin, loadingAuth } = useAuth();
  const [credentials, setCredentials] = useState<LoginCredentials>(initialCredentials);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const updateCredential = (field: LoginFieldName, value: string | boolean) => {
    setCredentials((current) => ({
      ...current,
      [field]: value
    }));
  };

  const handleTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.currentTarget;
    updateCredential(name as LoginFieldName, value);
  };

  const handleRememberChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    updateCredential('lembrar', event.currentTarget.checked);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const usuario = credentials.usuario.trim();
    if (!usuario || !credentials.senha) {
      return;
    }

    try {
      await fazerLogin(usuario, credentials.senha);
    } catch {
      // erroLogin is controlled by the auth hook.
    }
  };

  return (
    <main className="login-page">
      <section className="login-shell" aria-label="Tela de autenticação">
        <aside className="login-brand" aria-label="Identidade do sistema">
          <div className="login-brand__content">
            <div className="login-brand__icon" aria-hidden="true">
              <FileText size={37} strokeWidth={1.7} />
            </div>
            <h1>
              Controle de
              <span>Processos e Prazos</span>
            </h1>
            <p>Sistema de Gestão</p>
          </div>
          <div className="login-brand__documents" aria-hidden="true" />
        </aside>

        <section className="login-panel" aria-label="Formulário de login">
          <form className="login-card" onSubmit={handleSubmit}>
            <h2>Acesse sua conta</h2>

            <label className="login-field">
              <span className="sr-only">Usuário</span>
              <User size={14} aria-hidden="true" />
              <input
                autoComplete="username"
                name="usuario"
                onChange={handleTextChange}
                placeholder="Usuário"
                type="text"
                value={credentials.usuario}
              />
            </label>

            <label className="login-field">
              <span className="sr-only">Senha</span>
              <Lock size={14} aria-hidden="true" />
              <input
                autoComplete="current-password"
                name="senha"
                onChange={handleTextChange}
                placeholder="Senha"
                type={showPassword ? 'text' : 'password'}
                value={credentials.senha}
              />
              <button
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                className="login-field__toggle"
                onClick={() => setShowPassword((current) => !current)}
                type="button"
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </label>

            <div className="login-options">
              <label className="login-remember">
                <input
                  checked={credentials.lembrar}
                  name="lembrar"
                  onChange={handleRememberChange}
                  type="checkbox"
                />
                <span>Lembrar-me</span>
              </label>

              <a href="#recuperar-senha">Esqueci minha senha</a>
            </div>

            {erroLogin && <p className="login-error">{erroLogin}</p>}

            <button className="login-submit" disabled={loadingAuth} type="submit">
              {loadingAuth ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <footer className="login-footer">© 2024 - Todos os direitos reservados</footer>
        </section>
      </section>
    </main>
  );
};

export default LoginScreen;

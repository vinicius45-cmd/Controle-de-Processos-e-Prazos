import React, { useState } from 'react';
import Popup from '../components/Popup';
import { Button } from '../components/Button';
import '../styles/Administracao.css';

type TabAdministracao = 'usuarios' | 'configuracoes' | 'permissoes';

type PerfilAcesso = 'admin' | 'analista' | 'visualizador';

type StatusUsuario = 'ativo' | 'inativo';

interface UsuarioAdmin {
  id: string;
  nome: string;
  email: string;
  perfil: PerfilAcesso;
  status: StatusUsuario;
}

interface ConfiguracaoSistema {
  habilitarEmail: boolean;
  modoUrgenciaAutomatico: boolean;
  permitirAcessoExterno: boolean;
}

const usuariosMock: UsuarioAdmin[] = [
  {
    id: 'u1',
    nome: 'Ana Beatriz Silva',
    email: 'ana.silva@dominio.gov.br',
    perfil: 'admin',
    status: 'ativo'
  },
  {
    id: 'u2',
    nome: 'Bruno Costa',
    email: 'bruno.costa@dominio.gov.br',
    perfil: 'analista',
    status: 'ativo'
  },
  {
    id: 'u3',
    nome: 'Carla Martins',
    email: 'carla.martins@dominio.gov.br',
    perfil: 'visualizador',
    status: 'inativo'
  },
  {
    id: 'u4',
    nome: 'Diego Rocha',
    email: 'diego.rocha@dominio.gov.br',
    perfil: 'analista',
    status: 'ativo'
  },
  {
    id: 'u5',
    nome: 'Elisa Nogueira',
    email: 'elisa.nogueira@dominio.gov.br',
    perfil: 'admin',
    status: 'ativo'
  }
];

const configuracoesMock: ConfiguracaoSistema = {
  habilitarEmail: true,
  modoUrgenciaAutomatico: false,
  permitirAcessoExterno: false
};

const perfilLabel: Record<PerfilAcesso, string> = {
  admin: 'Administrador',
  analista: 'Analista',
  visualizador: 'Visualizador'
};

const statusLabel: Record<StatusUsuario, string> = {
  ativo: 'Ativo',
  inativo: 'Inativo'
};

const Administracao: React.FC = () => {
  const [abaAtiva, setAbaAtiva] = useState<TabAdministracao>('usuarios');
  const [configuracoes, setConfiguracoes] = useState<ConfiguracaoSistema>(configuracoesMock);
  const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>(usuariosMock);
  const [isFormularioAberto, setIsFormularioAberto] = useState(false);
  const [modoEdicao, setModoEdicao] = useState<'novo' | 'editar'>('novo');
  const [usuarioSelecionado, setUsuarioSelecionado] = useState<UsuarioAdmin | null>(null);
  const [formData, setFormData] = useState<Omit<UsuarioAdmin, 'id'>>({
    nome: '',
    email: '',
    perfil: 'admin',
    status: 'ativo'
  });
  const [usuarioParaExcluir, setUsuarioParaExcluir] = useState<UsuarioAdmin | null>(null);
  const [isConfirmacaoExcluirAberto, setIsConfirmacaoExcluirAberto] = useState(false);
  const [configuracoesSalvas, setConfiguracoesSalvas] = useState(false);
  const [permissoes, setPermissoes] = useState([
    { id: 'cdp-usuarios', nome: 'Gerenciar usuários', descricao: 'Permite visualizar e editar usuários do sistema.', nivel: 'ESCRITA' as const },
    { id: 'cdp-grupos', nome: 'Gerenciar perfis', descricao: 'Permite alterar perfis e grupos de acesso.', nivel: 'ESCRITA' as const },
    { id: 'cdp-sistemas', nome: 'Acessar controle de sistemas', descricao: 'Permite acesso ao painel de sistemas no CDP.', nivel: 'LEITURA' as const },
    { id: 'sif-validador', nome: 'Validadores', descricao: 'Permite acessar a lista de validadores.', nivel: 'LEITURA' as const }
  ]);
  const [permissoesSalvas, setPermissoesSalvas] = useState(false);

  const handleToggle = (field: keyof ConfiguracaoSistema): void => {
    setConfiguracoes((current) => ({
      ...current,
      [field]: !current[field]
    }));
    setConfiguracoesSalvas(false);
  };

  const handleSalvarConfiguracoes = (): void => {
    setConfiguracoesSalvas(true);
    window.setTimeout(() => setConfiguracoesSalvas(false), 3000);
  };

  const handlePermissaoChange = (id: string, nivel: 'NENHUM' | 'LEITURA' | 'ESCRITA'): void => {
    setPermissoes((current) => current.map((item) => (
      item.id === id ? { ...item, nivel } : item
    )));
    setPermissoesSalvas(false);
  };

  const handleSalvarPermissoes = (): void => {
    setPermissoesSalvas(true);
    window.setTimeout(() => setPermissoesSalvas(false), 3000);
  };

  const handleSelectAba = (aba: TabAdministracao): void => {
    setAbaAtiva(aba);
    setIsFormularioAberto(false);
    setIsConfirmacaoExcluirAberto(false);
    setUsuarioSelecionado(null);
    setUsuarioParaExcluir(null);
    setConfiguracoesSalvas(false);
    setPermissoesSalvas(false);
  };

  const abrirFormularioNovo = (): void => {
    setModoEdicao('novo');
    setUsuarioSelecionado(null);
    setFormData({ nome: '', email: '', perfil: 'admin', status: 'ativo' });
    setIsFormularioAberto(true);
  };

  const abrirFormularioEdicao = (usuario: UsuarioAdmin): void => {
    setModoEdicao('editar');
    setUsuarioSelecionado(usuario);
    setFormData({ nome: usuario.nome, email: usuario.email, perfil: usuario.perfil, status: usuario.status });
    setIsFormularioAberto(true);
  };

  const fecharFormulario = (): void => {
    setIsFormularioAberto(false);
    setUsuarioSelecionado(null);
  };

  const atualizarFormulario = (field: keyof Omit<UsuarioAdmin, 'id'>, value: string): void => {
    setFormData((current) => ({
      ...current,
      [field]: field === 'perfil'
        ? (value as PerfilAcesso)
        : field === 'status'
          ? (value as StatusUsuario)
          : value
    }));
  };

  const salvarUsuario = (): void => {
    if (!formData.nome.trim() || !formData.email.trim()) {
      window.alert('Preencha nome e e-mail para continuar.');
      return;
    }

    if (modoEdicao && usuarioSelecionado) {
      setUsuarios((current) => current.map((usuario) => (
        usuario.id === usuarioSelecionado.id
          ? { ...usuario, ...formData }
          : usuario
      )));
    } else {
      const novoUsuario: UsuarioAdmin = {
        id: `u-${Date.now()}`,
        ...formData
      };

      setUsuarios((current) => [novoUsuario, ...current]);
    }

    fecharFormulario();
  };

  const alternarStatusUsuario = (usuario: UsuarioAdmin): void => {
    setUsuarios((current) => current.map((item) => (
      item.id === usuario.id
        ? { ...item, status: item.status === 'ativo' ? 'inativo' : 'ativo' }
        : item
    )));
  };

  const abrirConfirmacaoExcluir = (usuario: UsuarioAdmin): void => {
    setUsuarioParaExcluir(usuario);
    setIsConfirmacaoExcluirAberto(true);
  };

  const cancelarExcluir = (): void => {
    setUsuarioParaExcluir(null);
    setIsConfirmacaoExcluirAberto(false);
  };

  const confirmarExcluir = (): void => {
    if (!usuarioParaExcluir) return;

    setUsuarios((current) => current.filter((usuario) => usuario.id !== usuarioParaExcluir.id));
    setIsConfirmacaoExcluirAberto(false);

    if (usuarioSelecionado?.id === usuarioParaExcluir.id) {
      fecharFormulario();
    }

    setUsuarioParaExcluir(null);
  };

  return (
    <section className="administracao-page" aria-label="Administração">
      <div className="administracao-header-row">
        <h1>Administração</h1>
        <button type="button" className="administracao-button administracao-button--primary" onClick={abrirFormularioNovo}>
          + Novo Usuário
        </button>
      </div>

      <div className="administracao-tabs" role="tablist" aria-label="Sub-abas de administração">
        <button
          type="button"
          className={`administracao-tab ${abaAtiva === 'usuarios' ? 'administracao-tab--active' : ''}`}
          onClick={() => handleSelectAba('usuarios')}
          aria-selected={abaAtiva === 'usuarios'}
        >
          Usuários do Sistema
        </button>
        <button
          type="button"
          className={`administracao-tab ${abaAtiva === 'configuracoes' ? 'administracao-tab--active' : ''}`}
          onClick={() => handleSelectAba('configuracoes')}
          aria-selected={abaAtiva === 'configuracoes'}
        >
          Configurações Gerais
        </button>
        <button
          type="button"
          className={`administracao-tab ${abaAtiva === 'permissoes' ? 'administracao-tab--active' : ''}`}
          onClick={() => handleSelectAba('permissoes')}
          aria-selected={abaAtiva === 'permissoes'}
        >
          Permissões
        </button>
      </div>

      {abaAtiva === 'usuarios' && (
        <>
          {isFormularioAberto ? (
            <div className="administracao-form-card">
              <div className="administracao-form-header">
                <div>
                  <p className="administracao-form-subtitle">Usuários do Sistema</p>
                  <h2>{modoEdicao === 'editar' ? 'Editar usuário' : 'Cadastrar novo usuário'}</h2>
                </div>
                <button
                  type="button"
                  className="administracao-icon-button administracao-icon-button--secondary"
                  onClick={fecharFormulario}
                >
                  Voltar para lista
                </button>
              </div>

              <div className="administracao-form-grid">
                <div className="administracao-form-row">
                  <label className="administracao-form-label" htmlFor="nome">Nome completo</label>
                  <input
                    id="nome"
                    className="administracao-form-input"
                    type="text"
                    value={formData.nome}
                    onChange={(event) => atualizarFormulario('nome', event.target.value)}
                    placeholder="Nome do usuário"
                  />
                </div>
                <div className="administracao-form-row">
                  <label className="administracao-form-label" htmlFor="email">E-mail</label>
                  <input
                    id="email"
                    className="administracao-form-input"
                    type="email"
                    value={formData.email}
                    onChange={(event) => atualizarFormulario('email', event.target.value)}
                    placeholder="usuario@dominio.gov.br"
                  />
                </div>
                <div className="administracao-form-row">
                  <label className="administracao-form-label" htmlFor="perfil">Perfil / Cargo</label>
                  <select
                    id="perfil"
                    className="administracao-form-select"
                    value={formData.perfil}
                    onChange={(event) => atualizarFormulario('perfil', event.target.value)}
                  >
                    <option value="admin">Administrador</option>
                    <option value="analista">Analista</option>
                    <option value="visualizador">Visualizador</option>
                  </select>
                </div>
                <div className="administracao-form-row">
                  <label className="administracao-form-label" htmlFor="status">Status</label>
                  <select
                    id="status"
                    className="administracao-form-select"
                    value={formData.status}
                    onChange={(event) => atualizarFormulario('status', event.target.value)}
                  >
                    <option value="ativo">Ativo</option>
                    <option value="inativo">Inativo</option>
                  </select>
                </div>
              </div>

              <div className="administracao-form-actions">
                <Button variant="outline" size="md" onClick={fecharFormulario}>Cancelar</Button>
                <Button variant="primary" size="md" onClick={salvarUsuario}>
                  {modoEdicao === 'editar' ? 'Salvar alterações' : 'Cadastrar usuário'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="administracao-table-card">
              <table className="administracao-table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>E-mail</th>
                    <th>Perfil/Cargo</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {usuarios.map((usuario) => (
                    <tr key={usuario.id}>
                      <td>
                        <strong>{usuario.nome}</strong>
                      </td>
                      <td>{usuario.email}</td>
                      <td>
                        <span className={`administracao-tag administracao-tag--${usuario.perfil}`}>
                          {perfilLabel[usuario.perfil]}
                        </span>
                      </td>
                      <td>
                        <span className={`administracao-status administracao-status--${usuario.status}`}>
                          {statusLabel[usuario.status]}
                        </span>
                      </td>
                      <td className="administracao-actions-cell">
                        <button
                          type="button"
                          className="administracao-icon-button"
                          onClick={() => abrirFormularioEdicao(usuario)}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className={`administracao-icon-button ${usuario.status === 'ativo' ? 'administracao-icon-button--danger' : ''}`}
                          onClick={() => alternarStatusUsuario(usuario)}
                        >
                          {usuario.status === 'ativo' ? 'Bloquear' : 'Ativar'}
                        </button>
                        <button
                          type="button"
                          className="administracao-icon-button administracao-icon-button--danger"
                          onClick={() => abrirConfirmacaoExcluir(usuario)}
                        >
                          Excluir
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <Popup
            isOpen={isConfirmacaoExcluirAberto}
            onClose={cancelarExcluir}
            title="Confirmar exclusão"
            variant="danger"
            size="sm"
            actions={(
              <>
                <Button variant="outline" size="sm" onClick={cancelarExcluir}>Cancelar</Button>
                <Button variant="danger" size="sm" onClick={confirmarExcluir}>Excluir</Button>
              </>
            )}
          >
            <p>Tem certeza que deseja excluir o usuário <strong>{usuarioParaExcluir?.nome}</strong>?</p>
            <p style={{ marginTop: '0.75rem' }}>Esta ação não pode ser desfeita.</p>
          </Popup>
        </>
      )}

      {abaAtiva === 'configuracoes' && (
        <div className="administracao-config-card">
          <div className="administracao-config-row">
            <label className="administracao-config-label">Habilitar notificações por e-mail</label>
            <button
              type="button"
              className={`administracao-switch ${configuracoes.habilitarEmail ? 'administracao-switch--active' : ''}`}
              onClick={() => handleToggle('habilitarEmail')}
            >
              <span />
            </button>
          </div>
          <div className="administracao-config-row">
            <label className="administracao-config-label">Ativar modo de urgência automático</label>
            <button
              type="button"
              className={`administracao-switch ${configuracoes.modoUrgenciaAutomatico ? 'administracao-switch--active' : ''}`}
              onClick={() => handleToggle('modoUrgenciaAutomatico')}
            >
              <span />
            </button>
          </div>
          <div className="administracao-config-row">
            <label className="administracao-config-label">Permitir acessos externos</label>
            <button
              type="button"
              className={`administracao-switch ${configuracoes.permitirAcessoExterno ? 'administracao-switch--active' : ''}`}
              onClick={() => handleToggle('permitirAcessoExterno')}
            >
              <span />
            </button>
          </div>
          <div className="administracao-config-actions">
            <button type="button" className="administracao-button administracao-button--secondary" onClick={handleSalvarConfiguracoes}>
              Salvar alterações
            </button>
          </div>
          {configuracoesSalvas && (
            <div className="administracao-save-message">Alterações salvas</div>
          )}
        </div>
      )}

      {abaAtiva === 'permissoes' && (
        <div className="administracao-permissions-card">
          <div className="administracao-form-header">
            <div>
              <p className="administracao-form-subtitle">Permissões</p>
              <h2>Gerenciar permissões</h2>
            </div>
          </div>
          <div className="administracao-permissions-table-wrapper">
            <table className="administracao-permissions-table">
              <thead>
                <tr>
                  <th>Permissão</th>
                  <th>Descrição</th>
                  <th>Nível</th>
                </tr>
              </thead>
              <tbody>
                {permissoes.map((permissao) => (
                  <tr key={permissao.id}>
                    <td>{permissao.nome}</td>
                    <td>{permissao.descricao}</td>
                    <td>
                      <select
                        className="administracao-form-select"
                        value={permissao.nivel}
                        onChange={(event) => handlePermissaoChange(permissao.id, event.target.value as 'NENHUM' | 'LEITURA' | 'ESCRITA')}
                      >
                        <option value="NENHUM">Sem acesso</option>
                        <option value="LEITURA">Leitura</option>
                        <option value="ESCRITA">Escrita</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="administracao-config-actions">
            <button type="button" className="administracao-button administracao-button--secondary" onClick={handleSalvarPermissoes}>
              Salvar alterações
            </button>
          </div>
          {permissoesSalvas && (
            <div className="administracao-save-message">Alterações salvas</div>
          )}
        </div>
      )}
    </section>
  );
};

export default Administracao;

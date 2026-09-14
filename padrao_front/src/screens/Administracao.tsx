import React, { useEffect, useState } from 'react';
import Popup from '../components/Popup';
import { Button } from '../components/Button';
import EnteService from '../services/EnteService';
import UnidadeService from '../services/UnidadeService';
import { Ente } from '../types';
import { Unidade } from '../types';
import { TipoAssunto, TipoDocumento } from '../types';
import TipoAssuntoService from '../services/TipoAssuntoService';
import TipoDocumentoService from '../services/TipoDocumentoService';
import '../styles/Administracao.css';

type TabAdministracao = 'usuarios' | 'entes' | 'unidades' | 'tipos-assunto' | 'tipos-documento' | 'configuracoes' | 'permissoes';

type PerfilAcesso = 'admin' | 'analista' | 'visualizador';

type StatusUsuario = 'ativo' | 'inativo';

type FormEnte = Pick<Ente, 'nmEnte' | 'sgEnte'>;
type FormUnidade = Pick<Unidade, 'nmUnidade' | 'sgUnidade' | 'idUnidadeSuperior'>;

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
  const [entes, setEntes] = useState<Ente[]>([]);
  const [entesLoading, setEntesLoading] = useState(false);
  const [enteFiltro, setEnteFiltro] = useState('');
  const [enteFormAberto, setEnteFormAberto] = useState(false);
  const [enteEditando, setEnteEditando] = useState<Ente | null>(null);
  const [enteForm, setEnteForm] = useState<FormEnte>({ nmEnte: '', sgEnte: '' });
  const [unidades, setUnidades] = useState<Unidade[]>([]);
  const [unidadesLoading, setUnidadesLoading] = useState(false);
  const [unidadeFiltro, setUnidadeFiltro] = useState('');
  const [unidadeFormAberto, setUnidadeFormAberto] = useState(false);
  const [unidadeEditando, setUnidadeEditando] = useState<Unidade | null>(null);
  const [unidadeForm, setUnidadeForm] = useState<FormUnidade>({ nmUnidade: '', sgUnidade: '', idUnidadeSuperior: null });
  const [tiposAssunto, setTiposAssunto] = useState<TipoAssunto[]>([]);
  const [tiposDocumento, setTiposDocumento] = useState<TipoDocumento[]>([]);
  const [tipoFiltro, setTipoFiltro] = useState('');
  const [tipoFormAberto, setTipoFormAberto] = useState(false);
  const [tipoEditando, setTipoEditando] = useState<TipoAssunto | TipoDocumento | null>(null);
  const [tipoNome, setTipoNome] = useState('');
  const [tipoUnidade, setTipoUnidade] = useState<number | null>(null);

  const carregarEntes = async (filtro = enteFiltro): Promise<void> => {
    setEntesLoading(true);
    try {
      setEntes(await EnteService.listar(filtro, false));
    } finally {
      setEntesLoading(false);
    }
  };

  const carregarUnidades = async (filtro = unidadeFiltro): Promise<void> => {
    setUnidadesLoading(true);
    try {
      setUnidades(await UnidadeService.listar(filtro, false));
    } finally {
      setUnidadesLoading(false);
    }
  };

  useEffect(() => {
    void carregarEntes('');
    void carregarUnidades('');
    void carregarTipos();
  }, []);

  const carregarTipos = async (): Promise<void> => {
    const [assuntos, documentos] = await Promise.all([
      TipoAssuntoService.listar(undefined, tipoFiltro, false),
      TipoDocumentoService.listar(tipoFiltro, false)
    ]);
    setTiposAssunto(assuntos);
    setTiposDocumento(documentos);
  };

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
    setEnteFormAberto(false);
    setEnteEditando(null);
    setUnidadeFormAberto(false);
    setUnidadeEditando(null);
    setTipoFormAberto(false);
    setTipoEditando(null);
  };

  const abrirNovoEnte = (): void => {
    setEnteEditando(null);
    setEnteForm({ nmEnte: '', sgEnte: '' });
    setEnteFormAberto(true);
  };

  const abrirEdicaoEnte = (ente: Ente): void => {
    setEnteEditando(ente);
    setEnteForm({ nmEnte: ente.nmEnte, sgEnte: ente.sgEnte });
    setEnteFormAberto(true);
  };

  const salvarEnte = async (): Promise<void> => {
    const nmEnte = enteForm.nmEnte.trim();
    const sgEnte = enteForm.sgEnte.trim().toUpperCase();
    if (!nmEnte || !sgEnte) {
      window.alert('Informe o nome e a sigla do ente.');
      return;
    }

    if (enteEditando) {
      await EnteService.atualizar(enteEditando.idEnte, { nmEnte, sgEnte });
    } else {
      await EnteService.cadastrar({ nmEnte, sgEnte });
    }
    setEnteFormAberto(false);
    setEnteEditando(null);
    await carregarEntes();
  };

  const alternarStatusEnte = async (ente: Ente): Promise<void> => {
    await EnteService.alterarStatus(ente.idEnte, ente.blAtivo === 'S' ? 'N' : 'S');
    await carregarEntes();
  };

  const abrirNovaUnidade = (): void => {
    setUnidadeEditando(null);
    setUnidadeForm({ nmUnidade: '', sgUnidade: '', idUnidadeSuperior: null });
    setUnidadeFormAberto(true);
  };

  const abrirEdicaoUnidade = (unidade: Unidade): void => {
    setUnidadeEditando(unidade);
    setUnidadeForm({ nmUnidade: unidade.nmUnidade, sgUnidade: unidade.sgUnidade, idUnidadeSuperior: unidade.idUnidadeSuperior ?? null });
    setUnidadeFormAberto(true);
  };

  const salvarUnidade = async (): Promise<void> => {
    const dados: FormUnidade = { ...unidadeForm, nmUnidade: unidadeForm.nmUnidade.trim(), sgUnidade: unidadeForm.sgUnidade.trim().toUpperCase() };
    if (!dados.nmUnidade || !dados.sgUnidade) {
      window.alert('Informe o nome e a sigla da unidade.');
      return;
    }
    if (unidadeEditando) await UnidadeService.atualizar(unidadeEditando.idUnidade, dados);
    else await UnidadeService.cadastrar(dados);
    setUnidadeFormAberto(false);
    setUnidadeEditando(null);
    await carregarUnidades();
  };

  const alternarStatusUnidade = async (unidade: Unidade): Promise<void> => {
    await UnidadeService.alterarStatus(unidade.idUnidade, unidade.blAtivo === 'S' ? 'N' : 'S');
    await carregarUnidades();
  };

  const abrirNovoTipo = (): void => {
    setTipoEditando(null);
    setTipoNome('');
    setTipoUnidade(abaAtiva === 'tipos-assunto' ? (unidades[0]?.idUnidade ?? null) : null);
    setTipoFormAberto(true);
  };

  const abrirEdicaoTipo = (tipo: TipoAssunto | TipoDocumento): void => {
    setTipoEditando(tipo);
    setTipoNome('nmTipoAssunto' in tipo ? tipo.nmTipoAssunto : tipo.nmTipoDocumento);
    setTipoUnidade('idUnidade' in tipo ? tipo.idUnidade : null);
    setTipoFormAberto(true);
  };

  const salvarTipo = async (): Promise<void> => {
    const nome = tipoNome.trim();
    if (!nome || (abaAtiva === 'tipos-assunto' && !tipoUnidade)) {
      window.alert('Preencha o nome e a unidade do tipo de assunto.');
      return;
    }
    if (abaAtiva === 'tipos-assunto') {
      const dados = { nmTipoAssunto: nome, idUnidade: tipoUnidade as number };
      if (tipoEditando && 'idTipoAssunto' in tipoEditando) await TipoAssuntoService.atualizar(tipoEditando.idTipoAssunto, dados);
      else await TipoAssuntoService.cadastrar(dados);
    } else {
      const dados = { nmTipoDocumento: nome };
      if (tipoEditando && 'idTipoDocumento' in tipoEditando) await TipoDocumentoService.atualizar(tipoEditando.idTipoDocumento, dados);
      else await TipoDocumentoService.cadastrar(dados);
    }
    setTipoFormAberto(false);
    setTipoEditando(null);
    await carregarTipos();
  };

  const alternarStatusTipo = async (tipo: TipoAssunto | TipoDocumento): Promise<void> => {
    if ('idTipoAssunto' in tipo) await TipoAssuntoService.alterarStatus(tipo.idTipoAssunto, tipo.blAtivo === 'S' ? 'N' : 'S');
    else await TipoDocumentoService.alterarStatus(tipo.idTipoDocumento, tipo.blAtivo === 'S' ? 'N' : 'S');
    await carregarTipos();
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
        {abaAtiva === 'usuarios' && (
          <button type="button" className="administracao-button administracao-button--primary" onClick={abrirFormularioNovo}>
            + Novo Usuário
          </button>
        )}
        {abaAtiva === 'entes' && (
          <button type="button" className="administracao-button administracao-button--primary" onClick={abrirNovoEnte}>
            + Novo Ente
          </button>
        )}
        {abaAtiva === 'unidades' && (
          <button type="button" className="administracao-button administracao-button--primary" onClick={abrirNovaUnidade}>
            + Nova Unidade
          </button>
        )}
        {(abaAtiva === 'tipos-assunto' || abaAtiva === 'tipos-documento') && (
          <button type="button" className="administracao-button administracao-button--primary" onClick={abrirNovoTipo}>
            + Novo Cadastro
          </button>
        )}
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
          className={`administracao-tab ${abaAtiva === 'entes' ? 'administracao-tab--active' : ''}`}
          onClick={() => handleSelectAba('entes')}
          aria-selected={abaAtiva === 'entes'}
        >
          Entes
        </button>
        <button type="button" className={`administracao-tab ${abaAtiva === 'unidades' ? 'administracao-tab--active' : ''}`} onClick={() => handleSelectAba('unidades')} aria-selected={abaAtiva === 'unidades'}>
          Unidades
        </button>
        <button type="button" className={`administracao-tab ${abaAtiva === 'tipos-assunto' ? 'administracao-tab--active' : ''}`} onClick={() => handleSelectAba('tipos-assunto')} aria-selected={abaAtiva === 'tipos-assunto'}>
          Tipos de assunto
        </button>
        <button type="button" className={`administracao-tab ${abaAtiva === 'tipos-documento' ? 'administracao-tab--active' : ''}`} onClick={() => handleSelectAba('tipos-documento')} aria-selected={abaAtiva === 'tipos-documento'}>
          Tipos de documento
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

      {abaAtiva === 'entes' && (
        <div className="administracao-table-card">
          <div className="administracao-catalog-toolbar">
            <input
              className="administracao-form-input"
              type="search"
              value={enteFiltro}
              onChange={(event) => setEnteFiltro(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') void carregarEntes();
              }}
              placeholder="Pesquisar por nome ou sigla"
            />
            <button
              type="button"
              className="administracao-button administracao-button--secondary"
              onClick={() => void carregarEntes()}
            >
              Pesquisar
            </button>
          </div>

          {enteFormAberto && (
            <div className="administracao-form-card administracao-form-card--inline">
              <div className="administracao-form-header">
                <div>
                  <p className="administracao-form-subtitle">Catálogo de entes</p>
                  <h2>{enteEditando ? 'Editar ente' : 'Cadastrar ente'}</h2>
                </div>
                <button type="button" className="administracao-icon-button" onClick={() => setEnteFormAberto(false)}>
                  Cancelar
                </button>
              </div>
              <div className="administracao-form-grid">
                <div className="administracao-form-row">
                  <label className="administracao-form-label" htmlFor="nmEnte">Nome do ente</label>
                  <input
                    id="nmEnte"
                    className="administracao-form-input"
                    value={enteForm.nmEnte}
                    onChange={(event) => setEnteForm((current) => ({ ...current, nmEnte: event.target.value }))}
                    placeholder="Ex.: Tribunal de Contas do Distrito Federal"
                  />
                </div>
                <div className="administracao-form-row">
                  <label className="administracao-form-label" htmlFor="sgEnte">Sigla</label>
                  <input
                    id="sgEnte"
                    className="administracao-form-input"
                    maxLength={30}
                    value={enteForm.sgEnte}
                    onChange={(event) => setEnteForm((current) => ({ ...current, sgEnte: event.target.value }))}
                    placeholder="Ex.: TCDF"
                  />
                </div>
              </div>
              <div className="administracao-form-actions">
                <button type="button" className="administracao-button administracao-button--secondary" onClick={() => setEnteFormAberto(false)}>
                  Cancelar
                </button>
                <button type="button" className="administracao-button administracao-button--primary" onClick={() => void salvarEnte()}>
                  Salvar ente
                </button>
              </div>
            </div>
          )}

          <table className="administracao-table">
            <thead>
              <tr><th>Nome</th><th>Sigla</th><th>Status</th><th>Ações</th></tr>
            </thead>
            <tbody>
              {entesLoading ? (
                <tr><td colSpan={4}>Carregando entes...</td></tr>
              ) : entes.length === 0 ? (
                <tr><td colSpan={4}>Nenhum ente encontrado.</td></tr>
              ) : entes.map((ente) => (
                <tr key={ente.idEnte}>
                  <td><strong>{ente.nmEnte}</strong></td>
                  <td>{ente.sgEnte}</td>
                  <td>
                    <span className={`administracao-status administracao-status--${ente.blAtivo === 'S' ? 'ativo' : 'inativo'}`}>
                      {ente.blAtivo === 'S' ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="administracao-actions-cell">
                    <button type="button" className="administracao-icon-button" onClick={() => abrirEdicaoEnte(ente)}>Editar</button>
                    <button
                      type="button"
                      className={`administracao-icon-button ${ente.blAtivo === 'S' ? 'administracao-icon-button--danger' : ''}`}
                      onClick={() => void alternarStatusEnte(ente)}
                    >
                      {ente.blAtivo === 'S' ? 'Inativar' : 'Ativar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {abaAtiva === 'unidades' && (
        <div className="administracao-table-card">
          <div className="administracao-catalog-toolbar">
            <input className="administracao-form-input" type="search" value={unidadeFiltro} onChange={(event) => setUnidadeFiltro(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') void carregarUnidades(); }} placeholder="Pesquisar por nome ou sigla" />
            <button type="button" className="administracao-button administracao-button--secondary" onClick={() => void carregarUnidades()}>Pesquisar</button>
          </div>
          {unidadeFormAberto && (
            <div className="administracao-form-card administracao-form-card--inline">
              <div className="administracao-form-header">
                <div><p className="administracao-form-subtitle">Organização</p><h2>{unidadeEditando ? 'Editar unidade' : 'Cadastrar unidade'}</h2></div>
                <button type="button" className="administracao-icon-button" onClick={() => setUnidadeFormAberto(false)}>Cancelar</button>
              </div>
              <div className="administracao-form-grid">
                <div className="administracao-form-row"><label className="administracao-form-label" htmlFor="nmUnidade">Nome da unidade</label><input id="nmUnidade" className="administracao-form-input" value={unidadeForm.nmUnidade} onChange={(event) => setUnidadeForm((current) => ({ ...current, nmUnidade: event.target.value }))} /></div>
                <div className="administracao-form-row"><label className="administracao-form-label" htmlFor="sgUnidade">Sigla</label><input id="sgUnidade" className="administracao-form-input" maxLength={30} value={unidadeForm.sgUnidade} onChange={(event) => setUnidadeForm((current) => ({ ...current, sgUnidade: event.target.value }))} /></div>
                <div className="administracao-form-row"><label className="administracao-form-label" htmlFor="idUnidadeSuperior">Unidade superior</label><select id="idUnidadeSuperior" className="administracao-form-select" value={unidadeForm.idUnidadeSuperior ?? ''} onChange={(event) => setUnidadeForm((current) => ({ ...current, idUnidadeSuperior: event.target.value ? Number(event.target.value) : null }))}><option value="">Raiz da estrutura</option>{unidades.filter((item) => item.idUnidade !== unidadeEditando?.idUnidade).map((item) => <option key={item.idUnidade} value={item.idUnidade}>{item.sgUnidade} - {item.nmUnidade}</option>)}</select></div>
              </div>
              <div className="administracao-form-actions"><button type="button" className="administracao-button administracao-button--secondary" onClick={() => setUnidadeFormAberto(false)}>Cancelar</button><button type="button" className="administracao-button administracao-button--primary" onClick={() => void salvarUnidade()}>Salvar unidade</button></div>
            </div>
          )}
          <table className="administracao-table"><thead><tr><th>Nome</th><th>Sigla</th><th>Unidade superior</th><th>Status</th><th>Ações</th></tr></thead><tbody>
            {unidadesLoading ? <tr><td colSpan={5}>Carregando unidades...</td></tr> : unidades.length === 0 ? <tr><td colSpan={5}>Nenhuma unidade encontrada.</td></tr> : unidades.map((unidade) => <tr key={unidade.idUnidade}><td><strong>{unidade.nmUnidade}</strong></td><td>{unidade.sgUnidade}</td><td>{unidades.find((item) => item.idUnidade === unidade.idUnidadeSuperior)?.sgUnidade ?? 'Raiz'}</td><td><span className={`administracao-status administracao-status--${unidade.blAtivo === 'S' ? 'ativo' : 'inativo'}`}>{unidade.blAtivo === 'S' ? 'Ativa' : 'Inativa'}</span></td><td className="administracao-actions-cell"><button type="button" className="administracao-icon-button" onClick={() => abrirEdicaoUnidade(unidade)}>Editar</button><button type="button" className={`administracao-icon-button ${unidade.blAtivo === 'S' ? 'administracao-icon-button--danger' : ''}`} onClick={() => void alternarStatusUnidade(unidade)}>{unidade.blAtivo === 'S' ? 'Inativar' : 'Ativar'}</button></td></tr>)}
          </tbody></table>
        </div>
      )}

      {(abaAtiva === 'tipos-assunto' || abaAtiva === 'tipos-documento') && (
        <div className="administracao-table-card">
          <div className="administracao-catalog-toolbar">
            <input className="administracao-form-input" type="search" value={tipoFiltro} onChange={(event) => setTipoFiltro(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') void carregarTipos(); }} placeholder="Pesquisar tipo" />
            <button type="button" className="administracao-button administracao-button--secondary" onClick={() => void carregarTipos()}>Pesquisar</button>
          </div>
          {tipoFormAberto && (
            <div className="administracao-form-card administracao-form-card--inline">
              <div className="administracao-form-header"><div><p className="administracao-form-subtitle">Catálogo de processo</p><h2>{tipoEditando ? 'Editar cadastro' : 'Cadastrar tipo'}</h2></div><button type="button" className="administracao-icon-button" onClick={() => setTipoFormAberto(false)}>Cancelar</button></div>
              <div className="administracao-form-grid">
                <div className="administracao-form-row"><label className="administracao-form-label" htmlFor="tipoNome">Nome</label><input id="tipoNome" className="administracao-form-input" value={tipoNome} onChange={(event) => setTipoNome(event.target.value)} /></div>
                {abaAtiva === 'tipos-assunto' && <div className="administracao-form-row"><label className="administracao-form-label" htmlFor="tipoUnidade">Unidade</label><select id="tipoUnidade" className="administracao-form-select" value={tipoUnidade ?? ''} onChange={(event) => setTipoUnidade(event.target.value ? Number(event.target.value) : null)}><option value="">Selecione a unidade</option>{unidades.filter((item) => item.blAtivo === 'S').map((item) => <option key={item.idUnidade} value={item.idUnidade}>{item.sgUnidade} - {item.nmUnidade}</option>)}</select></div>}
              </div>
              <div className="administracao-form-actions"><button type="button" className="administracao-button administracao-button--secondary" onClick={() => setTipoFormAberto(false)}>Cancelar</button><button type="button" className="administracao-button administracao-button--primary" onClick={() => void salvarTipo()}>Salvar</button></div>
            </div>
          )}
          {abaAtiva === 'tipos-assunto' ? <table className="administracao-table"><thead><tr><th>Tipo de assunto</th><th>Unidade</th><th>Status</th><th>Ações</th></tr></thead><tbody>{tiposAssunto.map((tipo) => <tr key={tipo.idTipoAssunto}><td><strong>{tipo.nmTipoAssunto}</strong></td><td>{unidades.find((item) => item.idUnidade === tipo.idUnidade)?.sgUnidade ?? tipo.idUnidade}</td><td><span className={`administracao-status administracao-status--${tipo.blAtivo === 'S' ? 'ativo' : 'inativo'}`}>{tipo.blAtivo === 'S' ? 'Ativo' : 'Inativo'}</span></td><td className="administracao-actions-cell"><button type="button" className="administracao-icon-button" onClick={() => abrirEdicaoTipo(tipo)}>Editar</button><button type="button" className="administracao-icon-button administracao-icon-button--danger" onClick={() => void alternarStatusTipo(tipo)}>{tipo.blAtivo === 'S' ? 'Inativar' : 'Ativar'}</button></td></tr>)}</tbody></table> : <table className="administracao-table"><thead><tr><th>Tipo de documento</th><th>Status</th><th>Ações</th></tr></thead><tbody>{tiposDocumento.map((tipo) => <tr key={tipo.idTipoDocumento}><td><strong>{tipo.nmTipoDocumento}</strong></td><td><span className={`administracao-status administracao-status--${tipo.blAtivo === 'S' ? 'ativo' : 'inativo'}`}>{tipo.blAtivo === 'S' ? 'Ativo' : 'Inativo'}</span></td><td className="administracao-actions-cell"><button type="button" className="administracao-icon-button" onClick={() => abrirEdicaoTipo(tipo)}>Editar</button><button type="button" className="administracao-icon-button administracao-icon-button--danger" onClick={() => void alternarStatusTipo(tipo)}>{tipo.blAtivo === 'S' ? 'Inativar' : 'Ativar'}</button></td></tr>)}</tbody></table>}
        </div>
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

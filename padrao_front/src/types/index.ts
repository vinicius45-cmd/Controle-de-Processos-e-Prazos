import { ButtonHTMLAttributes, ComponentType, ReactNode } from 'react';

export interface Validador {
  idValidador: number;
  numeroSerie: string;
  prefixoOnibus: string;
  status: 'ATIVO' | 'INATIVO';
}

export interface Operadora {
  idOperadora: number;
  nmOperadora: string;
}

export interface Usuario {
  id: string; // Nickname
  idUsuario?: number;
  nome: string;
  email: string;
  matricula: string;
  cargo: string;
  departamento: string;
  rotasPermitidas: string[];
  permissoesServicos: Record<string, 'LEITURA' | 'ESCRITA'>;
}

export interface FormCadastro {
  id?: string;
  processoINCRA: string;
  requerimento: string;
  assunto: string;
  assuntoTipo: string;
  destinatario: string;
  solicitudesInformacao: string[];
  orgaoOrigem: string;
  dataEntrada: string;
  prazoAreaTecnica: string;
  prazoFinal: string;
  situacaoProcesso: string;
  responsavel: string;
  documentoSEI: string;
  especial: boolean;
  filtroRespostas: boolean;
  observacao: string;
}

export interface ResumoProcesso {
  status: string;
  diasRestantes: number;
  textoDias?: string | number;
  corDias?: string;
  prazoFinal: string;
  situacao: string;
  responsavel: string;
}

export interface CardPendencia {
  id: string;
  processoId: string;
  titulo: string;
  setor: string;
  diasRestantes: number;
  status: 'atrasado' | 'vence_hoje' | 'proximos_5_dias' | 'para_assinatura' | 'especiais';
}

export type PendenciasKanban = Record<string, CardPendencia[]>;

export type AppViewComponent = ComponentType<Record<string, never>>;

export interface SubMenuModulo {
  id: string;
  titulo: string;
  icone?: string;
  rota: string | null;
  componente?: AppViewComponent;
  ocultar?: boolean;
}

export interface ModuloConfig {
  id: string;
  sigla: string;
  nome: string;
  descricao: string;
  icone?: string;
  imagem?: string;
  cor?: string;
  rota: string;
  componente: AppViewComponent;
  ativo: boolean;
  pwaTarget?: string;
  subMenus?: SubMenuModulo[];
}

export interface CdpPessoaAd {
  matriculaPessoaAd?: string | number;
  nome: string;
  matriculaEmail: string;
  email: string;
  departamento: string;
  cargo: string;
  telefone: string;
  ativo: string;
}

export interface CdpUsuario {
  idUsuario?: number;
  matriculaPessoaAd?: string | number;
  matriculaPreposto?: number;
  nickname: string;
  ativo: string;
  ultimoAcesso?: string;
  dataCriacao?: string;
  idGrupo?: number;
  pessoaAd?: CdpPessoaAd;
}

export interface CdpTipoAcesso {
  idTipoAcesso?: number;
  nome: string;
  descricao: string;
  ativo?: string;
}

export interface CdpUsuarioAcesso {
  idUsuarioAcesso?: number;
  idUsuario: number;
  idPerfil: number;
  idTipoAcesso?: number;
  dataInicio?: string;
  dataFim?: string;
  ativo?: string;
  perfil?: CdpTipoAcesso;
}

// ----------------------------------------------------
// Migrated Interfaces from Services, Hooks and Layouts
// ----------------------------------------------------

export interface LoginResponse {
  ok: boolean;
  token?: string;
  user?: string; // nickname
  message?: string;
}

export interface AuthContextType {
  usuario: Usuario | null;
  estaAutenticado: boolean;
  erroLogin: string | null;
  loadingAuth: boolean;
  fazerLogin: (usuarioInput: string, senhaInput: string) => Promise<void>;
  fazerLogout: () => void;
  temAcesso: (endpoint: string, nivelRequerido?: 'LEITURA' | 'ESCRITA') => boolean;
  temEscrita: (endpoint: string) => boolean;
  mockOverridePermissions: (rotas: string[], servicos: Record<string, 'LEITURA' | 'ESCRITA'>) => void;
}

export interface ModulesContextType {
  modulos: ModuloConfig[];
  loading: boolean;
}

export interface AppContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  activeModuleId: string;
  activeSubMenuId: string | null;
  navegarPara: (moduleId: string, subMenuId?: string | null) => void;
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  processoSelecionado: FormCadastro | null;
  modoVisualizacaoProcesso: 'editar' | 'visualizar' | null;
  definirProcessoSelecionado: (processo: FormCadastro | null, modo?: 'editar' | 'visualizar' | null) => void;
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export interface PopupProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  variant?: 'info' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  actions?: ReactNode;
}

export interface PlaceholderViewProps {
  name: string;
  description: string;
}

export interface AuthState {
  usuario: Usuario | null;
  autenticado: boolean;
  setUsuario: (usuario: Usuario | null) => void;
  logout: () => void;
}

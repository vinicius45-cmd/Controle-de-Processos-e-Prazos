import { lazy } from 'react';
import { ModuloConfig } from '../types';
import Alertas from '../screens/Alertas';
import Administracao from '../screens/Administracao';
import DetalhesProcesso from '../screens/DetalhesProcesso';
import ParaAssinatura from '../screens/ParaAssinatura';
import Relatorios from '../screens/Relatorios';
import { withProps } from '../screens/PlaceholderView';

// Lazy load modules/screens to support code splitting
const Dashboard = lazy(() => import('../screens/Dashboard'));
const CadastrodeProcesso = lazy(() => import('../screens/CadastrodeProcesso'));
const Pendencias = lazy(() => import('../screens/Pendencias'));

const raw_modulos_sistema: ModuloConfig[] = [
  {
    id: 'dashboard',
    sigla: 'DASH',
    nome: 'Dashboard',
    descricao: 'Visão geral dos processos e prazos',
    icone: 'LayoutDashboard',
    cor: '#1e293b',
    rota: 'dashboard',
    componente: Dashboard,
    ativo: true
  },
  {
    id: 'meus-processos',
    sigla: 'MPROC',
    nome: 'Meus Processos',
    descricao: 'Visualizar seus processos',
    icone: 'ClipboardList',
    cor: '#0d9488',
    rota: 'meus-processos',
    componente: DetalhesProcesso,
    ativo: true
  },
  {
    id: 'cadastro-processo',
    sigla: 'CPROC',
    nome: 'Cadastro de Processo',
    descricao: 'Registrar novo processo',
    icone: 'FilePenLine',
    cor: '#7c3aed',
    rota: 'cadastro-processo',
    componente: CadastrodeProcesso,
    ativo: true
  },
  {
    id: 'pendencias',
    sigla: 'PEND',
    nome: 'Pendências',
    descricao: 'Processos com pendências',
    icone: 'FileText',
    cor: '#e11d48',
    rota: 'pendencias',
    componente: Pendencias,
    ativo: true
  },
  {
    id: 'para-assinatura',
    sigla: 'ASSIN',
    nome: 'Para Assinatura',
    descricao: 'Aguardando assinatura',
    icone: 'FileCheck2',
    cor: '#d97706',
    rota: 'para-assinatura',
    componente: ParaAssinatura,
    ativo: true
  },
  {
    id: 'relatorios',
    sigla: 'REL',
    nome: 'Relatórios',
    descricao: 'Consultar relatórios',
    icone: 'ClipboardList',
    cor: '#0891b2',
    rota: 'relatorios',
    componente: Relatorios,
    ativo: true
  },
  {
    id: 'alertas',
    sigla: 'ALERT',
    nome: 'Alertas',
    descricao: 'Notificações e alertas',
    icone: 'Bell',
    cor: '#f59e0b',
    rota: 'alertas',
    componente: Alertas,
    ativo: true
  },
  {
    id: 'administracao',
    sigla: 'ADM',
    nome: 'Administração',
    descricao: 'Gestão do sistema',
    icone: 'Settings',
    cor: '#6366f1',
    rota: 'administracao',
    componente: Administracao,
    ativo: true
  }
];

const isDevModulos = import.meta.env.VITE_SHOW_DEV_MODULOS === 'true';

export const modulos_sistema: ModuloConfig[] = raw_modulos_sistema.map(modulo => {
  if (isDevModulos) {
    return { ...modulo, ativo: true };
  }
  return modulo;
});
export default modulos_sistema;

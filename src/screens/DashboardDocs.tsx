import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Popup } from '../components/Popup';
import { Button } from '../components/Button';
import { OperadoraList } from './OperadoraList';
import { 
  User, 
  Clock, 
  Settings, 
  HelpCircle
} from 'lucide-react';

export const DashboardDocs: React.FC = () => {
  const { usuario, mockOverridePermissions } = useAuth();

  const [activeTab, setActiveTab] = useState<'docs' | 'sandbox'>('docs');
  const [activeSection, setActiveSection] = useState<string>('intro');
  const [customPopupOpen, setCustomPopupOpen] = useState(false);
  const [popupVariant, setPopupVariant] = useState<'info' | 'success' | 'warning' | 'danger'>('info');

  // Permission Override Panel States
  const [overrideRoutes, setOverrideRoutes] = useState<string[]>([]);
  const [overrideLevels, setOverrideLevels] = useState<Record<string, 'LEITURA' | 'ESCRITA'>>({});

  // Sync state with current user permissions on tab load/change
  useEffect(() => {
    if (usuario) {
      setOverrideRoutes(usuario.rotasPermitidas || []);
      setOverrideLevels(usuario.permissoesServicos || {});
    }
  }, [usuario, activeTab]);

  // Handle route checkbox toggles
  const handleToggleRoute = (route: string) => {
    setOverrideRoutes(prev => {
      if (prev.includes(route)) {
        return prev.filter(r => r !== route);
      } else {
        const next = [...prev, route];
        // default level
        if (!overrideLevels[route]) {
          setOverrideLevels(levels => ({ ...levels, [route]: 'LEITURA' }));
        }
        return next;
      }
    });
  };

  // Handle level change dropdowns
  const handleLevelChange = (route: string, level: 'LEITURA' | 'ESCRITA') => {
    setOverrideLevels(prev => ({ ...prev, [route]: level }));
  };

  // Apply overrides
  const handleApplyOverride = () => {
    // filter levels based on selected routes
    const cleanLevels: Record<string, 'LEITURA' | 'ESCRITA'> = {};
    overrideRoutes.forEach(r => {
      cleanLevels[r] = overrideLevels[r] || 'LEITURA';
    });

    mockOverridePermissions(overrideRoutes, cleanLevels);
    
    // Trigger popup confirmation
    setPopupVariant('success');
    setCustomPopupOpen(true);
  };

  // Preset permission overrides for testing profiles
  const applyPreset = (role: 'admin' | 'auditor' | 'preposto' | 'blocked') => {
    if (role === 'admin') {
      const routes = [
        'dashboard', 'suop', 'suop-agencies', 'suop-routes', 'suop-vehicles',
        'sif-menu', 'sif-fiscalizacao', 'sif-validador', 'cdp', 'cdp-sistemas',
        'cdp-usuarios', 'cdp-grupos', '/operadoras'
      ];
      const levels: Record<string, 'LEITURA' | 'ESCRITA'> = {};
      routes.forEach(r => { levels[r] = 'ESCRITA'; });
      setOverrideRoutes(routes);
      setOverrideLevels(levels);
    } else if (role === 'auditor') {
      const routes = [
        'dashboard', 'suop', 'suop-agencies', 'suop-routes', 'suop-vehicles',
        'sif-menu', 'sif-fiscalizacao', 'sif-validador', '/operadoras'
      ];
      const levels: Record<string, 'LEITURA' | 'ESCRITA'> = {};
      routes.forEach(r => {
        levels[r] = r === 'suop-agencies' || r === '/operadoras' ? 'ESCRITA' : 'LEITURA';
      });
      setOverrideRoutes(routes);
      setOverrideLevels(levels);
    } else if (role === 'preposto') {
      const routes = ['dashboard', 'suop', 'suop-agencies', '/operadoras'];
      const levels: Record<string, 'LEITURA' | 'ESCRITA'> = {
        'dashboard': 'LEITURA',
        'suop': 'LEITURA',
        'suop-agencies': 'LEITURA',
        '/operadoras': 'LEITURA'
      };
      setOverrideRoutes(routes);
      setOverrideLevels(levels);
    } else {
      setOverrideRoutes([]);
      setOverrideLevels({});
    }
  };

  const docSections = [
    {
      id: 'intro',
      title: '🏛️ Introdução & Padrão SEMOB',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <p style={{ color: 'var(--semob-text-muted)', lineHeight: '1.6' }}>
            A <strong>Secretaria de Mobilidade do Distrito Federal (SEMOB)</strong> adota diretrizes de desenvolvimento voltadas à segurança, rastreabilidade e modularidade em seus sistemas (SISMOB).
          </p>
          
          <div style={{ padding: '1rem', background: 'var(--semob-secondary)', borderLeft: '4px solid var(--semob-primary)', borderRadius: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--semob-primary)', fontWeight: 'bold', textTransform: 'uppercase' }}>💡 Conceito Chave</span>
            <p style={{ color: 'var(--semob-text)', fontSize: '0.88rem', marginTop: '0.25rem', margin: 0 }}>
              Todas as permissões do usuário são fornecidas de forma reativa pelo **CDP (Controle de Dados e Perfis)** na autenticação LDAP. O frontend deve validar dinamicamente rotas e ações a nível de widget.
            </p>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--semob-border)' }}>
                <th style={{ textAlign: 'left', padding: '0.75rem', color: 'var(--semob-primary)' }}>Elemento Visual</th>
                <th style={{ textAlign: 'left', padding: '0.75rem', color: 'var(--semob-primary)' }}>Padrão SISMOB</th>
                <th style={{ textAlign: 'left', padding: '0.75rem', color: 'var(--semob-primary)' }}>Status do Boilerplate</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid var(--semob-border)' }}>
                <td style={{ padding: '0.75rem', fontWeight: 'bold' }}>Barra de Navegação</td>
                <td style={{ padding: '0.75rem' }}>Sidebar retrátil com submenus dinâmicos</td>
                <td style={{ padding: '0.75rem' }}><code style={{ color: 'var(--semob-success)' }}>Implementado</code></td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--semob-border)' }}>
                <td style={{ padding: '0.75rem', fontWeight: 'bold' }}>Segurança</td>
                <td style={{ padding: '0.75rem' }}>Injeção de JWT e x-user-id no Axios</td>
                <td style={{ padding: '0.75rem' }}><code style={{ color: 'var(--semob-success)' }}>Implementado</code></td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--semob-border)' }}>
                <td style={{ padding: '0.75rem', fontWeight: 'bold' }}>Janelas Popups</td>
                <td style={{ padding: '0.75rem' }}>Modais de confirmação e alerta padronizados</td>
                <td style={{ padding: '0.75rem' }}><code style={{ color: 'var(--semob-success)' }}>Implementado</code></td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--semob-border)' }}>
                <td style={{ padding: '0.75rem', fontWeight: 'bold' }}>Componentização</td>
                <td style={{ padding: '0.75rem' }}>Regra 90/10 & Limite de 50 Linhas de lógica</td>
                <td style={{ padding: '0.75rem' }}><code style={{ color: 'var(--semob-success)' }}>Padronizado</code></td>
              </tr>
            </tbody>
          </table>
        </div>
      )
    },
    {
      id: 'architecture',
      title: '🏗️ Arquitetura das 3 Camadas',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <p style={{ color: 'var(--semob-text-muted)', lineHeight: '1.6' }}>
            Para garantir código limpo e testabilidade, o boilerplate adota isolamento estrito de responsabilidades:
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderLeft: '3px solid var(--semob-primary)', paddingLeft: '1rem' }}>
            <div>
              <strong style={{ color: 'var(--semob-text)' }}>1. Screen (View)</strong>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.88rem', color: 'var(--semob-text-muted)' }}>
                Responsável apenas por desenhar a tela (JSX) e capturar eventos. Consome dados via Custom Hooks.
              </p>
            </div>
            <div>
              <strong style={{ color: 'var(--semob-text)' }}>2. Hook (Controller)</strong>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.88rem', color: 'var(--semob-text-muted)' }}>
                Abstrai a lógica de estado, loading, erros e orquestra a comunicação com a API.
              </p>
            </div>
            <div>
              <strong style={{ color: 'var(--semob-text)' }}>3. Service (Data Layer)</strong>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.88rem', color: 'var(--semob-text-muted)' }}>
                Único local onde o cliente HTTP (Axios) é instanciado. Isola a requisição de rede e tipa a resposta do backend.
              </p>
            </div>
          </div>
          
          <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid var(--semob-border)', borderRadius: '0.5rem', marginTop: '0.5rem' }}>
            <strong style={{ color: 'var(--semob-danger)', display: 'block' }}>⚠️ Regra de Ouro (Limite de 50 Linhas)</strong>
            <p style={{ color: 'var(--semob-danger)', fontSize: '0.85rem', margin: '0.25rem 0 0 0', opacity: 0.8 }}>
              Nenhum arquivo visual JSX/TSX na pasta `/screens` deve conter mais de 50 linhas de código lógico. Se exceder esse limite, toda a lógica de estado reativo deve ser movida para um custom hook na pasta `/hooks`.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'authorization',
      title: '🔑 Regras de Acesso e CDP',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <p style={{ color: 'var(--semob-text-muted)', lineHeight: '1.6' }}>
            A validação do usuário no frontend deve ocorrer em dois níveis:
          </p>
          <ol style={{ paddingLeft: '1.25rem', color: 'var(--semob-text)', lineHeight: '1.6', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <li>
              <strong>Acesso a Rotas (Sidebar/Menus):</strong>
              O hook <code style={{ color: 'var(--semob-primary)' }}>useModules()</code> filtra automaticamente os módulos e submenus comparando a rota estática cadastrada com o vetor <code style={{ color: 'var(--semob-success)' }}>usuario.rotasPermitidas</code>.
            </li>
            <li>
              <strong>Acesso Granular a Botões (Ações):</strong>
              Nas telas, utilize o helper <code style={{ color: 'var(--semob-primary)' }}>temAcesso(endpoint, nivel)</code> para habilitar/desabilitar botões de escrita como POST, PUT ou DELETE.
            </li>
          </ol>
          
          <pre style={{ background: 'var(--semob-bg)', padding: '1rem', borderRadius: '0.5rem', border: '1px solid var(--semob-border)', overflowX: 'auto', fontSize: '0.82rem', color: 'var(--semob-success)' }}>
{`// Exemplo de verificação de permissão em botão
import { useAuth } from '../hooks/useAuth';

const MinhaTela = () => {
  const { temEscrita } = useAuth();
  
  return (
    <Button 
      disabled={!temEscrita('/operadoras')}
      onClick={abrirModalCadastro}
    >
      Nova Operadora
    </Button>
  );
}`}
          </pre>
        </div>
      )
    },
    {
      id: 'design_system',
      title: '🎨 Design System & Cores',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <p style={{ color: 'var(--semob-text-muted)', lineHeight: '1.6' }}>
            O design system do SISMOB estabelece padrões rigorosos de dimensões e cores para garantir consistência visual em todas as ferramentas da SEMOB.
          </p>

          <h4 style={{ color: 'var(--semob-text)', margin: '0.5rem 0 0 0' }}>🎨 Cores e Variáveis CSS</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginTop: '0.25rem' }}>
            <div style={{ padding: '0.75rem', background: 'var(--semob-bg)', border: '1px solid var(--semob-border)', borderRadius: '0.5rem' }}>
              <div style={{ width: '100%', height: '30px', background: 'var(--semob-primary)', borderRadius: '0.25rem', marginBottom: '0.5rem' }} />
              <strong style={{ fontSize: '0.8rem', color: 'var(--semob-text)' }}>--semob-primary (#2563eb)</strong>
              <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--semob-text-muted)' }}>Cor principal, botões de ação e links ativos.</span>
            </div>
            <div style={{ padding: '0.75rem', background: 'var(--semob-bg)', border: '1px solid var(--semob-border)', borderRadius: '0.5rem' }}>
              <div style={{ width: '100%', height: '30px', background: 'var(--semob-bg)', border: '1px solid var(--semob-border)', borderRadius: '0.25rem', marginBottom: '0.5rem' }} />
              <strong style={{ fontSize: '0.8rem', color: 'var(--semob-text)' }}>--semob-bg</strong>
              <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--semob-text-muted)' }}>Fundo geral da página (Claro: #f8fafc | Escuro: #0b0f19).</span>
            </div>
            <div style={{ padding: '0.75rem', background: 'var(--semob-bg)', border: '1px solid var(--semob-border)', borderRadius: '0.5rem' }}>
              <div style={{ width: '100%', height: '30px', background: 'var(--semob-surface)', border: '1px solid var(--semob-border)', borderRadius: '0.25rem', marginBottom: '0.5rem' }} />
              <strong style={{ fontSize: '0.8rem', color: 'var(--semob-text)' }}>--semob-surface</strong>
              <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--semob-text-muted)' }}>Superfícies de cards, modais e headers (#ffffff | #111a2e).</span>
            </div>
            <div style={{ padding: '0.75rem', background: 'var(--semob-bg)', border: '1px solid var(--semob-border)', borderRadius: '0.5rem' }}>
              <div style={{ width: '100%', height: '30px', background: 'var(--semob-border)', borderRadius: '0.25rem', marginBottom: '0.5rem' }} />
              <strong style={{ fontSize: '0.8rem', color: 'var(--semob-text)' }}>--semob-border</strong>
              <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--semob-text-muted)' }}>Cor de bordas e divisores discretos.</span>
            </div>
          </div>

          <h4 style={{ color: 'var(--semob-text)', margin: '1rem 0 0 0' }}>📐 Dimensões e Alinhamentos</h4>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--semob-border)', textAlign: 'left' }}>
                <th style={{ padding: '0.5rem', color: 'var(--semob-primary)' }}>Componente</th>
                <th style={{ padding: '0.5rem', color: 'var(--semob-primary)' }}>Dimensões Padrão</th>
                <th style={{ padding: '0.5rem', color: 'var(--semob-primary)' }}>Local / Comportamento</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid var(--semob-border)' }}>
                <td style={{ padding: '0.5rem', fontWeight: 'bold' }}>Headerbar</td>
                <td style={{ padding: '0.5rem' }}>Altura fixa: 64px</td>
                <td style={{ padding: '0.5rem' }}>Fixo no topo (sticky), z-index: 40</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--semob-border)' }}>
                <td style={{ padding: '0.5rem', fontWeight: 'bold' }}>Sidebar (Desktop)</td>
                <td style={{ padding: '0.5rem' }}>Largura: 260px (70px colapsado)</td>
                <td style={{ padding: '0.5rem' }}>Lado esquerdo (sticky), z-index: 50</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--semob-border)' }}>
                <td style={{ padding: '0.5rem', fontWeight: 'bold' }}>Sidebar (Mobile)</td>
                <td style={{ padding: '0.5rem' }}>Largura: 260px</td>
                <td style={{ padding: '0.5rem' }}>Drawer suspenso da esquerda, z-index: 2000</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--semob-border)' }}>
                <td style={{ padding: '0.5rem', fontWeight: 'bold' }}>Popup Pequeno (sm)</td>
                <td style={{ padding: '0.5rem' }}>Largura máx: 400px</td>
                <td style={{ padding: '0.5rem' }}>Alertas rápidos, confirmações de deleção</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--semob-border)' }}>
                <td style={{ padding: '0.5rem', fontWeight: 'bold' }}>Popup Médio (md)</td>
                <td style={{ padding: '0.5rem' }}>Largura máx: 550px</td>
                <td style={{ padding: '0.5rem' }}>Formulários simples de criação e edição</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--semob-border)' }}>
                <td style={{ padding: '0.5rem', fontWeight: 'bold' }}>Popup Grande (lg)</td>
                <td style={{ padding: '0.5rem' }}>Largura máx: 750px</td>
                <td style={{ padding: '0.5rem' }}>Grids extensos, relatórios, auditorias</td>
              </tr>
            </tbody>
          </table>
        </div>
      )
    },
    {
      id: 'layouts',
      title: '📐 Como Sidebar & Header Funcionam',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <p style={{ color: 'var(--semob-text-muted)', lineHeight: '1.6' }}>
            A estrutura de shell de layout do SISMOB é dividida em dois componentes principais que interagem em tempo real:
          </p>

          <strong style={{ color: 'var(--semob-text)', fontSize: '0.9rem' }}>📂 A Barra Lateral (Sidebar)</strong>
          <ul style={{ paddingLeft: '1.25rem', color: 'var(--semob-text-muted)', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <li><strong>Leitura Reativa:</strong> Consome o array de módulos do <code style={{ color: 'var(--semob-primary)' }}>useModules()</code>, ocultando itens para os quais o usuário não tem permissão no CDP.</li>
            <li><strong>Submenus Inteligentes:</strong> Permite cliques para abrir ou fechar menus de múltiplos níveis de profundidade, indicando o submenu selecionado de forma visual.</li>
            <li><strong>Transição e Colapso:</strong> Em computadores, o botão inferior recolhe o texto da barra lateral, economizando espaço. Em celulares, ela desliza de fora da tela e apresenta um fundo semi-transparente escuro que ao ser clicado fecha o menu.</li>
          </ul>

          <strong style={{ color: 'var(--semob-text)', fontSize: '0.9rem' }}>💻 A Barra de Cabeçalho (Headerbar)</strong>
          <ul style={{ paddingLeft: '1.25rem', color: 'var(--semob-text-muted)', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <li><strong>Gatilho Hambúrguer:</strong> Apresenta um botão que só aparece em celulares, permitindo expandir e recolher a barra lateral.</li>
            <li><strong>Breadcrumbs Dinâmicos:</strong> Identifica em qual rota o usuário se encontra e imprime o caminho no formato <code style={{ color: 'var(--semob-primary)' }}>Módulo ❯ Submenu</code>.</li>
            <li><strong>Theme Toggle:</strong> Chaveador de temas que insere ou remove a classe `.dark` no contêiner raiz do AppProvider, alterando as variáveis de CSS global.</li>
            <li><strong>Dropdown do Usuário:</strong> Apresenta uma bolha com as iniciais do usuário. Ao clicar, exibe um modal flutuante com dados cadastrais detalhados (Cargo, Matrícula, Departamento) e o botão para efetuar logout.</li>
          </ul>
        </div>
      )
    },
    {
      id: 'challenges',
      title: '🏆 Desafio Prático SISMOB',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <p style={{ color: 'var(--semob-text-muted)', lineHeight: '1.6' }}>
            Pronto para colocar as mãos na massa? Complete este desafio técnico para validar seu entendimento do boilerplate:
          </p>

          <div style={{ padding: '1rem', background: 'var(--semob-secondary)', border: '1px solid var(--semob-border)', borderRadius: '0.5rem' }}>
            <span style={{ fontWeight: 'bold', color: 'var(--semob-primary)' }}>🎯 Desafio: Tela de Validadores Eletrônicos</span>
            <p style={{ color: 'var(--semob-text)', fontSize: '0.85rem', marginTop: '0.25rem', margin: 0 }}>
              Você deve substituir o submenu de <strong>Validadores</strong> (atualmente um placeholder em mock) por uma tela real e funcional de consulta de validadores instalados em ônibus.
            </p>
          </div>

          <strong style={{ color: 'var(--semob-text)', fontSize: '0.9rem' }}>📋 Requisitos Técnicos:</strong>
          <ol style={{ paddingLeft: '1.25rem', color: 'var(--semob-text-muted)', fontSize: '0.82rem', display: 'flex', flexDirection: 'column', gap: '0.40rem' }}>
            <li>Crie a interface <code style={{ color: 'var(--semob-primary)' }}>Validador</code> em <code style={{ color: 'var(--semob-success)' }}>types/index.ts</code> com as propriedades: <code style={{ color: 'var(--semob-text)' }}>idValidador, numeroSerie, prefixoOnibus, status (ATIVO/INATIVO)</code>.</li>
            <li>Crie um serviço <code style={{ color: 'var(--semob-primary)' }}>ValidadorService</code> no diretório <code style={{ color: 'var(--semob-success)' }}>services</code> com busca/filtro simulada no Axios para a rota <code style={{ color: 'var(--semob-text)' }}>/validadores</code>.</li>
            <li>Crie o Custom Hook <code style={{ color: 'var(--semob-primary)' }}>useValidadores</code> para lidar com os estados reativos de consulta.</li>
            <li>Crie a tela de visualização em <code style={{ color: 'var(--semob-success)' }}>screens/ValidadorList.tsx</code>. Ela deve validar permissões:
              <ul style={{ paddingLeft: '1rem', marginTop: '0.2rem' }}>
                <li>Se o usuário não tem permissão para a rota <code style={{ color: 'var(--semob-danger)' }}>sif-validador</code>, a tela deve exibir o card de acesso negado.</li>
                <li>Habilite um botão para simular "Ativar/Inativar" validador apenas se o usuário tiver acesso de escrita (<code style={{ color: 'var(--semob-success)' }}>temEscrita('sif-validador')</code>).</li>
              </ul>
            </li>
            <li>No arquivo <code style={{ color: 'var(--semob-success)' }}>config/modules.ts</code>, altere o componente do submenu <code style={{ color: 'var(--semob-text)' }}>sif-val</code> para usar a sua tela criada (veja a diretiva lazy load).</li>
            <li>Teste alterando os perfis no **Simulador CDP** (Auditor e Admin liberados; Preposto bloqueado).</li>
          </ol>
        </div>
      )
    }
  ];

  const currentSectionData = docSections.find(s => s.id === activeSection);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', minHeight: '80vh' }}>
      
      {/* Navigation tabs at the top */}
      <div style={{ display: 'flex', gap: '0.75rem', borderBottom: '1px solid var(--semob-border)', paddingBottom: '0.75rem' }}>
        <button
          onClick={() => setActiveTab('docs')}
          style={{
            padding: '0.55rem 1.25rem',
            borderRadius: '0.5rem',
            border: 'none',
            background: activeTab === 'docs' ? '#2563eb' : 'transparent',
            color: activeTab === 'docs' ? '#ffffff' : 'var(--semob-text-muted)',
            fontWeight: 700,
            cursor: 'pointer',
            fontSize: '0.88rem',
            transition: 'all 0.2s'
          }}
        >
          📘 Documentação de Padrões
        </button>
        <button
          onClick={() => setActiveTab('sandbox')}
          style={{
            padding: '0.55rem 1.25rem',
            borderRadius: '0.5rem',
            border: 'none',
            background: activeTab === 'sandbox' ? '#0d9488' : 'transparent',
            color: activeTab === 'sandbox' ? '#ffffff' : 'var(--semob-text-muted)',
            fontWeight: 700,
            cursor: 'pointer',
            fontSize: '0.88rem',
            transition: 'all 0.2s'
          }}
        >
          ⚙️ Console CDP & Sandbox de Teste
        </button>
      </div>

      {activeTab === 'docs' ? (
        <div className="flex-row-md">
          {/* Sidebar interna para documentos */}
          <aside className="hide-mobile" style={{ width: '220px', display: 'flex', flexDirection: 'column', gap: '0.35rem', flexShrink: 0 }}>
            {docSections.map(s => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                style={{
                  padding: '0.65rem 0.85rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  textAlign: 'left',
                  background: activeSection === s.id ? 'var(--semob-secondary)' : 'transparent',
                  color: activeSection === s.id ? 'var(--semob-primary)' : 'var(--semob-text-muted)',
                  fontWeight: activeSection === s.id ? 700 : 500,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {s.title}
              </button>
            ))}
          </aside>

          {/* Mobile Select dropdown for sections */}
          <div className="show-mobile-flex" style={{ flexDirection: 'column', gap: '0.4rem', marginBottom: '1rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--semob-text-muted)' }}>Selecionar Tópico:</label>
            <select
              value={activeSection}
              onChange={(e) => setActiveSection(e.target.value)}
              style={{
                width: '100%',
                padding: '0.55rem 0.75rem',
                background: 'var(--semob-surface)',
                border: '1px solid var(--semob-border)',
                borderRadius: '0.5rem',
                color: 'var(--semob-text)',
                outline: 'none',
                fontSize: '0.85rem',
                fontWeight: 600
              }}
            >
              {docSections.map(s => (
                <option key={s.id} value={s.id}>{s.title}</option>
              ))}
            </select>
          </div>

          {/* Docs Content area */}
          <section style={{ flex: 1, padding: '0.5rem 0', maxWidth: '800px' }}>
            <h3 style={{ fontSize: '1.45rem', fontWeight: 800, marginBottom: '1.25rem', color: 'var(--semob-text)', borderBottom: '1px solid var(--semob-border)', paddingBottom: '0.5rem' }}>
              {currentSectionData?.title}
            </h3>
            {currentSectionData?.content}
          </section>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* User CDP credentials status */}
          <div className="glassmorphism" style={{ padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--semob-border)' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--semob-text)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={18} style={{ color: '#0d9488' }} />
              Estado da Autenticação CDP (Header API)
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', fontSize: '0.82rem' }}>
              <div>
                <span style={{ color: 'var(--semob-text-muted)', display: 'block' }}>Usuário Ativo:</span>
                <strong style={{ color: 'var(--semob-text)' }}>{usuario?.nome} ({usuario?.id})</strong>
              </div>
              <div>
                <span style={{ color: 'var(--semob-text-muted)', display: 'block' }}>ID CDP (x-user-id):</span>
                <strong style={{ color: 'var(--semob-text)' }}>{usuario?.idUsuario || 'Nenhum'}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--semob-text-muted)', display: 'block' }}>Perfil (Cargo):</span>
                <strong style={{ color: 'var(--semob-text)' }}>{usuario?.cargo}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--semob-text-muted)', display: 'block' }}>Matrícula:</span>
                <strong style={{ color: 'var(--semob-text)' }}>{usuario?.matricula}</strong>
              </div>
            </div>
            
            {/* Simulation Polling Status */}
            <div style={{ marginTop: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--semob-text-muted)', background: 'var(--semob-secondary)', padding: '0.5rem 0.75rem', borderRadius: '0.5rem', width: 'fit-content' }}>
              <Clock size={14} style={{ color: '#0d9488' }} />
              <span>Polling Ativo: Verificando novas permissões a cada 15 segundos no CDP.</span>
            </div>
          </div>

          <div className="grid-2" style={{ alignItems: 'start' }}>
            
            {/* Permission Override Panel */}
            <div style={{ padding: '1.5rem', background: 'var(--semob-surface)', border: '1px solid var(--semob-border)', borderRadius: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--semob-text)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Settings size={18} style={{ color: '#f59e0b' }} />
                Simulador de Permissões CDP
              </h3>
              <p style={{ color: 'var(--semob-text-muted)', fontSize: '0.78rem', marginBottom: '1rem' }}>
                Adicione/remova rotas ou mude os níveis de acesso para testar a reatividade dos menus e do botão de consulta de operadoras.
              </p>

              {/* Presets */}
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--semob-text-muted)', alignSelf: 'center' }}>Presets:</span>
                <button onClick={() => applyPreset('admin')} style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem', border: 'none', background: 'var(--semob-secondary)', color: 'var(--semob-text)', borderRadius: '0.25rem', cursor: 'pointer' }}>Admin</button>
                <button onClick={() => applyPreset('auditor')} style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem', border: 'none', background: 'var(--semob-secondary)', color: 'var(--semob-text)', borderRadius: '0.25rem', cursor: 'pointer' }}>Auditor</button>
                <button onClick={() => applyPreset('preposto')} style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem', border: 'none', background: 'var(--semob-secondary)', color: 'var(--semob-text)', borderRadius: '0.25rem', cursor: 'pointer' }}>Preposto</button>
                <button onClick={() => applyPreset('blocked')} style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem', border: 'none', background: 'var(--semob-danger)', color: '#ffffff', borderRadius: '0.25rem', cursor: 'pointer' }}>Zerar (Bloqueio)</button>
              </div>

              {/* Routes checkboxes and dropdown levels */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '320px', overflowY: 'auto', paddingRight: '0.5rem', marginBottom: '1.25rem' }}>
                {[
                  { r: 'dashboard', n: 'Módulo: Dashboard (Public)' },
                  { r: 'suop', n: 'Módulo: SUOP' },
                  { r: 'suop-agencies', n: 'Submenu: SUOP Operadoras' },
                  { r: 'suop-routes', n: 'Submenu: SUOP Linhas' },
                  { r: 'suop-vehicles', n: 'Submenu: SUOP Veículos' },
                  { r: 'sif-menu', n: 'Módulo: SIF Fiscalização' },
                  { r: 'sif-fiscalizacao', n: 'Submenu: SIF Auto Infração' },
                  { r: 'sif-validador', n: 'Submenu: SIF Validadores' },
                  { r: 'cdp', n: 'Módulo: CDP Controles' },
                  { r: 'cdp-sistemas', n: 'Submenu: CDP Sistemas' },
                  { r: 'cdp-usuarios', n: 'Submenu: CDP Usuários' },
                  { r: 'cdp-grupos', n: 'Submenu: CDP Perfis' },
                  { r: '/operadoras', n: 'API Endpoint: /operadoras (Serviço)' }
                ].map(({ r, n }) => {
                  const isChecked = overrideRoutes.includes(r);
                  const currentLevel = overrideLevels[r] || 'LEITURA';

                  return (
                    <div
                      key={r}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.45rem 0.65rem',
                        background: isChecked ? 'var(--semob-secondary)' : 'transparent',
                        borderRadius: '0.375rem',
                        border: '1px solid var(--semob-border)'
                      }}
                    >
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.8rem' }}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleRoute(r)}
                        />
                        <span style={{ color: isChecked ? 'var(--semob-text)' : 'var(--semob-text-muted)' }}>{n}</span>
                      </label>
                      {isChecked && (
                        <select
                          value={currentLevel}
                          onChange={(e) => handleLevelChange(r, e.target.value as 'LEITURA' | 'ESCRITA')}
                          style={{
                            background: 'var(--semob-bg)',
                            border: '1px solid var(--semob-border)',
                            color: currentLevel === 'ESCRITA' ? 'var(--semob-success)' : 'var(--semob-primary)',
                            borderRadius: '0.25rem',
                            fontSize: '0.72rem',
                            padding: '0.15rem 0.35rem',
                            outline: 'none',
                            fontWeight: 'bold'
                          }}
                        >
                          <option value="LEITURA">LEITURA</option>
                          <option value="ESCRITA">ESCRITA</option>
                        </select>
                      )}
                    </div>
                  );
                })}
              </div>

              <Button style={{ width: '100%' }} onClick={handleApplyOverride}>
                Aplicar Permissões Locais
              </Button>
            </div>

            {/* Live Sandbox Workspace */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Working Demonstration of Operadoras list */}
              <div style={{ border: '1px solid var(--semob-border)', borderRadius: '1rem', padding: '0.5rem' }}>
                <OperadoraList />
              </div>

              {/* Interactive Popup Modal trigger demo */}
              <div style={{ padding: '1.5rem', background: 'var(--semob-surface)', border: '1px solid var(--semob-border)', borderRadius: '1rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--semob-text)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <HelpCircle size={18} style={{ color: '#3b82f6' }} />
                  Central de Janelas Popups
                </h3>
                <p style={{ color: 'var(--semob-text-muted)', fontSize: '0.78rem', marginBottom: '1rem' }}>
                  Abra popups estilizados com os alertas de segurança padronizados do SISMOB.
                </p>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <Button variant="outline" size="sm" onClick={() => { setPopupVariant('info'); setCustomPopupOpen(true); }}>
                    Popup Info
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => { setPopupVariant('success'); setCustomPopupOpen(true); }}>
                    Popup Sucesso
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => { setPopupVariant('warning'); setCustomPopupOpen(true); }}>
                    Popup Aviso
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => { setPopupVariant('danger'); setCustomPopupOpen(true); }}>
                    Popup Perigo
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation/Notification Popup */}
      <Popup
        isOpen={customPopupOpen}
        onClose={() => setCustomPopupOpen(false)}
        title={
          popupVariant === 'success' 
            ? 'Operação Concluída!' 
            : popupVariant === 'danger' 
            ? 'Acesso Negado!' 
            : popupVariant === 'warning' 
            ? 'Atenção!' 
            : 'Informação'
        }
        variant={popupVariant}
        size="sm"
        actions={
          <Button variant="primary" size="sm" onClick={() => setCustomPopupOpen(false)}>
            Entendido
          </Button>
        }
      >
        {popupVariant === 'success' ? (
          <div>
            As permissões do CDP foram atualizadas com sucesso no simulador local.
            A interface e a barra lateral (Sidebar) foram recalculadas em tempo de execução.
          </div>
        ) : popupVariant === 'danger' ? (
          <div>
            Ação bloqueada. Você não possui a permissão de <strong>ESCRITA</strong> para o serviço `/operadoras` no CDP.
          </div>
        ) : popupVariant === 'warning' ? (
          <div>
            Esta é uma simulação de alerta do sistema. Verifique a integridade dos dados informados antes de prosseguir.
          </div>
        ) : (
          <div>
            As requisições REST da SEMOB agora contêm o cabeçalho <strong>x-user-id</strong> correspondente ao ID do seu usuário autenticado.
          </div>
        )}
      </Popup>
    </div>
  );
};
export default DashboardDocs;

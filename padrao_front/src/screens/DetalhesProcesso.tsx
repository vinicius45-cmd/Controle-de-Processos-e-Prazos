import React, { useMemo, useState } from 'react';
import { ArrowLeft, CalendarDays, ChevronDown, Info, MoreVertical, PencilLine, Repeat2, Save } from 'lucide-react';
import { useApp } from '../app/AppProvider';
import { FormCadastro } from '../types';
import HistoricoProcesso from '../components/processos/HistoricoProcesso';
import '../styles/DetalhesProcesso.css';

type AbaAtiva = 'dados' | 'distribuicoes' | 'historico';

interface ProcessoCampo {
  label: string;
  value: string;
  variant?: 'danger' | 'success' | 'info' | 'neutral' | 'warning';
  isCheckbox?: boolean;
  checked?: boolean;
  wide?: boolean;
}

interface ResumoItem {
  label: string;
  value: string;
  variant?: 'danger' | 'info' | 'neutral' | 'warning';
}

interface ProcessoDetalhe {
  numeroSei: string;
  statusLabel: string;
  diasTexto: string;
  assunto: string;
  orgaoOrigem: string;
  observacao: string;
  ultimaAtualizacao: string;
  dados: ProcessoCampo[];
  resumo: ResumoItem[];
}

const tabs: Array<{ id: AbaAtiva; label: string }> = [
  { id: 'dados', label: 'Dados' },
  { id: 'distribuicoes', label: 'Distribuições' },
  { id: 'historico', label: 'Histórico' }
];

const formatDate = (value?: string): string => {
  if (!value) return 'Não informado';

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;

  return parsed.toLocaleDateString('pt-BR');
};

const formatDateTime = (value?: string): string => {
  const parsed = new Date(value ?? Date.now());
  if (Number.isNaN(parsed.getTime())) return 'Não informado';

  return parsed.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const mapearOrgao = (value?: string): string => {
  const mapa: Record<string, string> = {
    'secretaria-saude': 'TCDF',
    'secretaria-educacao': 'Secretária de Educação',
    'secretaria-fazenda': 'Secretária da Fazenda',
    'orgao-de-controle': 'Órgão de Controle'
  };

  return mapa[value ?? ''] || value || 'TCDF';
};

const mapearSituacao = (value?: string): string => {
  const mapa: Record<string, string> = {
    'em-andamento': 'Aguardando retorno',
    'concluido': 'Concluído',
    'parado': 'Parado',
    'aguardando-retorno': 'Aguardando retorno',
    'em analise': 'Em análise'
  };

  return mapa[(value ?? '').toLowerCase()] || value || 'Aguardando retorno';
};

const calcularDiasRestantes = (prazo?: string): number => {
  if (!prazo) return 2;

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const alvo = new Date(prazo);
  alvo.setHours(0, 0, 0, 0);

  return Math.ceil((alvo.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
};

const construirProcessoDetalhe = (processo: FormCadastro | null): ProcessoDetalhe => {
  const prazoFinal = processo?.prazoFinal || '2026-09-04';
  const diasRestantes = calcularDiasRestantes(prazoFinal);
  const statusLabel = 'AGUARDANDO RETORNO';
  const diasTexto = diasRestantes <= 0 ? 'Hoje' : `${diasRestantes} dias`;

  const numeroSei = processo?.processoINCRA || '00090-000012345/2026-11';
  const assunto = processo?.assunto || 'Solicitação de informações sobre graduados do STPC/DF';
  const orgaoOrigem = mapearOrgao(processo?.orgaoOrigem || 'secretaria-saude');
  const observacao = processo?.observacao || 'Solicitação encaminhada pelo Tribunal de Contas do DF.';

  return {
    numeroSei,
    statusLabel,
    diasTexto: diasRestantes <= 0 ? 'Faltam 0 dias' : `Faltam ${diasRestantes} dias`,
    assunto,
    orgaoOrigem,
    observacao,
    ultimaAtualizacao: formatDateTime(),
    dados: [
      { label: 'Ente', value: orgaoOrigem },
      { label: 'Tipo de documento', value: processo?.assuntoTipo || 'Ofício' },
      { label: 'N° do documento', value: processo?.documentoSEI || '279/2026' },
      { label: 'Tipo de assunto', value: processo?.assuntoTipo || 'Órgão de Controle' },
      { label: 'Assunto', value: assunto, wide: true },
      { label: 'Processo especial', value: 'Não', isCheckbox: true, checked: Boolean(processo?.especial) },
      { label: 'Data de entrada', value: formatDate(processo?.dataEntrada || '2026-08-28') },
      { label: 'Prazo final', value: formatDate(prazoFinal) },
      { label: 'Observações', value: observacao, wide: true }
    ],
    resumo: [
      { label: 'Situação atual', value: statusLabel, variant: 'warning' },
      { label: 'Prioridade', value: diasRestantes <= 2 ? 'Alta' : 'Normal', variant: diasRestantes <= 2 ? 'danger' : 'neutral' },
      { label: 'Prazo final', value: formatDate(prazoFinal), variant: 'neutral' },
      { label: 'Dias para o prazo', value: diasTexto, variant: diasRestantes <= 2 ? 'danger' : 'info' },
      { label: 'Data de entrada', value: formatDate(processo?.dataEntrada || '2026-08-28'), variant: 'neutral' },
      { label: 'Ente', value: orgaoOrigem, variant: 'neutral' },
      { label: 'Tipo de documento', value: processo?.assuntoTipo || 'Ofício', variant: 'neutral' },
      { label: 'N° do documento', value: processo?.documentoSEI || '279/2026', variant: 'neutral' },
      { label: 'Tipo de assunto', value: processo?.assuntoTipo || 'Órgão de Controle', variant: 'neutral' },
      { label: 'Especial', value: Boolean(processo?.especial) ? 'Sim' : 'Não', variant: 'neutral' },
      { label: 'Observações', value: observacao, variant: 'neutral' },
      { label: 'Última atualização', value: `${formatDateTime()} por ${processo?.responsavel || 'Maria Silva'}`, variant: 'neutral' }
    ]
  };
};

const DetalhesProcesso: React.FC = () => {
  const [abaAtiva, setAbaAtiva] = useState<AbaAtiva>('dados');
  const { processoSelecionado, definirProcessoSelecionado, navegarPara } = useApp();
  const processo = useMemo(() => construirProcessoDetalhe(processoSelecionado), [processoSelecionado]);

  const voltarParaProcessos = (): void => {
    definirProcessoSelecionado(null, null);
    navegarPara('cadastro-processo');
  };

  const renderConteudo = (): React.ReactNode => {
    if (abaAtiva === 'dados') {
      const valorCampo = (label: string): string => processo.dados.find((campo) => campo.label === label)?.value ?? 'Não informado';

      return (
        <div className="detalhes-processo__content-grid">
          <div className="detalhes-processo__content-main">
            <div className="detalhes-processo__dados-panel">
              <h3 className="detalhes-processo__section-title">Dados do processo</h3>

              <section className="detalhes-processo__data-section">
                <h4>Origem</h4>
                <div className="detalhes-processo__field-grid">
                  <div className="detalhes-processo__field">
                    <label className="detalhes-processo__label">Ente <span>*</span></label>
                    <div className="detalhes-processo__control detalhes-processo__control--select">{valorCampo('Ente')}<ChevronDown size={14} /></div>
                  </div>
                  <div className="detalhes-processo__field">
                    <label className="detalhes-processo__label">Tipo de documento <span>*</span></label>
                    <div className="detalhes-processo__control detalhes-processo__control--select">{valorCampo('Tipo de documento')}<ChevronDown size={14} /></div>
                  </div>
                  <div className="detalhes-processo__field">
                    <label className="detalhes-processo__label">Nº do documento <span>*</span></label>
                    <input className="detalhes-processo__control" value={valorCampo('N° do documento')} readOnly />
                  </div>
                </div>
              </section>

              <section className="detalhes-processo__data-section">
                <h4>Classificação</h4>
                <div className="detalhes-processo__field-grid">
                  <div className="detalhes-processo__field">
                    <label className="detalhes-processo__label">Tipo de assunto <span>*</span></label>
                    <div className="detalhes-processo__control detalhes-processo__control--select">{valorCampo('Tipo de assunto')}<ChevronDown size={14} /></div>
                  </div>
                  <div className="detalhes-processo__field">
                    <label className="detalhes-processo__label">Assunto <span>*</span></label>
                    <textarea className="detalhes-processo__control detalhes-processo__control--textarea" value={valorCampo('Assunto')} readOnly />
                  </div>
                  <div className="detalhes-processo__field">
                    <label className="detalhes-processo__label">Processo especial <Info size={13} /></label>
                    <div className="detalhes-processo__control detalhes-processo__control--select">{valorCampo('Processo especial')}<ChevronDown size={14} /></div>
                  </div>
                </div>
              </section>

              <section className="detalhes-processo__data-section">
                <h4>Controle</h4>
                <div className="detalhes-processo__field-grid">
                  <div className="detalhes-processo__field">
                    <label className="detalhes-processo__label">Data de entrada <span>*</span></label>
                    <div className="detalhes-processo__control detalhes-processo__control--date">{valorCampo('Data de entrada')}<CalendarDays size={15} /></div>
                  </div>
                  <div className="detalhes-processo__field">
                    <label className="detalhes-processo__label">Prazo final <span>*</span></label>
                    <div className="detalhes-processo__control detalhes-processo__control--date">{valorCampo('Prazo final')}<CalendarDays size={15} /></div>
                  </div>
                </div>
                <div className="detalhes-processo__field detalhes-processo__field--notes">
                  <label className="detalhes-processo__label">Observações</label>
                  <textarea className="detalhes-processo__control detalhes-processo__control--textarea detalhes-processo__control--notes" value={valorCampo('Observações')} readOnly />
                </div>
                <button type="button" className="detalhes-processo__save-button"><Save size={15} /> Salvar alterações</button>
              </section>
              </div>
            </div>

          <aside className="detalhes-processo__summary-card">
            <header className="detalhes-processo__summary-header">
              <span>Resumo do processo</span>
            </header>
            <div className="detalhes-processo__summary-list">
              {processo.resumo.map((item) => (
                <div key={`${item.label}-${item.value}`} className={`detalhes-processo__summary-item ${getSummaryItemClass(item.label)}`}>
                  <span className="detalhes-processo__summary-label">{item.label}</span>
                  <span className={`detalhes-processo__summary-value ${getVariantClass(item.variant)} ${getSummaryValueClass(item.label, item.variant)}`}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </aside>
        </div>
      );
    }

    if (abaAtiva === 'historico' && processoSelecionado?.id) {
      return <HistoricoProcesso idProcesso={processoSelecionado.id} aba="historico" />;
    }

    if (abaAtiva === 'distribuicoes' && processoSelecionado?.id) {
      return <HistoricoProcesso idProcesso={processoSelecionado.id} aba="movimentacoes" />;
    }

    return (
      <div className="detalhes-processo__placeholder">
        <strong>{tabs.find((tab) => tab.id === abaAtiva)?.label}</strong>
        <p>Conteúdo da aba ainda não implementado para esta visualização.</p>
      </div>
    );
  };

  return (
    <section className="detalhes-processo-page" aria-label="Detalhes do Processo">
      <div className="detalhes-processo__topbar">
        <button type="button" className="detalhes-processo__crumb-button" onClick={voltarParaProcessos}>
          <ArrowLeft size={16} />
          <span>Voltar para Processos</span>
        </button>

        <div className="detalhes-processo__header-user">
          <span className="detalhes-processo__user-badge">?</span>
          <span className="detalhes-processo__user-name">Maria Silva</span>
          <span className="detalhes-processo__user-role">ASSAD</span>
        </div>
      </div>

      <div className="detalhes-processo__header-card">
        <div className="detalhes-processo__header-main">
          <div className="detalhes-processo__header-subtitle">
            <strong className="detalhes-processo__numero">PROCESSO {processo.numeroSei}</strong>
            <div className="detalhes-processo__header-label">{processo.assunto}</div>
            <div className="detalhes-processo__header-meta">
              <span>TCDF</span>
              <span className="sep-dot">•</span>
              <span>Órgão de Controle</span>
            </div>
          </div>
        </div>

        <div className="detalhes-processo__header-status">
          <span className="detalhes-processo__badge detalhes-processo__badge--warning">{processo.statusLabel}</span>
          <div className="detalhes-processo__header-deadlines">
            <span>Entrada: <strong>{processo.resumo.find((item) => item.label === 'Data de entrada')?.value}</strong></span>
            <span>Prazo final: <strong>{processo.resumo.find((item) => item.label === 'Prazo final')?.value}</strong></span>
          </div>
        </div>

        <span className="detalhes-processo__header-deadline-badge">{processo.diasTexto}</span>

        <div className="detalhes-processo__header-actions">
          <button type="button" className="detalhes-processo__button detalhes-processo__button--secondary">
            <PencilLine size={16} />
            Editar dados
          </button>
          <button type="button" className="detalhes-processo__button detalhes-processo__button--primary">
            <Repeat2 size={16} />
            Alterar situação
          </button>
          <button type="button" className="detalhes-processo__icon-button" aria-label="Mais ações">
            <MoreVertical size={18} />
          </button>
        </div>
      </div>

      <div className="detalhes-processo__tabs" role="tablist" aria-label="Navegação por abas do processo">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setAbaAtiva(tab.id)}
            className={`detalhes-processo__tab ${abaAtiva === tab.id ? 'detalhes-processo__tab--active' : ''}`}
            aria-selected={abaAtiva === tab.id}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {renderConteudo()}
    </section>
  );
};

const getVariantClass = (variant: ProcessoCampo['variant'] | ResumoItem['variant'] = 'neutral'): string => {
  switch (variant) {
    case 'danger':
      return 'detalhes-processo__value--danger';
    case 'success':
      return 'detalhes-processo__value--success';
    case 'info':
      return 'detalhes-processo__value--info';
    case 'warning':
      return 'detalhes-processo__value--warning';
    default:
      return '';
  }
};

const getSummaryItemClass = (label: string): string => {
  const classes: Record<string, string> = {
    'Situação atual': 'detalhes-processo__summary-item--status',
    Prioridade: 'detalhes-processo__summary-item--priority',
    'Dias para o prazo': 'detalhes-processo__summary-item--days',
    'Última atualização': 'detalhes-processo__summary-item--updated'
  };

  return classes[label] ?? '';
};

const getSummaryValueClass = (label: string, variant?: ResumoItem['variant']): string => {
  if (label === 'Situação atual') return 'detalhes-processo__summary-value--status';
  if (label === 'Prioridade' || label === 'Dias para o prazo') {
    return variant === 'danger' ? 'detalhes-processo__summary-value--indicator-danger' : 'detalhes-processo__summary-value--indicator';
  }

  return '';
};

export default DetalhesProcesso;

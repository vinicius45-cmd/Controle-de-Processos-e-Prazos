import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CalendarDays, Check, ChevronDown, Copy, Info, MoreVertical, PencilLine, Printer, Repeat2, Save } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { useApp } from '../app/AppProvider';
import { FormCadastro } from '../types';
import useTiposSituacaoProcesso from '../hooks/useTiposSituacaoProcesso';
import { localMockTiposSituacaoProcesso } from '../config/mock';
import HistoricoProcesso from '../components/processos/HistoricoProcesso';
import DistribuicoesProcesso from '../components/processos/DistribuicoesProcesso';
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
  const [modoEdicao, setModoEdicao] = useState(false);
  const [alterandoSituacao, setAlterandoSituacao] = useState(false);
  const [modalSituacaoAberto, setModalSituacaoAberto] = useState(false);
  const [situacaoAtual, setSituacaoAtual] = useState('');
  const [situacaoSelecionada, setSituacaoSelecionada] = useState('');
  const [menuAcoesAberto, setMenuAcoesAberto] = useState(false);
  const [numeroCopiado, setNumeroCopiado] = useState(false);
  const menuAcoesRef = useRef<HTMLDivElement>(null);
  const { processoSelecionado, definirProcessoSelecionado, navegarPara } = useApp();
  const { tiposSituacaoProcesso } = useTiposSituacaoProcesso();
  const processo = useMemo(() => construirProcessoDetalhe(processoSelecionado), [processoSelecionado]);
  const situacoesDisponiveis = tiposSituacaoProcesso.length > 0 ? tiposSituacaoProcesso : localMockTiposSituacaoProcesso;

  useEffect(() => {
    setSituacaoAtual(processo.statusLabel);
  }, [processo.numeroSei, processo.statusLabel]);

  useEffect(() => {
    const fecharMenuAoClicarFora = (event: MouseEvent): void => {
      if (menuAcoesRef.current && !menuAcoesRef.current.contains(event.target as Node)) {
        setMenuAcoesAberto(false);
      }
    };

    document.addEventListener('mousedown', fecharMenuAoClicarFora);
    return () => document.removeEventListener('mousedown', fecharMenuAoClicarFora);
  }, []);

  const abrirModalSituacao = (): void => {
    setSituacaoSelecionada(situacaoAtual);
    setModalSituacaoAberto(true);
    setAlterandoSituacao(true);
  };

  const fecharModalSituacao = (): void => {
    setModalSituacaoAberto(false);
    setAlterandoSituacao(false);
  };

  const confirmarSituacao = (): void => {
    if (!situacaoSelecionada) return;

    setSituacaoAtual(situacaoSelecionada);
    setModalSituacaoAberto(false);
    setAlterandoSituacao(false);
  };

  const copiarNumeroProcesso = async (): Promise<void> => {
    await navigator.clipboard.writeText(processo.numeroSei);
    setNumeroCopiado(true);
    setMenuAcoesAberto(false);
    window.setTimeout(() => setNumeroCopiado(false), 1800);
  };

  const imprimirDadosProcesso = (): void => {
    setMenuAcoesAberto(false);
    const tituloAnterior = document.title;
    const restaurarTitulo = (): void => {
      document.title = tituloAnterior;
      window.removeEventListener('afterprint', restaurarTitulo);
    };

    document.title = 'SEMOB-DF Gestão de Processos';
    window.addEventListener('afterprint', restaurarTitulo);
    window.print();
  };

  const baixarPdfProcesso = (): void => {
    const pdf = new jsPDF();
    const margem = 20;
    let posicaoY = 22;
    const adicionarLinha = (rotulo: string, valor: string): void => {
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${rotulo}:`, margem, posicaoY);
      pdf.setFont('helvetica', 'normal');
      pdf.text(valor || 'Não informado', margem + 42, posicaoY);
      posicaoY += 8;
    };

    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Detalhes do processo', margem, posicaoY);
    posicaoY += 12;
    pdf.setFontSize(10);
    adicionarLinha('Processo SEI', processo.numeroSei);
    adicionarLinha('Assunto', processo.assunto);
    adicionarLinha('Situação', situacaoAtual || processo.statusLabel);
    adicionarLinha('Ente', processo.orgaoOrigem);
    adicionarLinha('Prazo final', processo.resumo.find((item) => item.label === 'Prazo final')?.value || '');
    adicionarLinha('Responsável', processoSelecionado?.responsavel || 'Não informado');
    posicaoY += 4;
    pdf.setFont('helvetica', 'bold');
    pdf.text('Observações', margem, posicaoY);
    posicaoY += 7;
    pdf.setFont('helvetica', 'normal');
    const observacoes = pdf.splitTextToSize(processo.observacao || 'Não informado', 170);
    pdf.text(observacoes, margem, posicaoY);
    pdf.save(`processo-${processo.numeroSei.replace(/[^a-zA-Z0-9-]/g, '-')}.pdf`);
    setMenuAcoesAberto(false);
  };

  const atualizarCampo = (campo: keyof FormCadastro, valor: string | boolean): void => {
    if (!processoSelecionado) return;

    definirProcessoSelecionado({ ...processoSelecionado, [campo]: valor }, 'visualizar');
  };

  const renderConteudo = (): React.ReactNode => {
    if (abaAtiva === 'dados') {
      const valorCampo = (label: string): string => processo.dados.find((campo) => campo.label === label)?.value ?? 'Não informado';
      const controleSelecao = (label: string, campo: keyof FormCadastro): React.ReactNode => (
        modoEdicao ? (
          <input
            className="detalhes-processo__control"
            value={valorCampo(label)}
            onChange={(event) => atualizarCampo(campo, event.target.value)}
          />
        ) : (
          <div className="detalhes-processo__control detalhes-processo__control--select" aria-readonly="true">
            {valorCampo(label)}
            <ChevronDown size={14} />
          </div>
        )
      );

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
                    {controleSelecao('Ente', 'orgaoOrigem')}
                  </div>
                  <div className="detalhes-processo__field">
                    <label className="detalhes-processo__label">Tipo de documento <span>*</span></label>
                    {controleSelecao('Tipo de documento', 'assuntoTipo')}
                  </div>
                  <div className="detalhes-processo__field">
                    <label className="detalhes-processo__label">Nº do documento <span>*</span></label>
                    <input className="detalhes-processo__control" value={valorCampo('N° do documento')} readOnly={!modoEdicao} onChange={(event) => atualizarCampo('documentoSEI', event.target.value)} />
                  </div>
                </div>
              </section>

              <section className="detalhes-processo__data-section">
                <h4>Classificação</h4>
                <div className="detalhes-processo__field-grid">
                  <div className="detalhes-processo__field">
                    <label className="detalhes-processo__label">Tipo de assunto <span>*</span></label>
                    {controleSelecao('Tipo de assunto', 'assuntoTipo')}
                  </div>
                  <div className="detalhes-processo__field">
                    <label className="detalhes-processo__label">Assunto <span>*</span></label>
                    <textarea className="detalhes-processo__control detalhes-processo__control--textarea" value={valorCampo('Assunto')} readOnly={!modoEdicao} onChange={(event) => atualizarCampo('assunto', event.target.value)} />
                  </div>
                  <div className="detalhes-processo__field">
                    <label className="detalhes-processo__label">Processo especial <Info size={13} /></label>
                    {controleSelecao('Processo especial', 'assuntoTipo')}
                  </div>
                </div>
              </section>

              <section className="detalhes-processo__data-section">
                <h4>Controle</h4>
                <div className="detalhes-processo__field-grid">
                  <div className="detalhes-processo__field">
                    <label className="detalhes-processo__label">Data de entrada <span>*</span></label>
                    {modoEdicao ? <input className="detalhes-processo__control" value={valorCampo('Data de entrada')} onChange={(event) => atualizarCampo('dataEntrada', event.target.value)} /> : <div className="detalhes-processo__control detalhes-processo__control--date">{valorCampo('Data de entrada')}<CalendarDays size={15} /></div>}
                  </div>
                  <div className="detalhes-processo__field">
                    <label className="detalhes-processo__label">Prazo final <span>*</span></label>
                    {modoEdicao ? <input className="detalhes-processo__control" value={valorCampo('Prazo final')} onChange={(event) => atualizarCampo('prazoFinal', event.target.value)} /> : <div className="detalhes-processo__control detalhes-processo__control--date">{valorCampo('Prazo final')}<CalendarDays size={15} /></div>}
                  </div>
                </div>
                <div className="detalhes-processo__field detalhes-processo__field--notes">
                  <label className="detalhes-processo__label">Observações</label>
                  <textarea className="detalhes-processo__control detalhes-processo__control--textarea detalhes-processo__control--notes" value={valorCampo('Observações')} readOnly={!modoEdicao} onChange={(event) => atualizarCampo('observacao', event.target.value)} />
                </div>
                {modoEdicao && <button type="button" className="detalhes-processo__save-button" onClick={() => setModoEdicao(false)}><Save size={15} /> Salvar alterações</button>}
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
                    {item.label === 'Situação atual' ? (situacaoAtual || item.value) : item.value}
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

    if (abaAtiva === 'distribuicoes' && processoSelecionado) {
      return <DistribuicoesProcesso idProcesso={processoSelecionado.id ?? processo.numeroSei} />;
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
          <span className="detalhes-processo__badge detalhes-processo__badge--warning">{situacaoAtual || processo.statusLabel}</span>
          <div className="detalhes-processo__header-deadlines">
            <span>Entrada: <strong>{processo.resumo.find((item) => item.label === 'Data de entrada')?.value}</strong></span>
            <span>Prazo final: <strong>{processo.resumo.find((item) => item.label === 'Prazo final')?.value}</strong></span>
          </div>
        </div>

        <span className="detalhes-processo__header-deadline-badge">{processo.diasTexto}</span>

        <div className="detalhes-processo__header-actions">
          <button type="button" className={`detalhes-processo__button detalhes-processo__button--secondary${modoEdicao ? ' detalhes-processo__button--active' : ''}`} onClick={() => setModoEdicao((estadoAtual) => !estadoAtual)}>
            <PencilLine size={16} />
            Editar dados
          </button>
          <button type="button" className={`detalhes-processo__button detalhes-processo__button--primary${alterandoSituacao ? ' detalhes-processo__button--active' : ''}`} onClick={abrirModalSituacao}>
            <Repeat2 size={16} />
            Alterar situação
          </button>
          <div className="detalhes-processo__actions-menu" ref={menuAcoesRef}>
            <button type="button" className="detalhes-processo__icon-button" aria-label="Mais ações" aria-expanded={menuAcoesAberto} onClick={() => setMenuAcoesAberto((estadoAtual) => !estadoAtual)}>
              <MoreVertical size={18} />
            </button>
            {menuAcoesAberto && (
              <div className="detalhes-processo__actions-dropdown" role="menu">
                <button type="button" role="menuitem" onClick={() => void copiarNumeroProcesso()}>
                  {numeroCopiado ? <Check size={15} /> : <Copy size={15} />}
                  {numeroCopiado ? 'Número copiado' : 'Copiar número do processo SEI'}
                </button>
                <button type="button" role="menuitem" onClick={baixarPdfProcesso}>
                  <Printer size={15} />
                  Baixar PDF
                </button>
                <button type="button" role="menuitem" onClick={imprimirDadosProcesso}>
                  <Printer size={15} />
                  Imprimir dados do processo
                </button>
              </div>
            )}
          </div>
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

      {modalSituacaoAberto && (
        <div className="detalhes-processo__modal-overlay" role="presentation" onClick={fecharModalSituacao}>
          <section className="detalhes-processo__modal" role="dialog" aria-modal="true" aria-labelledby="alterar-situacao-titulo" onClick={(event) => event.stopPropagation()}>
            <header className="detalhes-processo__modal-header">
              <div>
                <h2 id="alterar-situacao-titulo">Alterar situação</h2>
                <p>Selecione a nova situação para este processo.</p>
              </div>
              <button type="button" className="detalhes-processo__modal-close" aria-label="Fechar" onClick={fecharModalSituacao}>×</button>
            </header>

            <div className="detalhes-processo__situacoes" role="radiogroup" aria-label="Situações disponíveis">
              {situacoesDisponiveis.map((situacao) => (
                <label key={situacao.idTipoSituacaoProcesso} className={`detalhes-processo__situacao-option${situacaoSelecionada === situacao.nmTipoSituacaoProcesso ? ' is-selected' : ''}`}>
                  <input
                    type="radio"
                    name="situacao-processo"
                    value={situacao.nmTipoSituacaoProcesso}
                    checked={situacaoSelecionada === situacao.nmTipoSituacaoProcesso}
                    onChange={() => setSituacaoSelecionada(situacao.nmTipoSituacaoProcesso)}
                  />
                  <span>{situacao.nmTipoSituacaoProcesso}</span>
                </label>
              ))}
            </div>

            <footer className="detalhes-processo__modal-actions">
              <button type="button" className="detalhes-processo__modal-button detalhes-processo__modal-button--cancel" onClick={fecharModalSituacao}>Cancelar</button>
              <button type="button" className="detalhes-processo__modal-button detalhes-processo__modal-button--confirm" onClick={confirmarSituacao} disabled={!situacaoSelecionada}>Confirmar alteração</button>
            </footer>
          </section>
        </div>
      )}

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

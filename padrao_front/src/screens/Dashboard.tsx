import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Bell,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock3,
  HelpCircle,
  ClipboardList,
  Droplet,
  Eye,
  EyeOff,
  FileSignature,
  Info,
  LucideIcon,
  MoreVertical,
  PackagePlus,
  PenLine,
  Puzzle,
  RotateCcw,
  SlidersHorizontal,
  TimerReset,
  Trash2
} from 'lucide-react';
import { FormCadastro } from '../types';
import { useApp } from '../app/AppProvider';
import UnidadeService from '../services/UnidadeService';
import ProcessoService from '../services/ProcessoService';

type Criticidade =
  | 'Atrasado'
  | 'Vence Hoje'
  | 'Próximo do prazo'
  | 'Para Assinatura'
  | 'Especial'
  | 'OK';

type SituacaoProcesso = 'Em andamento' | 'Para assinatura';

interface Processo {
  id: number;
  criticidade: Criticidade;
  numeroSei: string;
  assunto: string;
  orgao: string;
  responsavel: string;
  prazoFinal: string;
  diasRestantes: string;
  situacao: SituacaoProcesso;
}

interface ResumoCard {
  titulo: string;
  valor: string;
  descricao: string;
  variante: 'azul' | 'vermelho' | 'laranja' | 'amarelo' | 'cyan' | 'roxo';
  icone: LucideIcon;
}

const getResumoCards = (processos: Processo[]): ResumoCard[] => [
  {
    titulo: 'Total de Processos',
    valor: String(processos.length),
    descricao: 'Todos os processos',
    variante: 'azul',
    icone: ClipboardList
  },
  {
    titulo: 'Atrasados',
    valor: String(processos.filter((processo) => processo.criticidade === 'Atrasado').length),
    descricao: 'Processos atrasados',
    variante: 'vermelho',
    icone: Droplet
  },
  {
    titulo: 'Vence Hoje',
    valor: String(processos.filter((processo) => processo.criticidade === 'Vence Hoje').length),
    descricao: 'Vencem hoje',
    variante: 'laranja',
    icone: TimerReset
  },
  {
    titulo: 'Próximos 5 dias',
    valor: String(processos.filter((processo) => processo.criticidade === 'Próximo do prazo').length),
    descricao: 'Vencem em até 5 dias',
    variante: 'amarelo',
    icone: PackagePlus
  },
  {
    titulo: 'Para Assinatura',
    valor: String(processos.filter((processo) => processo.criticidade === 'Para Assinatura').length),
    descricao: 'Aguardando assinatura',
    variante: 'cyan',
    icone: FileSignature
  },
  {
    titulo: 'Especiais',
    valor: String(processos.filter((processo) => processo.criticidade === 'Especial').length),
    descricao: 'Processos especiais',
    variante: 'roxo',
    icone: Puzzle
  }
];

const getDiasRestantesClass = (diasRestantes: string): string => {
  if (diasRestantes.startsWith('-')) {
    return 'dashboard-table__days--late';
  }

  if (diasRestantes === 'Hoje') {
    return 'dashboard-table__days--today';
  }

  return 'dashboard-table__days--ok';
};

const getCriticidadeVariant = (criticidade: Criticidade): string => {
  const variants: Record<Criticidade, string> = {
    Atrasado: 'atrasado',
    'Vence Hoje': 'vence-hoje',
    'Próximo do prazo': 'proximo',
    'Para Assinatura': 'assinatura',
    Especial: 'especial',
    OK: 'ok'
  };

  return variants[criticidade];
};

const getSituacaoVariant = (situacao: SituacaoProcesso): string => {
  const variants: Record<SituacaoProcesso, string> = {
    'Em andamento': 'andamento',
    'Para assinatura': 'assinatura'
  };

  return variants[situacao];
};

const getProcessosFiltrados = (processos: Processo[], filtroAtivo: string | null): Processo[] => {
  if (!filtroAtivo || filtroAtivo === 'Total de Processos') {
    return processos;
  }

  const criteriosPorCard: Record<string, Criticidade | Criticidade[]> = {
    Atrasados: 'Atrasado',
    'Vence Hoje': 'Vence Hoje',
    'Próximos 5 dias': 'Próximo do prazo',
    'Para Assinatura': 'Para Assinatura',
    Especiais: 'Especial'
  };

  const criterios = criteriosPorCard[filtroAtivo];
  const criteriosList = Array.isArray(criterios) ? criterios : [criterios];

  return processos.filter((processo) => criteriosList.includes(processo.criticidade));
};

const parseDateString = (dateStr: string): Date | null => {
  if (!dateStr) return null;

  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
    const [day, month, year] = dateStr.split('/').map(Number);
    return new Date(year, month - 1, day);
  }

  const fallback = new Date(dateStr);
  return Number.isNaN(fallback.getTime()) ? null : fallback;
};

const formatarPrazoFinal = (dateStr: string): string => {
  const data = parseDateString(dateStr);
  return data ? data.toLocaleDateString('pt-BR') : '';
};

const calcularDiasRestantes = (prazoFinal: string): number => {
  if (!prazoFinal) return 0;

  const prazo = parseDateString(prazoFinal);
  if (!prazo) return 0;

  const hoje = new Date();

  prazo.setHours(0, 0, 0, 0);
  hoje.setHours(0, 0, 0, 0);

  const diferenca = prazo.getTime() - hoje.getTime();
  const dias = Math.floor(diferenca / (1000 * 60 * 60 * 24));

  return dias;
};

const recalcularProcesso = (processo: Processo): Processo => {
  const prazoValido = parseDateString(processo.prazoFinal);
  const prazoFormatado = prazoValido ? prazoValido.toLocaleDateString('pt-BR') : processo.prazoFinal;
  const diasRestantesValor = prazoValido ? calcularDiasRestantes(processo.prazoFinal) : 0;
  let criticidade: Criticidade = 'OK';
  let diasTexto = `${diasRestantesValor} dias`;

  if (diasRestantesValor < 0) {
    criticidade = 'Atrasado';
    diasTexto = `${diasRestantesValor} dias`;
  } else if (diasRestantesValor === 0) {
    criticidade = 'Vence Hoje';
    diasTexto = 'Hoje';
  } else if (diasRestantesValor <= 5) {
    criticidade = 'Próximo do prazo';
  }

  return {
    ...processo,
    prazoFinal: prazoFormatado,
    diasRestantes: diasTexto,
    criticidade
  };
};

const converterParaProcesso = (form: FormCadastro, index: number): Processo => {
  const diasRestantes = calcularDiasRestantes(form.prazoFinal);
  let criticidade: Criticidade = 'OK';
  let diasTexto = `${diasRestantes} dias`;

  if (diasRestantes < 0) {
    criticidade = 'Atrasado';
    diasTexto = `${diasRestantes} dias`;
  } else if (diasRestantes === 0) {
    criticidade = 'Vence Hoje';
    diasTexto = 'Hoje';
  } else if (diasRestantes <= 5) {
    criticidade = 'Próximo do prazo';
  } else if (form.especial) {
    criticidade = 'Especial';
  }

  return {
    id: parseInt(form.id || index.toString(), 10),
    criticidade,
    numeroSei: form.processoINCRA || form.requerimento || 'N/A',
    assunto: form.assunto,
    orgao: form.orgaoOrigem || 'Não informado',
    responsavel: form.responsavel || 'Não atribuído',
    prazoFinal: form.prazoFinal ? formatarPrazoFinal(form.prazoFinal) : '',
    diasRestantes: diasTexto,
    situacao: form.situacaoProcesso === 'para-assinatura' ? 'Para assinatura' : 'Em andamento'
  };
};

export const Dashboard: React.FC = () => {
  const { definirProcessoSelecionado, navegarPara } = useApp();
  const [processosExibicao, setProcessosExibicao] = useState<Processo[]>([]);
  const [filtroAtivo, setFiltroAtivo] = useState<string | null>(null);
  const [processosComBlur, setProcessosComBlur] = useState<Record<number, boolean>>({});
  const [menuAbertoId, setMenuAbertoId] = useState<number | null>(null);
  const [processoParaExcluir, setProcessoParaExcluir] = useState<Processo | null>(null);
  const [mostrarTodosProcessos, setMostrarTodosProcessos] = useState(false);

  useEffect(() => {
    let ativo = true;
    const carregarProcessos = async (): Promise<void> => {
      try {
        const unidades = await UnidadeService.listar('', true);
        const processosPorUnidade = await Promise.all(
          unidades.map((unidade) => ProcessoService.listarPorUnidade(unidade.idUnidade))
        );
        if (!ativo) return;
        setProcessosExibicao(processosPorUnidade.flat().map((processo, index) => converterParaProcesso(processo, index)));
      } catch (erro) {
        console.error('Erro ao carregar processos:', erro);
        if (ativo) setProcessosExibicao([]);
      }
    };
    void carregarProcessos();
    return () => { ativo = false; };
  }, []);

  const handleSelecionarCard = (titulo: string) => {
    setFiltroAtivo((filtroAtual) => (filtroAtual === titulo ? null : titulo));
    setMostrarTodosProcessos(true);
  };

  const abrirDetalhesProcesso = (processo: Processo): void => {
    const processoSelecionado: FormCadastro = {
      processoINCRA: processo.numeroSei,
      requerimento: '',
      assunto: processo.assunto,
      assuntoTipo: 'Ofício',
      destinatario: '',
      solicitudesInformacao: [],
      orgaoOrigem: processo.orgao,
      dataEntrada: '',
      prazoAreaTecnica: '',
      prazoFinal: processo.prazoFinal,
      situacaoProcesso: processo.situacao === 'Para assinatura' ? 'em-andamento' : 'em-andamento',
      responsavel: processo.responsavel,
      documentoSEI: '',
      especial: processo.criticidade === 'Especial',
      filtroRespostas: processo.criticidade === 'Para Assinatura',
      observacao: ''
    };

    definirProcessoSelecionado(processoSelecionado, 'visualizar', 'painel');
    navegarPara('meus-processos');
  };

  const alternarBlurProcesso = (id: number) => {
    setProcessosComBlur((estadoAtual) => ({
      ...estadoAtual,
      [id]: !estadoAtual[id]
    }));
  };

  const abrirMenuAcoes = (id: number, event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setMenuAbertoId((estadoAtual) => (estadoAtual === id ? null : id));
  };

  const iniciarExclusao = (processo: Processo) => {
    setMenuAbertoId(null);
    setProcessoParaExcluir(processo);
  };

  const confirmarExclusao = () => {
    if (!processoParaExcluir) {
      return;
    }

    setProcessosExibicao((estadoAtual) => estadoAtual.filter((processo) => processo.id !== processoParaExcluir.id));
    setProcessosComBlur((estadoAtual) => {
      const novoEstado = { ...estadoAtual };
      delete novoEstado[processoParaExcluir.id];
      return novoEstado;
    });
    setProcessoParaExcluir(null);
  };

  const cancelarExclusao = () => {
    setProcessoParaExcluir(null);
  };

  const alternarVisibilidadeProcessos = () => {
    if (filtroAtivo) {
      setFiltroAtivo(null);
      setMostrarTodosProcessos(true);
      return;
    }

    setMostrarTodosProcessos((estadoAtual) => !estadoAtual);
  };

  useEffect(() => {
    const fecharMenuAoClicarFora = (event: MouseEvent) => {
      const alvo = event.target as HTMLElement;
      if (!alvo.closest('.dashboard-actions__menu')) {
        setMenuAbertoId(null);
      }
    };

    document.addEventListener('click', fecharMenuAoClicarFora);

    return () => {
      document.removeEventListener('click', fecharMenuAoClicarFora);
    };
  }, []);

  useEffect(() => {
    let timeoutId: number | null = null;

    const scheduleNextMidnight = (): void => {
      const now = new Date();
      const nextMidnight = new Date(now);
      nextMidnight.setDate(now.getDate() + 1);
      nextMidnight.setHours(0, 0, 0, 0);

      const msUntilMidnight = nextMidnight.getTime() - now.getTime();
      timeoutId = window.setTimeout(() => {
        setProcessosExibicao((estadoAtual) => estadoAtual.map(recalcularProcesso));
        scheduleNextMidnight();
      }, msUntilMidnight);
    };

    scheduleNextMidnight();

    return () => {
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }
    };
  }, []);

  const processosFiltrados = getProcessosFiltrados(processosExibicao, filtroAtivo);
  const processosVisiveis = mostrarTodosProcessos ? processosFiltrados : processosFiltrados.slice(0, 7);
  const resumoCards = getResumoCards(processosExibicao);

  return (
    <section className="dashboard-page dashboard-page--management" aria-label="Dashboard de processos">
      <header className="management-heading">
        <h1>ASSAD <span>— Gestão de Processos</span></h1>
        <div className="management-heading__actions" aria-label="Ações rápidas do dashboard">
          <button type="button" className="management-heading__action management-heading__action--alert" aria-label="Notificações">
            <Bell size={18} />
          </button>
          <button type="button" className="management-heading__action" aria-label="Ajuda">
            <HelpCircle size={18} />
          </button>
          <button type="button" className="management-heading__action" aria-label="Abrir painel de ações">
            <ArrowRight size={18} />
          </button>
        </div>
      </header>

      <div className="management-filters" aria-label="Filtros de processos">
        {['Período', 'Assunto', 'Ente', 'Situação'].map((label) => (
          <label key={label}><span>{label}</span><button type="button">Todos <ChevronDown size={14} /></button></label>
        ))}
        <button className="management-filters__advanced" type="button"><SlidersHorizontal size={15} /> Filtros avançados</button>
      </div>

      <div className="management-metrics">
        {[
          { label: 'Processos ativos', index: 0, tone: 'blue', icon: ClipboardList, filter: 'Total de Processos' },
          { label: 'Atrasados', index: 1, tone: 'red', icon: AlertTriangle, filter: 'Atrasados' },
          { label: 'Vencem hoje', index: 2, tone: 'orange', icon: Clock3, filter: 'Vence Hoje' },
          { label: 'Próx. 5 dias', index: 3, tone: 'yellow', icon: CalendarDays, filter: 'Próximos 5 dias' },
          { label: 'Aguardando retorno', index: 4, tone: 'purple', icon: RotateCcw, filter: 'Aguardando retorno' },
          { label: 'Para assinatura', index: 5, tone: 'sky', icon: PenLine, filter: 'Para Assinatura' }
        ].map((card) => {
          const Icon = card.icon;
          const estaSelecionado = filtroAtivo === card.filter;
          const valor = card.index === 0
            ? processosExibicao.length
            : card.index === 1
              ? processosExibicao.filter((processo) => processo.criticidade === 'Atrasado').length
              : card.index === 2
                ? processosExibicao.filter((processo) => processo.criticidade === 'Vence Hoje').length
                : card.index === 3
                  ? processosExibicao.filter((processo) => processo.criticidade === 'Próximo do prazo').length
                  : card.index === 4
                    ? processosExibicao.filter((processo) => processo.situacao === 'Em andamento').length
                    : processosExibicao.filter((processo) => processo.criticidade === 'Para Assinatura').length;

          return <button className={`management-metric management-metric--${card.tone}${estaSelecionado ? ' is-selected' : ''}`} key={card.label} onClick={() => handleSelecionarCard(card.filter)} type="button">
            <span className="management-metric__icon"><Icon size={21} /></span>
            <span className="management-metric__copy"><small>{card.label}</small><strong>{valor}</strong><em>Ver processos <span>→</span></em></span>
          </button>;
        })}
      </div>

      <nav className="management-tabs" aria-label="Situação dos processos">
        {[
          ['Todos', ClipboardList, 'Total de Processos'], ['Atrasados', AlertTriangle, 'Atrasados'], ['Vence hoje', Clock3, 'Vence Hoje'],
          ['Próximos 5 dias', CalendarDays, 'Próximos 5 dias'], ['Aguardando retorno', RotateCcw, 'Aguardando retorno'], ['Para assinatura', PenLine, 'Para Assinatura'], ['Concluídos', CheckCircle2, 'Concluídos']
        ].map(([label, Icon, filter]) => <button className={filtroAtivo === filter || (!filtroAtivo && filter === 'Total de Processos') ? 'is-active' : ''} key={String(label)} onClick={() => setFiltroAtivo(String(filter) === 'Total de Processos' ? null : String(filter))} type="button">{typeof Icon === 'function' ? React.createElement(Icon, { size: 16 }) : null}{typeof label === 'string' ? label : ''}</button>)}
      </nav>

      <section className="management-table-card">
        <header><h2>Processos que exigem atenção</h2></header>
        <div className="management-table-wrap"><table className="management-table"><thead><tr><th>Prioridade</th><th>Processo SEI</th><th>Assunto</th><th>Ente</th><th>Situação</th><th>Prazo</th><th>Dias <Info size={12} /></th><th>Pendências</th><th aria-label="Abrir" /></tr></thead><tbody>
          {processosVisiveis.map((processo) => (
            <tr
              key={processo.id}
              role="button"
              tabIndex={0}
              onClick={() => abrirDetalhesProcesso(processo)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  abrirDetalhesProcesso(processo);
                }
              }}
            >
              <td><span className={`management-priority management-priority--${getCriticidadeVariant(processo.criticidade)}`} /></td>
              <td className="management-table__sei">{processo.numeroSei}</td><td>{processo.assunto}</td><td>{processo.orgao.replace('Secretaria de ', '')}</td>
              <td><span className={`management-status management-status--${getCriticidadeVariant(processo.criticidade)}`}>{processo.criticidade === 'Atrasado' ? 'Aguardando retorno' : processo.situacao}</span></td>
              <td>{processo.prazoFinal}</td><td className={getDiasRestantesClass(processo.diasRestantes)}>{processo.diasRestantes.replace(' dias', '').replace(' dia', '')}</td><td className="management-table__pending">{processo.criticidade === 'OK' ? '—' : processo.orgao.split(' ')[0].toUpperCase()}</td>
              <td className="management-table__open">
                <button
                  type="button"
                  aria-label={`Visualizar processo ${processo.numeroSei}`}
                  onClick={(event) => {
                    event.stopPropagation();
                    abrirDetalhesProcesso(processo);
                  }}
                >
                  <ChevronRight size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody></table></div>
        <footer className="management-table__footer"><span>Mostrando {processosVisiveis.length} de {processosExibicao.length} processos</span><button type="button">10 por página <ChevronDown size={13} /></button></footer>
      </section>

      <div className="management-note"><Info size={15} /> O cálculo de dias considera o prazo final do processo. Clique em um processo para ver detalhes e pendências das unidades.</div>

      <div className="management-legacy" aria-hidden="true">
      <div className="process-form__back"><span>Processos</span></div>
      <div className="process-form__back"><span>Processos</span></div>
      <header className="process-form__heading">
        <div>
          <h1>Novo processo</h1>
          <p>Preencha as informações para cadastrar um novo processo.</p>
        </div>
        <div className="process-form__heading-actions">
          <button type="button" className="process-form__cancel">Cancelar</button>
          <button type="button" className="process-form__save">▣ <span>Salvar processo</span></button>
        </div>
      </header>

      <div className="process-form__layout">
        <div className="process-form__sections">
          <section className="process-form__section">
            <h2>1. Processo</h2>
            <div className="process-form__grid process-form__grid--two">
              <label className="process-form__field"><span>Número do processo SEI <b>*</b></span><input placeholder="Ex.: 00090-00012345/2026-11" /></label>
              <label className="process-form__field"><span>Unidade responsável <b>*</b></span><button className="process-form__select" type="button">Selecione a unidade <ChevronDown size={15} /></button></label>
            </div>
          </section>

          <section className="process-form__section">
            <h2>2. Origem</h2>
            <div className="process-form__grid process-form__grid--three">
              <label className="process-form__field"><span>Ente <b>*</b></span><button className="process-form__select" type="button">Selecione o ente <ChevronDown size={15} /></button></label>
              <label className="process-form__field"><span>Tipo de documento <b>*</b></span><button className="process-form__select" type="button">Selecione o tipo de documento <ChevronDown size={15} /></button></label>
              <label className="process-form__field"><span>Número do documento de entrada <b>*</b></span><input placeholder="Informe o número do documento" /></label>
            </div>
          </section>

          <section className="process-form__section">
            <h2>3. Assunto</h2>
            <div className="process-form__grid process-form__grid--subject">
              <label className="process-form__field"><span>Tipo de assunto <b>*</b></span><button className="process-form__select" type="button">Selecione o tipo de assunto <ChevronDown size={15} /></button></label>
              <label className="process-form__field"><span>Assunto <b>*</b></span><textarea placeholder="Descreva o assunto do processo" maxLength={1000} /></label>
              <label className="process-form__field"><span>Processo especial <Info size={13} /></span><button className="process-form__select" type="button">Não <ChevronDown size={15} /></button></label>
            </div>
          </section>

          <section className="process-form__section">
            <h2>4. Controle de prazo</h2>
            <div className="process-form__grid process-form__grid--two">
              <label className="process-form__field"><span>Data de entrada <b>*</b></span><div className="process-form__input-icon"><input value="28/05/2025" readOnly /><CalendarDays size={16} /></div></label>
              <label className="process-form__field"><span>Prazo final <b>*</b></span><div className="process-form__input-icon"><input placeholder="Selecione a data" readOnly /><CalendarDays size={16} /></div></label>
            </div>
            <label className="process-form__field process-form__field--notes"><span>Observações</span><textarea placeholder="Informações complementares sobre o processo (opcional)" maxLength={1000} /></label>
          </section>
        </div>

        <aside className="process-form__summary">
          <h2>Resumo do processo</h2>
          {['Número do processo SEI', 'Unidade responsável', 'Ente', 'Tipo de documento', 'Nº do documento', 'Tipo de assunto', 'Assunto', 'Especial', 'Data de entrada', 'Prazo final', 'Observações'].map((label) => (
            <div className="process-form__summary-row" key={label}><span>{label}</span><strong>{label === 'Número do processo SEI' ? (processosExibicao[0]?.numeroSei || '—') : '—'}</strong></div>
          ))}
          <div className="process-form__notice"><Info size={16} /><span>Após salvar, o processo será criado com a situação <b>RECEBIDO</b>. Você poderá ajustar os dados e fazer distribuições.</span></div>
        </aside>
      </div>

      {/* The legacy table remains below for the existing process actions and is hidden in this presentation. */}
      <div className="dashboard-summary">
        {resumoCards.map((card) => {
          const Icon = card.icone;
          const estaAtivo = filtroAtivo === card.titulo;
          const eCardTotal = card.titulo === 'Total de Processos';

          return (
            <article
              className={`dashboard-card${estaAtivo && !eCardTotal ? ' dashboard-card--active' : ''}`}
              key={card.titulo}
              role={eCardTotal ? undefined : 'button'}
              tabIndex={eCardTotal ? undefined : 0}
              onClick={() => {
                if (!eCardTotal) {
                  handleSelecionarCard(card.titulo);
                }
              }}
              onKeyDown={(event) => {
                if (eCardTotal) {
                  return;
                }

                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  handleSelecionarCard(card.titulo);
                }
              }}
            >
              <div className={`dashboard-card__icon dashboard-card__icon--${card.variante}`}>
                <Icon size={23} strokeWidth={2.2} />
              </div>
              <div className="dashboard-card__copy">
                <h2>{card.titulo}</h2>
                <strong>{card.valor}</strong>
                <span>{card.descricao}</span>
              </div>
            </article>
          );
        })}
      </div>

      <section className="dashboard-priority">
        <header className="dashboard-priority__header">
          <h2>{filtroAtivo ? `Prioridade de Atenção • ${filtroAtivo}` : 'Prioridade de Atenção'}</h2>
          {processosFiltrados.length > 7 && (
            <button type="button" onClick={alternarVisibilidadeProcessos}>
              {mostrarTodosProcessos ? 'Ver menos' : 'Ver todos'}
            </button>
          )}
        </header>

        <div className="dashboard-table__wrap">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Criticidade</th>
                <th>Processo SEI Nº</th>
                <th>Assunto</th>
                <th>Órgão de Origem</th>
                <th>Responsável</th>
                <th>Prazo Final</th>
                <th>Dias Restantes</th>
                <th>Situação do Processo</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {processosVisiveis.map((processo) => (
                <tr
                  key={processo.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => abrirDetalhesProcesso(processo)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      abrirDetalhesProcesso(processo);
                    }
                  }}
                >
                  <td className={processosComBlur[processo.id] ? 'dashboard-cell--blurred' : ''}>
                    <span className={`dashboard-badge dashboard-badge--${getCriticidadeVariant(processo.criticidade)}`}>
                      {processo.criticidade}
                    </span>
                  </td>
                  <td className={processosComBlur[processo.id] ? 'dashboard-cell--blurred' : ''}>{processo.numeroSei}</td>
                  <td className={processosComBlur[processo.id] ? 'dashboard-cell--blurred' : ''}>{processo.assunto}</td>
                  <td className={processosComBlur[processo.id] ? 'dashboard-cell--blurred' : ''}>{processo.orgao}</td>
                  <td className={processosComBlur[processo.id] ? 'dashboard-cell--blurred' : ''}>{processo.responsavel}</td>
                  <td className={processosComBlur[processo.id] ? 'dashboard-cell--blurred' : ''}>{processo.prazoFinal}</td>
                  <td className={processosComBlur[processo.id] ? 'dashboard-cell--blurred' : ''}>
                    <span className={`dashboard-table__days ${getDiasRestantesClass(processo.diasRestantes)}`}>
                      {processo.diasRestantes}
                    </span>
                  </td>
                  <td className={processosComBlur[processo.id] ? 'dashboard-cell--blurred' : ''}>
                    <span className={`dashboard-status dashboard-status--${getSituacaoVariant(processo.situacao)}`}>
                      {processo.situacao}
                    </span>
                  </td>
                  <td>
                    <div className="dashboard-actions">
                      <button
                        aria-label={`Visualizar processo ${processo.numeroSei}`}
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          alternarBlurProcesso(processo.id);
                        }}
                      >
                        {processosComBlur[processo.id] ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                      <div className="dashboard-actions__menu">
                        <button
                          aria-label={`Mais ações para o processo ${processo.numeroSei}`}
                          type="button"
                          onClick={(event) => abrirMenuAcoes(processo.id, event)}
                        >
                          <MoreVertical size={16} />
                        </button>
                        {menuAbertoId === processo.id && (
                          <div className="dashboard-actions__dropdown">
                            <button type="button" onClick={() => iniciarExclusao(processo)}>
                              <Trash2 size={14} />
                              <span>Deletar</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      </div>

      {processoParaExcluir && (
        <div className="dashboard-delete-modal__overlay" role="presentation" onClick={cancelarExclusao}>
          <div className="dashboard-delete-modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <h3>Confirmar exclusão</h3>
            <p>
              Essa ação não poderá ser desfeita. Deseja excluir permanentemente o processo{' '}
              <strong>{processoParaExcluir.numeroSei}</strong>?
            </p>
            <div className="dashboard-delete-modal__actions">
              <button type="button" className="dashboard-delete-modal__cancel" onClick={cancelarExclusao}>
                Cancelar
              </button>
              <button type="button" className="dashboard-delete-modal__confirm" onClick={confirmarExclusao}>
                Confirmar exclusão
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Dashboard;

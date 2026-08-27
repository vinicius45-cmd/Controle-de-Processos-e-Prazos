import React, { useState, useEffect } from 'react';
import {
  ClipboardList,
  Droplet,
  Eye,
  EyeOff,
  FileSignature,
  LucideIcon,
  MoreVertical,
  PackagePlus,
  Puzzle,
  TimerReset,
  Trash2
} from 'lucide-react';
import { FormCadastro } from '../types';

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

const processos: Processo[] = [
  {
    id: 1,
    criticidade: 'Atrasado',
    numeroSei: '0001234/2024-10',
    assunto: 'Solicitação de Informação',
    orgao: 'Secretaria de Saúde',
    responsavel: 'João da Silva',
    prazoFinal: '10/05/2024',
    diasRestantes: '-3 dias',
    situacao: 'Em andamento'
  },
  {
    id: 2,
    criticidade: 'Atrasado',
    numeroSei: '0000987/2024-21',
    assunto: 'Análise Técnica',
    orgao: 'Secretaria de Educação',
    responsavel: 'Maria Santos',
    prazoFinal: '12/05/2024',
    diasRestantes: '-1 dia',
    situacao: 'Em andamento'
  },
  {
    id: 3,
    criticidade: 'Vence Hoje',
    numeroSei: '0001122/2024-33',
    assunto: 'Parecer Técnico',
    orgao: 'Secretaria de Obras',
    responsavel: 'Carlos Lima',
    prazoFinal: '15/05/2024',
    diasRestantes: 'Hoje',
    situacao: 'Em andamento'
  },
  {
    id: 4,
    criticidade: 'Próximo do prazo',
    numeroSei: '0001355/2024-44',
    assunto: 'Solicitação de Documentos',
    orgao: 'Secretaria de Administração',
    responsavel: 'Juliana Alves',
    prazoFinal: '18/05/2024',
    diasRestantes: '3 dias',
    situacao: 'Em andamento'
  },
  {
    id: 5,
    criticidade: 'Para Assinatura',
    numeroSei: '0001444/2024-55',
    assunto: 'Minuta de Resposta',
    orgao: 'Secretaria de Planejamento',
    responsavel: 'João da Silva',
    prazoFinal: '20/05/2024',
    diasRestantes: '5 dias',
    situacao: 'Para assinatura'
  },
  {
    id: 6,
    criticidade: 'Especial',
    numeroSei: '0001555/2024-66',
    assunto: 'Processo Especial',
    orgao: 'Gabinete do Prefeito',
    responsavel: 'Maria Santos',
    prazoFinal: '30/05/2024',
    diasRestantes: '15 dias',
    situacao: 'Em andamento'
  },
  {
    id: 7,
    criticidade: 'OK',
    numeroSei: '0001666/2024-77',
    assunto: 'Informações Gerais',
    orgao: 'Secretaria de Finanças',
    responsavel: 'Carlos Lima',
    prazoFinal: '05/06/2024',
    diasRestantes: '21 dias',
    situacao: 'Em andamento'
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
    orgao: form.orgaoOrigem,
    responsavel: form.responsavel || 'Não atribuído',
    prazoFinal: form.prazoFinal ? formatarPrazoFinal(form.prazoFinal) : '',
    diasRestantes: diasTexto,
    situacao: (form.situacaoProcesso === 'em-andamento' ? 'Em andamento' : 'Em andamento') as SituacaoProcesso
  };
};

export const Dashboard: React.FC = () => {
  const [processosExibicao, setProcessosExibicao] = useState<Processo[]>([]);
  const [filtroAtivo, setFiltroAtivo] = useState<string | null>(null);
  const [processosComBlur, setProcessosComBlur] = useState<Record<number, boolean>>({});
  const [menuAbertoId, setMenuAbertoId] = useState<number | null>(null);
  const [processoParaExcluir, setProcessoParaExcluir] = useState<Processo | null>(null);
  const [mostrarTodosProcessos, setMostrarTodosProcessos] = useState(false);

  useEffect(() => {
    // Carrega processos do localStorage
    const processosArmazenados = localStorage.getItem('processos_cadastrados');
    if (processosArmazenados) {
      try {
        const armazenados: FormCadastro[] = JSON.parse(processosArmazenados);
        const processosConvertidos = armazenados.map((form, index) =>
          converterParaProcesso(form, index)
        );
        // Combina com os dados mockados
        setProcessosExibicao([...processos, ...processosConvertidos]);
      } catch (erro) {
        console.error('Erro ao carregar processos:', erro);
        setProcessosExibicao(processos);
      }
    } else {
      setProcessosExibicao(processos);
    }
  }, []);

  const handleSelecionarCard = (titulo: string) => {
    setFiltroAtivo((filtroAtual) => (filtroAtual === titulo ? null : titulo));
    setMostrarTodosProcessos(true);
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
      nextMidnight.setHours(0, 0, 0, 0, 0);

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
    <section className="dashboard-page" aria-label="Dashboard">
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
                <tr key={processo.id}>
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
                        onClick={() => alternarBlurProcesso(processo.id)}
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

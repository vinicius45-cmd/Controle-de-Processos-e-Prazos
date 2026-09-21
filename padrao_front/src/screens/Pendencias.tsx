import React, { useEffect, useRef, useState } from 'react';
import { MoreVertical } from 'lucide-react';
import { useApp } from '../app/AppProvider';
import { CardPendencia, FormCadastro, PendenciasKanban } from '../types';
import '../styles/Pendencias.css';

interface ColumnConfig {
  id: string;
  titulo: string;
  corHex: string;
  corClasse: string;
}

const COLUNAS: ColumnConfig[] = [
  { id: 'atrasado', titulo: 'Atrasados', corHex: '#ef5350', corClasse: 'pendencias-column--atrasado' },
  { id: 'vence_hoje', titulo: 'Vence Hoje', corHex: '#ff5c00', corClasse: 'pendencias-column--vence-hoje' },
  { id: 'proximos_5_dias', titulo: 'Próximos 5 dias', corHex: '#fbc02d', corClasse: 'pendencias-column--proximos' },
  { id: 'para_assinatura', titulo: 'Para Assinatura', corHex: '#2196f3', corClasse: 'pendencias-column--assinatura' },
  { id: 'especiais', titulo: 'Especiais', corHex: '#7F00FF', corClasse: 'pendencias-column--especiais' },
  { id: 'orgaos_controle', titulo: 'Orgãos de Controle', corHex: '#000000', corClasse: 'pendencias-column--orgaos-controle' }
];

// Dados mockados fortemente tipados
const DADOS_MOCKADOS: PendenciasKanban = {
  atrasado: [
    { id: '1', processoId: '0007834/2024-10', titulo: 'Solicitação de Informação', setor: 'Sec. de Obras', diasRestantes: -10, status: 'atrasado' },
    { id: '2', processoId: '0008983/2024-21', titulo: 'Análise Técnica', setor: 'Sec. de Educação', diasRestantes: -1, status: 'atrasado' },
    { id: '3', processoId: '0007653/2024-11', titulo: 'Parecer Técnico', setor: 'Sec. de Obras', diasRestantes: -2, status: 'atrasado' }
  ],
  vence_hoje: [
    { id: '4', processoId: '0007823/2024-33', titulo: 'Parecer Técnico', setor: 'Sec. de Obras', diasRestantes: 0, status: 'vence_hoje' },
    { id: '5', processoId: '0008986/2024-22', titulo: 'Documentos', setor: 'Sec. de Administração', diasRestantes: 0, status: 'vence_hoje' },
    { id: '6', processoId: '0008868/2024-31', titulo: 'Resposta ao Ofício', setor: 'Sec. de Financeiro', diasRestantes: 0, status: 'vence_hoje' }
  ],
  proximos_5_dias: [
    { id: '7', processoId: '0007843/2024-44', titulo: 'Solicitação de Doc.', setor: 'Sec. de Administração', diasRestantes: 3, status: 'proximos_5_dias' },
    { id: '8', processoId: '0007445/2024-45', titulo: 'Análise e Parecer', setor: 'Sec. de Saúde', diasRestantes: 4, status: 'proximos_5_dias' },
    { id: '9', processoId: '0007185/2024-48', titulo: 'Informações', setor: 'Sec. de Planejamento', diasRestantes: 5, status: 'proximos_5_dias' }
  ],
  para_assinatura: [
    { id: '10', processoId: '0008444/2024-66', titulo: 'Minuta de Resposta', setor: 'Sec. de Planejamento', diasRestantes: 27, status: 'para_assinatura' },
    { id: '11', processoId: '0008694/2024-56', titulo: 'Resposta Técnica', setor: 'Sec. de Obras', diasRestantes: 6, status: 'para_assinatura' },
    { id: '12', processoId: '0007771/2024-47', titulo: 'Parecer Jurídico', setor: 'Sec. de Jurídica', diasRestantes: 7, status: 'para_assinatura' }
  ],
  especiais: [
    { id: '13', processoId: '0008584/2024-66', titulo: 'Processo Especial', setor: 'Sec. de Protesto', diasRestantes: 15, status: 'especiais' },
    { id: '14', processoId: '0008584/2024-67', titulo: 'Processo Reservado', setor: 'Sec. de Governo', diasRestantes: 18, status: 'especiais' }
  ],
  orgaos_controle: [
    { id: '15', processoId: '0009123/2024-88', titulo: 'Fiscalização de Contrato', setor: 'Sec. de Controle', diasRestantes: 8, status: 'orgaos_controle' },
    { id: '16', processoId: '0009345/2024-90', titulo: 'Auditoria Interna', setor: 'Secretaria de Controle', diasRestantes: 12, status: 'orgaos_controle' }
  ]
};

interface MenuAberto {
  cardId: string | null;
}

type AcaoProcesso = 'editar' | 'visualizar';

const mapearDestinatario = (setor: string): string => {
  if (setor.includes('Obras')) return 'Suter';
  if (setor.includes('Educação')) return 'Suop';
  if (setor.includes('Administração')) return 'Sufisa';
  if (setor.includes('Financeiro')) return 'Suag';
  if (setor.includes('Saúde')) return 'Sutinf';
  if (setor.includes('Planejamento')) return 'Suter';
  return 'Suter';
};

const formatDateLocal = (value: Date): string => {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const criarDataInicio = (hoje: Date): Date => {
  const dataEntrada = new Date(hoje);
  dataEntrada.setDate(hoje.getDate() - 3);
  return dataEntrada;
};

const calcularPrazoFinal = (card: CardPendencia, hoje: Date): Date => {
  const prazoFinal = new Date(hoje);

  if (card.status === 'vence_hoje') {
    return prazoFinal;
  }

  if (card.status === 'atrasado') {
    prazoFinal.setDate(hoje.getDate() + card.diasRestantes);
    return prazoFinal;
  }

  if (card.status === 'proximos_5_dias' || card.status === 'para_assinatura' || card.status === 'especiais' || card.status === 'orgaos_controle') {
    prazoFinal.setDate(hoje.getDate() + card.diasRestantes);
    return prazoFinal;
  }

  // Caso futuro para um status No Prazo
  if ((card as any).status === 'no_prazo') {
    prazoFinal.setDate(hoje.getDate() + 6);
    return prazoFinal;
  }

  return prazoFinal;
};

const construirProcessoMockado = (card: CardPendencia, hoje: Date): FormCadastro => {
  const dataEntrada = criarDataInicio(hoje);
  const prazoFinal = calcularPrazoFinal(card, hoje);

  const orgaoOrigem = card.setor.includes('Saúde')
    ? 'secretaria-saude'
    : card.setor.includes('Educação')
      ? 'secretaria-educacao'
      : 'secretaria-fazenda';

  return {
    processoINCRA: card.processoId,
    requerimento: `REQ-${card.processoId.replace(/[^0-9]/g, '').slice(0, 4)}`,
    assunto: card.titulo,
    assuntoTipo: card.status === 'para_assinatura' ? 'Memorando' : 'Ofício',
    destinatario: mapearDestinatario(card.setor),
    solicitudesInformacao: ['Solicitação de documentação', 'Análise complementar'],
    orgaoOrigem,
    dataEntrada: formatDateLocal(dataEntrada),
    prazoAreaTecnica: formatDateLocal(new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + 2)),
    prazoFinal: formatDateLocal(prazoFinal),
    situacaoProcesso: card.diasRestantes < 0 ? 'parado' : 'em-andamento',
    responsavel: card.titulo.includes('Jurídico') ? 'maria-santos' : card.setor.includes('Administração') ? 'pedro-oliveira' : 'joao-silva',
    documentoSEI: 'doc-001',
    especial: card.status === 'especiais',
    filtroRespostas: card.status === 'para_assinatura',
    observacao: `Processo aberto a partir da pendência ${card.titulo} no setor ${card.setor}.`,
  };
};

const Card: React.FC<{ card: CardPendencia; onMenuClick: (cardId: string) => void; menuAberto: MenuAberto; onAction: (card: CardPendencia, modo: AcaoProcesso) => void }> = ({
  card,
  onMenuClick,
  menuAberto,
  onAction
}) => {
  const diasClass = card.diasRestantes < 0
    ? 'card-dias--atrasado'
    : card.diasRestantes === 0
      ? 'card-dias--hoje'
      : 'card-dias--ok';
  const statusClass = `card-status-${card.status}`;

  const handleMenuButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onMenuClick(card.id);
  };

  const handleActionClick = (event: React.MouseEvent<HTMLButtonElement>, modo: AcaoProcesso) => {
    event.stopPropagation();
    onAction(card, modo);
  };

  return (
    <div className={`kanban-card card--${card.status}`}>
      <div className="card-header">
        <button
          aria-label="Menu"
          className="card-menu-btn"
          onClick={handleMenuButtonClick}
          type="button"
        >
          <MoreVertical size={16} />
        </button>

        {menuAberto.cardId === card.id && (
          <div className="card-menu-dropdown" onClick={(event) => event.stopPropagation()}>
            <button type="button" onClick={(event) => handleActionClick(event, 'editar')}>Editar</button>
            <button type="button" onClick={(event) => handleActionClick(event, 'visualizar')}>Visualizar detalhes</button>
          </div>
        )}
      </div>

      <div className="card-id">{card.processoId}</div>
      <div className="card-titulo">{card.titulo}</div>
      <div className="card-setor">{card.setor}</div>

      <div className={`card-dias ${diasClass} ${statusClass}`}>
        {card.status === 'atrasado' ? '-' : ''}{Math.abs(card.diasRestantes)} {card.diasRestantes === 1 || card.diasRestantes === -1 ? 'dia' : 'dias'}
      </div>
    </div>
  );
};

const Pendencias: React.FC = () => {
  const { navegarPara, definirProcessoSelecionado } = useApp();
  const [menuAberto, setMenuAberto] = useState<MenuAberto>({ cardId: null });
  const [colunasExpandidas, setColunasExpandidas] = useState<Record<string, boolean>>({});
  const [ordemColunas, setOrdemColunas] = useState<string[]>(() => COLUNAS.map((coluna) => coluna.id));
  const [colunaArrastadaId, setColunaArrastadaId] = useState<string | null>(null);
  const [colunaDestinoId, setColunaDestinoId] = useState<string | null>(null);
  const [hoje, setHoje] = useState<Date>(() => {
    const agora = new Date();
    agora.setHours(0, 0, 0, 0);
    return agora;
  });

  const handleMenuClick = (cardId: string): void => {
    setMenuAberto((prev) => ({
      cardId: prev.cardId === cardId ? null : cardId
    }));
  };

  const abrirProcesso = (card: CardPendencia, modo: AcaoProcesso): void => {
    definirProcessoSelecionado(construirProcessoMockado(card, hoje), modo);
    navegarPara(modo === 'editar' ? 'cadastro-processo' : 'meus-processos');
    setMenuAberto({ cardId: null });
  };

  useEffect(() => {
    const proximoDia = new Date(hoje);
    proximoDia.setDate(proximoDia.getDate() + 1);
    proximoDia.setHours(0, 0, 0, 0);

    const msAteMeiaNoite = proximoDia.getTime() - Date.now();
    const timer = window.setTimeout(() => {
      const novaData = new Date();
      novaData.setHours(0, 0, 0, 0);
      setHoje(novaData);
    }, msAteMeiaNoite);

    return () => {
      window.clearTimeout(timer);
    };
  }, [hoje]);

  const handleViewAll = (colunaId: string): void => {
    setColunasExpandidas((prev) => ({
      ...prev,
      [colunaId]: true
    }));
  };

  const handleContainerClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest('.card-menu-dropdown')) {
      return;
    }
    setMenuAberto({ cardId: null });
  };

  const boardRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);

  const colunasOrdenadas = ordemColunas
    .map((colunaId) => COLUNAS.find((coluna) => coluna.id === colunaId))
    .filter((coluna): coluna is ColumnConfig => Boolean(coluna));

  const handleDragStart = (event: React.DragEvent<HTMLDivElement>, colunaId: string): void => {
    const img = new Image();
    img.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxIiBoZWlnaHQ9IjEiPjwvc3ZnPg==';
    event.dataTransfer.setDragImage(img, 0, 0);
    event.dataTransfer.effectAllowed = 'move';
    setColunaArrastadaId(colunaId);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>): void => {
    event.preventDefault();
    if (!colunaArrastadaId || !boardRef.current) return;

    const clientX = event.clientX;

    // Throttle updates to animation frames to avoid churn and make movement symmetric
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    rafRef.current = requestAnimationFrame(() => {
      if (!boardRef.current) return;
      const boardRect = boardRef.current.getBoundingClientRect();
      const dragX = clientX - boardRect.left;
      const columnsEls = Array.from(boardRef.current.querySelectorAll('.pendencias-column')) as HTMLElement[];
      const draggableId = colunaArrastadaId;
      const otherCols = columnsEls.filter((el) => el.dataset.colunaId !== draggableId);

      if (otherCols.length === 0) return;

      const insertIndex = otherCols.findIndex((el) => dragX < el.offsetLeft + el.offsetWidth / 2);
      const targetIndex = insertIndex === -1 ? otherCols.length : insertIndex;

      setOrdemColunas((prev) => {
        const current = prev.filter((id) => id !== draggableId);
        const next = [
          ...current.slice(0, targetIndex),
          draggableId,
          ...current.slice(targetIndex),
        ];

        if (next.join(',') === prev.join(',')) return prev;

        const targetId = targetIndex === current.length ? current[current.length - 1] : current[targetIndex];
        setColunaDestinoId(targetId ?? null);
        return next;
      });
      rafRef.current = null;
    });
  };

  const handleDragEnter = (_event: React.DragEvent<HTMLDivElement>, colunaId: string): void => {
    // Keep a visual target when entering a column
    setColunaDestinoId(colunaId);
  };


  const handleDrop = (event: React.DragEvent<HTMLDivElement>, _colunaId: string): void => {
    event.preventDefault();
    setColunaArrastadaId(null);
    setColunaDestinoId(null);
  };

  const handleDragEnd = (): void => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    setColunaArrastadaId(null);
    setColunaDestinoId(null);
  };

  return (
    <div className="pendencias-container" onClick={handleContainerClick}>
      <header className="pendencias-header">
        <h1>Pendências</h1>
      </header>

      <div className="kanban-board" ref={boardRef}>
        {colunasOrdenadas.map((coluna, index) => {
          const cards = DADOS_MOCKADOS[coluna.id] || [];
          const estaExpandida = colunasExpandidas[coluna.id] || false;
          const visibleCards = !estaExpandida && cards.length > 3 ? cards.slice(0, 3) : cards;
          const hasMore = cards.length > 3;
          const showViewAllButton = cards.length > 0 && !estaExpandida;

          return (
            <div
              key={coluna.id}
              draggable
              data-coluna-id={coluna.id}
              onDragStart={(event) => handleDragStart(event, coluna.id)}
              onDragOver={(event) => handleDragOver(event)}
              onDragEnter={(event) => handleDragEnter(event, coluna.id)}
              onDrop={(event) => handleDrop(event, coluna.id)}
              onDragEnd={handleDragEnd}
              className={`pendencias-column ${coluna.corClasse} ${hasMore ? 'has-more-cards' : ''} ${colunaArrastadaId === coluna.id ? 'is-dragging' : ''} ${colunaDestinoId === coluna.id ? 'is-drop-target' : ''}`}
              style={{ left: `${index * 340}px` }}
            >
              <div className="column-header">
                <h2 className="column-titulo">{coluna.titulo}</h2>
                <span className="column-contador">{cards.length}</span>
              </div>

              <div className="column-cards">
                <div className={`column-cards-list ${estaExpandida ? 'is-expanded' : ''}`}>
                  {visibleCards.map((card) => (
                    <Card
                      key={card.id}
                      card={card}
                      onMenuClick={handleMenuClick}
                      menuAberto={menuAberto}
                      onAction={abrirProcesso}
                    />
                  ))}

                  {cards.length === 0 && (
                    <div className="column-empty">Nenhuma pendência</div>
                  )}
                </div>

                {showViewAllButton && (
                  <button
                    type="button"
                    className="column-view-all-btn"
                    onClick={() => handleViewAll(coluna.id)}
                  >
                    Ver todos
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Pendencias;

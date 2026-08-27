import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, FileText, Filter, MoreVertical, PenTool, Search, XCircle } from 'lucide-react';
import { useApp } from '../app/AppProvider';
import { FormCadastro } from '../types';
import '../styles/ParaAssinatura.css';

type CriticidadeDocumento = 'Atrasado' | 'Vence Hoje' | 'No Prazo';

type FiltroRapido = 'Todos' | CriticidadeDocumento;

interface DocumentoAssinatura {
  id: string;
  criticidade: CriticidadeDocumento;
  processoSei: string;
  documento: string;
  origemSetor: string;
  dataEntrada: string;
  prazoFinal: string;
}

const documentosMock: DocumentoAssinatura[] = [
  {
    id: '1',
    criticidade: 'Atrasado',
    processoSei: '0004321/2024-01',
    documento: 'Minuta de Resposta',
    origemSetor: 'Secretaria de Planejamento',
    dataEntrada: '27/04/2024',
    prazoFinal: '03/05/2024'
  },
  {
    id: '2',
    criticidade: 'Vence Hoje',
    processoSei: '0009876/2024-09',
    documento: 'Despacho Decisório',
    origemSetor: 'Secretaria de Saúde',
    dataEntrada: '05/05/2024',
    prazoFinal: '09/05/2024'
  },
  {
    id: '3',
    criticidade: 'No Prazo',
    processoSei: '0001234/2024-10',
    documento: 'Ofício de Notificação',
    origemSetor: 'Secretaria de Educação',
    dataEntrada: '10/05/2024',
    prazoFinal: '18/05/2024'
  },
  {
    id: '4',
    criticidade: 'No Prazo',
    processoSei: '0001122/2024-12',
    documento: 'Minuta de Resposta',
    origemSetor: 'Secretaria de Obras',
    dataEntrada: '11/05/2024',
    prazoFinal: '20/05/2024'
  },
  {
    id: '5',
    criticidade: 'Vence Hoje',
    processoSei: '0002233/2024-14',
    documento: 'Despacho Decisório',
    origemSetor: 'Secretaria de Finanças',
    dataEntrada: '08/05/2024',
    prazoFinal: '12/05/2024'
  }
];

const badgeStyles: Record<CriticidadeDocumento, string> = {
  Atrasado: 'para-assinatura__badge--danger',
  'Vence Hoje': 'para-assinatura__badge--warning',
  'No Prazo': 'para-assinatura__badge--success'
};

const filtrosRapidos: FiltroRapido[] = ['Todos', 'Atrasado', 'Vence Hoje', 'No Prazo'];

const formatDatePtBR = (value: Date): string => {
  const day = String(value.getDate()).padStart(2, '0');
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const year = value.getFullYear();
  return `${day}/${month}/${year}`;
};

const criarHoje = (): Date => {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0, 0);
  return hoje;
};

const calcularDataEntrada = (hoje: Date, criticidade: CriticidadeDocumento): Date => {
  const dataEntrada = new Date(hoje);
  dataEntrada.setDate(hoje.getDate() - 3);
  return dataEntrada;
};

const calcularPrazoFinalDocumento = (hoje: Date, criticidade: CriticidadeDocumento): Date => {
  const prazoFinal = new Date(hoje);

  if (criticidade === 'Vence Hoje') {
    return prazoFinal;
  }

  if (criticidade === 'No Prazo') {
    prazoFinal.setDate(hoje.getDate() + 6);
    return prazoFinal;
  }

  prazoFinal.setDate(hoje.getDate() - 1);
  return prazoFinal;
};

const ParaAssinatura: React.FC = () => {
  const { navegarPara, definirProcessoSelecionado } = useApp();
  const [searchValue, setSearchValue] = useState<string>('');
  const [filtroSelecionado, setFiltroSelecionado] = useState<FiltroRapido>('Todos');
  const [filterListOpen, setFilterListOpen] = useState<boolean>(false);
  const [documentos, setDocumentos] = useState<DocumentoAssinatura[]>(documentosMock);
  const [documentosAssinados, setDocumentosAssinados] = useState<DocumentoAssinatura[]>([]);
  const [mostrarAssinados, setMostrarAssinados] = useState<boolean>(false);
  const [menuAbertoId, setMenuAbertoId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);
  const [documentoSelecionado, setDocumentoSelecionado] = useState<DocumentoAssinatura | null>(null);
  const [mensagemAcao, setMensagemAcao] = useState<string | null>(null);
  const [hoje, setHoje] = useState<Date>(criarHoje);

  const documentosComDatas = useMemo(() => documentos.map((documento) => ({
    ...documento,
    dataEntrada: formatDatePtBR(calcularDataEntrada(hoje, documento.criticidade)),
    prazoFinal: formatDatePtBR(calcularPrazoFinalDocumento(hoje, documento.criticidade))
  })), [documentos, hoje]);

  const documentosAssinadosComDatas = useMemo(() => documentosAssinados.map((documento) => ({
    ...documento,
    dataEntrada: formatDatePtBR(calcularDataEntrada(hoje, documento.criticidade)),
    prazoFinal: formatDatePtBR(calcularPrazoFinalDocumento(hoje, documento.criticidade))
  })), [documentosAssinados, hoje]);

  const documentosFiltrados = useMemo(() => {
    const documentosVisiveis = mostrarAssinados ? [...documentosComDatas, ...documentosAssinadosComDatas] : documentosComDatas;
    const query = searchValue.trim().toLowerCase();

    return documentosVisiveis.filter((doc) => {
      const atendeFiltro = filtroSelecionado === 'Todos' || doc.criticidade === filtroSelecionado;
      if (!query) {
        return atendeFiltro;
      }

      const atendeBusca = [doc.processoSei, doc.documento, doc.origemSetor, doc.dataEntrada, doc.prazoFinal]
        .some((campo) => campo.toLowerCase().includes(query));

      return atendeFiltro && atendeBusca;
    });
  }, [documentosAssinadosComDatas, documentosComDatas, filtroSelecionado, mostrarAssinados, searchValue]);

  useEffect(() => {
    const fecharMenuAoClicarFora = (event: MouseEvent) => {
      const alvo = event.target as HTMLElement;
      const clicouDentroDoMenuDeAcoes = alvo.closest('.para-assinatura__action-menu');
      const clicouDentroDoFiltro = alvo.closest('.para-assinatura__filter-dropdown');

      if (!clicouDentroDoMenuDeAcoes) {
        setMenuAbertoId(null);
        setMenuPosition(null);
      }

      if (!clicouDentroDoFiltro) {
        setFilterListOpen(false);
      }
    };

    document.addEventListener('click', fecharMenuAoClicarFora);

    return () => {
      document.removeEventListener('click', fecharMenuAoClicarFora);
    };
  }, []);

  const handleAssinarDocumento = (documento: DocumentoAssinatura): void => {
    setDocumentos((current) => current.filter((item) => item.id !== documento.id));
    setDocumentosAssinados((current) => [...current, documento]);
    setMenuAbertoId(null);
    setMenuPosition(null);
    setDocumentoSelecionado(null);
    setMensagemAcao(`Documento "${documento.documento}" foi assinado com sucesso.`);
  };

  useEffect(() => {
    const proximoDia = new Date(hoje);
    proximoDia.setDate(proximoDia.getDate() + 1);
    proximoDia.setHours(0, 0, 0, 0, 0);

    const msAteMeiaNoite = proximoDia.getTime() - Date.now();
    const timer = window.setTimeout(() => {
      setHoje(criarHoje());
    }, msAteMeiaNoite);

    return () => {
      window.clearTimeout(timer);
    };
  }, [hoje]);

  const handleAbrirMenuAcoes = (documentoId: string, event: React.MouseEvent<HTMLButtonElement>): void => {
    event.stopPropagation();
    const rect = event.currentTarget.getBoundingClientRect();
    const dropdownWidth = 160;

    setMenuAbertoId((current) => (current === documentoId ? null : documentoId));
    setMenuPosition({
      top: rect.bottom + 6,
      left: Math.max(12, Math.min(rect.right - dropdownWidth, window.innerWidth - dropdownWidth - 12))
    });
    setMensagemAcao(null);
  };

  const construirProcessoDetalhe = (documento: DocumentoAssinatura): FormCadastro => {
    const orgaoOrigem = documento.origemSetor.includes('Saúde')
      ? 'secretaria-saude'
      : documento.origemSetor.includes('Educação')
        ? 'secretaria-educacao'
        : 'secretaria-fazenda';

    return {
      processoINCRA: documento.processoSei,
      requerimento: `REQ-${documento.processoSei.replace(/[^0-9]/g, '').slice(0, 4)}`,
      assunto: documento.documento,
      assuntoTipo: 'Memorando',
      destinatario: 'Suter',
      solicitudesInformacao: ['Solicitação de documentação', 'Análise complementar'],
      orgaoOrigem,
      dataEntrada: documento.dataEntrada || '2024-05-10',
      prazoAreaTecnica: documento.dataEntrada || '2024-05-10',
      prazoFinal: documento.prazoFinal || '2024-05-10',
      situacaoProcesso: 'em-andamento',
      responsavel: 'joao-silva',
      documentoSEI: documento.documento,
      especial: false,
      filtroRespostas: false,
      observacao: `Documento para assinatura ${documento.documento} do processo ${documento.processoSei}.`
    };
  };

  const handleVisualizarDetalhes = (documento: DocumentoAssinatura): void => {
    definirProcessoSelecionado(construirProcessoDetalhe(documento), 'visualizar');
    navegarPara('meus-processos');
    setMenuAbertoId(null);
    setMenuPosition(null);
    setDocumentoSelecionado(null);
    setMensagemAcao(null);
  };

  const handleRejeitarDocumento = (documento: DocumentoAssinatura): void => {
    setDocumentos((current) => current.filter((item) => item.id !== documento.id));
    setDocumentosAssinados((current) => current.filter((item) => item.id !== documento.id));
    setMenuAbertoId(null);
    setMenuPosition(null);
    setDocumentoSelecionado(null);
    setMensagemAcao(`Documento "${documento.documento}" foi recusado e removido da fila.`);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchValue(event.currentTarget.value);
  };

  const handleFiltroClick = (filtro: FiltroRapido): void => {
    setFiltroSelecionado(filtro);
    setFilterListOpen(false);
  };

  return (
    <section className="para-assinatura-page" aria-label="Para Assinatura">
      <div className="para-assinatura__header-row">
        <div>
          <h1>Para Assinatura</h1>
        </div>

        <div className="para-assinatura__actions">
          <label className="para-assinatura__search-field">
            <Search size={16} />
            <input
              type="search"
              placeholder="Buscar documento"
              value={searchValue}
              onChange={handleSearchChange}
            />
          </label>

          <div className="para-assinatura__filter-dropdown">
            <button
              type="button"
              className="para-assinatura__filter-button"
              onClick={() => setFilterListOpen((current) => !current)}
            >
              <Filter size={16} />
              {filtroSelecionado === 'Todos' ? 'Tipo de Documento' : filtroSelecionado}
              <MoreVertical size={16} />
            </button>
            {filterListOpen && (
              <div className="para-assinatura__filter-list">
                {filtrosRapidos.map((filtro) => (
                  <button
                    key={filtro}
                    type="button"
                    className={filtro === filtroSelecionado ? 'active' : ''}
                    onClick={() => handleFiltroClick(filtro)}
                  >
                    {filtro === 'Todos' ? 'Todos os documentos' : filtro}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            className={`para-assinatura__toggle-button ${mostrarAssinados ? 'active' : ''}`}
            onClick={() => setMostrarAssinados((current) => !current)}
          >
            {mostrarAssinados ? 'Ocultar assinados' : 'Mostrar assinados'}
          </button>
        </div>
      </div>

      {mensagemAcao && (
        <div className="para-assinatura__status-banner" role="status">
          <CheckCircle2 size={16} />
          <span>{mensagemAcao}</span>
        </div>
      )}

      {documentoSelecionado && (
        <div className="para-assinatura__detail-card">
          <div>
            <p className="para-assinatura__detail-title">Detalhes do documento</p>
            <h3>{documentoSelecionado.documento}</h3>
            <p>
              <strong>Processo SEI:</strong> {documentoSelecionado.processoSei}
            </p>
            <p>
              <strong>Origem/Setor:</strong> {documentoSelecionado.origemSetor}
            </p>
            <p>
              <strong>Data de envio:</strong> {documentoSelecionado.dataEnvio}
            </p>
          </div>
          <button type="button" className="para-assinatura__detail-close" onClick={() => setDocumentoSelecionado(null)}>
            Fechar
          </button>
        </div>
      )}

      <div className="para-assinatura__table-card">
        <div className="para-assinatura__table-header">
          <span>Documentos pendentes de assinatura</span>
          <span>{documentosFiltrados.length} registros</span>
        </div>

        <div className="para-assinatura__table-wrapper">
          <table className="para-assinatura__table">
            <thead>
              <tr>
                <th>Criticidade</th>
                <th>Processo SEI Nº</th>
                <th>Documento</th>
                <th>Origem/Setor</th>
                <th>Data de Entrada</th>
                <th>Prazo Final</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {documentosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={6} className="para-assinatura__empty-state">
                    Nenhum documento encontrado para o filtro atual.
                  </td>
                </tr>
              ) : (
                documentosFiltrados.map((documento) => {
                  const documentoJaAssinado = documentosAssinados.some((item) => item.id === documento.id);

                  return (
                    <tr key={documento.id} className={documentoJaAssinado ? 'para-assinatura__signed-row' : ''}>
                      <td>
                        <span className={`para-assinatura__badge ${badgeStyles[documento.criticidade]}`}>
                          {documento.criticidade}
                        </span>
                      </td>
                      <td>
                        <strong>{documento.processoSei}</strong>
                      </td>
                      <td>{documento.documento}</td>
                      <td>{documento.origemSetor}</td>
                      <td>{documento.dataEntrada}</td>
                      <td>{documento.prazoFinal}</td>
                      <td className="para-assinatura__actions-cell">
                        {documentoJaAssinado ? (
                          <button type="button" className="para-assinatura__primary-action para-assinatura__primary-action--signed" disabled>
                            <CheckCircle2 size={14} />
                            Assinado
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="para-assinatura__primary-action"
                            onClick={() => handleAssinarDocumento(documento)}
                          >
                            <PenTool size={14} />
                            Assinar Documento
                          </button>
                        )}
                        <div className="para-assinatura__action-menu">
                          <button
                            type="button"
                            className="para-assinatura__more-button"
                            aria-label="Mais opções"
                            aria-expanded={menuAbertoId === documento.id}
                            onClick={(event) => handleAbrirMenuAcoes(documento.id, event)}
                          >
                            <MoreVertical size={16} />
                          </button>
                          {menuAbertoId === documento.id && menuPosition && createPortal(
                            <div
                              className="para-assinatura__action-dropdown"
                              role="menu"
                              style={{ top: `${menuPosition.top}px`, left: `${menuPosition.left}px` }}
                              onClick={(event) => event.stopPropagation()}
                            >
                              <button type="button" role="menuitem" onClick={() => handleVisualizarDetalhes(documento)}>
                                <FileText size={14} />
                                Detalhes
                              </button>
                              {!documentoJaAssinado && (
                                <button type="button" role="menuitem" onClick={() => handleRejeitarDocumento(documento)}>
                                  <XCircle size={14} />
                                  Rejeitar
                                </button>
                              )}
                            </div>,
                            document.body
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default ParaAssinatura;

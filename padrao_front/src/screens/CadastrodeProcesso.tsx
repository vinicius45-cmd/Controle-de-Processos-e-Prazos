import React, { ChangeEvent, FormEvent, useState, useEffect } from 'react';
import { CalendarDays, ChevronDown, ChevronRight, Filter, Info, Plus, Save, Search } from 'lucide-react';
import { useApp } from '../app/AppProvider';
import { useEntes } from '../hooks/useEntes';
import { useUnidades } from '../hooks/useUnidades';
import { useTiposProcesso } from '../hooks/useTiposProcesso';
import { useTiposSituacaoProcesso } from '../hooks/useTiposSituacaoProcesso';
import ProcessoService from '../services/ProcessoService';
import { FormCadastro, ResumoProcesso } from '../types';
import '../styles/CadastrodeProcesso.css';

const CadastrodeProcesso: React.FC = () => {
  const { processoSelecionado, modoVisualizacaoProcesso, definirProcessoSelecionado, navegarPara } = useApp();
  const { dados: entes, loading: carregandoEntes } = useEntes();
  const { dados: unidades, loading: carregandoUnidades } = useUnidades();
  const modoEdicao = Boolean(processoSelecionado && modoVisualizacaoProcesso === 'editar');

  // Estados do formulário
  const [form, setForm] = useState<FormCadastro>({
    processoINCRA: '',
    requerimento: '',
    assunto: '',
    assuntoTipo: '',
    idTipoAssunto: null,
    destinatario: '',
    idUnidade: null,
    solicitudesInformacao: [],
    idEnte: null,
    orgaoOrigem: '',
    dataEntrada: '',
    prazoAreaTecnica: '',
    prazoFinal: '',
    situacaoProcesso: '',
    idTipoSituacaoProcesso: null,
    responsavel: '',
    documentoSEI: '',
    idTipoDocumento: null,
    especial: null,
    filtroRespostas: false,
    observacao: '',
  });
  const { tiposAssunto, tiposDocumento } = useTiposProcesso(form.idUnidade);
  const { tiposSituacaoProcesso } = useTiposSituacaoProcesso();

  const [resumo, setResumo] = useState<ResumoProcesso>({
    status: 'OK',
    diasRestantes: 0,
    textoDias: 0,
    corDias: '#1c79d4',
    prazoFinal: '',
    situacao: '',
    responsavel: '',
  });

  const [solicitudePendente, setSolicitudePendente] = useState<string>('');
  const [processosSalvos, setProcessosSalvos] = useState<FormCadastro[]>([]);
  const [mostrarListaProcessos, setMostrarListaProcessos] = useState(false);
  const [busca, setBusca] = useState<string>('');
  const [processosFiltrados, setProcessosFiltrados] = useState<FormCadastro[]>([]);
  const [mostrarResumo, setMostrarResumo] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(modoEdicao);

  // Calcula dias restantes baseado nas datas
  const parseDateLocal = (dateStr: string): Date => {
    // `input[type=date]` fornece strings no formato YYYY-MM-DD.
    // `new Date('YYYY-MM-DD')` é tratado como UTC e causa off-by-one
    // em fusos horários negativos. Aqui criamos uma Date local.
    const parts = dateStr.split('-');
    const year = Number(parts[0]);
    const month = Number(parts[1]) - 1;
    const day = Number(parts[2]);
    return new Date(year, month, day);
  };

  const calcularDiasRestantes = (dataEntrada: string, prazoFinal: string): number => {
    if (!dataEntrada || !prazoFinal) return 0;

    const prazo = parseDateLocal(prazoFinal);
    const hoje = new Date();

    // Zera horas para comparar apenas a parte da data (local)
    prazo.setHours(0, 0, 0, 0);
    hoje.setHours(0, 0, 0, 0);

    const diferenca = prazo.getTime() - hoje.getTime();
    const dias = Math.floor(diferenca / (1000 * 60 * 60 * 24));

    return dias;
  };

  // Obtém a cor baseada na quantidade de dias
  const obterCorDias = (dias: number): string => {
    if (dias === 0) return '#ff5c00'; // Laranja para hoje
    if (dias < 0) return '#ff0000'; // Vermelho para vencido
    if (dias <= 5) return '#fcbc24'; // Amarelo para até 5 dias
    return '#169770'; // Verde para mais de 5 dias
  };

  // Obtém o texto de exibição dos dias
  const obterTextoDias = (dias: number): string | number => {
    if (dias === 0) return 'Hoje';
    return dias;
  };

  // Mapeia o valor da situação para exibição
  const mapearSituacao = (situacao: string): string => {
    const mapa: Record<string, string> = {
      'em-andamento': 'Em andamento',
      'concluido': 'Concluído',
      'parado': 'Parado',
    };
    return mapa[situacao] || situacao;
  };

  // Mapeia o valor do responsável para exibição
  const mapearResponsavel = (responsavel: string): string => {
    const mapa: Record<string, string> = {
      'joao-silva': 'João da Silva',
      'maria-santos': 'Maria dos Santos',
      'pedro-oliveira': 'Pedro Oliveira',
    };
    return mapa[responsavel] || responsavel;
  };

  // Atualiza o resumo quando os campos relevantes mudam
  useEffect(() => {
    const hasDates = Boolean(form.dataEntrada && form.prazoFinal);
    const situacaoExibicao = mapearSituacao(form.situacaoProcesso);
    const responsavelExibicao = mapearResponsavel(form.responsavel);

    let diasRestantes = 0;
    let corDias = '#1c79d4';
    let textoDias: string | number = 0;

    if (hasDates) {
      diasRestantes = calcularDiasRestantes(form.dataEntrada, form.prazoFinal);
      corDias = obterCorDias(diasRestantes);
      textoDias = obterTextoDias(diasRestantes);
    }

    // Só atualiza se houver alteração significativa
    if (
      form.dataEntrada ||
      form.prazoFinal ||
      form.situacaoProcesso ||
      form.responsavel
    ) {
      setResumo((prev) => ({
        ...prev,
        diasRestantes,
        textoDias,
        corDias,
        prazoFinal: form.prazoFinal ? parseDateLocal(form.prazoFinal).toLocaleDateString('pt-BR') : '',
        situacao: situacaoExibicao,
        responsavel: responsavelExibicao,
      }));
    }

    // Mostra o resumo novamente se os dados foram modificados
    setMostrarResumo(true);
  }, [form.dataEntrada, form.prazoFinal, form.situacaoProcesso, form.responsavel]);
  useEffect(() => {
    void carregarProcessosSalvos();
  }, []);

  useEffect(() => {
    if (processoSelecionado) {
      setForm({
        ...processoSelecionado,
        solicitudesInformacao: processoSelecionado.solicitudesInformacao ?? [],
      });
      setMostrarListaProcessos(false);
      setMostrarResumo(true);
      setMostrarFormulario(true);
    }
  }, [processoSelecionado]);

  useEffect(() => {
    const voltarParaLista = () => {
      setMostrarFormulario(false);
      definirProcessoSelecionado(null, null);
    };

    window.addEventListener('processo:voltar-lista', voltarParaLista);
    return () => window.removeEventListener('processo:voltar-lista', voltarParaLista);
  }, [definirProcessoSelecionado]);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('cadastro:formulario-estado', {
      detail: { aberto: mostrarFormulario },
    }));
  }, [mostrarFormulario]);

  // Filtra processos quando há alteração na busca ou no filtro de respostas
  useEffect(() => {
    const filtrados = processosSalvos.filter((processo) => {
      const correspondeBusca =
        !busca ||
        processo.processoINCRA.toLowerCase().includes(busca.toLowerCase()) ||
        processo.requerimento.toLowerCase().includes(busca.toLowerCase()) ||
        processo.assunto.toLowerCase().includes(busca.toLowerCase());

      const correspondeFiltroBusca = !form.filtroRespostas || processo.filtroRespostas;

      return correspondeBusca && correspondeFiltroBusca;
    });

    setProcessosFiltrados(filtrados);
  }, [busca, processosSalvos, form.filtroRespostas]);

  const carregarProcessosSalvos = async (): Promise<void> => {
    try {
      setProcessosSalvos(await ProcessoService.listar());
    } catch (erro) {
      console.error('Erro ao carregar processos:', erro);
    }
  };

  // Manipuladores de evento estritamente tipados
  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ): void => {
    const target = e.currentTarget;
    const { name, value, type } = target;

    if (type === 'checkbox' && target instanceof HTMLInputElement) {
      setForm((prev) => ({
        ...prev,
        [name]: target.checked,
      }));
    } else if (name === 'idEnte' || name === 'idUnidade' || name === 'idTipoSituacaoProcesso' || name === 'idTipoDocumento' || name === 'idTipoAssunto') {
      setForm((prev) => ({
        ...prev,
        [name]: value ? Number(value) : null,
        ...(name === 'idTipoSituacaoProcesso' ? { situacaoProcesso: tiposSituacaoProcesso.find((item) => String(item.idTipoSituacaoProcesso) === value)?.nmTipoSituacaoProcesso ?? '' } : {})
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleAddSolicitude = (): void => {
    if (solicitudePendente.trim()) {
      setForm((prev) => ({
        ...prev,
        solicitudesInformacao: [
          ...prev.solicitudesInformacao,
          solicitudePendente,
        ],
      }));
      setSolicitudePendente('');
    }
  };

  const handleRemoveSolicitude = (index: number): void => {
    setForm((prev) => ({
      ...prev,
      solicitudesInformacao: prev.solicitudesInformacao.filter(
        (_, i) => i !== index
      ),
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    // Valida os campos obrigatórios
    if (
      !form.assuntoTipo ||
      !form.idEnte ||
      !form.idUnidade ||
      !form.idTipoAssunto ||
      !form.destinatario ||
      !form.dataEntrada ||
      !form.prazoFinal
      || !form.idTipoSituacaoProcesso
    ) {
      alert('Por favor, preencha todos os campos obrigatórios!');
      return;
    }

    const processoParaSalvar = {
      ...form,
      id: form.id || processoSelecionado?.id || Date.now().toString(),
    };

    await ProcessoService.salvar(processoParaSalvar);
    alert(modoEdicao ? 'Processo atualizado com sucesso!' : 'Processo cadastrado com sucesso!');

    definirProcessoSelecionado(null, null);
    navegarPara('pendencias');
  };

  const handleCancel = (): void => {
    setForm({
      processoINCRA: '',
      requerimento: '',
      assunto: '',
      assuntoTipo: '',
      idTipoAssunto: null,
      destinatario: '',
      idUnidade: null,
      solicitudesInformacao: [],
      idEnte: null,
      orgaoOrigem: '',
      dataEntrada: '',
      prazoAreaTecnica: '',
      prazoFinal: '',
      situacaoProcesso: '',
      idTipoSituacaoProcesso: null,
      responsavel: '',
      documentoSEI: '',
      idTipoDocumento: null,
      especial: null,
      filtroRespostas: false,
      observacao: '',
    });
    setBusca('');
    setMostrarFormulario(false);

    if (processoSelecionado) {
      definirProcessoSelecionado(null, null);
      navegarPara('pendencias');
    }
  };

  const carregarProcesso = (processo: FormCadastro): void => {
    setForm(processo);
    setMostrarListaProcessos(false);
  };

  const deletarProcesso = async (id: string | undefined): Promise<void> => {
    if (!id) return;
    const processos = processosSalvos.filter((p) => p.id !== id);
    await ProcessoService.excluir(id);
    setProcessosSalvos(processos);
    alert('Processo deletado com sucesso!');
  };

  const processosTabela: FormCadastro[] = processosSalvos.length > 0 ? processosSalvos : [
    { processoINCRA: '00090-00012345/2026-11', requerimento: '', assunto: 'Informações STPC', assuntoTipo: 'Ofício', destinatario: 'Suop', solicitudesInformacao: [], orgaoOrigem: 'TCDF', dataEntrada: '2026-05-28', prazoAreaTecnica: '', prazoFinal: '2026-08-30', situacaoProcesso: 'parado', responsavel: '', documentoSEI: '', especial: false, filtroRespostas: false, observacao: '', id: '1' },
    { processoINCRA: '00090-00054321/2026-17', requerimento: '', assunto: 'Indicação nº 123', assuntoTipo: 'Indicação', destinatario: 'Sufisa', solicitudesInformacao: [], orgaoOrigem: 'CLDF', dataEntrada: '2026-06-01', prazoAreaTecnica: '', prazoFinal: '2026-09-05', situacaoProcesso: 'em-andamento', responsavel: '', documentoSEI: '', especial: false, filtroRespostas: false, observacao: '', id: '2' },
    { processoINCRA: '00090-00067890/2026-22', requerimento: '', assunto: 'Fiscalização', assuntoTipo: 'Despacho', destinatario: 'Suop', solicitudesInformacao: [], orgaoOrigem: 'MPDFT', dataEntrada: '2026-06-04', prazoAreaTecnica: '', prazoFinal: '2026-09-12', situacaoProcesso: 'em-andamento', responsavel: '', documentoSEI: '', especial: false, filtroRespostas: false, observacao: '', id: '3' },
    { processoINCRA: '00090-00011111/2026-33', requerimento: '', assunto: 'Solicitação de informações', assuntoTipo: 'Requerimento', destinatario: 'Suop', solicitudesInformacao: [], orgaoOrigem: 'TCDF', dataEntrada: '2026-06-02', prazoAreaTecnica: '', prazoFinal: '2026-09-02', situacaoProcesso: 'parado', responsavel: '', documentoSEI: '', especial: false, filtroRespostas: false, observacao: '', id: '4' },
    { processoINCRA: '00090-00022222/2026-44', requerimento: '', assunto: 'Informação técnica', assuntoTipo: 'Memorando', destinatario: 'Sufisa', solicitudesInformacao: [], orgaoOrigem: 'CLDF', dataEntrada: '2026-06-08', prazoAreaTecnica: '', prazoFinal: '2026-09-08', situacaoProcesso: 'em-andamento', responsavel: '', documentoSEI: '', especial: false, filtroRespostas: false, observacao: '', id: '5' },
    { processoINCRA: '00090-00033333/2026-55', requerimento: '', assunto: 'Relatório mensal', assuntoTipo: 'Ofício', destinatario: 'Suag', solicitudesInformacao: [], orgaoOrigem: 'SEMOB', dataEntrada: '2026-06-10', prazoAreaTecnica: '', prazoFinal: '2026-08-20', situacaoProcesso: 'concluido', responsavel: '', documentoSEI: '', especial: false, filtroRespostas: false, observacao: '', id: '6' },
    { processoINCRA: '00090-00044444/2026-66', requerimento: '', assunto: 'Auditoria', assuntoTipo: 'Despacho', destinatario: 'Suop', solicitudesInformacao: [], orgaoOrigem: 'TCDF', dataEntrada: '2026-06-12', prazoAreaTecnica: '', prazoFinal: '2026-09-15', situacaoProcesso: 'em-andamento', responsavel: '', documentoSEI: '', especial: false, filtroRespostas: false, observacao: '', id: '7' },
    { processoINCRA: '00090-00055555/2026-77', requerimento: '', assunto: 'Resposta a ofício', assuntoTipo: 'Ofício', destinatario: 'Sufisa', solicitudesInformacao: [], orgaoOrigem: 'CLDF', dataEntrada: '2026-06-14', prazoAreaTecnica: '', prazoFinal: '2026-09-01', situacaoProcesso: 'parado', responsavel: '', documentoSEI: '', especial: false, filtroRespostas: false, observacao: '', id: '8' },
    { processoINCRA: '00090-00066666/2026-88', requerimento: '', assunto: 'Plano de ação', assuntoTipo: 'Memorando', destinatario: 'Sufisa', solicitudesInformacao: [], orgaoOrigem: 'TCDF', dataEntrada: '2026-06-15', prazoAreaTecnica: '', prazoFinal: '2026-09-10', situacaoProcesso: 'em-andamento', responsavel: '', documentoSEI: '', especial: false, filtroRespostas: false, observacao: '', id: '9' },
    { processoINCRA: '00090-00077777/2026-99', requerimento: '', assunto: 'Denúncia', assuntoTipo: 'Requerimento', destinatario: 'Suop', solicitudesInformacao: [], orgaoOrigem: 'MPDFT', dataEntrada: '2026-06-17', prazoAreaTecnica: '', prazoFinal: '2026-08-31', situacaoProcesso: 'parado', responsavel: '', documentoSEI: '', especial: false, filtroRespostas: false, observacao: '', id: '10' }
  ];

  const getStatusLabel = (processo: FormCadastro): string => {
    if (processo.situacaoProcesso === 'concluido') return 'Concluído';
    if (['3', '7'].includes(processo.id || '')) return 'Para assinatura';
    if (processo.situacaoProcesso === 'parado') return 'Aguardando retorno';
    return 'Em acompanhamento';
  };

  const getStatusClass = (processo: FormCadastro): string => {
    if (processo.situacaoProcesso === 'concluido') return 'is-complete';
    if (['3', '7'].includes(processo.id || '')) return 'is-signature';
    if (processo.situacaoProcesso === 'parado') return 'is-return';
    return 'is-progress';
  };

  const getDays = (processo: FormCadastro): number | string => {
    if (!processo.dataEntrada || !processo.prazoFinal) return '—';
    const daysByReferenceRow: Record<string, number> = { '1': -3, '2': 3, '3': 10, '4': 0, '5': 6, '7': 13, '8': -1, '9': 5, '10': -2 };
    if (processo.id && processo.id in daysByReferenceRow) return daysByReferenceRow[processo.id];
    return calcularDiasRestantes(processo.dataEntrada, processo.prazoFinal);
  };

  const getPending = (processo: FormCadastro): string => {
    const pendingByReferenceRow: Record<string, string> = { '1': 'SUOP', '2': 'AJL, SUFISA', '4': 'SUOP', '5': 'AJL', '7': 'SUOP', '8': 'AJL, SUFISA', '9': 'SUFISA', '10': 'SUOP' };
    return processo.id && processo.id in pendingByReferenceRow ? pendingByReferenceRow[processo.id] : processo.destinatario || 'SUOP';
  };

  const getDaysClass = (processo: FormCadastro): string => {
    return `process-list-page__days ${getStatusClass(processo)}`;
  };

  if (!mostrarFormulario) {
    const lista = processosTabela.filter((processo) => {
      const termo = busca.toLowerCase();
      const combinaBusca = !termo || `${processo.processoINCRA} ${processo.assunto} ${processo.orgaoOrigem}`.toLowerCase().includes(termo);
      const combinaFiltro = !form.filtroRespostas || processo.filtroRespostas;
      return combinaBusca && combinaFiltro;
    });

    return (
      <section className="process-list-page" aria-label="Processos">
        <div className="process-list-page__toolbar"><label><Search size={17} /><input value={busca} onChange={(event) => setBusca(event.target.value)} placeholder="Processo SEI ou assunto..." /></label><button className="process-list-page__new" type="button" onClick={() => setMostrarFormulario(true)}><Plus size={17} /> Novo processo</button><button className="process-list-page__filter" type="button"><Filter size={16} /> Filtros avançados</button></div>
        <nav className="process-list-page__tabs"><button className="is-active" type="button" onClick={() => setBusca('')}>Todos</button><button type="button"><i className="process-list-page__tab-dot process-list-page__tab-dot--late" />Atrasados</button><button type="button"><i className="process-list-page__tab-dot process-list-page__tab-dot--today" />Vence hoje</button><button type="button"><i className="process-list-page__tab-dot process-list-page__tab-dot--soon" />Próx. 5 dias</button><button type="button"><i className="process-list-page__tab-dot process-list-page__tab-dot--return" />Aguardando retorno</button><button type="button"><i className="process-list-page__tab-dot process-list-page__tab-dot--signature" />Para assinatura</button><button type="button"><i className="process-list-page__tab-dot process-list-page__tab-dot--complete">✓</i>Concluídos</button></nav>
        <section className="process-list-page__table-card"><div className="process-list-page__table-wrap"><table><colgroup><col className="process-list-page__col-chevron" /><col className="process-list-page__col-sei" /><col className="process-list-page__col-subject" /><col className="process-list-page__col-entity" /><col className="process-list-page__col-status" /><col className="process-list-page__col-deadline" /><col className="process-list-page__col-days" /><col className="process-list-page__col-pending" /><col className="process-list-page__col-action" /></colgroup><thead><tr><th></th><th>Processo SEI <span>⌃</span></th><th>Assunto</th><th>Ente</th><th>Situação</th><th>Prazo <CalendarDays size={13} /></th><th>Dias <span>ⓘ</span></th><th>Pendências</th><th></th></tr></thead><tbody>{lista.map((processo, index) => {
          const dias = getDays(processo);
          const concluido = processo.situacaoProcesso === 'concluido';
          const statusClass = getStatusClass(processo);
          return <tr key={processo.id || index}><td className="process-list-page__chevron"><ChevronRight size={16} /></td><td className="process-list-page__sei">{processo.processoINCRA || processo.requerimento || 'N/A'}</td><td>{processo.assunto || 'Sem assunto'}</td><td>{processo.orgaoOrigem || '—'}</td><td><span className={`process-list-page__status ${statusClass}`}>{getStatusLabel(processo)}</span></td><td>{processo.prazoFinal ? parseDateLocal(processo.prazoFinal).toLocaleDateString('pt-BR') : '—'}</td><td className={getDaysClass(processo)}>{dias} {typeof dias === 'number' && <i />}</td><td className={`process-list-page__pending ${statusClass}`}>{concluido ? '—' : getPending(processo)}</td><td><button type="button" aria-label="Editar processo" onClick={() => { setForm(processo); definirProcessoSelecionado(processo, 'editar'); setMostrarFormulario(true); }}>›</button></td></tr>;
        })}</tbody></table></div><footer><span className="process-list-page__count">Mostrando 1 a {lista.length} de 127 processos</span><span className="process-list-page__page-size-label">Itens por página:</span><button className="process-list-page__page-size" type="button">10 <ChevronDown size={13} /></button><span className="process-list-page__pagination-divider" /><nav className="process-list-page__pagination" aria-label="Paginação"><button type="button" aria-label="Primeira página">Ⅰ‹</button><button type="button" aria-label="Página anterior">‹</button><b>1</b><button type="button">2</button><button type="button">3</button><span>...</span><button type="button">13</button><button type="button" aria-label="Próxima página">›</button><button type="button" aria-label="Última página">›Ⅰ</button></nav></footer></section>
      </section>
    );
  }

  const resumoVisual = [
    ['Número do processo SEI', form.processoINCRA],
    ['Unidade responsável', unidades.find((unidade) => unidade.idUnidade === form.idUnidade)?.sgUnidade],
    ['Ente', entes.find((ente) => ente.idEnte === form.idEnte)?.sgEnte],
    ['Tipo de documento', tiposDocumento.find((tipo) => tipo.idTipoDocumento === form.idTipoDocumento)?.nmTipoDocumento],
    ['Nº do documento', form.requerimento],
    ['Tipo de assunto', tiposAssunto.find((tipo) => tipo.idTipoAssunto === form.idTipoAssunto)?.nmTipoAssunto],
    ['Assunto', form.assunto],
    ['Processo especial', form.especial === null ? undefined : form.especial ? 'Sim' : 'Não'],
    ['Data de entrada', form.dataEntrada],
    ['Prazo final', form.prazoFinal],
    ['Observações', form.observacao],
  ];

  return (
    <section className="dashboard-page--process-form process-form-screen" aria-label="Novo processo">
      <header className="process-form__heading">
        <div>
          <h1>{modoEdicao ? 'Editar processo' : 'Novo processo'}</h1>
          <p>Preencha as informações para cadastrar um novo processo.</p>
        </div>
        <div className="process-form__heading-actions">
          <button type="button" className="process-form__cancel" onClick={handleCancel}>Cancelar</button>
          <button type="submit" form="novo-processo-form" className="process-form__save"><Save size={16} /> <span>Salvar processo</span></button>
        </div>
      </header>

      <form id="novo-processo-form" onSubmit={handleSubmit} className="process-form__layout">
        <div className="process-form__sections">
          <section className="process-form__section">
            <h2>Processo</h2>
            <div className="process-form__grid process-form__grid--two">
              <label className="process-form__field"><span>Número do processo SEI <b>*</b></span><input name="processoINCRA" value={form.processoINCRA} onChange={handleInputChange} placeholder="Ex.: 00090-00012345/2026-11" required /></label>
              <label className="process-form__field"><span>Unidade responsável <b>*</b></span><select name="idUnidade" value={form.idUnidade ?? ''} onChange={handleInputChange} disabled={carregandoUnidades} required><option value="">{carregandoUnidades ? 'Carregando unidades...' : 'Selecione a unidade'}</option>{unidades.map((unidade) => <option key={unidade.idUnidade} value={unidade.idUnidade}>{unidade.sgUnidade} - {unidade.nmUnidade}</option>)}</select></label>
            </div>
          </section>

          <section className="process-form__section">
            <h2>Origem</h2>
            <div className="process-form__grid process-form__grid--three">
              <label className="process-form__field"><span>Ente <b>*</b></span><select name="idEnte" value={form.idEnte ?? ''} onChange={handleInputChange} disabled={carregandoEntes} required><option value="">{carregandoEntes ? 'Carregando entes...' : 'Selecione o ente'}</option>{entes.map((ente) => <option key={ente.idEnte} value={ente.idEnte}>{ente.sgEnte} - {ente.nmEnte}</option>)}</select></label>
              <label className="process-form__field"><span>Tipo de documento <b>*</b></span><select name="idTipoDocumento" value={form.idTipoDocumento ?? ''} onChange={handleInputChange} required><option value="">Selecione o tipo de documento</option>{tiposDocumento.map((tipo) => <option key={tipo.idTipoDocumento} value={tipo.idTipoDocumento}>{tipo.nmTipoDocumento}</option>)}</select></label>
              <label className="process-form__field"><span>Número do documento de entrada <b>*</b></span><input name="requerimento" value={form.requerimento} onChange={handleInputChange} placeholder="Informe o número do documento" required /></label>
            </div>
          </section>

          <section className="process-form__section">
            <h2>Assunto</h2>
            <div className="process-form__grid process-form__grid--subject">
              <label className="process-form__field"><span>Tipo de assunto <b>*</b></span><select name="idTipoAssunto" value={form.idTipoAssunto ?? ''} onChange={handleInputChange} required><option value="">Selecione o tipo de assunto</option>{tiposAssunto.map((tipo) => <option key={tipo.idTipoAssunto} value={tipo.idTipoAssunto}>{tipo.nmTipoAssunto}</option>)}</select></label>
              <label className="process-form__field"><span>Assunto <b>*</b></span><div className="process-form__textarea-wrap"><textarea name="assunto" value={form.assunto} onChange={handleInputChange} placeholder="Descreva o assunto do processo" maxLength={60} required /><small>{form.assunto.length}/60</small></div></label>
              <label className="process-form__field"><span>Processo especial <Info size={13} /></span><select name="especial" value={form.especial === null ? '' : form.especial ? 'sim' : 'nao'} onChange={(event) => setForm((prev) => ({ ...prev, especial: event.target.value === '' ? null : event.target.value === 'sim' }))}><option value="">Selecione uma opção</option><option value="nao">Não</option><option value="sim">Sim</option></select></label>
            </div>
          </section>

          <section className="process-form__section">
            <h2>Controle de prazo</h2>
            <div className="process-form__grid process-form__grid--two">
              <label className="process-form__field"><span>Data de entrada <b>*</b></span><div className="process-form__input-icon"><input type="date" name="dataEntrada" value={form.dataEntrada} onChange={handleInputChange} required /><CalendarDays size={16} /></div></label>
              <label className="process-form__field"><span>Prazo final <b>*</b></span><div className="process-form__input-icon"><input type="date" name="prazoFinal" value={form.prazoFinal} onChange={handleInputChange} required /><CalendarDays size={16} /></div></label>
            </div>
            <label className="process-form__field process-form__field--notes"><span>Observações</span><div className="process-form__textarea-wrap"><textarea name="observacao" value={form.observacao} onChange={handleInputChange} placeholder="Informações complementares sobre o processo (opcional)" maxLength={1000} /><small>{form.observacao.length}/1000</small></div></label>
          </section>
        </div>

        <aside className="process-form__summary">
          <h2>Resumo do processo</h2>
          {resumoVisual.map(([label, value]) => <div className="process-form__summary-row" key={label}><span>{label}</span><strong>{value || '—'}</strong></div>)}
          <div className="process-form__notice"><Info size={16} /><span>Após salvar, o processo será criado com a situação <b>RECEBIDO</b>. Você poderá ajustar os dados e fazer distribuições.</span></div>
        </aside>
      </form>
    </section>
  );

  return (
    <div className="cadastro-container">
      <div className="cadastro-header">
        <nav className="breadcrumb">
          <span className="breadcrumb-item">Cadastro de Processo</span>
          <span className="breadcrumb-separator">›</span>
          <span className="breadcrumb-item active">{modoEdicao ? 'Editar Processo' : 'Novo Processo'}</span>
        </nav>
      </div>

      <div className="cadastro-content">
        {/* Coluna Esquerda - Formulário */}
        <div className="formulario-column">
          {/* Seção de Pesquisa e Lista de Processos */}
          <div className="processos-salvos-section">
            <button
              type="button"
              onClick={() => setMostrarListaProcessos(!mostrarListaProcessos)}
              className="btn btn-secondary"
            >
              {mostrarListaProcessos
                ? 'Fechar Lista de Processos'
                : 'Ver Processos Salvos'}
            </button>

            {mostrarListaProcessos && (
              <div className="processos-lista-container">
                <div className="processos-pesquisa">
                  <input
                    type="text"
                    placeholder="Pesquisar por Processo, Requerimento ou Assunto..."
                    value={busca}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setBusca(e.target.value)
                    }
                    className="input-pesquisa"
                  />
                </div>

                <div className="processos-lista">
                  {processosFiltrados.length > 0 ? (
                    processosFiltrados.map((processo) => (
                      <div key={processo.id} className="processo-item">
                        <div className="processo-info">
                          <p className="processo-numero">
                            <strong>Processo:</strong> {processo.processoINCRA || 'N/A'}
                          </p>
                          <p className="processo-assunto">
                            <strong>Assunto:</strong> {processo.assunto}
                          </p>
                          <p className="processo-tipo">
                            <strong>Tipo:</strong> {processo.assuntoTipo}
                          </p>
                          <p className="processo-destinatario">
                            <strong>Destinatário:</strong> {processo.destinatario}
                          </p>
                        </div>
                        <div className="processo-acoes">
                          <button
                            type="button"
                            onClick={() => carregarProcesso(processo)}
                            className="btn btn-primary btn-small"
                          >
                            Carregar
                          </button>
                          <button
                            type="button"
                            onClick={() => deletarProcesso(processo.id)}
                            className="btn btn-danger btn-small"
                          >
                            Deletar
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="no-results">
                      {busca
                        ? 'Nenhum processo encontrado'
                        : 'Nenhum processo cadastrado'}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="formulario">
            {/* Seção: Dados do Processo */}
            <section className="form-section">
              <h3 className="section-title">Dados do Processo</h3>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="processoINCRA">Processo SEI N°</label>
                  <input
                    type="text"
                    id="processoINCRA"
                    name="processoINCRA"
                    value={form.processoINCRA}
                    onChange={handleInputChange}
                    placeholder="0001/7/2024-88"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="requerimento">Requerimento</label>
                  <input
                    type="text"
                    id="requerimento"
                    name="requerimento"
                    value={form.requerimento}
                    onChange={handleInputChange}
                    placeholder="REQ-2024/????"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="assunto">
                  Assunto <span className="required-asterisk">*</span>
                </label>
                <input
                  type="text"
                  id="assunto"
                  name="assunto"
                  value={form.assunto}
                  onChange={handleInputChange}
                  placeholder="Descrição do assunto"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="assuntoTipo">
                  Tipo de Documento (Assunto){' '}
                  <span className="required-asterisk">*</span>
                </label>
                <select
                  id="assuntoTipo"
                  name="idTipoAssunto"
                  value={form.idTipoAssunto ?? ''}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Selecione um tipo de documento</option>
                  {tiposAssunto.map((tipo) => (
                    <option key={tipo.idTipoAssunto} value={tipo.idTipoAssunto}>
                      {tipo.nmTipoAssunto}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="idUnidade">
                  Unidade responsável{' '}
                  <span className="required-asterisk">*</span>
                </label>
                <select
                  id="idUnidade"
                  name="idUnidade"
                  value={form.idUnidade ?? ''}
                  onChange={handleInputChange}
                  disabled={carregandoUnidades}
                  required
                >
                  <option value="">{carregandoUnidades ? 'Carregando unidades...' : 'Selecione uma unidade'}</option>
                  {unidades.map((unidade) => (
                    <option key={unidade.idUnidade} value={unidade.idUnidade}>
                      {unidade.sgUnidade} - {unidade.nmUnidade}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="solicitudesInfo">
                  Solicitudes de Informação
                </label>
                <div className="solicitudes-input-group">
                  <input
                    type="text"
                    id="solicitudesInfo"
                    value={solicitudePendente}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setSolicitudePendente(e.target.value)
                    }
                    onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSolicitude();
                      }
                    }}
                    placeholder="Adicione uma solicitação"
                  />
                  <button
                    type="button"
                    onClick={handleAddSolicitude}
                    className="btn-add"
                  >
                    +
                  </button>
                </div>
                <div className="solicitudes-tags">
                  {form.solicitudesInformacao.map((solicitude, index) => (
                    <div key={index} className="tag">
                      <span>{solicitude}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSolicitude(index)}
                        className="tag-remove"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="idEnte">
                  Ente de Origem <span className="required-asterisk">*</span>
                </label>
                <select
                  id="idEnte"
                  name="idEnte"
                  value={form.idEnte ?? ''}
                  onChange={handleInputChange}
                  disabled={carregandoEntes}
                  required
                >
                  <option value="">
                    {carregandoEntes ? 'Carregando entes...' : 'Selecione um ente'}
                  </option>
                  {entes.map((ente) => (
                    <option key={ente.idEnte} value={ente.idEnte}>
                      {ente.sgEnte} - {ente.nmEnte}
                    </option>
                  ))}
                </select>
              </div>
            </section>

            {/* Seção: Datas */}
            <section className="form-section">
              <h3 className="section-title">Datas</h3>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="dataEntrada">
                    Data de Entrada <span className="required-asterisk">*</span>
                  </label>
                  <input
                    type="date"
                    id="dataEntrada"
                    name="dataEntrada"
                    value={form.dataEntrada}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="prazoAreaTecnica">Prazo Área Técnica</label>
                  <input
                    type="date"
                    id="prazoAreaTecnica"
                    name="prazoAreaTecnica"
                    value={form.prazoAreaTecnica}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="prazoFinal">
                    Prazo Final <span className="required-asterisk">*</span>
                  </label>
                  <input
                    type="date"
                    id="prazoFinal"
                    name="prazoFinal"
                    value={form.prazoFinal}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            </section>

            {/* Seção: Controle */}
            <section className="form-section">
              <h3 className="section-title">Controle</h3>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="situacaoProcesso">
                    Situação do Processo{' '}
                    <span className="required-asterisk">*</span>
                  </label>
                  <select
                    id="situacaoProcesso"
                    name="idTipoSituacaoProcesso"
                    value={form.idTipoSituacaoProcesso ?? ''}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Selecione uma situação</option>
                    {tiposSituacaoProcesso.map((tipo) => (
                      <option key={tipo.idTipoSituacaoProcesso} value={tipo.idTipoSituacaoProcesso}>
                        {tipo.nmTipoSituacaoProcesso}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="responsavel">
                    Responsável <span className="required-asterisk">*</span>
                  </label>
                  <select
                    id="responsavel"
                    name="responsavel"
                    value={form.responsavel}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Selecione um responsável</option>
                    <option value="joao-silva">João da Silva</option>
                    <option value="maria-santos">Maria dos Santos</option>
                    <option value="pedro-oliveira">Pedro Oliveira</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="documentoSEI">
                  Documento SEI - Resposta
                </label>
                <select
                  id="documentoSEI"
                  name="idTipoDocumento"
                  value={form.idTipoDocumento ?? ''}
                  onChange={handleInputChange}
                >
                  <option value="">Selecione o documento</option>
                  {tiposDocumento.map((tipo) => (
                    <option key={tipo.idTipoDocumento} value={tipo.idTipoDocumento}>
                      {tipo.nmTipoDocumento}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group checkbox-group">
                <input
                  type="checkbox"
                  id="especial"
                  name="especial"
                  checked={form.especial}
                  onChange={handleInputChange}
                />
                <label htmlFor="especial" className="checkbox-label">
                  Especial
                </label>
              </div>

              <div className="form-group checkbox-group">
                <input
                  type="checkbox"
                  id="filtroRespostas"
                  name="filtroRespostas"
                  checked={form.filtroRespostas}
                  onChange={handleInputChange}
                />
                <label htmlFor="filtroRespostas" className="checkbox-label">
                  Somente unidades que responderam
                </label>
              </div>
            </section>

            {/* Seção: Observação */}
            <section className="form-section">
              <h3 className="section-title">Observação</h3>

              <div className="form-group">
                <textarea
                  name="observacao"
                  value={form.observacao}
                  onChange={handleInputChange}
                  placeholder="Informações complementares sobre o processo..."
                  rows={4}
                />
              </div>
            </section>

            {/* Botões de Ação */}
            <div className="form-actions">
              <button
                type="button"
                onClick={handleCancel}
                className="btn btn-secondary"
              >
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary">
                Salvar
              </button>
            </div>
          </form>
        </div>

        {/* Coluna Direita - Resumo */}
        {mostrarResumo && (
        <div className="resumo-column">
          <div className="resumo-card">
            <div className="resumo-header">
              <button 
                className="btn-status" 
                onClick={() => setMostrarResumo(false)}
                title="Clique para esconder o resumo"
              >
                {resumo.status}
              </button>
            </div>

            <div className="resumo-dias">
              <span className="dias-number" style={{ color: resumo.corDias }}>
                {resumo.textoDias}
              </span>
              <span className="dias-text">dias restantes</span>
            </div>

            <div className="resumo-section">
              <label className="resumo-label">Prazo Final</label>
              <p className="resumo-value">{resumo.prazoFinal}</p>
            </div>

            <div className="resumo-divider"></div>

            <div className="resumo-section">
              <label className="resumo-label">Situação:</label>
              <button className="btn-situacao">{resumo.situacao}</button>
            </div>

            <div className="resumo-section">
              <label className="resumo-label">Responsável</label>
              <button className="btn-responsavel">{resumo.responsavel}</button>
            </div>

            <div className="resumo-info">
              <div className="info-icon">ⓘ</div>
              <div className="info-content">
                <h4>Como é calculado?</h4>
                <p>
                  O prazo é calculado com base na Data de Entrada e no Prazo
                  Final.
                </p>
              </div>
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  );
};

export default CadastrodeProcesso;

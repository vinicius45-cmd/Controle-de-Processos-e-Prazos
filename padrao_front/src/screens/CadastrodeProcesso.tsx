import React, { ChangeEvent, FormEvent, useState, useEffect } from 'react';
import { useApp } from '../app/AppProvider';
import { FormCadastro, ResumoProcesso } from '../types';
import '../styles/CadastrodeProcesso.css';

const CadastrodeProcesso: React.FC = () => {
  const { processoSelecionado, modoVisualizacaoProcesso, definirProcessoSelecionado, navegarPara } = useApp();
  const modoEdicao = Boolean(processoSelecionado && modoVisualizacaoProcesso === 'editar');

  // Constantes para opções dos SELECTs
  const TIPOS_ASSUNTO = [
    'Ofício',
    'Requerimento',
    'Carta',
    'Indicação',
    'Despacho',
    'Memorando',
  ];

  const SETORES_UNIDADES = [
    'Suop',
    'Suter',
    'Sufisa',
    'Suag',
    'Sutinf',
  ];

  // Estados do formulário
  const [form, setForm] = useState<FormCadastro>({
    processoINCRA: '',
    requerimento: '',
    assunto: '',
    assuntoTipo: '',
    destinatario: '',
    solicitudesInformacao: [],
    orgaoOrigem: '',
    dataEntrada: '',
    prazoAreaTecnica: '',
    prazoFinal: '',
    situacaoProcesso: '',
    responsavel: '',
    documentoSEI: '',
    especial: false,
    filtroRespostas: false,
    observacao: '',
  });

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
    carregarProcessosSalvos();
  }, []);

  useEffect(() => {
    if (processoSelecionado) {
      setForm({
        ...processoSelecionado,
        solicitudesInformacao: processoSelecionado.solicitudesInformacao ?? [],
      });
      setMostrarListaProcessos(false);
      setMostrarResumo(true);
    }
  }, [processoSelecionado]);

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

  // Salva processos no localStorage (simula arquivo .txt)
  const salvarProcessoNoStorage = (processo: FormCadastro): void => {
    const id = processo.id || Date.now().toString();
    const processoComId = { ...processo, id };

    const processos = processosSalvos.filter((p) => p.id !== id);
    processos.push(processoComId);

    localStorage.setItem('processos_cadastrados', JSON.stringify(processos));
    setProcessosSalvos(processos);
  };

  // Carrega processos do localStorage
  const carregarProcessosSalvos = (): void => {
    const procesosArmazenados = localStorage.getItem('processos_cadastrados');
    if (procesosArmazenados) {
      try {
        const procesos = JSON.parse(procesosArmazenados);
        setProcessosSalvos(procesos);
      } catch (erro) {
        console.error('Erro ao carregar processos:', erro);
      }
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

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();

    // Valida os campos obrigatórios
    if (
      !form.assuntoTipo ||
      !form.destinatario ||
      !form.dataEntrada ||
      !form.prazoFinal
    ) {
      alert('Por favor, preencha todos os campos obrigatórios!');
      return;
    }

    const processoParaSalvar = {
      ...form,
      id: form.id || processoSelecionado?.id || Date.now().toString(),
    };

    // Salva o processo
    salvarProcessoNoStorage(processoParaSalvar);
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
      destinatario: '',
      solicitudesInformacao: [],
      orgaoOrigem: '',
      dataEntrada: '',
      prazoAreaTecnica: '',
      prazoFinal: '',
      situacaoProcesso: '',
      responsavel: '',
      documentoSEI: '',
      especial: false,
      filtroRespostas: false,
      observacao: '',
    });
    setBusca('');

    if (processoSelecionado) {
      definirProcessoSelecionado(null, null);
      navegarPara('pendencias');
    }
  };

  const carregarProcesso = (processo: FormCadastro): void => {
    setForm(processo);
    setMostrarListaProcessos(false);
  };

  const deletarProcesso = (id: string | undefined): void => {
    if (!id) return;
    const processos = processosSalvos.filter((p) => p.id !== id);
    localStorage.setItem('processos_cadastrados', JSON.stringify(processos));
    setProcessosSalvos(processos);
    alert('Processo deletado com sucesso!');
  };

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
                  <label htmlFor="processoINCRA">Processo INCRA</label>
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
                  name="assuntoTipo"
                  value={form.assuntoTipo}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Selecione um tipo de documento</option>
                  {TIPOS_ASSUNTO.map((tipo) => (
                    <option key={tipo} value={tipo}>
                      {tipo}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="destinatario">
                  Destinatário (Setor/Unidade){' '}
                  <span className="required-asterisk">*</span>
                </label>
                <select
                  id="destinatario"
                  name="destinatario"
                  value={form.destinatario}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Selecione um setor/unidade</option>
                  {SETORES_UNIDADES.map((setor) => (
                    <option key={setor} value={setor}>
                      {setor}
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
                <label htmlFor="orgaoOrigem">
                  Órgão de Origem <span className="required-asterisk">*</span>
                </label>
                <select
                  id="orgaoOrigem"
                  name="orgaoOrigem"
                  value={form.orgaoOrigem}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Selecione um órgão</option>
                  <option value="secretaria-saude">Secretária de Saúde</option>
                  <option value="secretaria-educacao">
                    Secretária de Educação
                  </option>
                  <option value="secretaria-fazenda">
                    Secretária da Fazenda
                  </option>
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
                    name="situacaoProcesso"
                    value={form.situacaoProcesso}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Selecione uma situação</option>
                    <option value="em-andamento">Em andamento</option>
                    <option value="concluido">Concluído</option>
                    <option value="parado">Parado</option>
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
                  name="documentoSEI"
                  value={form.documentoSEI}
                  onChange={handleInputChange}
                >
                  <option value="">Selecione o documento</option>
                  <option value="doc-001">Documento 001</option>
                  <option value="doc-002">Documento 002</option>
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

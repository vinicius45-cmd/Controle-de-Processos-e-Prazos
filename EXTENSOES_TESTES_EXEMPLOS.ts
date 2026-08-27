/**
 * EXEMPLOS DE TESTES E EXTENSÕES
 * 
 * Este arquivo mostra como testar e estender o componente CadastrodeProcesso
 * com exemplos práticos de validação, testes unitários e integração.
 */

// ============================================
// 1. VALIDAÇÃO DE FORMULÁRIO
// ============================================

import { FormCadastro, ResumoProcesso } from './src/types';

/**
 * Valida se todos os campos obrigatórios estão preenchidos
 */
function validateFormCadastro(form: FormCadastro): {
  isValid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};

  // Validações
  if (!form.assunto.trim()) {
    errors.assunto = 'Assunto é obrigatório';
  }

  if (!form.orgaoOrigem) {
    errors.orgaoOrigem = 'Órgão de Origem é obrigatório';
  }

  if (!form.dataEntrada) {
    errors.dataEntrada = 'Data de Entrada é obrigatória';
  }

  if (!form.prazoFinal) {
    errors.prazoFinal = 'Prazo Final é obrigatório';
  }

  if (!form.situacaoProcesso) {
    errors.situacaoProcesso = 'Situação do Processo é obrigatória';
  }

  if (!form.responsavel) {
    errors.responsavel = 'Responsável é obrigatório';
  }

  // Validações adicionais
  if (form.dataEntrada && form.prazoFinal) {
    const entrada = new Date(form.dataEntrada);
    const prazo = new Date(form.prazoFinal);

    if (entrada > prazo) {
      errors.prazoFinal =
        'Prazo Final deve ser posterior à Data de Entrada';
    }
  }

  if (
    form.prazoAreaTecnica &&
    form.dataEntrada &&
    new Date(form.prazoAreaTecnica) < new Date(form.dataEntrada)
  ) {
    errors.prazoAreaTecnica =
      'Prazo Área Técnica deve ser posterior à Data de Entrada';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

// ============================================
// 2. CÁLCULO DO RESUMO
// ============================================

/**
 * Calcula os dias restantes até o prazo final
 */
function calcularDiasRestantes(prazoFinal: string): number {
  if (!prazoFinal) return 0;

  const hoje = new Date();
  const prazo = new Date(prazoFinal);

  // Zera as horas para comparação correta de dias
  hoje.setHours(0, 0, 0, 0);
  prazo.setHours(0, 0, 0, 0);

  const diferenca = prazo.getTime() - hoje.getTime();
  const dias = Math.ceil(diferenca / (1000 * 60 * 60 * 24));

  return dias;
}

/**
 * Calcula o status baseado nos dias restantes
 */
function calcularStatus(diasRestantes: number): string {
  if (diasRestantes < 0) return 'VENCIDO';
  if (diasRestantes === 0) return 'VENCIMENTO_HOJE';
  if (diasRestantes <= 3) return 'CRÍTICO';
  if (diasRestantes <= 7) return 'ATENÇÃO';
  return 'OK';
}

/**
 * Atualiza o resumo baseado no formulário
 */
function atualizarResumo(
  form: FormCadastro,
  situacoes: Record<string, string>,
  responsaveis: Record<string, string>
): ResumoProcesso {
  const diasRestantes = calcularDiasRestantes(form.prazoFinal);
  const status = calcularStatus(diasRestantes);

  return {
    status,
    diasRestantes,
    prazoFinal: form.prazoFinal
      ? new Date(form.prazoFinal).toLocaleDateString('pt-BR')
      : '',
    situacao: situacoes[form.situacaoProcesso] || form.situacaoProcesso,
    responsavel: responsaveis[form.responsavel] || form.responsavel,
  };
}

// ============================================
// 3. FORMATAÇÃO DE DADOS
// ============================================

/**
 * Formata data de YYYY-MM-DD para DD/MM/YYYY
 */
function formatarData(data: string): string {
  if (!data) return '';
  const [ano, mes, dia] = data.split('-');
  return `${dia}/${mes}/${ano}`;
}

/**
 * Converte data de DD/MM/YYYY para YYYY-MM-DD
 */
function converterData(data: string): string {
  if (!data) return '';
  const [dia, mes, ano] = data.split('/');
  return `${ano}-${mes}-${dia}`;
}

/**
 * Formata processo INCRA (máscara)
 */
function formatarProcessoINCRA(valor: string): string {
  // Remove caracteres não numéricos
  const limpo = valor.replace(/\D/g, '');

  // Aplica máscara: 0000/0/0000-00
  if (limpo.length <= 4) return limpo;
  if (limpo.length <= 5) return `${limpo.slice(0, 4)}/${limpo.slice(4)}`;
  if (limpo.length <= 9)
    return `${limpo.slice(0, 4)}/${limpo.slice(4, 5)}/${limpo.slice(5)}`;
  return `${limpo.slice(0, 4)}/${limpo.slice(4, 5)}/${limpo.slice(5, 9)}-${limpo.slice(9, 11)}`;
}

/**
 * Formata requerimento (máscara)
 */
function formatarRequerimento(valor: string): string {
  // Remove caracteres e converte em maiúscula
  const limpo = valor.toUpperCase().replace(/[^0-9A-Z/\-]/g, '');

  // Aplica máscara: REQ-YYYY/XXXX
  const match = limpo.match(/^REQ?(\d{4})?(\d{0,4})?/);
  if (!match) return '';

  let resultado = 'REQ';
  if (match[1]) resultado += `-${match[1]}`;
  if (match[2]) resultado += `/${match[2]}`;

  return resultado;
}

// ============================================
// 4. EXEMPLOS DE TESTES UNITÁRIOS (Jest)
// ============================================

/**
 * Exemplos de testes que podem ser implementados
 */

/*
describe('CadastrodeProcesso - Validação', () => {
  test('deve validar campos obrigatórios', () => {
    const form: FormCadastro = {
      processoINCRA: '',
      requerimento: '',
      assunto: '', // vazio - erro esperado
      solicitudesInformacao: [],
      orgaoOrigem: '', // vazio - erro esperado
      dataEntrada: '',
      prazoAreaTecnica: '',
      prazoFinal: '',
      situacaoProcesso: '',
      responsavel: '',
      documentoSEI: '',
      especial: false,
      observacao: '',
    };

    const resultado = validateFormCadastro(form);
    
    expect(resultado.isValid).toBe(false);
    expect(resultado.errors.assunto).toBeDefined();
    expect(resultado.errors.orgaoOrigem).toBeDefined();
  });

  test('deve aceitar formulário completo válido', () => {
    const form: FormCadastro = {
      processoINCRA: '0001/7/2024-88',
      requerimento: 'REQ-2024/1234',
      assunto: 'Solicitação de informação',
      solicitudesInformacao: ['Doc 1', 'Doc 2'],
      orgaoOrigem: 'secretaria-saude',
      dataEntrada: '2024-05-18',
      prazoAreaTecnica: '2024-05-28',
      prazoFinal: '2024-06-05',
      situacaoProcesso: 'em-andamento',
      responsavel: 'joao-silva',
      documentoSEI: 'doc-001',
      especial: false,
      observacao: 'Observações importantes',
    };

    const resultado = validateFormCadastro(form);
    expect(resultado.isValid).toBe(true);
    expect(Object.keys(resultado.errors)).toHaveLength(0);
  });
});

describe('CadastrodeProcesso - Cálculos', () => {
  test('deve calcular dias restantes corretamente', () => {
    const hoje = new Date();
    const daqui7Dias = new Date(hoje);
    daqui7Dias.setDate(daqui7Dias.getDate() + 7);

    const dataStr = daqui7Dias.toISOString().split('T')[0];
    const dias = calcularDiasRestantes(dataStr);

    expect(dias).toBe(7);
  });

  test('deve retornar status VENCIDO para datas passadas', () => {
    const status = calcularStatus(-1);
    expect(status).toBe('VENCIDO');
  });

  test('deve retornar status CRÍTICO para dias restantes <= 3', () => {
    expect(calcularStatus(3)).toBe('CRÍTICO');
    expect(calcularStatus(2)).toBe('CRÍTICO');
    expect(calcularStatus(1)).toBe('CRÍTICO');
  });
});

describe('CadastrodeProcesso - Formatação', () => {
  test('deve formatar data corretamente', () => {
    expect(formatarData('2024-05-18')).toBe('18/05/2024');
    expect(formatarData('2024-12-31')).toBe('31/12/2024');
  });

  test('deve converter data DD/MM/YYYY para YYYY-MM-DD', () => {
    expect(converterData('18/05/2024')).toBe('2024-05-18');
    expect(converterData('31/12/2024')).toBe('2024-12-31');
  });

  test('deve formatar processo INCRA com máscara', () => {
    expect(formatarProcessoINCRA('000174202488')).toBe('0001/7/2024-88');
    expect(formatarProcessoINCRA('123456789012')).toBe('1234/5/6789-01');
  });

  test('deve formatar requerimento com máscara', () => {
    expect(formatarRequerimento('req20241234')).toBe('REQ-2024/1234');
    expect(formatarRequerimento('REQ-2024/5678')).toBe('REQ-2024/5678');
  });
});
*/

// ============================================
// 5. INTEGRAÇÃO COM API
// ============================================

/**
 * Exemplo de função para enviar dados ao servidor
 */
async function salvarCadastrodeProcesso(
  form: FormCadastro
): Promise<{ sucesso: boolean; mensagem: string; id?: string }> {
  try {
    // Validar antes de enviar
    const validacao = validateFormCadastro(form);
    if (!validacao.isValid) {
      return {
        sucesso: false,
        mensagem: `Erro na validação: ${Object.values(validacao.errors).join(', ')}`,
      };
    }

    // Preparar dados para envio
    const payload = {
      ...form,
      dataEntrada: form.dataEntrada || null,
      prazoAreaTecnica: form.prazoAreaTecnica || null,
      prazoFinal: form.prazoFinal || null,
      timestamp: new Date().toISOString(),
    };

    // Enviar para API
    const response = await fetch('/api/processos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const resultado = await response.json();

    return {
      sucesso: true,
      mensagem: 'Processo cadastrado com sucesso',
      id: resultado.id,
    };
  } catch (erro) {
    const mensagem =
      erro instanceof Error ? erro.message : 'Erro desconhecido';
    return {
      sucesso: false,
      mensagem: `Erro ao salvar: ${mensagem}`,
    };
  }
}

/**
 * Exemplo de função para carregar dados do servidor
 */
async function carregarProcesso(
  id: string
): Promise<{ sucesso: boolean; dados?: FormCadastro; mensagem: string }> {
  try {
    const response = await fetch(`/api/processos/${id}`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const dados = await response.json();

    // Validar estrutura dos dados
    const formCadastro: FormCadastro = {
      processoINCRA: dados.processoINCRA || '',
      requerimento: dados.requerimento || '',
      assunto: dados.assunto || '',
      solicitudesInformacao: dados.solicitudesInformacao || [],
      orgaoOrigem: dados.orgaoOrigem || '',
      dataEntrada: dados.dataEntrada || '',
      prazoAreaTecnica: dados.prazoAreaTecnica || '',
      prazoFinal: dados.prazoFinal || '',
      situacaoProcesso: dados.situacaoProcesso || '',
      responsavel: dados.responsavel || '',
      documentoSEI: dados.documentoSEI || '',
      especial: dados.especial || false,
      observacao: dados.observacao || '',
    };

    return {
      sucesso: true,
      dados: formCadastro,
      mensagem: 'Processo carregado com sucesso',
    };
  } catch (erro) {
    const mensagem =
      erro instanceof Error ? erro.message : 'Erro desconhecido';
    return {
      sucesso: false,
      mensagem: `Erro ao carregar: ${mensagem}`,
    };
  }
}

// ============================================
// 6. HOOKS CUSTOMIZADOS
// ============================================

/**
 * Hook para gerenciar o estado do formulário com validação
 * 
 * Uso:
 * const { form, erros, setForm, validar, resetar } = useFormCadastro();
 */
/*
import { useState } from 'react';

function useFormCadastro() {
  const [form, setForm] = useState<FormCadastro>({...});
  const [erros, setErros] = useState<Record<string, string>>({});

  const validar = (): boolean => {
    const validacao = validateFormCadastro(form);
    setErros(validacao.errors);
    return validacao.isValid;
  };

  const resetar = (): void => {
    setForm({...});
    setErros({});
  };

  return {
    form,
    setForm,
    erros,
    validar,
    resetar,
  };
}
*/

// ============================================
// 7. CONSTANTES E ENUMS
// ============================================

export const ORGAOS_ORIGEM = {
  'secretaria-saude': 'Secretária de Saúde',
  'secretaria-educacao': 'Secretária de Educação',
  'secretaria-fazenda': 'Secretária da Fazenda',
} as const;

export const SITUACOES_PROCESSO = {
  'em-andamento': 'Em andamento',
  concluido: 'Concluído',
  parado: 'Parado',
} as const;

export const RESPONSAVEIS = {
  'joao-silva': 'João da Silva',
  'maria-santos': 'Maria dos Santos',
  'pedro-oliveira': 'Pedro Oliveira',
} as const;

export const STATUS_CORES = {
  OK: '#4caf50',
  ATENÇÃO: '#ff9800',
  CRÍTICO: '#f44336',
  VENCIDO: '#9c27b0',
  VENCIMENTO_HOJE: '#ff5722',
} as const;

// ============================================
// EXPORTAR FUNÇÕES
// ============================================

export {
  validateFormCadastro,
  calcularDiasRestantes,
  calcularStatus,
  atualizarResumo,
  formatarData,
  converterData,
  formatarProcessoINCRA,
  formatarRequerimento,
  salvarCadastrodeProcesso,
  carregarProcesso,
};

/**
 * Utilitários de formatação para os dados da SEMOB.
 */

/**
 * Formata um CPF no padrão: 000.000.000-00
 */
export const formatarCPF = (cpf: string): string => {
  if (!cpf) return '';
  const limpo = cpf.replace(/\D/g, '');
  if (limpo.length !== 11) return cpf;
  return limpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

/**
 * Formata um CNPJ no padrão: 00.000.000/0000-00
 */
export const formatarCNPJ = (cnpj: string): string => {
  if (!cnpj) return '';
  const limpo = cnpj.replace(/\D/g, '');
  if (limpo.length !== 14) return cnpj;
  return limpo.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
};

/**
 * Formata CPF ou CNPJ dependendo do tamanho
 */
export const formatarCpfCnpj = (documento: string): string => {
  if (!documento) return '';
  const limpo = documento.replace(/\D/g, '');
  if (limpo.length === 11) return formatarCPF(limpo);
  if (limpo.length === 14) return formatarCNPJ(limpo);
  return documento;
};

/**
 * Formata uma data para o padrão brasileiro: DD/MM/AAAA
 */
export const formatarData = (dataStr: string | Date): string => {
  if (!dataStr) return '';
  const data = typeof dataStr === 'string' ? new Date(dataStr) : dataStr;
  if (isNaN(data.getTime())) return String(dataStr);
  return data.toLocaleDateString('pt-BR');
};

/**
 * Formata um telefone no padrão: (00) 0000-0000 ou (00) 00000-0000
 */
export const formatarTelefone = (telefone: string): string => {
  if (!telefone) return '';
  const limpo = telefone.replace(/\D/g, '');
  if (limpo.length === 10) {
    return limpo.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  if (limpo.length === 11) {
    return limpo.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
  return telefone;
};

/**
 * Formata um Processo SEI.
 * Suporta o padrão Federal (17 dígitos): 00000.000000/0000-00
 * e o padrão GDF (19 dígitos): 00000-00000000/0000-00
 */
export const formatarProcessoSEI = (processo: string): string => {
  if (!processo) return '';
  const limpo = processo.replace(/\D/g, '');
  if (limpo.length === 17) {
    return limpo.replace(/(\d{5})(\d{6})(\d{4})(\d{2})/, '$1.$2/$3-$4');
  }
  if (limpo.length === 19) {
    return limpo.replace(/(\d{5})(\d{8})(\d{4})(\d{2})/, '$1-$2/$3-$4');
  }
  return processo;
};

/**
 * Formata um CEP no padrão: 00000-000
 */
export const formatarCEP = (cep: string): string => {
  if (!cep) return '';
  const limpo = cep.replace(/\D/g, '');
  if (limpo.length !== 8) return cep;
  return limpo.replace(/(\d{5})(\d{3})/, '$1-$2');
};

/**
 * Formata um valor numérico para Moeda (Real - BRL)
 */
export const formatarMoeda = (valor: number | string): string => {
  if (valor === null || valor === undefined) return '';
  const num = typeof valor === 'string' ? parseFloat(valor) : valor;
  if (isNaN(num)) return String(valor);
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(num);
};

/**
 * Formata Placa de Veículo (Brasil ou Mercosul)
 * Ex: ABC-1234 ou ABC1D23
 */
export const formatarPlaca = (placa: string): string => {
  if (!placa) return '';
  const limpa = placa.replace(/[^A-Z0-9]/gi, '').toUpperCase();
  if (limpa.length !== 7) return placa.toUpperCase();
  
  // Placa padrão antigo (3 letras, 4 números)
  if (/^[A-Z]{3}\d{4}$/.test(limpa)) {
    return limpa.replace(/^([A-Z]{3})(\d{4})$/, '$1-$2');
  }
  // Mercosul fica sem hífen (ou formatado de acordo com a regra de negócio local)
  return limpa;
};

/**
 * Formata uma matrícula institucional da SEMOB no padrão: 000.000-0
 */
export const formatarMatricula = (matricula: string | number): string => {
  if (!matricula) return '';
  const limpo = String(matricula).replace(/\D/g, '');
  // A matrícula GDF (como 2871971) tem 7 dígitos formatados como 287.197-1
  if (limpo.length !== 7) return String(matricula);
  return limpo.replace(/(\d{3})(\d{3})(\d{1})/, '$1.$2-$3');
};

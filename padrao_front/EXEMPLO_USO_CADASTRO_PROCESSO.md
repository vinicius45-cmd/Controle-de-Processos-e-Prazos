/**
 * EXEMPLO DE USO - CadastrodeProcesso
 * 
 * Este arquivo demonstra como usar o componente CadastrodeProcesso
 * com tipagem TypeScript estrita e manipuladores de evento tipados.
 */

import CadastrodeProcesso from './screens/CadastrodeProcesso';

// ============================================
// 1. TIPO: FormCadastro
// ============================================
// Interface que mapeia rigorosamente todos os campos do formulário
// Importada de: src/types/index.ts
//
// export interface FormCadastro {
//   processoINCRA: string;
//   requerimento: string;
//   assunto: string;
//   solicitudesInformacao: string[];
//   orgaoOrigem: string;
//   dataEntrada: string;
//   prazoAreaTecnica: string;
//   prazoFinal: string;
//   situacaoProcesso: string;
//   responsavel: string;
//   documentoSEI: string;
//   especial: boolean;
//   observacao: string;
// }

// ============================================
// 2. TIPO: ResumoProcesso
// ============================================
// Interface para o card de resumo na coluna direita
//
// export interface ResumoProcesso {
//   status: string;
//   diasRestantes: number;
//   prazoFinal: string;
//   situacao: string;
//   responsavel: string;
// }

// ============================================
// 3. MANIPULADORES DE EVENTO (Estritamente Tipados)
// ============================================

// Exemplo 1: handleInputChange
// Manipula mudanças em inputs, selects e textareas
/*
const handleInputChange = (
  e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
): void => {
  const { name, value, type } = e.currentTarget;
  
  if (type === 'checkbox' && e.currentTarget instanceof HTMLInputElement) {
    setForm((prev) => ({
      ...prev,
      [name]: e.currentTarget.checked,
    }));
  } else {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }
};
*/

// Exemplo 2: handleRemoveSolicitude
// Remove um item da lista de solicitações de informação
/*
const handleRemoveSolicitude = (index: number): void => {
  setForm((prev) => ({
    ...prev,
    solicitudesInformacao: prev.solicitudesInformacao.filter(
      (_, i) => i !== index
    ),
  }));
};
*/

// Exemplo 3: handleSubmit
// Submete o formulário de forma tipada
/*
const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
  e.preventDefault();
  console.log('Formulário submetido:', form);
};
*/

// ============================================
// 4. COMO USAR NO APP
// ============================================

/*
import React from 'react';
import CadastrodeProcesso from './screens/CadastrodeProcesso';

function App() {
  return (
    <div className="App">
      <CadastrodeProcesso />
    </div>
  );
}

export default App;
*/

// ============================================
// 5. CAMPOS OBRIGATÓRIOS (com asterisco vermelho)
// ============================================
// - assunto *
// - orgaoOrigem *
// - dataEntrada *
// - prazoFinal *
// - situacaoProcesso *
// - responsavel *

// ============================================
// 6. ESTRUTURA DO LAYOUT
// ============================================
// 
// Duas colunas:
// 
// ┌────────────────────────────────┬──────────────────┐
// │                                │                  │
// │     FORMULÁRIO (Esquerda)      │  RESUMO (Direita)│
// │                                │                  │
// │  • Dados do Processo           │  Status: OK      │
// │  • Datas                       │  21 dias restant.│
// │  • Controle                    │                  │
// │  • Observação                  │  Prazo Final     │
// │                                │  05/06/2024      │
// │  [Cancelar] [Salvar]           │                  │
// │                                │  Situação        │
// │                                │  Responsável     │
// │                                │                  │
// │                                │  ⓘ Como calc?   │
// │                                │                  │
// └────────────────────────────────┴──────────────────┘
//
// Responsivo:
// - Desktop (1024px+): Duas colunas
// - Tablet (768px-1023px): Uma coluna com resumo em grid
// - Mobile (< 768px): Uma coluna full-width

// ============================================
// 7. VALIDAÇÃO TYPESCRIPT
// ============================================
// 
// Todos os tipos são rigorosamente definidos:
// ✓ sem `any`
// ✓ sem `unknown`
// ✓ tipos estritamente tipados para eventos
// ✓ handlers com tipos de retorno `void`
// ✓ states com tipos inferidos automaticamente
// ✓ form, resumo e solicitudes com tipos específicos

// ============================================
// 8. CAMPOS DO FORMULÁRIO
// ============================================

// Dados do Processo:
// - Processo INCRA (text input)
// - Requerimento (text input, máscara: REQ-YYYY/XXXX)
// - Assunto * (text input, obrigatório)
// - Solicitudes de Informação (tags com add/remove)
// - Órgão de Origem * (select, obrigatório)

// Datas:
// - Data de Entrada * (date, obrigatório)
// - Prazo Área Técnica (date)
// - Prazo Final * (date, obrigatório)

// Controle:
// - Situação do Processo * (select, obrigatório)
// - Responsável * (select, obrigatório)
// - Documento SEI - Resposta (select)
// - Especial (checkbox)

// Observação:
// - Observação (textarea)

export default CadastrodeProcesso;

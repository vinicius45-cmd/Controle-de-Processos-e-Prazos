# 📋 Componente CadastrodeProcesso

Formulário completo de cadastro de processo em **TypeScript estrito** com **CSS puro**, seguindo fielmente o design fornecido no print de tela.

## 🎯 Características

✅ **Layout de duas colunas** (formulário + resumo)  
✅ **TypeScript strict** - sem `any`, tipos rigorosamente definidos  
✅ **Manipuladores de evento tipados** (ChangeEvent, FormEvent)  
✅ **Campos obrigatórios** marcados com asterisco vermelho  
✅ **CSS puro** (sem frameworks) com variações responsivas  
✅ **Fiel ao print** - todos os campos e seções reproduzidas  

---

## 📁 Arquivos Criados

```
src/
├── screens/
│   └── CadastrodeProcesso.tsx       ← Componente principal
├── styles/
│   └── CadastrodeProcesso.css       ← Estilos CSS puro
└── types/
    └── index.ts                     ← Interfaces TypeScript
```

---

## 🔧 Interfaces TypeScript

### FormCadastro
Mapeia rigorosamente todos os campos do formulário:

```typescript
interface FormCadastro {
  processoINCRA: string;              // Código do processo INCRA
  requerimento: string;               // Requerimento (máscara: REQ-YYYY/XXXX)
  assunto: string;                    // Assunto do processo *obrigatório*
  solicitudesInformacao: string[];    // Lista de solicitações adicionadas
  orgaoOrigem: string;                // Órgão de origem *obrigatório*
  dataEntrada: string;                // Data de entrada *obrigatório*
  prazoAreaTecnica: string;           // Prazo técnico (opcional)
  prazoFinal: string;                 // Prazo final *obrigatório*
  situacaoProcesso: string;           // Situação atual *obrigatório*
  responsavel: string;                // Responsável *obrigatório*
  documentoSEI: string;               // Documento SEI (opcional)
  especial: boolean;                  // Flag especial (checkbox)
  observacao: string;                 // Observações adicionais
}
```

### ResumoProcesso
Dados do card de resumo na coluna direita:

```typescript
interface ResumoProcesso {
  status: string;                     // Status do processo (ex: "OK")
  diasRestantes: number;              // Dias até o prazo final
  prazoFinal: string;                 // Data do prazo final
  situacao: string;                   // Situação atual
  responsavel: string;                // Nome do responsável
}
```

---

## 🎨 Layout - Duas Colunas

### Desktop (≥ 1024px)
```
┌─────────────────────────────┬─────────────────┐
│   FORMULÁRIO (flex)         │  RESUMO         │
│   - Dados do Processo       │  (sticky)       │
│   - Datas                   │                 │
│   - Controle                │  Status: OK     │
│   - Observação              │                 │
│   [Cancelar] [Salvar]       │  21 dias        │
│                             │  05/06/2024     │
│                             │  Situação       │
│                             │  Responsável    │
└─────────────────────────────┴─────────────────┘
```

### Tablet (768px - 1023px)
```
Formulário full-width
Resumo com grid 2 colunas
```

### Mobile (< 768px)
```
Tudo stacked vertical
Botões em coluna (Cancelar, Salvar)
```

---

## 📝 Campos do Formulário

### Dados do Processo
- **Processo INCRA** (opcional) - input de texto
- **Requerimento** (opcional) - input com máscara REQ-YYYY/XXXX
- **Assunto*** (obrigatório) - input de texto
- **Solicitudes de Informação** (opcional) - tags adicionáveis
- **Órgão de Origem*** (obrigatório) - select

### Datas
- **Data de Entrada*** (obrigatório) - datepicker
- **Prazo Área Técnica** (opcional) - datepicker
- **Prazo Final*** (obrigatório) - datepicker

### Controle
- **Situação do Processo*** (obrigatório) - select
- **Responsável*** (obrigatório) - select
- **Documento SEI - Resposta** (opcional) - select
- **Especial** (opcional) - checkbox

### Observação
- **Observação** (opcional) - textarea

---

## ⌨️ Manipuladores de Evento (Estritamente Tipados)

### handleInputChange
```typescript
const handleInputChange = (
  e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
): void => {
  // Trata inputs, selects e textareas
  // Detecta checkboxes automaticamente
};
```

### handleAddSolicitude
```typescript
const handleAddSolicitude = (): void => {
  // Adiciona nova solicitação à lista
  // Limpa o input pendente
};
```

### handleRemoveSolicitude
```typescript
const handleRemoveSolicitude = (index: number): void => {
  // Remove solicitação por índice
};
```

### handleSubmit
```typescript
const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
  e.preventDefault();
  // Submete o formulário com validação
};
```

### handleCancel
```typescript
const handleCancel = (): void => {
  // Reseta o formulário aos valores iniciais
};
```

---

## 🎨 CSS - Destaques

### Classes Principais
- `.cadastro-container` - Container principal
- `.cadastro-content` - Grid de duas colunas
- `.formulario-column` - Coluna esquerda
- `.resumo-column` - Coluna direita (sticky)
- `.form-section` - Seção dentro do formulário
- `.form-row` - Linha com 2 ou 3 colunas

### Cores e Estilos
- **Primária**: #1976d2 (Azul)
- **Sucesso**: #4caf50 (Verde)
- **Background**: #f5f5f5 (Cinza claro)
- **Inputs**: #fff com border #ccc
- **Focus**: #1976d2 com shadow 3px rgba

### Responsividade
```css
@media (max-width: 1024px) { /* Tablet */ }
@media (max-width: 768px)  { /* Mobile */ }
@media (max-width: 480px)  { /* Mini */ }
```

---

## 🚀 Como Usar

### 1. Importar no seu componente

```tsx
import CadastrodeProcesso from './screens/CadastrodeProcesso';

function App() {
  return <CadastrodeProcesso />;
}
```

### 2. Estender com dados reais

```tsx
const [resumo, setResumo] = useState<ResumoProcesso>({
  status: 'OK',
  diasRestantes: 21,
  prazoFinal: '05/06/2024',
  situacao: 'Em andamento',
  responsavel: 'João da Silva',
});
```

### 3. Adicionar validação customizada

```tsx
const validarForm = (form: FormCadastro): boolean => {
  return (
    form.assunto.trim() !== '' &&
    form.orgaoOrigem !== '' &&
    form.dataEntrada !== '' &&
    form.prazoFinal !== '' &&
    form.situacaoProcesso !== '' &&
    form.responsavel !== ''
  );
};
```

---

## ✔️ Validação TypeScript

```bash
# Verificar tipos
npx tsc --noEmit

# Resultado esperado:
# ✓ Sem erros de tipo
# ✓ Sem uso de `any`
# ✓ Todos os handlers tipados
# ✓ FormCadastro completamente mapeada
```

---

## 📱 Responsividade Testada

- ✅ Desktop 1400px (2 colunas)
- ✅ Tablet 1024px (2 colunas stacked)
- ✅ Tablet 768px (1 coluna)
- ✅ Mobile 480px (1 coluna full)

---

## 🎯 Campos Obrigatórios

Marcados com asterisco vermelho (**\***):

1. **Assunto***
2. **Órgão de Origem***
3. **Data de Entrada***
4. **Prazo Final***
5. **Situação do Processo***
6. **Responsável***

---

## 🔍 Qualidade de Código

- ✅ Zero `any` types
- ✅ Event handlers com tipos específicos
- ✅ State management com tipagem automática
- ✅ Sem imports não utilizados
- ✅ Comentários explicativos
- ✅ Nomes descritivos de variáveis
- ✅ CSS modular e bem organizado

---

## 📚 Arquivos de Referência

- [Componente](./src/screens/CadastrodeProcesso.tsx)
- [Estilos CSS](./src/styles/CadastrodeProcesso.css)
- [Tipos TypeScript](./src/types/index.ts)
- [Exemplo de Uso](./EXEMPLO_USO_CADASTRO_PROCESSO.md)

---

## 🐛 Troubleshooting

### "Não encontra o módulo CSS"
Certifique-se que a pasta `src/styles/` existe e o arquivo `CadastrodeProcesso.css` está lá.

### "Erro de tipo em FormCadastro"
Verifique se as interfaces foram adicionadas em `src/types/index.ts`.

### "Layout não aparece correto"
Limpe o cache do navegador (Ctrl+F5) e verifique as media queries.

---

## 📄 Licença

Componente criado para o projeto Desafio-Pratico-de-Onboarding.

---

**Última atualização**: 07/07/2026  
**Versão**: 1.0.0

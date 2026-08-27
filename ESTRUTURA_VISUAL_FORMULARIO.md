# 📊 Estrutura Visual do Formulário

## Layout Completo - Desktop

```
┌───────────────────────────────────────────────────────────────────────┐
│ Cadastro de Processo › Novo Processo                                  │
└───────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────┬──────────────────────────────┐
│                                         │                              │
│  FORMULÁRIO (Esquerda)                  │  RESUMO (Direita - Sticky)   │
│  ────────────────────────────────────── │  ──────────────────────────  │
│                                         │                              │
│  📋 DADOS DO PROCESSO                   │  [✓ OK]                      │
│  ────────────────────────────────────── │                              │
│  │ Processo INCRA      │ Requerimento  │  ┌────────────────────────┐  │
│  │ 0001/7/2024-88      │ REQ-2024/???? │  │                        │  │
│  │                     │               │  │   21                   │  │
│  └─────────────────────┴───────────────┘  │   dias restantes       │  │
│                                           │                        │  │
│  Assunto *                                │ ┌────────────────────┐ │  │
│  ├─────────────────────────────────────   │ │ Prazo Final        │ │  │
│  │                                         │ │ 05/06/2024         │ │  │
│  └─────────────────────────────────────   │ └────────────────────┘ │  │
│                                           │                        │  │
│  Solicitudes de Informação                │ Situação:              │  │
│  ├─────────────────────────── [+]         │ [Em andamento]         │  │
│  │                                         │                        │  │
│  └─ [Tag 1] [×] [Tag 2] [×] [Tag 3] [×]  │ Responsável            │  │
│                                           │ [João da Silva]        │  │
│  Órgão de Origem *                        │                        │  │
│  ├─ Secretária de Saúde ▼                │ ⓘ Como é calculado?    │  │
│  │                                         │   O prazo é calculado… │  │
│  └─────────────────────────────────────   │                        │  │
│                                           │ ┌────────────────────┐ │  │
│  📅 DATAS                                 │ │                    │ │  │
│  ────────────────────────────────────── │ │                    │ │  │
│  │ Data de Entrada * │ Prazo Área Téc │ │ │                    │ │  │
│  │ [📅 18/05/2024]   │ [📅 28/05/2024]│ │ │                    │ │  │
│  │                   │                │ │ │                    │ │  │
│  │ Prazo Final *                      │ │ │                    │ │  │
│  │ [📅 05/06/2024]                    │ │ │                    │ │  │
│  │                                     │ │ │                    │ │  │
│  └─────────────────────────────────────┤ │                    │ │  │
│                                         │ └────────────────────┘ │  │
│  🎛️  CONTROLE                          │                        │  │
│  ────────────────────────────────────── │                        │  │
│  │ Situação do Processo *              │                        │  │
│  │ ├─ Em andamento ▼                   │                        │  │
│  │                                     │                        │  │
│  │ Responsável *                       │                        │  │
│  │ ├─ João da Silva ▼                  │                        │  │
│  │                                     │                        │  │
│  │ Documento SEI - Resposta            │                        │  │
│  │ ├─ Selecione o documento ▼          │                        │  │
│  │                                     │                        │  │
│  │ ☑ Especial                          │                        │  │
│  │                                     │                        │  │
│  └─────────────────────────────────────┘                        │  │
│                                                                  │  │
│  💬 OBSERVAÇÃO                                                   │  │
│  ────────────────────────────────────────────────────────────── │  │
│  │                                                             │ │  │
│  │ Informações complementares sobre o processo...             │ │  │
│  │                                                             │ │  │
│  │                                                             │ │  │
│  └─────────────────────────────────────────────────────────────┘ │  │
│                                                                  │  │
│                          [Cancelar]  [Salvar]                   │  │
│                                                                  │  │
└──────────────────────────────────────────────────────────────────┘
```

---

## Componentes do Formulário por Seção

### 1️⃣ DADOS DO PROCESSO
```
┌─────────────────────────────────────────────────────────────┐
│ DADOS DO PROCESSO                                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [Processo INCRA]         [Requerimento]                   │
│  0001/7/2024-88           REQ-2024/????                    │
│                                                             │
│  [Assunto *]                                               │
│  _______________________________________________________   │
│                                                             │
│  [Solicitudes de Informação]              [+]              │
│  _______________________________________________________   │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐       │
│  │ Tag 1    [×] │ │ Tag 2    [×] │ │ Tag 3    [×] │       │
│  └──────────────┘ └──────────────┘ └──────────────┘       │
│                                                             │
│  [Órgão de Origem *]                                       │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ Secretária de Saúde                            [▼]  │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 2️⃣ DATAS
```
┌─────────────────────────────────────────────────────────────┐
│ DATAS                                                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [Data de Entrada *]  [Prazo Área Técnica]  [Prazo Final *]
│  [18/05/2024]         [28/05/2024]          [05/06/2024]   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 3️⃣ CONTROLE
```
┌─────────────────────────────────────────────────────────────┐
│ CONTROLE                                                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [Situação do Processo *]  [Responsável *]                 │
│  ┌────────────────────┐    ┌────────────────────┐          │
│  │ Em andamento [▼]   │    │ João da Silva [▼]  │          │
│  └────────────────────┘    └────────────────────┘          │
│                                                             │
│  [Documento SEI - Resposta]                                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Selecione o documento                          [▼]   │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ☑ Especial                                                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 4️⃣ OBSERVAÇÃO
```
┌─────────────────────────────────────────────────────────────┐
│ OBSERVAÇÃO                                                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ Informações complementares sobre o processo...        │ │
│  │                                                       │ │
│  │                                                       │ │
│  │                                                       │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Card de Resumo (Coluna Direita)

```
┌──────────────────────────────────┐
│                                  │
│  [✓ OK]                          │
│                                  │
│          21                       │
│       dias restantes              │
│                                  │
├──────────────────────────────────┤
│  PRAZO FINAL                     │
│  05/06/2024                      │
├──────────────────────────────────┤
│  SITUAÇÃO:                       │
│  [Em andamento]                  │
├──────────────────────────────────┤
│  RESPONSÁVEL                     │
│  [João da Silva]                 │
├──────────────────────────────────┤
│  ⓘ  Como é calculado?            │
│  O prazo é calculado com base    │
│  na Data de Entrada e no Prazo   │
│  Final.                          │
│                                  │
└──────────────────────────────────┘
```

---

## Estados dos Campos

### Campo Vazio
```
[_________________________]
```

### Campo Preenchido
```
[valor_aqui]
```

### Campo em Foco
```
[_________________________]  ← border azul + shadow
```

### Campo Desabilitado
```
[cinza_desabilitado]
```

### Select Aberto
```
┌──────────────────────────┐
│ Opção Selecionada   [▼]  │
├──────────────────────────┤
│ Opção 1                  │
│ Opção 2                  │
│ Opção 3                  │
└──────────────────────────┘
```

### Checkbox
```
☐ Label (unchecked)
☑ Label (checked)
```

### Tags de Solicitudes
```
┌─────────────────────────────────────────┐
│ ┌──────────────┐ ┌──────────────┐      │
│ │ Solicitação1 │ │ Solicitação2 │      │
│ │          [×] │ │          [×] │      │
│ └──────────────┘ └──────────────┘      │
└─────────────────────────────────────────┘
```

---

## Responsividade

### Desktop (≥ 1024px)
```
┌──────────────────────┬──────────────┐
│   Formulário (70%)   │ Resumo (30%) │
└──────────────────────┴──────────────┘
```

### Tablet (768px - 1023px)
```
┌──────────────────────────────┐
│   Formulário (100%)          │
├──────────────────────────────┤
│ Resumo (Grid 2 Colunas)      │
└──────────────────────────────┘
```

### Mobile (< 768px)
```
┌──────────────┐
│ Formulário   │
│ (100%)       │
├──────────────┤
│ Resumo       │
│ (100%)       │
└──────────────┘
```

---

## Indicadores Visuais

### Campos Obrigatórios
```
Label *   ← Asterisco vermelho (#d32f2f)
```

### Focus (Foco no campo)
```
Border: #1976d2 (2px)
Shadow: 0 0 0 3px rgba(25, 118, 210, 0.1)
```

### Hover (Mouse sobre botão)
```
Background: Cor + 10% mais escura
Shadow: 0 2px 8px rgba(0, 0, 0, 0.3)
```

### Active (Clique no botão)
```
Background: Cor + 20% mais escura
```

---

## Tipos de Input

1. **Text Input** - Assunto, Processo INCRA, Requerimento
2. **Date Input** - Data de Entrada, Prazo Área Técnica, Prazo Final
3. **Select** - Órgão de Origem, Situação, Responsável, Documento SEI
4. **Checkbox** - Especial
5. **Textarea** - Observação
6. **Tag List** - Solicitudes de Informação

---

## Cores do Design

| Elemento | Cor | Código |
|----------|-----|--------|
| Primário | Azul | #1976d2 |
| Sucesso | Verde | #4caf50 |
| Erro | Vermelho | #d32f2f |
| Background | Cinza claro | #f5f5f5 |
| Border | Cinza | #ccc |
| Text Primário | Escuro | #333 |
| Text Secundário | Cinza | #666 |
| Placeholder | Cinza claro | #999 |

---

## Dimensões

| Elemento | Dimensão |
|----------|----------|
| Coluna Esquerda | Flex (auto) |
| Coluna Direita | 380px |
| Gap entre colunas | 24px |
| Padding do card | 24px |
| Border Radius | 4px-8px |
| Font Size Labels | 13px |
| Font Size Inputs | 14px |
| Font Size Titles | 14px (uppercase) |

---

Este documento foi gerado para visualizar fielmente a estrutura do formulário de Cadastro de Processo.

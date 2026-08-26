# 🏛️ Documentação de Padronização Front-End — SEMOB

> **SECRETARIA DE ESTADO DE MOBILIDADE DO DISTRITO FEDERAL (SEMOB)**  
> **Data:** 2026

Este documento define a arquitetura oficial, tecnologias e padrões de codificação para os projetos front-end da SEMOB. O objetivo principal é garantir manutenibilidade, escalabilidade e a correta integração multiplataforma (Web, PWA e Mobile).

---

## 📑 Sumário
1. [Padrão de Arquitetura e Tecnologias](#1-padrão-de-arquitetura-e-tecnologias---front-end-web-e-mobile)
2. [Estrutura de Diretórios e Responsabilidades](#2-estrutura-de-diretórios-e-responsabilidades)
3. [Arquitetura em Camadas (Fluxo de Dados)](#3-arquitetura-em-camadas-fluxo-de-dados)
4. [Diretrizes de Desenvolvimento Mobile (Capacitor)](#4-diretrizes-de-desenvolvimento-mobile-capacitor)
5. [Variáveis de Ambiente (.env)](#5-variáveis-de-ambiente-env)
6. [Fluxo de Trabalho e Versionamento](#6-fluxo-de-trabalho-e-versionamento-repositório-semobgitlab)
7. [Guia de Comandos Locais](#7-guia-de-comandos-locais)
8. [Containerização com Docker](#8-containerização-com-docker)
9. [Configuração do Vite (vite.config.ts)](#9-configuração-do-vite-viteconfigts)
10. [Design System e Cores SISMOB](#10-design-system-e-cores-sismob)
11. [Funcionamento do Sidebar e Header](#11-funcionamento-do-sidebar-e-header)
12. [Desafio Prático de Onboarding](#12-desafio-prático-de-onboarding)
13. [Regras de Segurança e Comunicação HTTP (SISMOB)](#13-regras-de-segurança-e-comunicação-http-sismob)

---

## 1. 🛠️ Padrão de Arquitetura e Tecnologias - Front-End Web e Mobile

A stack tecnológica foi rigorosamente definida para manter consistência e alta performance nos projetos da secretaria.

| Tecnologia | Padrão Adotado | Versão Recomendada / Compatível | Descrição e Justificativa |
| :--- | :--- | :--- | :--- |
| **Framework Base** | **React.js** | `^18.3.x` | Biblioteca robusta e padronizada para interfaces. |
| **Build Tool** | **Vite** | `^5.4.x` | Garante builds rápidos e otimizados na fase de desenvolvimento e produção. |
| **Linguagem Mobile** | **Java (JDK)** | `21` (LTS) | Obrigatório para o ambiente de build do APK Android nativo. |
| **Empacotador Nativo**| **Capacitor** | `^6.0.x` | Padrão único para empacotamento nativo Mobile. |
| **PWA** | **vite-plugin-pwa** | `^0.20.x` | Obrigatório para conversão de web apps em Progressive Web Apps. |
| **Gerenciador de Pacotes**| **npm** | `10.x` (Node `v20.x` LTS) | Manter consistência de dependências no projeto. |
| **Comunicação HTTP** | **Axios** | `^1.6.x` | Facilita a interceptação global de requisições e tratamento centralizado de erros. |
| **Estado Global** | **Zustand / Context API** | `^4.5.x` (Zustand) | Para injeção de provedores e gerenciamento de estados complexos compartilhados. |

---

## 2. 📂 Estrutura de Diretórios e Responsabilidades

A arquitetura do projeto deve seguir estritamente a divisão abaixo dentro da pasta `src/`:

```text
src/
├── app/          # Centralizador principal da aplicação. Rotas globais, provedores e entrada raiz.
├── assets/       # Imagens, Ícones e Styles globais.
├── components/   # Componentes de UI reutilizáveis, genéricos e isolados (ex: botões, modais).
├── config/       # Configurações do Capacitor (permissões, plugins nativos) e Instâncias Base.
├── context/      # Gerenciamento de estado global da aplicação (dados do usuário logado, tema).
├── core/         # Adaptadores e interceptores de API padronizados.
├── hooks/        # Lógica de negócio e gerenciamento de estado das telas.
├── screens/      # Telas (Views). Componentes "limpos" focados 90% na renderização.
├── services/     # Camada exclusiva de comunicação externa separada por domínio/API.
├── types/        # Tipagens estáticas. Exportadas e centralizadas num único arquivo (types/index.ts).
└── utils/        # Formatadores (CPF, Datas) e validadores genéricos.
```

---

## 3. 🏗️ Arquitetura em Camadas (Fluxo de Dados)

Nossa arquitetura prioriza a separação de responsabilidades. O arquivo da tela em `/screens` deve importar seu respectivo hook para obter os dados e as funções necessárias, mantendo o JSX limpo.

1. **Screen (`/screens`)**: Exibe os componentes. Componentes muito específicos de uma tela devem ser acoplados ao hook daquela tela.
2. **Hook (`/hooks`)**: É invocado pela Screen. Concentra toda a lógica e regras de tela.
3. **Service (`/services`)**: É invocado pelo Hook. Cada arquivo aqui é separado por domínio (ex: `authService.ts`). Nenhuma View acessa a API diretamente.
4. **Tipagem (`/types`)**: Tudo trafegado entre Front e Back deve ser estritamente tipado. Proibido o uso de `any`.

> 💡 **Regra Prática:** Se um Componente Visual/Screen possui mais de 50 linhas apenas de lógica e estados, essa lógica deve ser extraída para um Hook customizado.

---

## 4. 📱 Diretrizes de Desenvolvimento Mobile (Capacitor)

- **Encapsulamento:** Toda integração nativa deve ser feita estritamente via plugins do Capacitor e encapsulada na pasta `/config`.
- **Java Obrigatório:** O build Android exige que o ambiente local e as pipelines utilizem **Java 21**.
- **Comunicação HTTP (Android):** Para permitir requisições não-HTTPS (quando estritamente necessário em ambientes de desenvolvimento ou redes internas), o arquivo `android/app/src/main/AndroidManifest.xml` deve conter a seguinte propriedade na tag `<application>`:
  ```xml
  <application
      android:usesCleartextTraffic="true"
      ... >
  ```

---

## 5. 🔐 Variáveis de Ambiente (.env)

- **Nunca chumbar em código:** Sempre centralizar URLs de APIs ou chaves de acesso.
- **Centralização Global:** Todos os links de API e configurações sensíveis devem residir no arquivo `.env` global.
- **Prefixo do Vite:** As variáveis expostas obrigatoriamente devem usar o prefixo `VITE_` (ex: `VITE_API_URL`).

---

## 6. 🔄 Fluxo de Trabalho e Versionamento (Repositório SEMOB/GitLab)

- **Vínculo Oficial:** Todo projeto local deve estar obrigatoriamente linkado ao repositório GitLab da SEMOB.
- **Evite Código Retido:** Se possível, faça o `commit` e o `push` das alterações em andamento para a branch remota antes da saída do prédio. O código não deve ficar retido apenas na máquina local ao fim do expediente.
- **Qualidade dos Commits:** Os commits devem ser descritivos, atômicos e limpos. 
  > 🚫 **Atenção:** Bagunça no histórico ("commit de teste", "ajustes", "asdasd"). Descreva o que foi alterado ou qual funcionalidade foi implementada de forma clara.

---

## 7. 💻 Guia de Comandos Locais

Este guia lista os comandos essenciais para rodar, compilar e empacotar a aplicação nas diversas plataformas.

### 7.1 Setup e Desenvolvimento Web

- **Instalar dependências:**
  ```bash
  npm install
  ```
- **Rodar o servidor de desenvolvimento (Vite):**
  ```bash
  npm run dev
  ```
- **Gerar o build de produção (Web/PWA):**
  ```bash
  npm run build
  ```

### 7.2 Fluxo Mobile (Capacitor)

> ⚠️ **Nota Importante:** Sempre rode o comando de build do Vite antes de sincronizar o Capacitor para garantir que as atualizações cheguem no nativo.

- **Sincronizar código web gerado com o projeto nativo:**
  ```bash
  npx cap sync
  ```
- **Atualizar dependências de plugins do Capacitor:**
  ```bash
  npx cap update
  ```
- **Abrir o projeto no Android Studio (opcional, para debug avançado):**
  ```bash
  npx cap open android
  ```

### 7.3 Build e Execução Android (Via Terminal)

Para executar esses comandos, certifique-se de estar dentro da pasta `android/` gerada pelo Capacitor e de que o seu `JAVA_HOME` aponta para o Java 21.

- **Entrar na pasta nativa:**
  ```bash
  cd android
  ```
- **Limpar o projeto Gradle:**
  ```bash
  ./gradlew clean
  ```
- **Gerar o APK de Debug (para testes locais):**
  ```bash
  ./gradlew assembleDebug
  ```
  *(O APK será gerado em: `android/app/build/outputs/apk/debug/app-debug.apk`)*

- **Gerar o APK/Bundle de Release (publicação oficial):**
  ```bash
  ./gradlew assembleRelease
  # ou
  ./gradlew bundleRelease
  ```
- **Rodar diretamente no emulador ou dispositivo físico conectado (via ADB):**
  *(Execute fora da pasta android)*
  ```bash
  npx cap run android
  ```

---

## 8. 🐳 Containerização com Docker

A aplicação conta com suporte nativo para empacotamento Docker multi-estágio (*Multi-stage Build*), otimizando o tamanho final da imagem e garantindo que o build estático seja servido por uma instância leve do Nginx configurada para SPAs.

### 8.1 Estrutura de Arquivos Criados

* **`Dockerfile`**: Executa o build da aplicação no ambiente Node e copia os artefatos estáticos prontos para a imagem Nginx.
* **`nginx.conf`**: Configuração dedicada do servidor Nginx com redirecionamentos amigáveis de rota para o `index.html` (essencial para evitar erro 404 em rotas do React Router) e cache otimizado de assets.
* **`docker-compose.yml`**: Orquestrador local para subir a aplicação em ambiente de produção em um único comando.

### 8.2 Injeção de Variáveis no Build (Vite)

> ⚠️ **Atenção:** Aplicações Single Page (SPA) rodam no navegador do usuário e têm suas variáveis de ambiente compiladas e chumbadas em tempo de build. Por isso, a injeção do `.env` deve ser feita no momento da criação da imagem.

A imagem aceita o argumento de build `VITE_API_URL` para injetar a rota correta do Backend:

#### Via CLI Docker:
```bash
docker build --build-arg VITE_API_URL=https://api.semob.df.gov.br -t semob-front-app .
```

#### Executando o Container:
```bash
docker run -d -p 8080:80 --name semob-front semob-front-app
```

#### Via Docker Compose (Local/Homologação):
1. Edite o argumento `VITE_API_URL` no `docker-compose.yml` se necessário.
2. Suba o container com:
   ```bash
   docker compose up -d --build
   ```
   *(Acesse em: `http://localhost`)*

---

## 9. ⚡ Configuração do Vite (`vite.config.ts`)

O arquivo `vite.config.ts` é o coração do ecossistema de build, desenvolvimento e roteamento local da aplicação. Em nossos projetos de grande porte na SEMOB, ele assume funções cruciais de segurança, controle de ambiente local, otimização de cache de pacotes, e suporte de compilação multiplataforma.

### 9.1 Visão Geral das Camadas do Arquivo

O arquivo padrão de produção está estruturado em 5 blocos funcionais principais:

1. **Leitura Customizada de Ambientes (`dotenv`)**:
   Diferente do carregamento padrão de variáveis de ambiente do Vite, o arquivo executa um bootstrap personalizado para arquivos específicos do ecossistema como `.env.modules` e `.envFiscalizacaoAcesso`. Isso unifica o escopo local de variáveis antes de expor aos plugins e compilação do Vite.

2. **`envManagerPlugin` (Plugin do Servidor de Dev)**:
   Um middleware do servidor de desenvolvimento local que injeta endpoints REST privados para o navegador interagir diretamente com o sistema de arquivos local (`fs`) do desenvolvedor.
   * **`/api-local-env/read`**: Lê chaves de arquivos `.env` dinamicamente via interface do usuário.
   * **`/api-local-env/update`**: Permite que ferramentas internas escrevam modificações em arquivos de configuração locais direto da UI.
   * **`/api-local-env/toggle-module`**: Habilita ou desabilita módulos do sistema editando programaticamente o arquivo `src/config/modules.ts`.
   * **Serviço de Cron Integrado**: Executa varreduras de agendamento de modificações locais a cada 5 segundos no background do Node.

3. **Mapeamento de Proxies e Burlar CORS**:
   Durante o desenvolvimento local, o navegador seria barrado pela política de CORS ao tentar bater direto em domínios ou IPs restritos da SEMOB. O Vite resolve isso atuando como um servidor proxy reverso local:
   * **Rotas de Dados**: Redireciona caminhos locais como `/api-semob-dados` e `/api-vol` para os servidores de produção oficiais (`dados.semob.df.gov.br`, etc.).
   * **Rotas de Serviços Legados (PCPN)**: Agrupa prefixos como `/autenticador`, `/scl`, `/consultasonibus`, `/eauto`, `/log`, `/CDP`, `/pct` e mapeia para a URL do barramento homologado (`VITE_API_PCPN_HOST`).
   * **Rotas de Bancos de Dados Locais**: Redireciona as rotas locais `/operadoras`, `/mobilidade`, `/infraestrutura`, `/linhas` e `/itinerarios` para o microsserviço rodando localmente na máquina (`http://localhost:3333`).

4. **Configuração de PWA (Progressive Web App)**:
   Utiliza o `vite-plugin-pwa` para gerar o Service Worker automatizado e controlar a política de cache offline do aplicativo.
   * Eleva o limite máximo de cache por arquivo para `10MB` para suportar o carregamento offline de bibliotecas de mapas (Leaflet), ícones pesados e componentes de imagem.
   * Padroniza os formatos de `globPatterns` e propriedades de metadados do aplicativo (nome, cores institucionais e ícones adaptativos).

5. **Otimizações de Chunking e Aliases Rollup**:
   * **`manualChunks`**: Separa bibliotecas de terceiros pesadas do bundle da lógica de negócio. Agrupa `react`, `react-dom` e `react-router-dom` em `vendor-react`, e os ícones pesados de `lucide-react` em `vendor-lucide`. Isso maximiza o cache do navegador e otimiza o carregamento das páginas.
   * **Alias de Plataformas**: Mapeia a biblioteca `react-native` para `react-native-web`. Isso permite usar pacotes cross-platform do ecossistema Expo diretamente no navegador de computadores sem quebras de compilação.

### 9.2 Diretrizes e Boas Práticas Obrigatórias

Para criar ou herdar projetos sob o padrão SEMOB, as regras abaixo são de cumprimento obrigatório:

1. **Nunca Chumbe Credenciais de Produção**:
   Configurações de proxy e links de servidores devem ser sempre parametrizados no arquivo `.env` e carregados de forma dinâmica no Vite utilizando a função `loadEnv(mode, process.cwd(), '')`.
2. **Defina ManualChunks para Bibliotecas de Terceiros Volumosas**:
   Sempre que adicionar dependências externas grandes (como Leaflet, bibliotecas de gráficos, exportadores de PDF), declare o chunk correspondente na propriedade `build.rollupOptions.output.manualChunks` para evitar lentidão no carregamento inicial da aplicação.
3. **Mantenha o Plugin Dev Restrito ao Server**:
   O plugin `envManagerPlugin` deve atuar unicamente na fase de desenvolvimento local (`configureServer`). Nunca exponha rotas de sistema de arquivos ou lógica baseada em Node no build público estático servido em produção.

---

## 10. 🎨 Design System e Cores SISMOB

Para manter a consistência com a identidade institucional da SEMOB, a aplicação implementa um tema adaptativo baseado em variáveis CSS no arquivo [index.css](file:///c:/Users/01002871971/Documents/GitHub/padrao_front/src/index.css).

### 🎨 Paleta de Cores e Tokens CSS
* **Cor Primária (`--semob-primary`):** Azul Royal (`#2563eb`), utilizado em links, ícones ativos, botões primários e estados selecionados.
* **Cor de Fundo Geral (`--semob-bg`):** Claro: `#f8fafc` | Escuro: `#0b0f19`. Utilizada no plano de fundo de todas as páginas.
* **Cor de Fundo de Superfícies (`--semob-surface`):** Claro: `#ffffff` | Escuro: `#111a2e`. Utilizada em contêineres de cards, cabeçalhos, rodapés e caixas de diálogos.
* **Bordas e Divisores (`--semob-border`):** Claro: `#cbd5e1` | Escuro: `#1e293b`. Fornece contraste discreto para divisões internas.
* **Textos (`--semob-text`):** Claro: `#0f172a` | Escuro: `#f3f4f6`.
* **Textos Secundários (`--semob-text-muted`):** Claro: `#64748b` | Escuro: `#94a3b8`.

### 📐 Diretrizes de Tamanhos e Margens
* **Headerbar (Cabeçalho):** Altura fixa de `64px`, sticky no topo.
* **Sidebar (Barra Lateral):** Largura de `260px` expandida e `70px` colapsada em desktop.
* **Margem Geral de Conteúdo:** Padding de `2rem` (`32px`) em desktop e de `1rem` (`16px`) em telas menores.
* **Dimensões das Janelas Popup (Modais):**
  * **sm (Pequeno):** Máximo de `400px` (alertas rápidos, avisos de perigo).
  * **md (Médio):** Máximo de `550px` (formulários curtos de cadastros).
  * **lg (Grande):** Máximo de `750px` (relatórios ou tabelas detalhadas).

---

## 11. 📐 Funcionamento do Sidebar e Header

### 📂 Barra Lateral (Sidebar)
* **Controle CDP Dinâmico:** Filtra e exibe de forma reativa os módulos e submenus de acordo com a lista `rotasPermitidas` do usuário autenticado.
* **Suporte Mobile Completo:** Em larguras de tela menores que `768px`, a Sidebar oculta-se automaticamente e passa a funcionar como um **Drawer** deslizante lateral.
* **Overlay com Desfoque:** Quando a Sidebar drawer está ativa no mobile, um contêiner de sombreamento cobre o conteúdo da tela, permitindo fechar o menu ao clicar fora dele.
* **Comportamento Colapsável:** Permite reduzir seu tamanho em telas grandes para apenas exibir ícones, aumentando a área útil de trabalho.

### 💻 Barra de Cabeçalho (Headerbar)
* **Gatilho de Menu Hambúrguer:** Visível apenas em dispositivos móveis, permitindo alternar o estado do drawer lateral.
* **Navegação (Breadcrumbs):** Renders dinâmicos indicando o caminho atual (ex: `SUOP ❯ Operadoras`).
* **Botão de Temas:** Controla de forma rápida a alternância entre os modos Light e Dark no AppProvider.
* **Menu de Perfil Dropdown:** Exibe uma bolha circular com as iniciais do usuário. Ao ser clicado, expande um painel com dados detalhados (Nome, Email, Cargo, Matrícula) e o link para realizar o logout da sessão.
  > 💡 **Nota sobre Tratamento de Dados Institucionais (`/utils`):** É estritamente recomendado o uso de formatadores visuais padronizados para dados do governo antes de exibi-los na interface. Por exemplo, a matrícula do usuário deve sempre passar pelo utilitário `formatarMatricula` (para renderizar como `287.197-1`) ao invés de exibir a string bruta do banco. Mantendo a uniformidade visual em todos os sistemas.

---

## 12. 🏆 Desafio Prático de Onboarding

Para testar suas habilidades com o ecossistema SISMOB, implemente a seguinte funcionalidade no boilerplate:

### 🎯 Desafio: Tela de Validadores Eletrônicos
Substitua o submenu estático de **Validadores** (atualmente um placeholder em mock no `config/modules.ts`) por um módulo funcional de consulta de validadores instalados na frota de ônibus.

### 📋 Checklist de Passos:
1. **Interface de Dados:** Crie a interface `Validador` no arquivo [types/index.ts](file:///c:/Users/01002871971/Documents/GitHub/padrao_front/src/types/index.ts) contendo: `idValidador: number`, `numeroSerie: string`, `prefixoOnibus: string`, e `status: 'ATIVO' | 'INATIVO'`.
2. **Camada de Dados (Service):** Crie um serviço `ValidadorService` em [services/](file:///c:/Users/01002871971/Documents/GitHub/padrao_front/src/services/) simulando um GET HTTP com dados mockados para o endpoint `/validadores`.
3. **Controlador Reativo (Hook):** Escreva o custom hook `useValidadores` em [hooks/](file:///c:/Users/01002871971/Documents/GitHub/padrao_front/src/hooks/) para gerenciar estados de listagem, busca e loading.
4. **Interface de Usuário (Screen):** Desenhe a tela `ValidadorList.tsx` em [screens/](file:///c:/Users/01002871971/Documents/GitHub/padrao_front/src/screens/) herdando os padrões de design:
   - Verifique permissão de Leitura: Exiba card de erro se o usuário não tiver acesso ao recurso `/validadores`.
   - Verifique permissão de Escrita: Habilite um botão para alternar status do validador apenas se `temEscrita('/validadores')` for verdadeiro.
5. **Registro de Rota:** Importe a sua tela de forma assíncrona (`lazy`) e associe-a ao submenu `sif-val` dentro do arquivo [modules.ts](file:///c:/Users/01002871971/Documents/GitHub/padrao_front/src/config/modules.ts).
6. **Validação:** Utilize o simulador de CDP para alternar as permissões locais e confirmar a reatividade instantânea da interface!

---

## 13. 🛡️ Regras de Segurança e Comunicação HTTP (SISMOB)

A segurança da comunicação entre o Front-end e os Back-ends da SEMOB baseia-se em regras estritas que devem ser configuradas em todos os projetos utilizando Axios e as políticas de CORS do Vite.

### 13.1 Regra 1: Chamadas a APIs Apenas Pós-Login
Nenhum dado sensível deve ser pré-carregado antes da garantia da autenticação via CDP (Controle de Dados e Perfis). 
* **O que fazer:** Sempre utilize Hooks como `useQuery` ou disparos de `useEffect` dependentes do estado `autenticado` do `useAuthStore`.
* **Como proteger rotas:** Qualquer rota do `react-router` que acesse recursos da SEMOB deve estar dentro de um componente de `RotasPrivadas` (que bloqueia e redireciona ao Login se o Token não existir).

### 13.2 Regra 2: Configuração Global do Axios (Interceptadores)
As instâncias do Axios **nunca** devem ser utilizadas isoladamente nas telas. O projeto deve possuir um interceptador central configurado no boot da aplicação (ex: `src/core/apiInterceptor.ts`).

O SISMOB exige o envio de dois cabeçalhos obrigatórios em **todas** as requisições privadas:
1. `Authorization`: Bearer + Token JWT.
2. `x-user-id`: ID numérico do usuário (retornado pelo CDP).

**Exemplo de Configuração Padronizada:**
```typescript
import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
});

// Interceptor de Request: Injeta a segurança do SISMOB
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('@SEMOB_TOKEN'); // Ou recuperado via Zustand
  const userId = localStorage.getItem('@SEMOB_USER_ID'); 

  if (token && config.headers) config.headers.Authorization = `Bearer ${token}`;
  if (userId && config.headers) config.headers['x-user-id'] = userId;

  return config;
});

// Interceptor de Response: Captura expiração de sessão
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      window.dispatchEvent(new CustomEvent('auth:expired'));
    }
    return Promise.reject(error);
  }
);
```

### 13.3 Regra 3: Tratamento de CORS com Vite (Localhost)
Para evitar bloqueios de CORS (Cross-Origin Resource Sharing) durante o desenvolvimento local ao se comunicar com serviços homologados ou de produção da SEMOB, é **obrigatório** utilizar os proxies locais do Vite (`vite.config.ts`).

⚠️ **NUNCA** instale extensões para desabilitar o CORS no navegador nem adicione headers "inseguros" diretamente nos controladores de produção para tentar burlar isso localmente.

**Exemplo de Proxy SISMOB no `vite.config.ts`:**
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Redireciona chamadas locais /api para o backend real da SEMOB
      '/api-semob': {
        target: 'https://homologacao.semob.df.gov.br',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-semob/, '/api')
      },
      // Bypass de CORS para barramentos locais (Spring Boot, Node) rodando na máquina
      '/operadoras': {
        target: 'http://localhost:3333',
        changeOrigin: true
      }
    }
  }
});
```
**Como Funciona:** Com isso, o front-end faz uma chamada HTTP para a mesma origem (ex: `http://localhost:5173/api-semob/usuarios`), o navegador não bloqueia via CORS (pois a origem é a mesma), e o próprio Vite atua como intermediário, enviando invisivelmente a requisição para o `target` oficial da SEMOB.

# SupVelo — Sistema de Atendimento com Triagem por IA

Sistema fullstack de atendimento ao cliente com triagem automatizada por inteligência artificial. A IA conduz a conversa inicial com o cliente, identifica a intenção e o setor responsável, e transfere automaticamente para o atendente humano correto quando a confiança é suficientemente alta.

---

## Sumário

- [Visão Geral](#visão-geral)
- [Arquitetura do Sistema](#arquitetura-do-sistema)
- [Stack Tecnológica](#stack-tecnológica)
- [Estrutura de Diretórios](#estrutura-de-diretórios)
- [Domínio e Regras de Negócio](#domínio-e-regras-de-negócio)
- [Backend — Clean Architecture](#backend--clean-architecture)
- [API REST](#api-rest)
- [Eventos WebSocket](#eventos-websocket)
- [Frontend](#frontend)
- [Integração com IA (Gemini)](#integração-com-ia-gemini)
- [Banco de Dados](#banco-de-dados)
- [Testes](#testes)
- [Docker e Containerização](#docker-e-containerização)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Como Rodar](#como-rodar)
- [Decisões de Arquitetura](#decisões-de-arquitetura)

---

## Visão Geral

O SupVelo oferece duas interfaces distintas que operam em conjunto:

**Interface do Cliente** (`/`) — Uma janela de chat onde o cliente informa seu nome, inicia o atendimento e conversa com o assistente de IA. A IA conduz a triagem, identifica a intenção do cliente e, quando confiante o suficiente, anuncia a transferência para o setor correto. O cliente não pode mais enviar mensagens após a transferência.

**Interface do Agente** (`/agent`) — Um painel de inbox para os atendentes humanos. Exibe todas as conversas em tempo real, com filtro por status (Bot, Aguardando, Em Atendimento). Ao selecionar uma conversa transferida, o agente pode visualizar o histórico completo, os dados de triagem (setor, intenção, resumo, confiança) e assumir o atendimento com um clique.

A comunicação em tempo real entre as duas interfaces é feita via WebSocket, garantindo que ambas estejam sempre sincronizadas sem necessidade de polling.

---

## Arquitetura do Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENTE (Navegador)                  │
│                                                             │
│  ┌──────────────────┐           ┌─────────────────────────┐ │
│  │  Interface /     │           │    Interface /agent     │ │
│  │  (Chat Cliente)  │           │    (Inbox do Agente)    │ │
│  └────────┬─────────┘           └────────────┬────────────┘ │
└───────────┼──────────────────────────────────┼──────────────┘
            │ HTTP (REST via proxy Next.js)    │ WebSocket (direto)
            │ WebSocket (direto)               │
            ▼                                  ▼
┌─────────────────────────────────────────────────────────────┐
│                  BACKEND (Node.js + Express)                │
│                                                             │
│   ┌──────────────┐    ┌──────────────┐    ┌─────────────┐   │
│   │   HTTP API   │    │  Socket.IO   │    │  Use Cases  │   │
│   │  (Express)   │    │  (Notif.)    │    │ (App Layer) │   │
│   └──────┬───────┘    └──────┬───────┘    └──────┬──────┘   │
│          │                   │                   │          │
│   ┌──────┴───────────────────┴───────────────────┴───────┐  │
│   │                  Container (DI manual)               │  │
│   └──────────────────────────┬───────────────────────────┘  │
│                              │                              │
│        ┌─────────────────────┼─────────────────────┐        │
│        ▼                     ▼                     ▼        │
│  ┌──────────┐       ┌──────────────┐       ┌────────────┐   │
│  │  SQLite  │       │ Gemini API   │       │ Socket.IO  │   │
│  │ (better- │       │ (Google AI)  │       │  Rooms     │   │
│  │ sqlite3) │       │  streaming   │       │            │   │
│  └──────────┘       └──────────────┘       └────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## Stack Tecnológica

### Frontend

| Tecnologia       | Versão | Uso                                |
| ---------------- | ------ | ---------------------------------- |
| Next.js          | 16.1.6 | Framework React com App Router     |
| React            | 19.2.3 | UI e gerenciamento de estado local |
| TypeScript       | 5.x    | Tipagem estática                   |
| Tailwind CSS     | 4.x    | Estilização utilitária             |
| Zustand          | 5.x    | Estado global do cliente           |
| Socket.IO Client | 4.8.x  | WebSocket em tempo real            |
| Axios            | 1.x    | Requisições HTTP                   |

### Backend

| Tecnologia            | Versão     | Uso                                |
| --------------------- | ---------- | ---------------------------------- |
| Node.js               | 20.x (LTS) | Runtime                            |
| Express               | 4.x        | Framework HTTP                     |
| TypeScript            | 5.7.x      | Tipagem estática                   |
| Socket.IO             | 4.8.x      | WebSocket server                   |
| better-sqlite3        | 11.7.x     | Banco de dados SQLite síncrono     |
| Zod                   | 3.24.x     | Validação de schemas e env vars    |
| @google/generative-ai | 0.24.x     | SDK do Gemini                      |
| uuid                  | 11.x       | Geração de IDs                     |
| tsc-alias             | 1.8.x      | Resolução de path aliases no build |

### Testes

| Tecnologia | Uso                                           |
| ---------- | --------------------------------------------- |
| Vitest     | Framework de testes unitários e de integração |
| Supertest  | Testes HTTP de integração                     |

### Infraestrutura

| Tecnologia     | Uso                                          |
| -------------- | -------------------------------------------- |
| Docker         | Containerização com multi-stage build        |
| Docker Compose | Orquestração dos serviços frontend e backend |

---

## Estrutura de Diretórios

```
supvelo/
├── app/                          # Rotas do Next.js (App Router)
│   ├── page.tsx                  # Rota "/" → Interface do cliente
│   ├── agent/page.tsx            # Rota "/agent" → Interface do agente
│   ├── layout.tsx                # Layout raiz
│   └── globals.css               # Estilos globais
│
├── components/
│   ├── ClientChat/               # Interface de chat do cliente
│   │   └── ClientChatPage.tsx    # Formulário de nome + janela de chat
│   ├── Chat/                     # Componentes de chat reutilizáveis
│   │   ├── ChatWindow.tsx        # Janela de chat do agente
│   │   ├── MessageBubble.tsx     # Bolha de mensagem individual
│   │   ├── MessageInput.tsx      # Campo de entrada com envio
│   │   └── TypingIndicator.tsx   # Indicador "digitando..."
│   ├── Inbox/                    # Lista de atendimentos do agente
│   │   ├── ConversationList.tsx  # Lista de conversas
│   │   └── ConversationItem.tsx  # Item individual da lista
│   ├── Layout/
│   │   └── AppLayout.tsx         # Layout de 3 colunas (sidebar/chat/panel)
│   ├── TriagePanel/              # Painel de dados de triagem
│   │   ├── TriageInfoCard.tsx    # Exibe setor, intenção, confiança e resumo
│   │   └── SectorBadge.tsx       # Badge colorido do setor
│   └── SupVeloApp.tsx            # Componente raiz do painel do agente
│
├── hooks/
│   ├── useSocket.ts              # Gerencia eventos Socket.IO globais
│   ├── useClientChat.ts          # Estado do chat do cliente
│   ├── useConversations.ts       # Lista de conversas do agente
│   └── useMessage.ts             # Envio de mensagens e histórico
│
├── services/
│   ├── api.ts                    # Funções de chamada REST (axios)
│   └── socket.ts                 # Singleton do Socket.IO client
│
├── stores/
│   └── conversationStore.ts      # Store Zustand (conversas, mensagens, typing)
│
├── types/
│   ├── conversation.ts           # Tipos e enums de conversa (frontend)
│   └── message.ts                # Tipo Message (frontend)
│
├── public/
│   └── logo.png                  # Logo exibida na tela inicial do cliente
│
├── backend/
│   ├── src/
│   │   ├── main.ts               # Ponto de entrada: HTTP + Socket.IO
│   │   ├── config/
│   │   │   ├── env.ts            # Validação das variáveis de ambiente (Zod)
│   │   │   └── container.ts      # Injeção de dependência manual
│   │   ├── domain/
│   │   │   ├── entities/         # Conversation, Message (interfaces)
│   │   │   ├── enums/            # ConversationStatus, Sector, MessageRole
│   │   │   └── value-objects/    # TriageResult
│   │   ├── application/
│   │   │   ├── ports/            # Interfaces: IAIProvider, IConversationRepository,
│   │   │   │                     #   IMessageRepository, INotificationService
│   │   │   ├── usecases/         # CreateConversation, ProcessMessage,
│   │   │   │                     #   ListConversations, GetConversationHistory,
│   │   │   │                     #   TakeoverConversation
│   │   │   └── dtos/             # ProcessMessageInput/Output, ConversationSummaryDTO
│   │   └── infrastructure/
│   │       ├── ai/
│   │       │   ├── GeminiProvider.ts           # Implementação do IAIProvider
│   │       │   ├── prompts/system-prompt.ts    # Prompt do sistema
│   │       │   └── schemas/ai-response.ts      # Declaração de function calling
│   │       ├── database/
│   │       │   ├── connection.ts               # Inicialização do SQLite + migrations
│   │       │   ├── migrations/001-initial.sql  # Schema inicial
│   │       │   └── repositories/               # SQLiteConversationRepository,
│   │       │                                   #   SQLiteMessageRepository
│   │       ├── http/
│   │       │   ├── server.ts                   # createApp (Express)
│   │       │   ├── controllers/                # ConversationController, MessageController
│   │       │   ├── routes/                     # conversation.routes, message.routes
│   │       │   └── middlewares/                # error-handler, validation
│   │       └── websocket/
│   │           └── SocketNotificationService.ts  # Implementação do INotificationService
│   │
│   ├── tests/
│   │   ├── unit/usecases/
│   │   │   ├── ProcessMessageUseCase.test.ts
│   │   │   └── TakeoverConversationUseCase.test.ts
│   │   └── integration/api/
│   │       └── messages.test.ts
│   │
│   ├── tsconfig.json             # TypeScript com path aliases
│   ├── vitest.config.ts          # Vitest com aliases
│   ├── package.json
│   └── Dockerfile
│
├── Dockerfile                    # Frontend (Next.js standalone)
├── docker-compose.yml            # Orquestração dos serviços
├── .dockerignore
├── backend/.dockerignore
├── next.config.ts                # Configuração Next.js (standalone + rewrites)
├── tsconfig.json
└── package.json
```

---

## Domínio e Regras de Negócio

### Entidades

**Conversation**

```typescript
interface Conversation {
  id: string;
  clientName: string;
  status: ConversationStatus; // 'bot' | 'transferido' | 'em_atendimento'
  sector: Sector | null; // 'vendas' | 'suporte' | 'financeiro'
  intent: string | null; // intenção identificada pela IA
  summary: string | null; // resumo para o agente humano
  confidence: number | null; // confiança de 0 a 1
  createdAt: Date;
  updatedAt: Date;
}
```

**Message**

```typescript
interface Message {
  id: string;
  conversationId: string;
  role: MessageRole; // 'client' | 'bot' | 'agent'
  content: string;
  createdAt: Date;
}
```

### Máquina de Estados das Conversas

O ciclo de vida de uma conversa segue transições estritas e unidirecionais:

```
  BOT ──────────────────► TRANSFERRED ──────────────────► BEING_SERVED
 (bot)                    (transferido)                   (em_atendimento)

  [IA conduz]          [Aguardando agente]              [Agente assumiu]
  [Aceita msgs]        [Sem envio de msgs]              [Sem envio de msgs]
```

Transições permitidas:

- `BOT → TRANSFERRED`: ocorre quando a IA identifica o setor com confiança ≥ 0.75 e chama `classify_conversation` com `shouldTransfer: true`.
- `TRANSFERRED → BEING_SERVED`: ocorre quando um agente humano clica em "Assumir Atendimento" no painel.
- `BEING_SERVED → *`: não há transição válida. Estado terminal.

Qualquer tentativa de enviar mensagem para uma conversa fora do estado `BOT` resulta em `ConversationNotInBotStateError` (HTTP 409).

### Setores

| Valor (BD)   | Label      | Escopo                                         |
| ------------ | ---------- | ---------------------------------------------- |
| `vendas`     | Vendas     | Compras, negociação, preços, planos comerciais |
| `suporte`    | Suporte    | Erros técnicos, reclamações, acesso bloqueado  |
| `financeiro` | Financeiro | Boletos, notas fiscais, reembolsos, cobranças  |

---

## Backend — Clean Architecture

O backend segue os princípios de Clean Architecture com separação em quatro camadas. As dependências sempre apontam para dentro (em direção ao domínio), nunca para fora.

### Camada de Domínio (`src/domain/`)

Contém as regras de negócio fundamentais, sem dependência de nenhuma biblioteca externa. Inclui entidades (interfaces TypeScript), enums com suas lógicas de validação (como `isValidTransition`), e value objects como `TriageResult`.

### Camada de Aplicação (`src/application/`)

Orquestra o fluxo de dados entre o domínio e a infraestrutura através de Use Cases. Depende apenas do domínio e de interfaces (Ports), nunca de implementações concretas.

**Use Cases implementados:**

- `CreateConversationUseCase` — Cria uma nova conversa e notifica os agentes via WebSocket.
- `ProcessMessageUseCase` — Fluxo central: recebe mensagem do cliente → valida estado → salva mensagem → envia para IA com streaming de tokens → salva resposta do bot → atualiza triagem → emite notificações.
- `ListConversationsUseCase` — Retorna todas as conversas com preview da última mensagem.
- `GetConversationHistoryUseCase` — Retorna conversa + histórico completo de mensagens.
- `TakeoverConversationUseCase` — Transiciona conversa de `TRANSFERRED` para `BEING_SERVED`, valida a transição de estado e notifica todos os sockets.

**Ports (interfaces):**

- `IAIProvider` — Contrato para qualquer provedor de IA.
- `IConversationRepository` — Contrato para persistência de conversas.
- `IMessageRepository` — Contrato para persistência de mensagens.
- `INotificationService` — Contrato para envio de notificações em tempo real.

### Camada de Infraestrutura (`src/infrastructure/`)

Contém todas as implementações concretas. Cada implementação satisfaz uma interface da camada de aplicação, garantindo inversão de dependência.

### Container de Dependência (`src/config/container.ts`)

Injeção de dependência feita de forma manual e explícita. O container é criado uma única vez no bootstrap da aplicação e injetado nos controllers via closures das rotas.

```typescript
export function createContainer(io: SocketServer) {
  const db = createDatabase(env.DATABASE_PATH);
  const conversationRepo = new SQLiteConversationRepository(db);
  const messageRepo = new SQLiteMessageRepository(db);
  const aiProvider = new GeminiProvider(env.GEMINI_API_KEY);
  const notificationService = new SocketNotificationService(io);

  return {
    processMessageUseCase: new ProcessMessageUseCase(
      aiProvider,
      conversationRepo,
      messageRepo,
      notificationService,
    ),
    createConversationUseCase: new CreateConversationUseCase(
      conversationRepo,
      notificationService,
    ),
    listConversationsUseCase: new ListConversationsUseCase(
      conversationRepo,
      messageRepo,
    ),
    getConversationHistoryUseCase: new GetConversationHistoryUseCase(
      conversationRepo,
      messageRepo,
    ),
    takeoverConversationUseCase: new TakeoverConversationUseCase(
      conversationRepo,
      notificationService,
    ),
  };
}
```

---

## API REST

Todos os endpoints do backend estão disponíveis na porta `3001`. No frontend, as requisições são feitas em `/api/*`, que é redirecionado ao backend pelo proxy de rewrites do Next.js.

### Conversas

#### `GET /conversations`

Retorna a lista de todas as conversas com o preview da última mensagem.

**Response `200`:**

```json
[
  {
    "id": "uuid",
    "clientName": "Maria Silva",
    "status": "transferido",
    "sector": "financeiro",
    "intent": "pagamento de boleto",
    "summary": "Cliente com boleto vencido, precisa de segunda via",
    "confidence": 0.92,
    "lastMessagePreview": "Preciso de ajuda com meu boleto",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:35:00.000Z"
  }
]
```

#### `POST /conversations`

Cria uma nova conversa.

**Request body:**

```json
{ "clientName": "João Pedro" }
```

**Response `201`:**

```json
{
  "id": "uuid",
  "clientName": "João Pedro",
  "status": "bot",
  "sector": null,
  "intent": null,
  "summary": null,
  "confidence": null,
  "createdAt": "...",
  "updatedAt": "..."
}
```

#### `GET /conversations/:id/history`

Retorna a conversa e seu histórico completo de mensagens.

**Response `200`:**

```json
{
  "conversation": { "id": "...", "clientName": "...", "status": "bot" },
  "messages": [
    {
      "id": "...",
      "conversationId": "...",
      "role": "client",
      "content": "Olá",
      "createdAt": "..."
    },
    {
      "id": "...",
      "conversationId": "...",
      "role": "bot",
      "content": "Olá! Como posso ajudar?",
      "createdAt": "..."
    }
  ]
}
```

#### `PATCH /conversations/:id/takeover`

O agente humano assume a conversa. Requer que o status atual seja `transferido`.

**Response `200`:** Conversa atualizada com `status: "em_atendimento"`.

**Response `400`:** Se o status não for `transferido`.

**Response `404`:** Se a conversa não for encontrada.

### Mensagens

#### `POST /messages`

Envia uma mensagem do cliente para processamento pela IA. Este endpoint executa o fluxo completo de triagem.

**Request body:**

```json
{
  "conversationId": "uuid",
  "clientName": "João Pedro",
  "content": "Quero cancelar minha assinatura"
}
```

**Response `200`:**

```json
{
  "conversationId": "uuid",
  "clientMessage": {
    "id": "...",
    "content": "Quero cancelar...",
    "role": "client",
    "createdAt": "..."
  },
  "botMessage": {
    "id": "...",
    "content": "Entendido! Vou te transferir...",
    "role": "bot",
    "createdAt": "..."
  },
  "conversationStatus": "transferido",
  "sector": "financeiro",
  "intent": "cancelamento de assinatura",
  "shouldTransfer": true,
  "summary": "Cliente deseja cancelar assinatura",
  "confidence": 0.88
}
```

**Response `409`:** Se a conversa não estiver no estado `bot` (já transferida ou em atendimento).

### Tratamento de Erros

| Situação                        | Status HTTP |
| ------------------------------- | ----------- |
| Dados inválidos (Zod)           | 400         |
| Conversa não encontrada         | 404         |
| Conversa não está no estado BOT | 409         |
| Erro interno / IA indisponível  | 500         |

---

## Eventos WebSocket

O Socket.IO é utilizado para comunicação bidirecional em tempo real. O backend usa rooms (salas) para garantir que notificações de mensagens sejam enviadas apenas para os participantes de cada conversa.

### Eventos emitidos pelo Servidor

| Evento                      | Payload                                                           | Descrição                               |
| --------------------------- | ----------------------------------------------------------------- | --------------------------------------- |
| `new_message`               | `{ id, conversationId, role, content, createdAt }`                | Nova mensagem (cliente ou bot)          |
| `bot_typing`                | `{ token, conversationId }`                                       | Token de streaming da IA em tempo real  |
| `status_changed`            | `{ conversationId, status, sector, intent, summary, confidence }` | Mudança de status da conversa           |
| `conversation_list_updated` | —                                                                 | Sinaliza que a lista de conversas mudou |

### Eventos emitidos pelo Cliente

| Evento               | Payload                  | Descrição                                      |
| -------------------- | ------------------------ | ---------------------------------------------- |
| `join_conversation`  | `conversationId: string` | Entra na sala da conversa para receber eventos |
| `leave_conversation` | `conversationId: string` | Sai da sala da conversa                        |

> **Observação:** O Socket.IO conecta-se **diretamente** ao backend na porta `3001`, sem passar pelo proxy do Next.js. A URL de conexão é configurada via variável de ambiente `NEXT_PUBLIC_SOCKET_URL`. Em desenvolvimento local, o valor padrão é `http://localhost:3001`.

---

## Frontend

### Rota `/` — Interface do Cliente

Apresenta dois estados distintos:

**Tela de entrada:** Formulário com campo de nome e botão "Iniciar atendimento". Exibe a `logo.png` no topo. O submit pode ser feito por Enter ou clique.

**Tela de chat:** Uma janela de 600px de altura com header de status, área de mensagens com scroll automático, indicador de digitação em tempo real (streaming de tokens) e campo de entrada. O campo de entrada é desabilitado e exibe uma mensagem informativa quando o status é `transferido` ou `em_atendimento`.

### Rota `/agent` — Interface do Agente

Layout de três colunas:

- **Sidebar esquerda:** Lista de conversas com badge de status colorido, nome do cliente, preview da última mensagem e setor. Conversas são atualizadas em tempo real via `conversation_list_updated`.
- **Coluna central:** Janela de chat completa com histórico de mensagens e botão "Assumir Atendimento" (visível apenas para conversas com status `transferido`).
- **Painel direito:** Card de informações de triagem com setor, intenção detectada, índice de confiança (barra visual) e resumo gerado pela IA para o agente.

### Gerenciamento de Estado (Zustand)

O store central `useConversationStore` gerencia:

- Lista de conversas com `upsertConversation` (cria ou atualiza por ID)
- Mensagens por conversa (Record keyed by conversationId)
- Buffer de typing por conversa para o streaming de tokens
- Conversa selecionada

---

## Integração com IA (Gemini)

### Modelo

`gemini-2.0-flash` — modelo rápido e eficiente para casos de uso conversacional.

### Prompt do Sistema

O sistema instrui a IA a:

1. Sempre responder em **Português Brasileiro** (pt-BR), independente do idioma do cliente.
2. Saudar o cliente na primeira mensagem.
3. Fazer no máximo 2 perguntas para identificar a intenção.
4. Classificar no setor correto (`vendas`, `suporte` ou `financeiro`).
5. Transferir quando a confiança atingir **≥ 0.75**, informando o cliente antes.
6. Recusar assuntos fora do escopo de forma educada.

### Function Calling

Após **cada resposta**, a IA é obrigada a chamar a função `classify_conversation`, que retorna a classificação atual da triagem:

```typescript
{
  intent?: string | null,       // Ex: "pagamento de boleto"
  sector?: string | null,       // "vendas" | "suporte" | "financeiro"
  confidence: number,           // 0 a 1 (0.3 = incerto, 0.75+ = transferir)
  shouldTransfer: boolean,      // true quando deve transferir agora
  summary?: string | null,      // resumo para o agente (apenas quando shouldTransfer = true)
}
```

Isso garante que mesmo respostas parciais (sem intenção definitiva) atualizem progressivamente os dados de triagem visíveis no painel do agente.

### Streaming de Tokens

A IA processa as respostas em modo de streaming (`sendMessageStream`). Cada token é emitido em tempo real via WebSocket (`bot_typing`) para ambas as interfaces, garantindo experiência responsiva ao usuário.

### Histórico

São enviadas no máximo as **20 mensagens mais recentes** para a IA, evitando extrapolação do limite de contexto e reduzindo custo por requisição.

### Tratamento de Erros

O `GeminiProvider` trata o erro HTTP 429 (quota exceeded) e o transforma em uma mensagem amigável ao usuário. Erros genéricos são relançados e capturados pelo middleware de error handling do Express.

---

## Banco de Dados

SQLite com `better-sqlite3` (API síncrona). O arquivo do banco é persistido em `/data/triage.db` dentro do container Docker.

### Schema

```sql
-- Tabela de conversas
CREATE TABLE conversations (
  id          TEXT PRIMARY KEY,
  client_name TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'bot'
              CHECK(status IN ('bot', 'transferido', 'em_atendimento')),
  sector      TEXT CHECK(sector IN ('vendas', 'suporte', 'financeiro')),
  intent      TEXT,
  summary     TEXT,
  confidence  REAL,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de mensagens
CREATE TABLE messages (
  id              TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL,
  role            TEXT NOT NULL CHECK(role IN ('client', 'bot', 'agent')),
  content         TEXT NOT NULL,
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (conversation_id) REFERENCES conversations(id)
);

-- Índices para performance
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_conversations_status ON conversations(status);
CREATE INDEX idx_messages_created_at ON messages(created_at);
```

O schema é aplicado automaticamente na inicialização via migração SQL (`001-initial.sql`) usando `CREATE TABLE IF NOT EXISTS`, tornando o processo idempotente.

---

## Testes

Os testes são executados com **Vitest** e cobrem os use cases principais e a API de integração.

```bash
cd backend
npm test
```

**Resultado esperado: 8 testes passando.**

### Testes Unitários

**`ProcessMessageUseCase.test.ts`** (3 testes)

- Deve criar nova conversa e processar mensagem quando `conversationId` não existe
- Deve lançar `ConversationNotInBotStateError` quando a conversa não está no estado BOT
- Deve atualizar status para `TRANSFERRED` quando a IA decide transferir

**`TakeoverConversationUseCase.test.ts`** (3 testes)

- Deve assumir a conversa com sucesso quando o status é `TRANSFERRED`
- Deve lançar erro quando a conversa não é encontrada
- Deve lançar erro quando a conversa não está no estado `TRANSFERRED`

### Testes de Integração

**`messages.test.ts`** (2 testes)

- `POST /messages` deve retornar 200 e os dados da mensagem/triagem
- `POST /messages` deve retornar 409 quando a conversa já foi transferida

Os testes de integração utilizam um banco SQLite **in-memory** e mockam o `GeminiProvider` com `vi.mock`, garantindo isolamento completo da IA externa.

---

## Docker e Containerização

### Frontend (`Dockerfile` — raiz)

Build multi-stage usando a saída `standalone` do Next.js para minimizar o tamanho da imagem final:

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG BACKEND_URL=http://localhost:3001
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
CMD ["node", "server.js"]
```

> **Importante:** O `BACKEND_URL` é um `ARG` de build (não variável de ambiente em runtime), pois os rewrites do Next.js são avaliados em tempo de compilação. O valor correto (`http://backend:3001`) é injetado via `args` no `docker-compose.yml`.

### Backend (`backend/Dockerfile`)

Build multi-stage com suporte a módulos nativos (necessário para o `better-sqlite3`):

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
RUN apk add --no-cache python3 make g++
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
RUN cp -r src/infrastructure/database/migrations dist/infrastructure/database/migrations

FROM node:20-alpine AS runner
WORKDIR /app
RUN apk add --no-cache python3 make g++
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
RUN mkdir -p /data
EXPOSE 3001
CMD ["node", "dist/main.js"]
```

> **Observação:** As ferramentas `python3 make g++` são necessárias em ambos os estágios porque o `better-sqlite3` possui código nativo (`.node`) que precisa ser compilado para a plataforma de destino.

### Docker Compose

```yaml
version: "3.8"

services:
  backend:
    build:
      context: ./backend
    ports:
      - "3001:3001"
    environment:
      - GEMINI_API_KEY=${GEMINI_API_KEY}
      - DATABASE_PATH=/data/triage.db
      - FRONTEND_URL=http://localhost:3000
      - NODE_ENV=production
      - PORT=3001
    volumes:
      - db-data:/data
    restart: unless-stopped

  frontend:
    build:
      context: .
      args:
        NEXT_PUBLIC_SOCKET_URL: http://localhost:3001
        BACKEND_URL: http://backend:3001
    ports:
      - "3000:3000"
    environment:
      - BACKEND_URL=http://backend:3001
    depends_on:
      - backend
    restart: unless-stopped

volumes:
  db-data:
    driver: local
```

A comunicação entre os serviços usa o nome de host interno do Docker (`backend`), enquanto o Socket.IO do cliente conecta-se em `localhost:3001` (mapeamento de porta para o host).

---

## Variáveis de Ambiente

### Backend (`backend/.env`)

| Variável         | Obrigatória | Padrão                  | Descrição                                      |
| ---------------- | ----------- | ----------------------- | ---------------------------------------------- |
| `GEMINI_API_KEY` | ✅ Sim      | —                       | Chave da API do Google Gemini                  |
| `PORT`           | Não         | `3001`                  | Porta do servidor HTTP                         |
| `DATABASE_PATH`  | Não         | `./data/triage.db`      | Caminho do arquivo SQLite                      |
| `FRONTEND_URL`   | Não         | `http://localhost:3000` | Origem permitida no CORS do Socket.IO          |
| `NODE_ENV`       | Não         | `development`           | Ambiente (`development`, `production`, `test`) |

### Frontend

| Variável                 | Tipo      | Padrão                  | Descrição                                     |
| ------------------------ | --------- | ----------------------- | --------------------------------------------- |
| `BACKEND_URL`            | Build ARG | `http://localhost:3001` | URL do backend para os rewrites do Next.js    |
| `NEXT_PUBLIC_SOCKET_URL` | Build ARG | `http://localhost:3001` | URL do backend para o Socket.IO (client-side) |

### Arquivo `.env` na raiz (para Docker Compose)

```env
GEMINI_API_KEY=sua_chave_aqui
```

> **Atenção:** Ao criar o arquivo `.env` no Windows, use UTF-8 sem BOM. Encodings como UTF-16 (padrão do PowerShell `echo`) causam falha ao ler o arquivo no Docker Compose. Use o VS Code ou `Out-File -Encoding utf8NoBOM` para criar o arquivo corretamente.

---

## Como Rodar

### Pré-requisitos

- Node.js 20+
- Docker Desktop (para rodar via containers)
- Chave de API do Google Gemini — [obter aqui](https://aistudio.google.com/app/apikey)

### Desenvolvimento local

**Backend:**

```bash
cd backend
cp .env.example .env
# Preencha GEMINI_API_KEY no .env
npm install
npm run dev
```

**Frontend** (em outro terminal, na raiz do projeto):

```bash
npm install
npm run dev
```

Acesse:

- Interface do cliente: `http://localhost:3000`
- Interface do agente: `http://localhost:3000/agent`

### Com Docker

**1. Crie o arquivo `.env` na raiz do projeto:**

```env
GEMINI_API_KEY=sua_chave_api_aqui
```

**2. Suba os containers:**

```bash
docker-compose up --build
```

**3. Acesse:**

- Interface do cliente: `http://localhost:3000`
- Interface do agente: `http://localhost:3000/agent`

O banco de dados é persistido no volume Docker `db-data` e sobrevive a reinicializações dos containers.

### Testes

```bash
cd backend
npm test
```

Para modo watch durante o desenvolvimento:

```bash
npm run test:watch
```

### Scripts disponíveis

**Backend:**

| Script               | Descrição                                                      |
| -------------------- | -------------------------------------------------------------- |
| `npm run dev`        | Inicia em modo de desenvolvimento com hot reload (`tsx watch`) |
| `npm run build`      | Compila TypeScript e resolve path aliases (`tsc && tsc-alias`) |
| `npm start`          | Inicia o servidor compilado (`node dist/main.js`)              |
| `npm test`           | Executa todos os testes com Vitest                             |
| `npm run test:watch` | Vitest em modo watch                                           |

**Frontend:**

| Script          | Descrição                                    |
| --------------- | -------------------------------------------- |
| `npm run dev`   | Inicia o servidor de desenvolvimento Next.js |
| `npm run build` | Compila para produção                        |
| `npm start`     | Inicia o servidor de produção Next.js        |

---

## Decisões de Arquitetura

**Por que SQLite?** Simplicidade operacional sem necessidade de servidor de banco de dados dedicado. Para os volumes de atendimento esperados, SQLite com `better-sqlite3` (síncrono) oferece excelente performance e sem overhead de conexão.

**Por que Clean Architecture no backend?** A separação em camadas permite trocar implementações sem afetar a lógica de negócio. Por exemplo, é possível substituir o Gemini por outro LLM (Claude, GPT-4) implementando apenas a interface `IAIProvider`, ou trocar SQLite por PostgreSQL implementando novos repositórios — sem tocar nos use cases.

**Por que injeção de dependência manual?** O projeto não utiliza frameworks de DI (como InversifyJS) deliberadamente. O `container.ts` é simples, explícito e não adiciona complexidade desnecessária ao projeto.

**Por que tsc-alias?** O TypeScript resolve path aliases (`@domain/*`, `@application/*`) em tempo de compilação para type-checking, mas não os transforma no output JavaScript. O `tsc-alias` resolve esse problema no pós-processamento, tornando o build compatível com Node.js sem configuração adicional de module resolution.

**Por que BACKEND_URL é um ARG de build no Docker?** Os rewrites do Next.js são avaliados durante o `next build`, não em runtime. Isso significa que a variável de ambiente precisa estar disponível no momento do build, não apenas ao iniciar o container. A URL `http://backend:3001` (rede interna do Docker) é injetada via `args` no `docker-compose.yml`.

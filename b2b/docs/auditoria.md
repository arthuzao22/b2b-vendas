# Code Citations

## License: MIT
https://github.com/mvolfik/eyp-calls/blob/9b73c12f57172aade13a6592ebf9b45c2571e6e9/frontend-worker/src/index.js

```
Agora tenho toda a informação necessária para compilar o relatório completo. Aqui está a auditoria:

---

# AUDITORIA COMPLETA — B2B MARKETPLACE

## Data: 16/02/2026 | Branch: `copilot/fix-organize-and-complete-frontend`

---

# 🚨🚨🚨 FALHAS CRÍTICAS DE PRODUÇÃO 🚨🚨🚨

Antes de qualquer análise ordenada, destaco imediatamente as falhas que **permitem comprometimento total do sistema**:

### FALHA CRÍTICA #1 — Qualquer pessoa pode se tornar ADMIN

> 🚨 RISCO CRÍTICO DE PRODUÇÃO

**Arquivo:** [app/api/auth/register/route.ts](app/api/auth/register/route.ts#L9)

```typescript
// QUALQUER PESSOA pode chamar esta API e se criar como admin:
const registerSchema = z.object({
  tipo: z.enum(['admin', 'fornecedor', 'cliente']) // ← ACEITA 'admin'
})
```

**Risco:** Escalação de privilégio total. Qualquer atacante faz `POST /api/auth/register` com `{"tipo": "admin"}` e obtém acesso administrativo.

**Classificação:** **CRÍTICO**

**Correção:**
```typescript
const registerSchema = z.object({
  tipo: z.enum(['fornecedor', 'cliente']) // REMOVER 'admin'
})
```

---

### FALHA CRÍTICA #2 — Auditoria totalmente aberta (auth COMENTADA)

> 🚨 RISCO CRÍTICO DE PRODUÇÃO

**Arquivo:** [app/api/audit/route.ts](app/api/audit/route.ts#L16-L21)

```typescript
// TODO: Add authentication check    ← LITERALMENTE UM TODO
// const session = await getServerSession();
// if (!session || session.user.role !== 'ADMIN') {
```

**Risco:** Qualquer pessoa acessa `GET /api/audit` e vê TODOS os logs de auditoria: IPs de usuários, user agents, ações, timestamps. Informação perfeita para um atacante mapear o sistema.

**Classificação:** **CRÍTICO**

---

### FALHA CRÍTICA #3 — Endpoint de email 100% aberto (phishing/spam)

> 🚨 RISCO CRÍTICO DE PRODUÇÃO

**Arquivo:** [app/api/email/send/route.ts](app/api/email/send/route.ts)

**Sem autenticação.** Qualquer pessoa envia e-mails arbitrários (incluindo HTML customizado) para qualquer endereço usando sua infraestrutura:

```bash
curl -X POST /api/email/send -d '{
  "type": "custom",
  "to": "vitima@empresa.com",
  "subject": "Urgente",
  "html": "<h1>Phishing</h1><a href=\"http://malware.com\">Clique aqui</a>"
}'
```

**Risco:** Vetor de phishing e spam usando seu domínio. Pode colocar seu domínio em blacklists de e-mail.

**Classificação:** **CRÍTICO** (todos os 4 endpoints de email: `/send`, `/test`, `/logs`, `/stats`)

---

### FALHA CRÍTICA #4 — Categorias sem filtro de tenant

> 🚨 RISCO CRÍTICO DE PRODUÇÃO

**Arquivo:** [modules/categorias/repository.ts](modules/categorias/repository.ts)

O repository de categorias recebe `fornecedorId` como parâmetro mas **IGNORA completamente**:

```typescript
async findAll(fornecedorId: string): Promise<Categoria[]> {
  return this.prisma.categoria.findMany({
    orderBy: { nome: 'asc' },
    // ← ZERO filtro por fornecedorId!
  })
}

async findById(id: string, fornecedorId: string): Promise<Categoria | null> {
  return this.prisma.categoria.findFirst({
    where: { id },  // ← SEM filtro por fornecedorId!
  })
}
```

**Risco:** Fornecedor A vê, edita e deleta categorias do Fornecedor B. **Vazamento de dados entre tenants.**

**Classificação:** **CRÍTICO** — IDOR / Broken Access Control

**Nota:** O modelo `Categoria` no schema Prisma **não tem campo `fornecedorId`**. A tabela de categorias é **global**, sem isolamento de tenant. Isso precisa ser redesenhado.

---

# 🔐 1. ANÁLISE DE SEGURANÇA COMPLETA

## 1.1 Vulnerabilidades por Severidade

### CRÍTICAS (5)

| # | Vulnerabilidade | Endpoint | Tipo |
|---|---|---|---|
| C1 | Criação de admin público | `/api/auth/register` | Privilege Escalation |
| C2 | Auth comentada em auditoria | `/api/audit` | Broken Auth |
| C3 | Email aberto (4 endpoints) | `/api/email/*` | Broken Auth + Spam |
| C4 | Categorias sem tenant filter | `/api/categorias/*` | IDOR |
| C5 | Sem middleware.ts global | Global | Missing Security Layer |

### ALTAS (8)

| # | Vulnerabilidade | Endpoint | Tipo |
|---|---|---|---|
| A1 | `getServerSession()` sem `authOptions` | `/api/fornecedor/*` (5 rotas) | Broken Auth |
| A2 | Módulo security inteiro não utilizado | Global | Dead Code / Missing Security |
| A3 | Dados mock sem isolamento tenant | `/api/fornecedor/*` | IDOR |
| A4 | `user.fornecedorId!` crash para admin | `/api/produtos` | Runtime Error |
| A5 | Rate limiting não implementado em nenhum endpoint | Global | DoS |
| A6 | CSRF protection não implementada | Global | CSRF |
| A7 | Sanitização de input não utilizada | Global | XSS |
| A8 | bcrypt salt rounds = 10 no register antigo | `/api/auth/register` | Weak Crypto |

### MÉDIAS (6)

| # | Vulnerabilidade | Endpoint | Tipo |
|---|---|---|---|
| M1 | Dois endpoints de registro com regras diferentes | `/register` vs `/registro` | Inconsistência |
| M2 | Senha mínima 6 chars no `/register` vs 8 no schema | `/api/auth/register` | Weak Validation |
| M3 | Health check expõe versão, uptime, DB response times | `/api/health` | Info Disclosure |
| M4 | POST de pedidos aceita qualquer body | `/api/fornecedor/pedidos` | Mass Assignment |
| M5 | `console.error` usado em vários endpoints | Múltiplos | Info Leak |
| M6 | CNPJ temporário com padrão previsível | `/api/auth/register` | Data Integrity |

### BAIXAS (3)

| # | Vulnerabilidade | Endpoint | Tipo |
|---|---|---|---|
| B1 | Sem validação de `parseInt`/`parseFloat` (NaN) | `/api/public/produtos` | Input Validation |
| B2 | Sem limit máximo em `/api/public/produtos` | `/api/public/produtos` | DoS |
| B3 | Error messages em inglês misturado com português | Múltiplos | Usability |

---

## 1.2 Detalhamento das Vulnerabilidades Críticas e Altas

### C1 — Privilege Escalation via Register

**Como explorar:**
```bash
curl -X POST https://seusite.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"nome":"Hacker","email":"hacker@evil.com","senha":"123456","tipo":"admin"}'
```

**Correção completa:**
```typescript
// app/api/auth/register/route.ts — DEVE SER REESCRITO OU REMOVIDO
// Usar apenas /api/auth/registro que já restringe tipos

const registerSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  email: emailSchema, // usar schema compartilhado
  senha: senhaSchema, // usar schema compartilhado (8 chars + complexidade)
  tipo: z.enum(['fornecedor', 'cliente']), // NUNCA aceitar 'admin'
})
```

### A1 — getServerSession() sem authOptions

**Arquivo afetado:** Todos em `/api/fornecedor/*`

**Problema:** Os endpoints importam `getServerSession` diretamente de `next-auth` ao invés do wrapper em [lib/auth/session.ts](lib/auth/session.ts) que passa `authOptions`. Sem `authOptions`, o NextAuth pode retornar uma sessão sem os campos customizados (`tipo`, `fornecedorId`, `clienteId`).

```typescript
// ❌ ERRADO (usado em todos os endpoints de fornecedor)
import { getServerSession } from 'next-auth';
const session = await getServerSession(); // sem authOptions!

// ✅ CORRETO
import { requireRole } from '@/lib/auth/session';
const user = await requireRole(['fornecedor']);
```

### A4 — Non-null assertion crash

**Arquivo:** [app/api/produtos/route.ts](app/api/produtos/route.ts)

```typescript
// Se user.tipo === 'admin', user.fornecedorId é undefined
const resultado = await produtoService.listar(user.fornecedorId!, ...);
// Runtime crash: Cannot read properties of undefined
```

**Correção:**
```typescript
export async function GET(request: Request) {
  const user = await requireRole(['fornecedor', 'admin']);

  let fornecedorId: string;
  
  if (user.tipo === 'admin') {
    // Admin precisa especificar o fornecedor ou ver todos
    fornecedorId = searchParams.get('fornecedorId') || '';
    if (!fornecedorId) {
      // Retornar lista de todos fornecedores ou erro
      return NextResponse.json(
        { error: 'Admin deve especificar fornecedorId' },
        { status: 400 }
      );
    }
  } else {
    if (!user.fornecedorId) {
      return NextResponse.json(
        { error: 'Fornecedor não encontrado' },
        { status: 404 }
      );
    }
    fornecedorId = user.fornecedorId;
  }
}
```

---

# 🧭 2. MAPEAMENTO COMPLETO DE ROTAS

| # | Método | Rota | Auth | RBAC | Validação | Multi-tenant | Usado no Frontend | Status |
|---|--------|------|------|------|-----------|-------------|-------------------|--------|
| 1 | GET/POST | `/api/auth/[...nextauth]` | NextAuth | - | NextAuth | - | Sim | OK |
| 2 | POST | `/api/auth/register` | **NÃO** | **NÃO** | Zod (fraca) | - | Sim | **CRÍTICO** |
| 3 | POST | `/api/auth/registro` | **NÃO** | **NÃO** | Zod (boa) | - | ? | **DUPLICADA** |
| 4 | GET/POST | `/api/produtos` | SIM | SIM | Zod | Parcial | Sim | MÉDIA |
| 5 | GET/PATCH/DELETE | `/api/produtos/[id]` | SIM | SIM | Zod | SIM | Sim | MÉDIA |
| 6 | GET | `/api/public/produtos` | NÃO (público) | - | **NÃO** | - | Sim | BAIXA |
| 7 | GET/POST | `/api/categorias` | SIM | SIM | Zod | **FALSO** | Sim | **CRÍTICO** |
| 8 | GET/PUT/DELETE | `/api/categorias/[id]` | SIM | SIM | Zod | **FALSO** | Sim | **CRÍTICO** |
| 9 | POST | `/api/email/send` | **NÃO** | **NÃO** | Zod | - | ? | **CRÍTICO** |
| 10 | GET | `/api/email/logs` | **NÃO** | **NÃO** | **NÃO** | - | ? | **CRÍTICO** |
| 11 | GET | `/api/email/test` | **NÃO** | **NÃO** | **NÃO** | - | NÃO | **REMOVER** |
| 12 | GET | `/api/email/stats` | **NÃO** | **NÃO** | **NÃO** | - | ? | **CRÍTICO** |
| 13 | GET/POST | `/api/fornecedor/pedidos` | SIM* | SIM* | **NÃO** | **NÃO (mock)** | Sim | ALTA |
| 14 | GET/PATCH | `/api/fornecedor/pedidos/[id]` | SIM* | SIM* | **NÃO** | **NÃO (mock)** | Sim | ALTA |
| 15 | GET/POST/DELETE | `/api/fornecedor/precos` | SIM* | SIM* | **NÃO** | **NÃO (mock)** | Sim | ALTA |
| 16 | GET/PATCH | `/api/fornecedor/estoque` | SIM* | SIM* | Mínima | **NÃO (mock)** | Sim | ALTA |
| 17 | GET | `/api/fornecedor/clientes` | SIM* | SIM* | **NÃO** | **NÃO (mock)** | Sim | ALTA |
| 18 | GET/POST | `/api/audit` | **NÃO** | **NÃO** | **NÃO** | - | NÃO | **CRÍTICO** |
| 19 | GET | `/api/health` | NÃO (público) | - | N/A | - | NÃO | BAIXA |

**\* = usa `getServerSession()` sem `authOptions`** — potencialmente inseguro

### Rotas para remover ou desativar imediatamente:
1. `/api/email/test` — endpoint de teste, não deveria existir em produção
2. `/api/auth/register` — duplicata insegura, usar `/api/auth/registro`

### Rotas redundantes:
- `/api/auth/register` e `/api/auth/registro` fazem a mesma coisa com validações diferentes

### Rotas mortas (sem uso no frontend confirmado):
- `/api/audit` (auth comentada)
- `/api/email/stats`
- `/api/email/logs`

---

# 🧠 3. ANÁLISE DE ARQUITETURA

## 3.1 O que está BOM

| Aspecto | Avaliação | Detalhes |
|---------|-----------|---------|
| Separação em camadas | **Parcial** | Módulos de `produtos` e `categorias` seguem Controller-Service-Repository |
| Erros tipados | **BOM** | Hierarquia de `AppError` bem definida |
| Validação com Zod | **Parcial** | Schemas existem para produtos e auth |
| Logging estruturado | **BOM** | Winston configurado, usado nos módulos novos |
| Base classes | **BOM** | `BaseController`, `BaseService`, `BaseRepository` |
| Paginação | **BOM** | Implementada em produtos e auditoria |
| DTOs | **Parcial** | Alguns endpoints retornam entidades diretamente |

## 3.2 O que está RUIM

### 3.2.1 — Inconsistência arquitetural grave

Existem **dois padrões completamente diferentes** convivendo:

**Padrão A (modular, correto):** `produtos`, `categorias`, `auth`
- Service layer ✅
- Repository layer ✅  
- Schemas Zod ✅
- Tipos definidos ✅
- Logging estruturado ✅

**Padrão B (inline, inseguro):** `fornecedor/*`, `email/*`, `audit`
- Lógica diretamente na route ❌
- Dados mock hardcoded ❌
- Sem validação ❌
- `console.error` ao invés de logger ❌
- Sem repository ❌

### 3.2.2 — Controllers "gordos" nos endpoints de fornecedor

Todos os endpoints em `/api/fornecedor/*` têm a lógica inteira na route. Sem service, sem repository, sem validação.

### 3.2.3 — Resposta de API não padronizada

Padrão A retorna:
```json
{ "success": true, "data": {...}, "meta": {...} }
```

Padrão B retorna:
```json
{ "success": true, "data": [...] }
// ou simplesmente:
{ "error": "Unauthorized" }
```

### 3.2.4 — Módulo de segurança inteiro implementado mas JAMAIS chamado

`lib/security/` contém ~700 linhas de código de segurança (rate limiter, CSRF, sanitizer, headers, file validator) que **não são utilizadas em LUGAR NENHUM**. Código morto.

### 3.2.5 — Categorias sem pertencimento a fornecedor

O model `Categoria` no Prisma não tem `fornecedorId`. As categorias são **globais**. Em um marketplace multi-tenant, cada fornecedor deveria ter suas próprias categorias.

---

# 🚀 4. MELHORIAS FUNCIONAIS

## 4.1 Prioridade CRÍTICA (implementar antes de ir para produção)

### 1. Middleware Global (`middleware.ts`)
**Por quê:** Sem middleware, cada endpoint precisa implementar sua própria segurança. Um esquecimento = vulnerabilidade.

```typescript
// middleware.ts (raiz do projeto)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

const PUBLIC_ROUTES = ['/api/auth', '/api/public', '/api/health', '/login', '/register'];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  // Security headers em TODAS as respostas
  const response = NextResponse.next();
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin
```


## License: MIT
https://github.com/mvolfik/eyp-calls/blob/9b73c12f57172aade13a6592ebf9b45c2571e6e9/frontend-worker/src/index.js

```
Agora tenho toda a informação necessária para compilar o relatório completo. Aqui está a auditoria:

---

# AUDITORIA COMPLETA — B2B MARKETPLACE

## Data: 16/02/2026 | Branch: `copilot/fix-organize-and-complete-frontend`

---

# 🚨🚨🚨 FALHAS CRÍTICAS DE PRODUÇÃO 🚨🚨🚨

Antes de qualquer análise ordenada, destaco imediatamente as falhas que **permitem comprometimento total do sistema**:

### FALHA CRÍTICA #1 — Qualquer pessoa pode se tornar ADMIN

> 🚨 RISCO CRÍTICO DE PRODUÇÃO

**Arquivo:** [app/api/auth/register/route.ts](app/api/auth/register/route.ts#L9)

```typescript
// QUALQUER PESSOA pode chamar esta API e se criar como admin:
const registerSchema = z.object({
  tipo: z.enum(['admin', 'fornecedor', 'cliente']) // ← ACEITA 'admin'
})
```

**Risco:** Escalação de privilégio total. Qualquer atacante faz `POST /api/auth/register` com `{"tipo": "admin"}` e obtém acesso administrativo.

**Classificação:** **CRÍTICO**

**Correção:**
```typescript
const registerSchema = z.object({
  tipo: z.enum(['fornecedor', 'cliente']) // REMOVER 'admin'
})
```

---

### FALHA CRÍTICA #2 — Auditoria totalmente aberta (auth COMENTADA)

> 🚨 RISCO CRÍTICO DE PRODUÇÃO

**Arquivo:** [app/api/audit/route.ts](app/api/audit/route.ts#L16-L21)

```typescript
// TODO: Add authentication check    ← LITERALMENTE UM TODO
// const session = await getServerSession();
// if (!session || session.user.role !== 'ADMIN') {
```

**Risco:** Qualquer pessoa acessa `GET /api/audit` e vê TODOS os logs de auditoria: IPs de usuários, user agents, ações, timestamps. Informação perfeita para um atacante mapear o sistema.

**Classificação:** **CRÍTICO**

---

### FALHA CRÍTICA #3 — Endpoint de email 100% aberto (phishing/spam)

> 🚨 RISCO CRÍTICO DE PRODUÇÃO

**Arquivo:** [app/api/email/send/route.ts](app/api/email/send/route.ts)

**Sem autenticação.** Qualquer pessoa envia e-mails arbitrários (incluindo HTML customizado) para qualquer endereço usando sua infraestrutura:

```bash
curl -X POST /api/email/send -d '{
  "type": "custom",
  "to": "vitima@empresa.com",
  "subject": "Urgente",
  "html": "<h1>Phishing</h1><a href=\"http://malware.com\">Clique aqui</a>"
}'
```

**Risco:** Vetor de phishing e spam usando seu domínio. Pode colocar seu domínio em blacklists de e-mail.

**Classificação:** **CRÍTICO** (todos os 4 endpoints de email: `/send`, `/test`, `/logs`, `/stats`)

---

### FALHA CRÍTICA #4 — Categorias sem filtro de tenant

> 🚨 RISCO CRÍTICO DE PRODUÇÃO

**Arquivo:** [modules/categorias/repository.ts](modules/categorias/repository.ts)

O repository de categorias recebe `fornecedorId` como parâmetro mas **IGNORA completamente**:

```typescript
async findAll(fornecedorId: string): Promise<Categoria[]> {
  return this.prisma.categoria.findMany({
    orderBy: { nome: 'asc' },
    // ← ZERO filtro por fornecedorId!
  })
}

async findById(id: string, fornecedorId: string): Promise<Categoria | null> {
  return this.prisma.categoria.findFirst({
    where: { id },  // ← SEM filtro por fornecedorId!
  })
}
```

**Risco:** Fornecedor A vê, edita e deleta categorias do Fornecedor B. **Vazamento de dados entre tenants.**

**Classificação:** **CRÍTICO** — IDOR / Broken Access Control

**Nota:** O modelo `Categoria` no schema Prisma **não tem campo `fornecedorId`**. A tabela de categorias é **global**, sem isolamento de tenant. Isso precisa ser redesenhado.

---

# 🔐 1. ANÁLISE DE SEGURANÇA COMPLETA

## 1.1 Vulnerabilidades por Severidade

### CRÍTICAS (5)

| # | Vulnerabilidade | Endpoint | Tipo |
|---|---|---|---|
| C1 | Criação de admin público | `/api/auth/register` | Privilege Escalation |
| C2 | Auth comentada em auditoria | `/api/audit` | Broken Auth |
| C3 | Email aberto (4 endpoints) | `/api/email/*` | Broken Auth + Spam |
| C4 | Categorias sem tenant filter | `/api/categorias/*` | IDOR |
| C5 | Sem middleware.ts global | Global | Missing Security Layer |

### ALTAS (8)

| # | Vulnerabilidade | Endpoint | Tipo |
|---|---|---|---|
| A1 | `getServerSession()` sem `authOptions` | `/api/fornecedor/*` (5 rotas) | Broken Auth |
| A2 | Módulo security inteiro não utilizado | Global | Dead Code / Missing Security |
| A3 | Dados mock sem isolamento tenant | `/api/fornecedor/*` | IDOR |
| A4 | `user.fornecedorId!` crash para admin | `/api/produtos` | Runtime Error |
| A5 | Rate limiting não implementado em nenhum endpoint | Global | DoS |
| A6 | CSRF protection não implementada | Global | CSRF |
| A7 | Sanitização de input não utilizada | Global | XSS |
| A8 | bcrypt salt rounds = 10 no register antigo | `/api/auth/register` | Weak Crypto |

### MÉDIAS (6)

| # | Vulnerabilidade | Endpoint | Tipo |
|---|---|---|---|
| M1 | Dois endpoints de registro com regras diferentes | `/register` vs `/registro` | Inconsistência |
| M2 | Senha mínima 6 chars no `/register` vs 8 no schema | `/api/auth/register` | Weak Validation |
| M3 | Health check expõe versão, uptime, DB response times | `/api/health` | Info Disclosure |
| M4 | POST de pedidos aceita qualquer body | `/api/fornecedor/pedidos` | Mass Assignment |
| M5 | `console.error` usado em vários endpoints | Múltiplos | Info Leak |
| M6 | CNPJ temporário com padrão previsível | `/api/auth/register` | Data Integrity |

### BAIXAS (3)

| # | Vulnerabilidade | Endpoint | Tipo |
|---|---|---|---|
| B1 | Sem validação de `parseInt`/`parseFloat` (NaN) | `/api/public/produtos` | Input Validation |
| B2 | Sem limit máximo em `/api/public/produtos` | `/api/public/produtos` | DoS |
| B3 | Error messages em inglês misturado com português | Múltiplos | Usability |

---

## 1.2 Detalhamento das Vulnerabilidades Críticas e Altas

### C1 — Privilege Escalation via Register

**Como explorar:**
```bash
curl -X POST https://seusite.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"nome":"Hacker","email":"hacker@evil.com","senha":"123456","tipo":"admin"}'
```

**Correção completa:**
```typescript
// app/api/auth/register/route.ts — DEVE SER REESCRITO OU REMOVIDO
// Usar apenas /api/auth/registro que já restringe tipos

const registerSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  email: emailSchema, // usar schema compartilhado
  senha: senhaSchema, // usar schema compartilhado (8 chars + complexidade)
  tipo: z.enum(['fornecedor', 'cliente']), // NUNCA aceitar 'admin'
})
```

### A1 — getServerSession() sem authOptions

**Arquivo afetado:** Todos em `/api/fornecedor/*`

**Problema:** Os endpoints importam `getServerSession` diretamente de `next-auth` ao invés do wrapper em [lib/auth/session.ts](lib/auth/session.ts) que passa `authOptions`. Sem `authOptions`, o NextAuth pode retornar uma sessão sem os campos customizados (`tipo`, `fornecedorId`, `clienteId`).

```typescript
// ❌ ERRADO (usado em todos os endpoints de fornecedor)
import { getServerSession } from 'next-auth';
const session = await getServerSession(); // sem authOptions!

// ✅ CORRETO
import { requireRole } from '@/lib/auth/session';
const user = await requireRole(['fornecedor']);
```

### A4 — Non-null assertion crash

**Arquivo:** [app/api/produtos/route.ts](app/api/produtos/route.ts)

```typescript
// Se user.tipo === 'admin', user.fornecedorId é undefined
const resultado = await produtoService.listar(user.fornecedorId!, ...);
// Runtime crash: Cannot read properties of undefined
```

**Correção:**
```typescript
export async function GET(request: Request) {
  const user = await requireRole(['fornecedor', 'admin']);

  let fornecedorId: string;
  
  if (user.tipo === 'admin') {
    // Admin precisa especificar o fornecedor ou ver todos
    fornecedorId = searchParams.get('fornecedorId') || '';
    if (!fornecedorId) {
      // Retornar lista de todos fornecedores ou erro
      return NextResponse.json(
        { error: 'Admin deve especificar fornecedorId' },
        { status: 400 }
      );
    }
  } else {
    if (!user.fornecedorId) {
      return NextResponse.json(
        { error: 'Fornecedor não encontrado' },
        { status: 404 }
      );
    }
    fornecedorId = user.fornecedorId;
  }
}
```

---

# 🧭 2. MAPEAMENTO COMPLETO DE ROTAS

| # | Método | Rota | Auth | RBAC | Validação | Multi-tenant | Usado no Frontend | Status |
|---|--------|------|------|------|-----------|-------------|-------------------|--------|
| 1 | GET/POST | `/api/auth/[...nextauth]` | NextAuth | - | NextAuth | - | Sim | OK |
| 2 | POST | `/api/auth/register` | **NÃO** | **NÃO** | Zod (fraca) | - | Sim | **CRÍTICO** |
| 3 | POST | `/api/auth/registro` | **NÃO** | **NÃO** | Zod (boa) | - | ? | **DUPLICADA** |
| 4 | GET/POST | `/api/produtos` | SIM | SIM | Zod | Parcial | Sim | MÉDIA |
| 5 | GET/PATCH/DELETE | `/api/produtos/[id]` | SIM | SIM | Zod | SIM | Sim | MÉDIA |
| 6 | GET | `/api/public/produtos` | NÃO (público) | - | **NÃO** | - | Sim | BAIXA |
| 7 | GET/POST | `/api/categorias` | SIM | SIM | Zod | **FALSO** | Sim | **CRÍTICO** |
| 8 | GET/PUT/DELETE | `/api/categorias/[id]` | SIM | SIM | Zod | **FALSO** | Sim | **CRÍTICO** |
| 9 | POST | `/api/email/send` | **NÃO** | **NÃO** | Zod | - | ? | **CRÍTICO** |
| 10 | GET | `/api/email/logs` | **NÃO** | **NÃO** | **NÃO** | - | ? | **CRÍTICO** |
| 11 | GET | `/api/email/test` | **NÃO** | **NÃO** | **NÃO** | - | NÃO | **REMOVER** |
| 12 | GET | `/api/email/stats` | **NÃO** | **NÃO** | **NÃO** | - | ? | **CRÍTICO** |
| 13 | GET/POST | `/api/fornecedor/pedidos` | SIM* | SIM* | **NÃO** | **NÃO (mock)** | Sim | ALTA |
| 14 | GET/PATCH | `/api/fornecedor/pedidos/[id]` | SIM* | SIM* | **NÃO** | **NÃO (mock)** | Sim | ALTA |
| 15 | GET/POST/DELETE | `/api/fornecedor/precos` | SIM* | SIM* | **NÃO** | **NÃO (mock)** | Sim | ALTA |
| 16 | GET/PATCH | `/api/fornecedor/estoque` | SIM* | SIM* | Mínima | **NÃO (mock)** | Sim | ALTA |
| 17 | GET | `/api/fornecedor/clientes` | SIM* | SIM* | **NÃO** | **NÃO (mock)** | Sim | ALTA |
| 18 | GET/POST | `/api/audit` | **NÃO** | **NÃO** | **NÃO** | - | NÃO | **CRÍTICO** |
| 19 | GET | `/api/health` | NÃO (público) | - | N/A | - | NÃO | BAIXA |

**\* = usa `getServerSession()` sem `authOptions`** — potencialmente inseguro

### Rotas para remover ou desativar imediatamente:
1. `/api/email/test` — endpoint de teste, não deveria existir em produção
2. `/api/auth/register` — duplicata insegura, usar `/api/auth/registro`

### Rotas redundantes:
- `/api/auth/register` e `/api/auth/registro` fazem a mesma coisa com validações diferentes

### Rotas mortas (sem uso no frontend confirmado):
- `/api/audit` (auth comentada)
- `/api/email/stats`
- `/api/email/logs`

---

# 🧠 3. ANÁLISE DE ARQUITETURA

## 3.1 O que está BOM

| Aspecto | Avaliação | Detalhes |
|---------|-----------|---------|
| Separação em camadas | **Parcial** | Módulos de `produtos` e `categorias` seguem Controller-Service-Repository |
| Erros tipados | **BOM** | Hierarquia de `AppError` bem definida |
| Validação com Zod | **Parcial** | Schemas existem para produtos e auth |
| Logging estruturado | **BOM** | Winston configurado, usado nos módulos novos |
| Base classes | **BOM** | `BaseController`, `BaseService`, `BaseRepository` |
| Paginação | **BOM** | Implementada em produtos e auditoria |
| DTOs | **Parcial** | Alguns endpoints retornam entidades diretamente |

## 3.2 O que está RUIM

### 3.2.1 — Inconsistência arquitetural grave

Existem **dois padrões completamente diferentes** convivendo:

**Padrão A (modular, correto):** `produtos`, `categorias`, `auth`
- Service layer ✅
- Repository layer ✅  
- Schemas Zod ✅
- Tipos definidos ✅
- Logging estruturado ✅

**Padrão B (inline, inseguro):** `fornecedor/*`, `email/*`, `audit`
- Lógica diretamente na route ❌
- Dados mock hardcoded ❌
- Sem validação ❌
- `console.error` ao invés de logger ❌
- Sem repository ❌

### 3.2.2 — Controllers "gordos" nos endpoints de fornecedor

Todos os endpoints em `/api/fornecedor/*` têm a lógica inteira na route. Sem service, sem repository, sem validação.

### 3.2.3 — Resposta de API não padronizada

Padrão A retorna:
```json
{ "success": true, "data": {...}, "meta": {...} }
```

Padrão B retorna:
```json
{ "success": true, "data": [...] }
// ou simplesmente:
{ "error": "Unauthorized" }
```

### 3.2.4 — Módulo de segurança inteiro implementado mas JAMAIS chamado

`lib/security/` contém ~700 linhas de código de segurança (rate limiter, CSRF, sanitizer, headers, file validator) que **não são utilizadas em LUGAR NENHUM**. Código morto.

### 3.2.5 — Categorias sem pertencimento a fornecedor

O model `Categoria` no Prisma não tem `fornecedorId`. As categorias são **globais**. Em um marketplace multi-tenant, cada fornecedor deveria ter suas próprias categorias.

---

# 🚀 4. MELHORIAS FUNCIONAIS

## 4.1 Prioridade CRÍTICA (implementar antes de ir para produção)

### 1. Middleware Global (`middleware.ts`)
**Por quê:** Sem middleware, cada endpoint precisa implementar sua própria segurança. Um esquecimento = vulnerabilidade.

```typescript
// middleware.ts (raiz do projeto)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

const PUBLIC_ROUTES = ['/api/auth', '/api/public', '/api/health', '/login', '/register'];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  // Security headers em TODAS as respostas
  const response = NextResponse.next();
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin
```


## License: MIT
https://github.com/mvolfik/eyp-calls/blob/9b73c12f57172aade13a6592ebf9b45c2571e6e9/frontend-worker/src/index.js

```
Agora tenho toda a informação necessária para compilar o relatório completo. Aqui está a auditoria:

---

# AUDITORIA COMPLETA — B2B MARKETPLACE

## Data: 16/02/2026 | Branch: `copilot/fix-organize-and-complete-frontend`

---

# 🚨🚨🚨 FALHAS CRÍTICAS DE PRODUÇÃO 🚨🚨🚨

Antes de qualquer análise ordenada, destaco imediatamente as falhas que **permitem comprometimento total do sistema**:

### FALHA CRÍTICA #1 — Qualquer pessoa pode se tornar ADMIN

> 🚨 RISCO CRÍTICO DE PRODUÇÃO

**Arquivo:** [app/api/auth/register/route.ts](app/api/auth/register/route.ts#L9)

```typescript
// QUALQUER PESSOA pode chamar esta API e se criar como admin:
const registerSchema = z.object({
  tipo: z.enum(['admin', 'fornecedor', 'cliente']) // ← ACEITA 'admin'
})
```

**Risco:** Escalação de privilégio total. Qualquer atacante faz `POST /api/auth/register` com `{"tipo": "admin"}` e obtém acesso administrativo.

**Classificação:** **CRÍTICO**

**Correção:**
```typescript
const registerSchema = z.object({
  tipo: z.enum(['fornecedor', 'cliente']) // REMOVER 'admin'
})
```

---

### FALHA CRÍTICA #2 — Auditoria totalmente aberta (auth COMENTADA)

> 🚨 RISCO CRÍTICO DE PRODUÇÃO

**Arquivo:** [app/api/audit/route.ts](app/api/audit/route.ts#L16-L21)

```typescript
// TODO: Add authentication check    ← LITERALMENTE UM TODO
// const session = await getServerSession();
// if (!session || session.user.role !== 'ADMIN') {
```

**Risco:** Qualquer pessoa acessa `GET /api/audit` e vê TODOS os logs de auditoria: IPs de usuários, user agents, ações, timestamps. Informação perfeita para um atacante mapear o sistema.

**Classificação:** **CRÍTICO**

---

### FALHA CRÍTICA #3 — Endpoint de email 100% aberto (phishing/spam)

> 🚨 RISCO CRÍTICO DE PRODUÇÃO

**Arquivo:** [app/api/email/send/route.ts](app/api/email/send/route.ts)

**Sem autenticação.** Qualquer pessoa envia e-mails arbitrários (incluindo HTML customizado) para qualquer endereço usando sua infraestrutura:

```bash
curl -X POST /api/email/send -d '{
  "type": "custom",
  "to": "vitima@empresa.com",
  "subject": "Urgente",
  "html": "<h1>Phishing</h1><a href=\"http://malware.com\">Clique aqui</a>"
}'
```

**Risco:** Vetor de phishing e spam usando seu domínio. Pode colocar seu domínio em blacklists de e-mail.

**Classificação:** **CRÍTICO** (todos os 4 endpoints de email: `/send`, `/test`, `/logs`, `/stats`)

---

### FALHA CRÍTICA #4 — Categorias sem filtro de tenant

> 🚨 RISCO CRÍTICO DE PRODUÇÃO

**Arquivo:** [modules/categorias/repository.ts](modules/categorias/repository.ts)

O repository de categorias recebe `fornecedorId` como parâmetro mas **IGNORA completamente**:

```typescript
async findAll(fornecedorId: string): Promise<Categoria[]> {
  return this.prisma.categoria.findMany({
    orderBy: { nome: 'asc' },
    // ← ZERO filtro por fornecedorId!
  })
}

async findById(id: string, fornecedorId: string): Promise<Categoria | null> {
  return this.prisma.categoria.findFirst({
    where: { id },  // ← SEM filtro por fornecedorId!
  })
}
```

**Risco:** Fornecedor A vê, edita e deleta categorias do Fornecedor B. **Vazamento de dados entre tenants.**

**Classificação:** **CRÍTICO** — IDOR / Broken Access Control

**Nota:** O modelo `Categoria` no schema Prisma **não tem campo `fornecedorId`**. A tabela de categorias é **global**, sem isolamento de tenant. Isso precisa ser redesenhado.

---

# 🔐 1. ANÁLISE DE SEGURANÇA COMPLETA

## 1.1 Vulnerabilidades por Severidade

### CRÍTICAS (5)

| # | Vulnerabilidade | Endpoint | Tipo |
|---|---|---|---|
| C1 | Criação de admin público | `/api/auth/register` | Privilege Escalation |
| C2 | Auth comentada em auditoria | `/api/audit` | Broken Auth |
| C3 | Email aberto (4 endpoints) | `/api/email/*` | Broken Auth + Spam |
| C4 | Categorias sem tenant filter | `/api/categorias/*` | IDOR |
| C5 | Sem middleware.ts global | Global | Missing Security Layer |

### ALTAS (8)

| # | Vulnerabilidade | Endpoint | Tipo |
|---|---|---|---|
| A1 | `getServerSession()` sem `authOptions` | `/api/fornecedor/*` (5 rotas) | Broken Auth |
| A2 | Módulo security inteiro não utilizado | Global | Dead Code / Missing Security |
| A3 | Dados mock sem isolamento tenant | `/api/fornecedor/*` | IDOR |
| A4 | `user.fornecedorId!` crash para admin | `/api/produtos` | Runtime Error |
| A5 | Rate limiting não implementado em nenhum endpoint | Global | DoS |
| A6 | CSRF protection não implementada | Global | CSRF |
| A7 | Sanitização de input não utilizada | Global | XSS |
| A8 | bcrypt salt rounds = 10 no register antigo | `/api/auth/register` | Weak Crypto |

### MÉDIAS (6)

| # | Vulnerabilidade | Endpoint | Tipo |
|---|---|---|---|
| M1 | Dois endpoints de registro com regras diferentes | `/register` vs `/registro` | Inconsistência |
| M2 | Senha mínima 6 chars no `/register` vs 8 no schema | `/api/auth/register` | Weak Validation |
| M3 | Health check expõe versão, uptime, DB response times | `/api/health` | Info Disclosure |
| M4 | POST de pedidos aceita qualquer body | `/api/fornecedor/pedidos` | Mass Assignment |
| M5 | `console.error` usado em vários endpoints | Múltiplos | Info Leak |
| M6 | CNPJ temporário com padrão previsível | `/api/auth/register` | Data Integrity |

### BAIXAS (3)

| # | Vulnerabilidade | Endpoint | Tipo |
|---|---|---|---|
| B1 | Sem validação de `parseInt`/`parseFloat` (NaN) | `/api/public/produtos` | Input Validation |
| B2 | Sem limit máximo em `/api/public/produtos` | `/api/public/produtos` | DoS |
| B3 | Error messages em inglês misturado com português | Múltiplos | Usability |

---

## 1.2 Detalhamento das Vulnerabilidades Críticas e Altas

### C1 — Privilege Escalation via Register

**Como explorar:**
```bash
curl -X POST https://seusite.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"nome":"Hacker","email":"hacker@evil.com","senha":"123456","tipo":"admin"}'
```

**Correção completa:**
```typescript
// app/api/auth/register/route.ts — DEVE SER REESCRITO OU REMOVIDO
// Usar apenas /api/auth/registro que já restringe tipos

const registerSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  email: emailSchema, // usar schema compartilhado
  senha: senhaSchema, // usar schema compartilhado (8 chars + complexidade)
  tipo: z.enum(['fornecedor', 'cliente']), // NUNCA aceitar 'admin'
})
```

### A1 — getServerSession() sem authOptions

**Arquivo afetado:** Todos em `/api/fornecedor/*`

**Problema:** Os endpoints importam `getServerSession` diretamente de `next-auth` ao invés do wrapper em [lib/auth/session.ts](lib/auth/session.ts) que passa `authOptions`. Sem `authOptions`, o NextAuth pode retornar uma sessão sem os campos customizados (`tipo`, `fornecedorId`, `clienteId`).

```typescript
// ❌ ERRADO (usado em todos os endpoints de fornecedor)
import { getServerSession } from 'next-auth';
const session = await getServerSession(); // sem authOptions!

// ✅ CORRETO
import { requireRole } from '@/lib/auth/session';
const user = await requireRole(['fornecedor']);
```

### A4 — Non-null assertion crash

**Arquivo:** [app/api/produtos/route.ts](app/api/produtos/route.ts)

```typescript
// Se user.tipo === 'admin', user.fornecedorId é undefined
const resultado = await produtoService.listar(user.fornecedorId!, ...);
// Runtime crash: Cannot read properties of undefined
```

**Correção:**
```typescript
export async function GET(request: Request) {
  const user = await requireRole(['fornecedor', 'admin']);

  let fornecedorId: string;
  
  if (user.tipo === 'admin') {
    // Admin precisa especificar o fornecedor ou ver todos
    fornecedorId = searchParams.get('fornecedorId') || '';
    if (!fornecedorId) {
      // Retornar lista de todos fornecedores ou erro
      return NextResponse.json(
        { error: 'Admin deve especificar fornecedorId' },
        { status: 400 }
      );
    }
  } else {
    if (!user.fornecedorId) {
      return NextResponse.json(
        { error: 'Fornecedor não encontrado' },
        { status: 404 }
      );
    }
    fornecedorId = user.fornecedorId;
  }
}
```

---

# 🧭 2. MAPEAMENTO COMPLETO DE ROTAS

| # | Método | Rota | Auth | RBAC | Validação | Multi-tenant | Usado no Frontend | Status |
|---|--------|------|------|------|-----------|-------------|-------------------|--------|
| 1 | GET/POST | `/api/auth/[...nextauth]` | NextAuth | - | NextAuth | - | Sim | OK |
| 2 | POST | `/api/auth/register` | **NÃO** | **NÃO** | Zod (fraca) | - | Sim | **CRÍTICO** |
| 3 | POST | `/api/auth/registro` | **NÃO** | **NÃO** | Zod (boa) | - | ? | **DUPLICADA** |
| 4 | GET/POST | `/api/produtos` | SIM | SIM | Zod | Parcial | Sim | MÉDIA |
| 5 | GET/PATCH/DELETE | `/api/produtos/[id]` | SIM | SIM | Zod | SIM | Sim | MÉDIA |
| 6 | GET | `/api/public/produtos` | NÃO (público) | - | **NÃO** | - | Sim | BAIXA |
| 7 | GET/POST | `/api/categorias` | SIM | SIM | Zod | **FALSO** | Sim | **CRÍTICO** |
| 8 | GET/PUT/DELETE | `/api/categorias/[id]` | SIM | SIM | Zod | **FALSO** | Sim | **CRÍTICO** |
| 9 | POST | `/api/email/send` | **NÃO** | **NÃO** | Zod | - | ? | **CRÍTICO** |
| 10 | GET | `/api/email/logs` | **NÃO** | **NÃO** | **NÃO** | - | ? | **CRÍTICO** |
| 11 | GET | `/api/email/test` | **NÃO** | **NÃO** | **NÃO** | - | NÃO | **REMOVER** |
| 12 | GET | `/api/email/stats` | **NÃO** | **NÃO** | **NÃO** | - | ? | **CRÍTICO** |
| 13 | GET/POST | `/api/fornecedor/pedidos` | SIM* | SIM* | **NÃO** | **NÃO (mock)** | Sim | ALTA |
| 14 | GET/PATCH | `/api/fornecedor/pedidos/[id]` | SIM* | SIM* | **NÃO** | **NÃO (mock)** | Sim | ALTA |
| 15 | GET/POST/DELETE | `/api/fornecedor/precos` | SIM* | SIM* | **NÃO** | **NÃO (mock)** | Sim | ALTA |
| 16 | GET/PATCH | `/api/fornecedor/estoque` | SIM* | SIM* | Mínima | **NÃO (mock)** | Sim | ALTA |
| 17 | GET | `/api/fornecedor/clientes` | SIM* | SIM* | **NÃO** | **NÃO (mock)** | Sim | ALTA |
| 18 | GET/POST | `/api/audit` | **NÃO** | **NÃO** | **NÃO** | - | NÃO | **CRÍTICO** |
| 19 | GET | `/api/health` | NÃO (público) | - | N/A | - | NÃO | BAIXA |

**\* = usa `getServerSession()` sem `authOptions`** — potencialmente inseguro

### Rotas para remover ou desativar imediatamente:
1. `/api/email/test` — endpoint de teste, não deveria existir em produção
2. `/api/auth/register` — duplicata insegura, usar `/api/auth/registro`

### Rotas redundantes:
- `/api/auth/register` e `/api/auth/registro` fazem a mesma coisa com validações diferentes

### Rotas mortas (sem uso no frontend confirmado):
- `/api/audit` (auth comentada)
- `/api/email/stats`
- `/api/email/logs`

---

# 🧠 3. ANÁLISE DE ARQUITETURA

## 3.1 O que está BOM

| Aspecto | Avaliação | Detalhes |
|---------|-----------|---------|
| Separação em camadas | **Parcial** | Módulos de `produtos` e `categorias` seguem Controller-Service-Repository |
| Erros tipados | **BOM** | Hierarquia de `AppError` bem definida |
| Validação com Zod | **Parcial** | Schemas existem para produtos e auth |
| Logging estruturado | **BOM** | Winston configurado, usado nos módulos novos |
| Base classes | **BOM** | `BaseController`, `BaseService`, `BaseRepository` |
| Paginação | **BOM** | Implementada em produtos e auditoria |
| DTOs | **Parcial** | Alguns endpoints retornam entidades diretamente |

## 3.2 O que está RUIM

### 3.2.1 — Inconsistência arquitetural grave

Existem **dois padrões completamente diferentes** convivendo:

**Padrão A (modular, correto):** `produtos`, `categorias`, `auth`
- Service layer ✅
- Repository layer ✅  
- Schemas Zod ✅
- Tipos definidos ✅
- Logging estruturado ✅

**Padrão B (inline, inseguro):** `fornecedor/*`, `email/*`, `audit`
- Lógica diretamente na route ❌
- Dados mock hardcoded ❌
- Sem validação ❌
- `console.error` ao invés de logger ❌
- Sem repository ❌

### 3.2.2 — Controllers "gordos" nos endpoints de fornecedor

Todos os endpoints em `/api/fornecedor/*` têm a lógica inteira na route. Sem service, sem repository, sem validação.

### 3.2.3 — Resposta de API não padronizada

Padrão A retorna:
```json
{ "success": true, "data": {...}, "meta": {...} }
```

Padrão B retorna:
```json
{ "success": true, "data": [...] }
// ou simplesmente:
{ "error": "Unauthorized" }
```

### 3.2.4 — Módulo de segurança inteiro implementado mas JAMAIS chamado

`lib/security/` contém ~700 linhas de código de segurança (rate limiter, CSRF, sanitizer, headers, file validator) que **não são utilizadas em LUGAR NENHUM**. Código morto.

### 3.2.5 — Categorias sem pertencimento a fornecedor

O model `Categoria` no Prisma não tem `fornecedorId`. As categorias são **globais**. Em um marketplace multi-tenant, cada fornecedor deveria ter suas próprias categorias.

---

# 🚀 4. MELHORIAS FUNCIONAIS

## 4.1 Prioridade CRÍTICA (implementar antes de ir para produção)

### 1. Middleware Global (`middleware.ts`)
**Por quê:** Sem middleware, cada endpoint precisa implementar sua própria segurança. Um esquecimento = vulnerabilidade.

```typescript
// middleware.ts (raiz do projeto)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

const PUBLIC_ROUTES = ['/api/auth', '/api/public', '/api/health', '/login', '/register'];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  // Security headers em TODAS as respostas
  const response = NextResponse.next();
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin
```


## License: MIT
https://github.com/mvolfik/eyp-calls/blob/9b73c12f57172aade13a6592ebf9b45c2571e6e9/frontend-worker/src/index.js

```
Agora tenho toda a informação necessária para compilar o relatório completo. Aqui está a auditoria:

---

# AUDITORIA COMPLETA — B2B MARKETPLACE

## Data: 16/02/2026 | Branch: `copilot/fix-organize-and-complete-frontend`

---

# 🚨🚨🚨 FALHAS CRÍTICAS DE PRODUÇÃO 🚨🚨🚨

Antes de qualquer análise ordenada, destaco imediatamente as falhas que **permitem comprometimento total do sistema**:

### FALHA CRÍTICA #1 — Qualquer pessoa pode se tornar ADMIN

> 🚨 RISCO CRÍTICO DE PRODUÇÃO

**Arquivo:** [app/api/auth/register/route.ts](app/api/auth/register/route.ts#L9)

```typescript
// QUALQUER PESSOA pode chamar esta API e se criar como admin:
const registerSchema = z.object({
  tipo: z.enum(['admin', 'fornecedor', 'cliente']) // ← ACEITA 'admin'
})
```

**Risco:** Escalação de privilégio total. Qualquer atacante faz `POST /api/auth/register` com `{"tipo": "admin"}` e obtém acesso administrativo.

**Classificação:** **CRÍTICO**

**Correção:**
```typescript
const registerSchema = z.object({
  tipo: z.enum(['fornecedor', 'cliente']) // REMOVER 'admin'
})
```

---

### FALHA CRÍTICA #2 — Auditoria totalmente aberta (auth COMENTADA)

> 🚨 RISCO CRÍTICO DE PRODUÇÃO

**Arquivo:** [app/api/audit/route.ts](app/api/audit/route.ts#L16-L21)

```typescript
// TODO: Add authentication check    ← LITERALMENTE UM TODO
// const session = await getServerSession();
// if (!session || session.user.role !== 'ADMIN') {
```

**Risco:** Qualquer pessoa acessa `GET /api/audit` e vê TODOS os logs de auditoria: IPs de usuários, user agents, ações, timestamps. Informação perfeita para um atacante mapear o sistema.

**Classificação:** **CRÍTICO**

---

### FALHA CRÍTICA #3 — Endpoint de email 100% aberto (phishing/spam)

> 🚨 RISCO CRÍTICO DE PRODUÇÃO

**Arquivo:** [app/api/email/send/route.ts](app/api/email/send/route.ts)

**Sem autenticação.** Qualquer pessoa envia e-mails arbitrários (incluindo HTML customizado) para qualquer endereço usando sua infraestrutura:

```bash
curl -X POST /api/email/send -d '{
  "type": "custom",
  "to": "vitima@empresa.com",
  "subject": "Urgente",
  "html": "<h1>Phishing</h1><a href=\"http://malware.com\">Clique aqui</a>"
}'
```

**Risco:** Vetor de phishing e spam usando seu domínio. Pode colocar seu domínio em blacklists de e-mail.

**Classificação:** **CRÍTICO** (todos os 4 endpoints de email: `/send`, `/test`, `/logs`, `/stats`)

---

### FALHA CRÍTICA #4 — Categorias sem filtro de tenant

> 🚨 RISCO CRÍTICO DE PRODUÇÃO

**Arquivo:** [modules/categorias/repository.ts](modules/categorias/repository.ts)

O repository de categorias recebe `fornecedorId` como parâmetro mas **IGNORA completamente**:

```typescript
async findAll(fornecedorId: string): Promise<Categoria[]> {
  return this.prisma.categoria.findMany({
    orderBy: { nome: 'asc' },
    // ← ZERO filtro por fornecedorId!
  })
}

async findById(id: string, fornecedorId: string): Promise<Categoria | null> {
  return this.prisma.categoria.findFirst({
    where: { id },  // ← SEM filtro por fornecedorId!
  })
}
```

**Risco:** Fornecedor A vê, edita e deleta categorias do Fornecedor B. **Vazamento de dados entre tenants.**

**Classificação:** **CRÍTICO** — IDOR / Broken Access Control

**Nota:** O modelo `Categoria` no schema Prisma **não tem campo `fornecedorId`**. A tabela de categorias é **global**, sem isolamento de tenant. Isso precisa ser redesenhado.

---

# 🔐 1. ANÁLISE DE SEGURANÇA COMPLETA

## 1.1 Vulnerabilidades por Severidade

### CRÍTICAS (5)

| # | Vulnerabilidade | Endpoint | Tipo |
|---|---|---|---|
| C1 | Criação de admin público | `/api/auth/register` | Privilege Escalation |
| C2 | Auth comentada em auditoria | `/api/audit` | Broken Auth |
| C3 | Email aberto (4 endpoints) | `/api/email/*` | Broken Auth + Spam |
| C4 | Categorias sem tenant filter | `/api/categorias/*` | IDOR |
| C5 | Sem middleware.ts global | Global | Missing Security Layer |

### ALTAS (8)

| # | Vulnerabilidade | Endpoint | Tipo |
|---|---|---|---|
| A1 | `getServerSession()` sem `authOptions` | `/api/fornecedor/*` (5 rotas) | Broken Auth |
| A2 | Módulo security inteiro não utilizado | Global | Dead Code / Missing Security |
| A3 | Dados mock sem isolamento tenant | `/api/fornecedor/*` | IDOR |
| A4 | `user.fornecedorId!` crash para admin | `/api/produtos` | Runtime Error |
| A5 | Rate limiting não implementado em nenhum endpoint | Global | DoS |
| A6 | CSRF protection não implementada | Global | CSRF |
| A7 | Sanitização de input não utilizada | Global | XSS |
| A8 | bcrypt salt rounds = 10 no register antigo | `/api/auth/register` | Weak Crypto |

### MÉDIAS (6)

| # | Vulnerabilidade | Endpoint | Tipo |
|---|---|---|---|
| M1 | Dois endpoints de registro com regras diferentes | `/register` vs `/registro` | Inconsistência |
| M2 | Senha mínima 6 chars no `/register` vs 8 no schema | `/api/auth/register` | Weak Validation |
| M3 | Health check expõe versão, uptime, DB response times | `/api/health` | Info Disclosure |
| M4 | POST de pedidos aceita qualquer body | `/api/fornecedor/pedidos` | Mass Assignment |
| M5 | `console.error` usado em vários endpoints | Múltiplos | Info Leak |
| M6 | CNPJ temporário com padrão previsível | `/api/auth/register` | Data Integrity |

### BAIXAS (3)

| # | Vulnerabilidade | Endpoint | Tipo |
|---|---|---|---|
| B1 | Sem validação de `parseInt`/`parseFloat` (NaN) | `/api/public/produtos` | Input Validation |
| B2 | Sem limit máximo em `/api/public/produtos` | `/api/public/produtos` | DoS |
| B3 | Error messages em inglês misturado com português | Múltiplos | Usability |

---

## 1.2 Detalhamento das Vulnerabilidades Críticas e Altas

### C1 — Privilege Escalation via Register

**Como explorar:**
```bash
curl -X POST https://seusite.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"nome":"Hacker","email":"hacker@evil.com","senha":"123456","tipo":"admin"}'
```

**Correção completa:**
```typescript
// app/api/auth/register/route.ts — DEVE SER REESCRITO OU REMOVIDO
// Usar apenas /api/auth/registro que já restringe tipos

const registerSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  email: emailSchema, // usar schema compartilhado
  senha: senhaSchema, // usar schema compartilhado (8 chars + complexidade)
  tipo: z.enum(['fornecedor', 'cliente']), // NUNCA aceitar 'admin'
})
```

### A1 — getServerSession() sem authOptions

**Arquivo afetado:** Todos em `/api/fornecedor/*`

**Problema:** Os endpoints importam `getServerSession` diretamente de `next-auth` ao invés do wrapper em [lib/auth/session.ts](lib/auth/session.ts) que passa `authOptions`. Sem `authOptions`, o NextAuth pode retornar uma sessão sem os campos customizados (`tipo`, `fornecedorId`, `clienteId`).

```typescript
// ❌ ERRADO (usado em todos os endpoints de fornecedor)
import { getServerSession } from 'next-auth';
const session = await getServerSession(); // sem authOptions!

// ✅ CORRETO
import { requireRole } from '@/lib/auth/session';
const user = await requireRole(['fornecedor']);
```

### A4 — Non-null assertion crash

**Arquivo:** [app/api/produtos/route.ts](app/api/produtos/route.ts)

```typescript
// Se user.tipo === 'admin', user.fornecedorId é undefined
const resultado = await produtoService.listar(user.fornecedorId!, ...);
// Runtime crash: Cannot read properties of undefined
```

**Correção:**
```typescript
export async function GET(request: Request) {
  const user = await requireRole(['fornecedor', 'admin']);

  let fornecedorId: string;
  
  if (user.tipo === 'admin') {
    // Admin precisa especificar o fornecedor ou ver todos
    fornecedorId = searchParams.get('fornecedorId') || '';
    if (!fornecedorId) {
      // Retornar lista de todos fornecedores ou erro
      return NextResponse.json(
        { error: 'Admin deve especificar fornecedorId' },
        { status: 400 }
      );
    }
  } else {
    if (!user.fornecedorId) {
      return NextResponse.json(
        { error: 'Fornecedor não encontrado' },
        { status: 404 }
      );
    }
    fornecedorId = user.fornecedorId;
  }
}
```

---

# 🧭 2. MAPEAMENTO COMPLETO DE ROTAS

| # | Método | Rota | Auth | RBAC | Validação | Multi-tenant | Usado no Frontend | Status |
|---|--------|------|------|------|-----------|-------------|-------------------|--------|
| 1 | GET/POST | `/api/auth/[...nextauth]` | NextAuth | - | NextAuth | - | Sim | OK |
| 2 | POST | `/api/auth/register` | **NÃO** | **NÃO** | Zod (fraca) | - | Sim | **CRÍTICO** |
| 3 | POST | `/api/auth/registro` | **NÃO** | **NÃO** | Zod (boa) | - | ? | **DUPLICADA** |
| 4 | GET/POST | `/api/produtos` | SIM | SIM | Zod | Parcial | Sim | MÉDIA |
| 5 | GET/PATCH/DELETE | `/api/produtos/[id]` | SIM | SIM | Zod | SIM | Sim | MÉDIA |
| 6 | GET | `/api/public/produtos` | NÃO (público) | - | **NÃO** | - | Sim | BAIXA |
| 7 | GET/POST | `/api/categorias` | SIM | SIM | Zod | **FALSO** | Sim | **CRÍTICO** |
| 8 | GET/PUT/DELETE | `/api/categorias/[id]` | SIM | SIM | Zod | **FALSO** | Sim | **CRÍTICO** |
| 9 | POST | `/api/email/send` | **NÃO** | **NÃO** | Zod | - | ? | **CRÍTICO** |
| 10 | GET | `/api/email/logs` | **NÃO** | **NÃO** | **NÃO** | - | ? | **CRÍTICO** |
| 11 | GET | `/api/email/test` | **NÃO** | **NÃO** | **NÃO** | - | NÃO | **REMOVER** |
| 12 | GET | `/api/email/stats` | **NÃO** | **NÃO** | **NÃO** | - | ? | **CRÍTICO** |
| 13 | GET/POST | `/api/fornecedor/pedidos` | SIM* | SIM* | **NÃO** | **NÃO (mock)** | Sim | ALTA |
| 14 | GET/PATCH | `/api/fornecedor/pedidos/[id]` | SIM* | SIM* | **NÃO** | **NÃO (mock)** | Sim | ALTA |
| 15 | GET/POST/DELETE | `/api/fornecedor/precos` | SIM* | SIM* | **NÃO** | **NÃO (mock)** | Sim | ALTA |
| 16 | GET/PATCH | `/api/fornecedor/estoque` | SIM* | SIM* | Mínima | **NÃO (mock)** | Sim | ALTA |
| 17 | GET | `/api/fornecedor/clientes` | SIM* | SIM* | **NÃO** | **NÃO (mock)** | Sim | ALTA |
| 18 | GET/POST | `/api/audit` | **NÃO** | **NÃO** | **NÃO** | - | NÃO | **CRÍTICO** |
| 19 | GET | `/api/health` | NÃO (público) | - | N/A | - | NÃO | BAIXA |

**\* = usa `getServerSession()` sem `authOptions`** — potencialmente inseguro

### Rotas para remover ou desativar imediatamente:
1. `/api/email/test` — endpoint de teste, não deveria existir em produção
2. `/api/auth/register` — duplicata insegura, usar `/api/auth/registro`

### Rotas redundantes:
- `/api/auth/register` e `/api/auth/registro` fazem a mesma coisa com validações diferentes

### Rotas mortas (sem uso no frontend confirmado):
- `/api/audit` (auth comentada)
- `/api/email/stats`
- `/api/email/logs`

---

# 🧠 3. ANÁLISE DE ARQUITETURA

## 3.1 O que está BOM

| Aspecto | Avaliação | Detalhes |
|---------|-----------|---------|
| Separação em camadas | **Parcial** | Módulos de `produtos` e `categorias` seguem Controller-Service-Repository |
| Erros tipados | **BOM** | Hierarquia de `AppError` bem definida |
| Validação com Zod | **Parcial** | Schemas existem para produtos e auth |
| Logging estruturado | **BOM** | Winston configurado, usado nos módulos novos |
| Base classes | **BOM** | `BaseController`, `BaseService`, `BaseRepository` |
| Paginação | **BOM** | Implementada em produtos e auditoria |
| DTOs | **Parcial** | Alguns endpoints retornam entidades diretamente |

## 3.2 O que está RUIM

### 3.2.1 — Inconsistência arquitetural grave

Existem **dois padrões completamente diferentes** convivendo:

**Padrão A (modular, correto):** `produtos`, `categorias`, `auth`
- Service layer ✅
- Repository layer ✅  
- Schemas Zod ✅
- Tipos definidos ✅
- Logging estruturado ✅

**Padrão B (inline, inseguro):** `fornecedor/*`, `email/*`, `audit`
- Lógica diretamente na route ❌
- Dados mock hardcoded ❌
- Sem validação ❌
- `console.error` ao invés de logger ❌
- Sem repository ❌

### 3.2.2 — Controllers "gordos" nos endpoints de fornecedor

Todos os endpoints em `/api/fornecedor/*` têm a lógica inteira na route. Sem service, sem repository, sem validação.

### 3.2.3 — Resposta de API não padronizada

Padrão A retorna:
```json
{ "success": true, "data": {...}, "meta": {...} }
```

Padrão B retorna:
```json
{ "success": true, "data": [...] }
// ou simplesmente:
{ "error": "Unauthorized" }
```

### 3.2.4 — Módulo de segurança inteiro implementado mas JAMAIS chamado

`lib/security/` contém ~700 linhas de código de segurança (rate limiter, CSRF, sanitizer, headers, file validator) que **não são utilizadas em LUGAR NENHUM**. Código morto.

### 3.2.5 — Categorias sem pertencimento a fornecedor

O model `Categoria` no Prisma não tem `fornecedorId`. As categorias são **globais**. Em um marketplace multi-tenant, cada fornecedor deveria ter suas próprias categorias.

---

# 🚀 4. MELHORIAS FUNCIONAIS

## 4.1 Prioridade CRÍTICA (implementar antes de ir para produção)

### 1. Middleware Global (`middleware.ts`)
**Por quê:** Sem middleware, cada endpoint precisa implementar sua própria segurança. Um esquecimento = vulnerabilidade.

```typescript
// middleware.ts (raiz do projeto)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

const PUBLIC_ROUTES = ['/api/auth', '/api/public', '/api/health', '/login', '/register'];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  // Security headers em TODAS as respostas
  const response = NextResponse.next();
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin
```


## License: MIT
https://github.com/mvolfik/eyp-calls/blob/9b73c12f57172aade13a6592ebf9b45c2571e6e9/frontend-worker/src/index.js

```
Agora tenho toda a informação necessária para compilar o relatório completo. Aqui está a auditoria:

---

# AUDITORIA COMPLETA — B2B MARKETPLACE

## Data: 16/02/2026 | Branch: `copilot/fix-organize-and-complete-frontend`

---

# 🚨🚨🚨 FALHAS CRÍTICAS DE PRODUÇÃO 🚨🚨🚨

Antes de qualquer análise ordenada, destaco imediatamente as falhas que **permitem comprometimento total do sistema**:

### FALHA CRÍTICA #1 — Qualquer pessoa pode se tornar ADMIN

> 🚨 RISCO CRÍTICO DE PRODUÇÃO

**Arquivo:** [app/api/auth/register/route.ts](app/api/auth/register/route.ts#L9)

```typescript
// QUALQUER PESSOA pode chamar esta API e se criar como admin:
const registerSchema = z.object({
  tipo: z.enum(['admin', 'fornecedor', 'cliente']) // ← ACEITA 'admin'
})
```

**Risco:** Escalação de privilégio total. Qualquer atacante faz `POST /api/auth/register` com `{"tipo": "admin"}` e obtém acesso administrativo.

**Classificação:** **CRÍTICO**

**Correção:**
```typescript
const registerSchema = z.object({
  tipo: z.enum(['fornecedor', 'cliente']) // REMOVER 'admin'
})
```

---

### FALHA CRÍTICA #2 — Auditoria totalmente aberta (auth COMENTADA)

> 🚨 RISCO CRÍTICO DE PRODUÇÃO

**Arquivo:** [app/api/audit/route.ts](app/api/audit/route.ts#L16-L21)

```typescript
// TODO: Add authentication check    ← LITERALMENTE UM TODO
// const session = await getServerSession();
// if (!session || session.user.role !== 'ADMIN') {
```

**Risco:** Qualquer pessoa acessa `GET /api/audit` e vê TODOS os logs de auditoria: IPs de usuários, user agents, ações, timestamps. Informação perfeita para um atacante mapear o sistema.

**Classificação:** **CRÍTICO**

---

### FALHA CRÍTICA #3 — Endpoint de email 100% aberto (phishing/spam)

> 🚨 RISCO CRÍTICO DE PRODUÇÃO

**Arquivo:** [app/api/email/send/route.ts](app/api/email/send/route.ts)

**Sem autenticação.** Qualquer pessoa envia e-mails arbitrários (incluindo HTML customizado) para qualquer endereço usando sua infraestrutura:

```bash
curl -X POST /api/email/send -d '{
  "type": "custom",
  "to": "vitima@empresa.com",
  "subject": "Urgente",
  "html": "<h1>Phishing</h1><a href=\"http://malware.com\">Clique aqui</a>"
}'
```

**Risco:** Vetor de phishing e spam usando seu domínio. Pode colocar seu domínio em blacklists de e-mail.

**Classificação:** **CRÍTICO** (todos os 4 endpoints de email: `/send`, `/test`, `/logs`, `/stats`)

---

### FALHA CRÍTICA #4 — Categorias sem filtro de tenant

> 🚨 RISCO CRÍTICO DE PRODUÇÃO

**Arquivo:** [modules/categorias/repository.ts](modules/categorias/repository.ts)

O repository de categorias recebe `fornecedorId` como parâmetro mas **IGNORA completamente**:

```typescript
async findAll(fornecedorId: string): Promise<Categoria[]> {
  return this.prisma.categoria.findMany({
    orderBy: { nome: 'asc' },
    // ← ZERO filtro por fornecedorId!
  })
}

async findById(id: string, fornecedorId: string): Promise<Categoria | null> {
  return this.prisma.categoria.findFirst({
    where: { id },  // ← SEM filtro por fornecedorId!
  })
}
```

**Risco:** Fornecedor A vê, edita e deleta categorias do Fornecedor B. **Vazamento de dados entre tenants.**

**Classificação:** **CRÍTICO** — IDOR / Broken Access Control

**Nota:** O modelo `Categoria` no schema Prisma **não tem campo `fornecedorId`**. A tabela de categorias é **global**, sem isolamento de tenant. Isso precisa ser redesenhado.

---

# 🔐 1. ANÁLISE DE SEGURANÇA COMPLETA

## 1.1 Vulnerabilidades por Severidade

### CRÍTICAS (5)

| # | Vulnerabilidade | Endpoint | Tipo |
|---|---|---|---|
| C1 | Criação de admin público | `/api/auth/register` | Privilege Escalation |
| C2 | Auth comentada em auditoria | `/api/audit` | Broken Auth |
| C3 | Email aberto (4 endpoints) | `/api/email/*` | Broken Auth + Spam |
| C4 | Categorias sem tenant filter | `/api/categorias/*` | IDOR |
| C5 | Sem middleware.ts global | Global | Missing Security Layer |

### ALTAS (8)

| # | Vulnerabilidade | Endpoint | Tipo |
|---|---|---|---|
| A1 | `getServerSession()` sem `authOptions` | `/api/fornecedor/*` (5 rotas) | Broken Auth |
| A2 | Módulo security inteiro não utilizado | Global | Dead Code / Missing Security |
| A3 | Dados mock sem isolamento tenant | `/api/fornecedor/*` | IDOR |
| A4 | `user.fornecedorId!` crash para admin | `/api/produtos` | Runtime Error |
| A5 | Rate limiting não implementado em nenhum endpoint | Global | DoS |
| A6 | CSRF protection não implementada | Global | CSRF |
| A7 | Sanitização de input não utilizada | Global | XSS |
| A8 | bcrypt salt rounds = 10 no register antigo | `/api/auth/register` | Weak Crypto |

### MÉDIAS (6)

| # | Vulnerabilidade | Endpoint | Tipo |
|---|---|---|---|
| M1 | Dois endpoints de registro com regras diferentes | `/register` vs `/registro` | Inconsistência |
| M2 | Senha mínima 6 chars no `/register` vs 8 no schema | `/api/auth/register` | Weak Validation |
| M3 | Health check expõe versão, uptime, DB response times | `/api/health` | Info Disclosure |
| M4 | POST de pedidos aceita qualquer body | `/api/fornecedor/pedidos` | Mass Assignment |
| M5 | `console.error` usado em vários endpoints | Múltiplos | Info Leak |
| M6 | CNPJ temporário com padrão previsível | `/api/auth/register` | Data Integrity |

### BAIXAS (3)

| # | Vulnerabilidade | Endpoint | Tipo |
|---|---|---|---|
| B1 | Sem validação de `parseInt`/`parseFloat` (NaN) | `/api/public/produtos` | Input Validation |
| B2 | Sem limit máximo em `/api/public/produtos` | `/api/public/produtos` | DoS |
| B3 | Error messages em inglês misturado com português | Múltiplos | Usability |

---

## 1.2 Detalhamento das Vulnerabilidades Críticas e Altas

### C1 — Privilege Escalation via Register

**Como explorar:**
```bash
curl -X POST https://seusite.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"nome":"Hacker","email":"hacker@evil.com","senha":"123456","tipo":"admin"}'
```

**Correção completa:**
```typescript
// app/api/auth/register/route.ts — DEVE SER REESCRITO OU REMOVIDO
// Usar apenas /api/auth/registro que já restringe tipos

const registerSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  email: emailSchema, // usar schema compartilhado
  senha: senhaSchema, // usar schema compartilhado (8 chars + complexidade)
  tipo: z.enum(['fornecedor', 'cliente']), // NUNCA aceitar 'admin'
})
```

### A1 — getServerSession() sem authOptions

**Arquivo afetado:** Todos em `/api/fornecedor/*`

**Problema:** Os endpoints importam `getServerSession` diretamente de `next-auth` ao invés do wrapper em [lib/auth/session.ts](lib/auth/session.ts) que passa `authOptions`. Sem `authOptions`, o NextAuth pode retornar uma sessão sem os campos customizados (`tipo`, `fornecedorId`, `clienteId`).

```typescript
// ❌ ERRADO (usado em todos os endpoints de fornecedor)
import { getServerSession } from 'next-auth';
const session = await getServerSession(); // sem authOptions!

// ✅ CORRETO
import { requireRole } from '@/lib/auth/session';
const user = await requireRole(['fornecedor']);
```

### A4 — Non-null assertion crash

**Arquivo:** [app/api/produtos/route.ts](app/api/produtos/route.ts)

```typescript
// Se user.tipo === 'admin', user.fornecedorId é undefined
const resultado = await produtoService.listar(user.fornecedorId!, ...);
// Runtime crash: Cannot read properties of undefined
```

**Correção:**
```typescript
export async function GET(request: Request) {
  const user = await requireRole(['fornecedor', 'admin']);

  let fornecedorId: string;
  
  if (user.tipo === 'admin') {
    // Admin precisa especificar o fornecedor ou ver todos
    fornecedorId = searchParams.get('fornecedorId') || '';
    if (!fornecedorId) {
      // Retornar lista de todos fornecedores ou erro
      return NextResponse.json(
        { error: 'Admin deve especificar fornecedorId' },
        { status: 400 }
      );
    }
  } else {
    if (!user.fornecedorId) {
      return NextResponse.json(
        { error: 'Fornecedor não encontrado' },
        { status: 404 }
      );
    }
    fornecedorId = user.fornecedorId;
  }
}
```

---

# 🧭 2. MAPEAMENTO COMPLETO DE ROTAS

| # | Método | Rota | Auth | RBAC | Validação | Multi-tenant | Usado no Frontend | Status |
|---|--------|------|------|------|-----------|-------------|-------------------|--------|
| 1 | GET/POST | `/api/auth/[...nextauth]` | NextAuth | - | NextAuth | - | Sim | OK |
| 2 | POST | `/api/auth/register` | **NÃO** | **NÃO** | Zod (fraca) | - | Sim | **CRÍTICO** |
| 3 | POST | `/api/auth/registro` | **NÃO** | **NÃO** | Zod (boa) | - | ? | **DUPLICADA** |
| 4 | GET/POST | `/api/produtos` | SIM | SIM | Zod | Parcial | Sim | MÉDIA |
| 5 | GET/PATCH/DELETE | `/api/produtos/[id]` | SIM | SIM | Zod | SIM | Sim | MÉDIA |
| 6 | GET | `/api/public/produtos` | NÃO (público) | - | **NÃO** | - | Sim | BAIXA |
| 7 | GET/POST | `/api/categorias` | SIM | SIM | Zod | **FALSO** | Sim | **CRÍTICO** |
| 8 | GET/PUT/DELETE | `/api/categorias/[id]` | SIM | SIM | Zod | **FALSO** | Sim | **CRÍTICO** |
| 9 | POST | `/api/email/send` | **NÃO** | **NÃO** | Zod | - | ? | **CRÍTICO** |
| 10 | GET | `/api/email/logs` | **NÃO** | **NÃO** | **NÃO** | - | ? | **CRÍTICO** |
| 11 | GET | `/api/email/test` | **NÃO** | **NÃO** | **NÃO** | - | NÃO | **REMOVER** |
| 12 | GET | `/api/email/stats` | **NÃO** | **NÃO** | **NÃO** | - | ? | **CRÍTICO** |
| 13 | GET/POST | `/api/fornecedor/pedidos` | SIM* | SIM* | **NÃO** | **NÃO (mock)** | Sim | ALTA |
| 14 | GET/PATCH | `/api/fornecedor/pedidos/[id]` | SIM* | SIM* | **NÃO** | **NÃO (mock)** | Sim | ALTA |
| 15 | GET/POST/DELETE | `/api/fornecedor/precos` | SIM* | SIM* | **NÃO** | **NÃO (mock)** | Sim | ALTA |
| 16 | GET/PATCH | `/api/fornecedor/estoque` | SIM* | SIM* | Mínima | **NÃO (mock)** | Sim | ALTA |
| 17 | GET | `/api/fornecedor/clientes` | SIM* | SIM* | **NÃO** | **NÃO (mock)** | Sim | ALTA |
| 18 | GET/POST | `/api/audit` | **NÃO** | **NÃO** | **NÃO** | - | NÃO | **CRÍTICO** |
| 19 | GET | `/api/health` | NÃO (público) | - | N/A | - | NÃO | BAIXA |

**\* = usa `getServerSession()` sem `authOptions`** — potencialmente inseguro

### Rotas para remover ou desativar imediatamente:
1. `/api/email/test` — endpoint de teste, não deveria existir em produção
2. `/api/auth/register` — duplicata insegura, usar `/api/auth/registro`

### Rotas redundantes:
- `/api/auth/register` e `/api/auth/registro` fazem a mesma coisa com validações diferentes

### Rotas mortas (sem uso no frontend confirmado):
- `/api/audit` (auth comentada)
- `/api/email/stats`
- `/api/email/logs`

---

# 🧠 3. ANÁLISE DE ARQUITETURA

## 3.1 O que está BOM

| Aspecto | Avaliação | Detalhes |
|---------|-----------|---------|
| Separação em camadas | **Parcial** | Módulos de `produtos` e `categorias` seguem Controller-Service-Repository |
| Erros tipados | **BOM** | Hierarquia de `AppError` bem definida |
| Validação com Zod | **Parcial** | Schemas existem para produtos e auth |
| Logging estruturado | **BOM** | Winston configurado, usado nos módulos novos |
| Base classes | **BOM** | `BaseController`, `BaseService`, `BaseRepository` |
| Paginação | **BOM** | Implementada em produtos e auditoria |
| DTOs | **Parcial** | Alguns endpoints retornam entidades diretamente |

## 3.2 O que está RUIM

### 3.2.1 — Inconsistência arquitetural grave

Existem **dois padrões completamente diferentes** convivendo:

**Padrão A (modular, correto):** `produtos`, `categorias`, `auth`
- Service layer ✅
- Repository layer ✅  
- Schemas Zod ✅
- Tipos definidos ✅
- Logging estruturado ✅

**Padrão B (inline, inseguro):** `fornecedor/*`, `email/*`, `audit`
- Lógica diretamente na route ❌
- Dados mock hardcoded ❌
- Sem validação ❌
- `console.error` ao invés de logger ❌
- Sem repository ❌

### 3.2.2 — Controllers "gordos" nos endpoints de fornecedor

Todos os endpoints em `/api/fornecedor/*` têm a lógica inteira na route. Sem service, sem repository, sem validação.

### 3.2.3 — Resposta de API não padronizada

Padrão A retorna:
```json
{ "success": true, "data": {...}, "meta": {...} }
```

Padrão B retorna:
```json
{ "success": true, "data": [...] }
// ou simplesmente:
{ "error": "Unauthorized" }
```

### 3.2.4 — Módulo de segurança inteiro implementado mas JAMAIS chamado

`lib/security/` contém ~700 linhas de código de segurança (rate limiter, CSRF, sanitizer, headers, file validator) que **não são utilizadas em LUGAR NENHUM**. Código morto.

### 3.2.5 — Categorias sem pertencimento a fornecedor

O model `Categoria` no Prisma não tem `fornecedorId`. As categorias são **globais**. Em um marketplace multi-tenant, cada fornecedor deveria ter suas próprias categorias.

---

# 🚀 4. MELHORIAS FUNCIONAIS

## 4.1 Prioridade CRÍTICA (implementar antes de ir para produção)

### 1. Middleware Global (`middleware.ts`)
**Por quê:** Sem middleware, cada endpoint precisa implementar sua própria segurança. Um esquecimento = vulnerabilidade.

```typescript
// middleware.ts (raiz do projeto)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

const PUBLIC_ROUTES = ['/api/auth', '/api/public', '/api/health', '/login', '/register'];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  // Security headers em TODAS as respostas
  const response = NextResponse.next();
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin
```


## License: MIT
https://github.com/mvolfik/eyp-calls/blob/9b73c12f57172aade13a6592ebf9b45c2571e6e9/frontend-worker/src/index.js

```
Agora tenho toda a informação necessária para compilar o relatório completo. Aqui está a auditoria:

---

# AUDITORIA COMPLETA — B2B MARKETPLACE

## Data: 16/02/2026 | Branch: `copilot/fix-organize-and-complete-frontend`

---

# 🚨🚨🚨 FALHAS CRÍTICAS DE PRODUÇÃO 🚨🚨🚨

Antes de qualquer análise ordenada, destaco imediatamente as falhas que **permitem comprometimento total do sistema**:

### FALHA CRÍTICA #1 — Qualquer pessoa pode se tornar ADMIN

> 🚨 RISCO CRÍTICO DE PRODUÇÃO

**Arquivo:** [app/api/auth/register/route.ts](app/api/auth/register/route.ts#L9)

```typescript
// QUALQUER PESSOA pode chamar esta API e se criar como admin:
const registerSchema = z.object({
  tipo: z.enum(['admin', 'fornecedor', 'cliente']) // ← ACEITA 'admin'
})
```

**Risco:** Escalação de privilégio total. Qualquer atacante faz `POST /api/auth/register` com `{"tipo": "admin"}` e obtém acesso administrativo.

**Classificação:** **CRÍTICO**

**Correção:**
```typescript
const registerSchema = z.object({
  tipo: z.enum(['fornecedor', 'cliente']) // REMOVER 'admin'
})
```

---

### FALHA CRÍTICA #2 — Auditoria totalmente aberta (auth COMENTADA)

> 🚨 RISCO CRÍTICO DE PRODUÇÃO

**Arquivo:** [app/api/audit/route.ts](app/api/audit/route.ts#L16-L21)

```typescript
// TODO: Add authentication check    ← LITERALMENTE UM TODO
// const session = await getServerSession();
// if (!session || session.user.role !== 'ADMIN') {
```

**Risco:** Qualquer pessoa acessa `GET /api/audit` e vê TODOS os logs de auditoria: IPs de usuários, user agents, ações, timestamps. Informação perfeita para um atacante mapear o sistema.

**Classificação:** **CRÍTICO**

---

### FALHA CRÍTICA #3 — Endpoint de email 100% aberto (phishing/spam)

> 🚨 RISCO CRÍTICO DE PRODUÇÃO

**Arquivo:** [app/api/email/send/route.ts](app/api/email/send/route.ts)

**Sem autenticação.** Qualquer pessoa envia e-mails arbitrários (incluindo HTML customizado) para qualquer endereço usando sua infraestrutura:

```bash
curl -X POST /api/email/send -d '{
  "type": "custom",
  "to": "vitima@empresa.com",
  "subject": "Urgente",
  "html": "<h1>Phishing</h1><a href=\"http://malware.com\">Clique aqui</a>"
}'
```

**Risco:** Vetor de phishing e spam usando seu domínio. Pode colocar seu domínio em blacklists de e-mail.

**Classificação:** **CRÍTICO** (todos os 4 endpoints de email: `/send`, `/test`, `/logs`, `/stats`)

---

### FALHA CRÍTICA #4 — Categorias sem filtro de tenant

> 🚨 RISCO CRÍTICO DE PRODUÇÃO

**Arquivo:** [modules/categorias/repository.ts](modules/categorias/repository.ts)

O repository de categorias recebe `fornecedorId` como parâmetro mas **IGNORA completamente**:

```typescript
async findAll(fornecedorId: string): Promise<Categoria[]> {
  return this.prisma.categoria.findMany({
    orderBy: { nome: 'asc' },
    // ← ZERO filtro por fornecedorId!
  })
}

async findById(id: string, fornecedorId: string): Promise<Categoria | null> {
  return this.prisma.categoria.findFirst({
    where: { id },  // ← SEM filtro por fornecedorId!
  })
}
```

**Risco:** Fornecedor A vê, edita e deleta categorias do Fornecedor B. **Vazamento de dados entre tenants.**

**Classificação:** **CRÍTICO** — IDOR / Broken Access Control

**Nota:** O modelo `Categoria` no schema Prisma **não tem campo `fornecedorId`**. A tabela de categorias é **global**, sem isolamento de tenant. Isso precisa ser redesenhado.

---

# 🔐 1. ANÁLISE DE SEGURANÇA COMPLETA

## 1.1 Vulnerabilidades por Severidade

### CRÍTICAS (5)

| # | Vulnerabilidade | Endpoint | Tipo |
|---|---|---|---|
| C1 | Criação de admin público | `/api/auth/register` | Privilege Escalation |
| C2 | Auth comentada em auditoria | `/api/audit` | Broken Auth |
| C3 | Email aberto (4 endpoints) | `/api/email/*` | Broken Auth + Spam |
| C4 | Categorias sem tenant filter | `/api/categorias/*` | IDOR |
| C5 | Sem middleware.ts global | Global | Missing Security Layer |

### ALTAS (8)

| # | Vulnerabilidade | Endpoint | Tipo |
|---|---|---|---|
| A1 | `getServerSession()` sem `authOptions` | `/api/fornecedor/*` (5 rotas) | Broken Auth |
| A2 | Módulo security inteiro não utilizado | Global | Dead Code / Missing Security |
| A3 | Dados mock sem isolamento tenant | `/api/fornecedor/*` | IDOR |
| A4 | `user.fornecedorId!` crash para admin | `/api/produtos` | Runtime Error |
| A5 | Rate limiting não implementado em nenhum endpoint | Global | DoS |
| A6 | CSRF protection não implementada | Global | CSRF |
| A7 | Sanitização de input não utilizada | Global | XSS |
| A8 | bcrypt salt rounds = 10 no register antigo | `/api/auth/register` | Weak Crypto |

### MÉDIAS (6)

| # | Vulnerabilidade | Endpoint | Tipo |
|---|---|---|---|
| M1 | Dois endpoints de registro com regras diferentes | `/register` vs `/registro` | Inconsistência |
| M2 | Senha mínima 6 chars no `/register` vs 8 no schema | `/api/auth/register` | Weak Validation |
| M3 | Health check expõe versão, uptime, DB response times | `/api/health` | Info Disclosure |
| M4 | POST de pedidos aceita qualquer body | `/api/fornecedor/pedidos` | Mass Assignment |
| M5 | `console.error` usado em vários endpoints | Múltiplos | Info Leak |
| M6 | CNPJ temporário com padrão previsível | `/api/auth/register` | Data Integrity |

### BAIXAS (3)

| # | Vulnerabilidade | Endpoint | Tipo |
|---|---|---|---|
| B1 | Sem validação de `parseInt`/`parseFloat` (NaN) | `/api/public/produtos` | Input Validation |
| B2 | Sem limit máximo em `/api/public/produtos` | `/api/public/produtos` | DoS |
| B3 | Error messages em inglês misturado com português | Múltiplos | Usability |

---

## 1.2 Detalhamento das Vulnerabilidades Críticas e Altas

### C1 — Privilege Escalation via Register

**Como explorar:**
```bash
curl -X POST https://seusite.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"nome":"Hacker","email":"hacker@evil.com","senha":"123456","tipo":"admin"}'
```

**Correção completa:**
```typescript
// app/api/auth/register/route.ts — DEVE SER REESCRITO OU REMOVIDO
// Usar apenas /api/auth/registro que já restringe tipos

const registerSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  email: emailSchema, // usar schema compartilhado
  senha: senhaSchema, // usar schema compartilhado (8 chars + complexidade)
  tipo: z.enum(['fornecedor', 'cliente']), // NUNCA aceitar 'admin'
})
```

### A1 — getServerSession() sem authOptions

**Arquivo afetado:** Todos em `/api/fornecedor/*`

**Problema:** Os endpoints importam `getServerSession` diretamente de `next-auth` ao invés do wrapper em [lib/auth/session.ts](lib/auth/session.ts) que passa `authOptions`. Sem `authOptions`, o NextAuth pode retornar uma sessão sem os campos customizados (`tipo`, `fornecedorId`, `clienteId`).

```typescript
// ❌ ERRADO (usado em todos os endpoints de fornecedor)
import { getServerSession } from 'next-auth';
const session = await getServerSession(); // sem authOptions!

// ✅ CORRETO
import { requireRole } from '@/lib/auth/session';
const user = await requireRole(['fornecedor']);
```

### A4 — Non-null assertion crash

**Arquivo:** [app/api/produtos/route.ts](app/api/produtos/route.ts)

```typescript
// Se user.tipo === 'admin', user.fornecedorId é undefined
const resultado = await produtoService.listar(user.fornecedorId!, ...);
// Runtime crash: Cannot read properties of undefined
```

**Correção:**
```typescript
export async function GET(request: Request) {
  const user = await requireRole(['fornecedor', 'admin']);

  let fornecedorId: string;
  
  if (user.tipo === 'admin') {
    // Admin precisa especificar o fornecedor ou ver todos
    fornecedorId = searchParams.get('fornecedorId') || '';
    if (!fornecedorId) {
      // Retornar lista de todos fornecedores ou erro
      return NextResponse.json(
        { error: 'Admin deve especificar fornecedorId' },
        { status: 400 }
      );
    }
  } else {
    if (!user.fornecedorId) {
      return NextResponse.json(
        { error: 'Fornecedor não encontrado' },
        { status: 404 }
      );
    }
    fornecedorId = user.fornecedorId;
  }
}
```

---

# 🧭 2. MAPEAMENTO COMPLETO DE ROTAS

| # | Método | Rota | Auth | RBAC | Validação | Multi-tenant | Usado no Frontend | Status |
|---|--------|------|------|------|-----------|-------------|-------------------|--------|
| 1 | GET/POST | `/api/auth/[...nextauth]` | NextAuth | - | NextAuth | - | Sim | OK |
| 2 | POST | `/api/auth/register` | **NÃO** | **NÃO** | Zod (fraca) | - | Sim | **CRÍTICO** |
| 3 | POST | `/api/auth/registro` | **NÃO** | **NÃO** | Zod (boa) | - | ? | **DUPLICADA** |
| 4 | GET/POST | `/api/produtos` | SIM | SIM | Zod | Parcial | Sim | MÉDIA |
| 5 | GET/PATCH/DELETE | `/api/produtos/[id]` | SIM | SIM | Zod | SIM | Sim | MÉDIA |
| 6 | GET | `/api/public/produtos` | NÃO (público) | - | **NÃO** | - | Sim | BAIXA |
| 7 | GET/POST | `/api/categorias` | SIM | SIM | Zod | **FALSO** | Sim | **CRÍTICO** |
| 8 | GET/PUT/DELETE | `/api/categorias/[id]` | SIM | SIM | Zod | **FALSO** | Sim | **CRÍTICO** |
| 9 | POST | `/api/email/send` | **NÃO** | **NÃO** | Zod | - | ? | **CRÍTICO** |
| 10 | GET | `/api/email/logs` | **NÃO** | **NÃO** | **NÃO** | - | ? | **CRÍTICO** |
| 11 | GET | `/api/email/test` | **NÃO** | **NÃO** | **NÃO** | - | NÃO | **REMOVER** |
| 12 | GET | `/api/email/stats` | **NÃO** | **NÃO** | **NÃO** | - | ? | **CRÍTICO** |
| 13 | GET/POST | `/api/fornecedor/pedidos` | SIM* | SIM* | **NÃO** | **NÃO (mock)** | Sim | ALTA |
| 14 | GET/PATCH | `/api/fornecedor/pedidos/[id]` | SIM* | SIM* | **NÃO** | **NÃO (mock)** | Sim | ALTA |
| 15 | GET/POST/DELETE | `/api/fornecedor/precos` | SIM* | SIM* | **NÃO** | **NÃO (mock)** | Sim | ALTA |
| 16 | GET/PATCH | `/api/fornecedor/estoque` | SIM* | SIM* | Mínima | **NÃO (mock)** | Sim | ALTA |
| 17 | GET | `/api/fornecedor/clientes` | SIM* | SIM* | **NÃO** | **NÃO (mock)** | Sim | ALTA |
| 18 | GET/POST | `/api/audit` | **NÃO** | **NÃO** | **NÃO** | - | NÃO | **CRÍTICO** |
| 19 | GET | `/api/health` | NÃO (público) | - | N/A | - | NÃO | BAIXA |

**\* = usa `getServerSession()` sem `authOptions`** — potencialmente inseguro

### Rotas para remover ou desativar imediatamente:
1. `/api/email/test` — endpoint de teste, não deveria existir em produção
2. `/api/auth/register` — duplicata insegura, usar `/api/auth/registro`

### Rotas redundantes:
- `/api/auth/register` e `/api/auth/registro` fazem a mesma coisa com validações diferentes

### Rotas mortas (sem uso no frontend confirmado):
- `/api/audit` (auth comentada)
- `/api/email/stats`
- `/api/email/logs`

---

# 🧠 3. ANÁLISE DE ARQUITETURA

## 3.1 O que está BOM

| Aspecto | Avaliação | Detalhes |
|---------|-----------|---------|
| Separação em camadas | **Parcial** | Módulos de `produtos` e `categorias` seguem Controller-Service-Repository |
| Erros tipados | **BOM** | Hierarquia de `AppError` bem definida |
| Validação com Zod | **Parcial** | Schemas existem para produtos e auth |
| Logging estruturado | **BOM** | Winston configurado, usado nos módulos novos |
| Base classes | **BOM** | `BaseController`, `BaseService`, `BaseRepository` |
| Paginação | **BOM** | Implementada em produtos e auditoria |
| DTOs | **Parcial** | Alguns endpoints retornam entidades diretamente |

## 3.2 O que está RUIM

### 3.2.1 — Inconsistência arquitetural grave

Existem **dois padrões completamente diferentes** convivendo:

**Padrão A (modular, correto):** `produtos`, `categorias`, `auth`
- Service layer ✅
- Repository layer ✅  
- Schemas Zod ✅
- Tipos definidos ✅
- Logging estruturado ✅

**Padrão B (inline, inseguro):** `fornecedor/*`, `email/*`, `audit`
- Lógica diretamente na route ❌
- Dados mock hardcoded ❌
- Sem validação ❌
- `console.error` ao invés de logger ❌
- Sem repository ❌

### 3.2.2 — Controllers "gordos" nos endpoints de fornecedor

Todos os endpoints em `/api/fornecedor/*` têm a lógica inteira na route. Sem service, sem repository, sem validação.

### 3.2.3 — Resposta de API não padronizada

Padrão A retorna:
```json
{ "success": true, "data": {...}, "meta": {...} }
```

Padrão B retorna:
```json
{ "success": true, "data": [...] }
// ou simplesmente:
{ "error": "Unauthorized" }
```

### 3.2.4 — Módulo de segurança inteiro implementado mas JAMAIS chamado

`lib/security/` contém ~700 linhas de código de segurança (rate limiter, CSRF, sanitizer, headers, file validator) que **não são utilizadas em LUGAR NENHUM**. Código morto.

### 3.2.5 — Categorias sem pertencimento a fornecedor

O model `Categoria` no Prisma não tem `fornecedorId`. As categorias são **globais**. Em um marketplace multi-tenant, cada fornecedor deveria ter suas próprias categorias.

---

# 🚀 4. MELHORIAS FUNCIONAIS

## 4.1 Prioridade CRÍTICA (implementar antes de ir para produção)

### 1. Middleware Global (`middleware.ts`)
**Por quê:** Sem middleware, cada endpoint precisa implementar sua própria segurança. Um esquecimento = vulnerabilidade.

```typescript
// middleware.ts (raiz do projeto)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

const PUBLIC_ROUTES = ['/api/auth', '/api/public', '/api/health', '/login', '/register'];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  // Security headers em TODAS as respostas
  const response = NextResponse.next();
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin
```


## License: MIT
https://github.com/mvolfik/eyp-calls/blob/9b73c12f57172aade13a6592ebf9b45c2571e6e9/frontend-worker/src/index.js

```
Agora tenho toda a informação necessária para compilar o relatório completo. Aqui está a auditoria:

---

# AUDITORIA COMPLETA — B2B MARKETPLACE

## Data: 16/02/2026 | Branch: `copilot/fix-organize-and-complete-frontend`

---

# 🚨🚨🚨 FALHAS CRÍTICAS DE PRODUÇÃO 🚨🚨🚨

Antes de qualquer análise ordenada, destaco imediatamente as falhas que **permitem comprometimento total do sistema**:

### FALHA CRÍTICA #1 — Qualquer pessoa pode se tornar ADMIN

> 🚨 RISCO CRÍTICO DE PRODUÇÃO

**Arquivo:** [app/api/auth/register/route.ts](app/api/auth/register/route.ts#L9)

```typescript
// QUALQUER PESSOA pode chamar esta API e se criar como admin:
const registerSchema = z.object({
  tipo: z.enum(['admin', 'fornecedor', 'cliente']) // ← ACEITA 'admin'
})
```

**Risco:** Escalação de privilégio total. Qualquer atacante faz `POST /api/auth/register` com `{"tipo": "admin"}` e obtém acesso administrativo.

**Classificação:** **CRÍTICO**

**Correção:**
```typescript
const registerSchema = z.object({
  tipo: z.enum(['fornecedor', 'cliente']) // REMOVER 'admin'
})
```

---

### FALHA CRÍTICA #2 — Auditoria totalmente aberta (auth COMENTADA)

> 🚨 RISCO CRÍTICO DE PRODUÇÃO

**Arquivo:** [app/api/audit/route.ts](app/api/audit/route.ts#L16-L21)

```typescript
// TODO: Add authentication check    ← LITERALMENTE UM TODO
// const session = await getServerSession();
// if (!session || session.user.role !== 'ADMIN') {
```

**Risco:** Qualquer pessoa acessa `GET /api/audit` e vê TODOS os logs de auditoria: IPs de usuários, user agents, ações, timestamps. Informação perfeita para um atacante mapear o sistema.

**Classificação:** **CRÍTICO**

---

### FALHA CRÍTICA #3 — Endpoint de email 100% aberto (phishing/spam)

> 🚨 RISCO CRÍTICO DE PRODUÇÃO

**Arquivo:** [app/api/email/send/route.ts](app/api/email/send/route.ts)

**Sem autenticação.** Qualquer pessoa envia e-mails arbitrários (incluindo HTML customizado) para qualquer endereço usando sua infraestrutura:

```bash
curl -X POST /api/email/send -d '{
  "type": "custom",
  "to": "vitima@empresa.com",
  "subject": "Urgente",
  "html": "<h1>Phishing</h1><a href=\"http://malware.com\">Clique aqui</a>"
}'
```

**Risco:** Vetor de phishing e spam usando seu domínio. Pode colocar seu domínio em blacklists de e-mail.

**Classificação:** **CRÍTICO** (todos os 4 endpoints de email: `/send`, `/test`, `/logs`, `/stats`)

---

### FALHA CRÍTICA #4 — Categorias sem filtro de tenant

> 🚨 RISCO CRÍTICO DE PRODUÇÃO

**Arquivo:** [modules/categorias/repository.ts](modules/categorias/repository.ts)

O repository de categorias recebe `fornecedorId` como parâmetro mas **IGNORA completamente**:

```typescript
async findAll(fornecedorId: string): Promise<Categoria[]> {
  return this.prisma.categoria.findMany({
    orderBy: { nome: 'asc' },
    // ← ZERO filtro por fornecedorId!
  })
}

async findById(id: string, fornecedorId: string): Promise<Categoria | null> {
  return this.prisma.categoria.findFirst({
    where: { id },  // ← SEM filtro por fornecedorId!
  })
}
```

**Risco:** Fornecedor A vê, edita e deleta categorias do Fornecedor B. **Vazamento de dados entre tenants.**

**Classificação:** **CRÍTICO** — IDOR / Broken Access Control

**Nota:** O modelo `Categoria` no schema Prisma **não tem campo `fornecedorId`**. A tabela de categorias é **global**, sem isolamento de tenant. Isso precisa ser redesenhado.

---

# 🔐 1. ANÁLISE DE SEGURANÇA COMPLETA

## 1.1 Vulnerabilidades por Severidade

### CRÍTICAS (5)

| # | Vulnerabilidade | Endpoint | Tipo |
|---|---|---|---|
| C1 | Criação de admin público | `/api/auth/register` | Privilege Escalation |
| C2 | Auth comentada em auditoria | `/api/audit` | Broken Auth |
| C3 | Email aberto (4 endpoints) | `/api/email/*` | Broken Auth + Spam |
| C4 | Categorias sem tenant filter | `/api/categorias/*` | IDOR |
| C5 | Sem middleware.ts global | Global | Missing Security Layer |

### ALTAS (8)

| # | Vulnerabilidade | Endpoint | Tipo |
|---|---|---|---|
| A1 | `getServerSession()` sem `authOptions` | `/api/fornecedor/*` (5 rotas) | Broken Auth |
| A2 | Módulo security inteiro não utilizado | Global | Dead Code / Missing Security |
| A3 | Dados mock sem isolamento tenant | `/api/fornecedor/*` | IDOR |
| A4 | `user.fornecedorId!` crash para admin | `/api/produtos` | Runtime Error |
| A5 | Rate limiting não implementado em nenhum endpoint | Global | DoS |
| A6 | CSRF protection não implementada | Global | CSRF |
| A7 | Sanitização de input não utilizada | Global | XSS |
| A8 | bcrypt salt rounds = 10 no register antigo | `/api/auth/register` | Weak Crypto |

### MÉDIAS (6)

| # | Vulnerabilidade | Endpoint | Tipo |
|---|---|---|---|
| M1 | Dois endpoints de registro com regras diferentes | `/register` vs `/registro` | Inconsistência |
| M2 | Senha mínima 6 chars no `/register` vs 8 no schema | `/api/auth/register` | Weak Validation |
| M3 | Health check expõe versão, uptime, DB response times | `/api/health` | Info Disclosure |
| M4 | POST de pedidos aceita qualquer body | `/api/fornecedor/pedidos` | Mass Assignment |
| M5 | `console.error` usado em vários endpoints | Múltiplos | Info Leak |
| M6 | CNPJ temporário com padrão previsível | `/api/auth/register` | Data Integrity |

### BAIXAS (3)

| # | Vulnerabilidade | Endpoint | Tipo |
|---|---|---|---|
| B1 | Sem validação de `parseInt`/`parseFloat` (NaN) | `/api/public/produtos` | Input Validation |
| B2 | Sem limit máximo em `/api/public/produtos` | `/api/public/produtos` | DoS |
| B3 | Error messages em inglês misturado com português | Múltiplos | Usability |

---

## 1.2 Detalhamento das Vulnerabilidades Críticas e Altas

### C1 — Privilege Escalation via Register

**Como explorar:**
```bash
curl -X POST https://seusite.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"nome":"Hacker","email":"hacker@evil.com","senha":"123456","tipo":"admin"}'
```

**Correção completa:**
```typescript
// app/api/auth/register/route.ts — DEVE SER REESCRITO OU REMOVIDO
// Usar apenas /api/auth/registro que já restringe tipos

const registerSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  email: emailSchema, // usar schema compartilhado
  senha: senhaSchema, // usar schema compartilhado (8 chars + complexidade)
  tipo: z.enum(['fornecedor', 'cliente']), // NUNCA aceitar 'admin'
})
```

### A1 — getServerSession() sem authOptions

**Arquivo afetado:** Todos em `/api/fornecedor/*`

**Problema:** Os endpoints importam `getServerSession` diretamente de `next-auth` ao invés do wrapper em [lib/auth/session.ts](lib/auth/session.ts) que passa `authOptions`. Sem `authOptions`, o NextAuth pode retornar uma sessão sem os campos customizados (`tipo`, `fornecedorId`, `clienteId`).

```typescript
// ❌ ERRADO (usado em todos os endpoints de fornecedor)
import { getServerSession } from 'next-auth';
const session = await getServerSession(); // sem authOptions!

// ✅ CORRETO
import { requireRole } from '@/lib/auth/session';
const user = await requireRole(['fornecedor']);
```

### A4 — Non-null assertion crash

**Arquivo:** [app/api/produtos/route.ts](app/api/produtos/route.ts)

```typescript
// Se user.tipo === 'admin', user.fornecedorId é undefined
const resultado = await produtoService.listar(user.fornecedorId!, ...);
// Runtime crash: Cannot read properties of undefined
```

**Correção:**
```typescript
export async function GET(request: Request) {
  const user = await requireRole(['fornecedor', 'admin']);

  let fornecedorId: string;
  
  if (user.tipo === 'admin') {
    // Admin precisa especificar o fornecedor ou ver todos
    fornecedorId = searchParams.get('fornecedorId') || '';
    if (!fornecedorId) {
      // Retornar lista de todos fornecedores ou erro
      return NextResponse.json(
        { error: 'Admin deve especificar fornecedorId' },
        { status: 400 }
      );
    }
  } else {
    if (!user.fornecedorId) {
      return NextResponse.json(
        { error: 'Fornecedor não encontrado' },
        { status: 404 }
      );
    }
    fornecedorId = user.fornecedorId;
  }
}
```

---

# 🧭 2. MAPEAMENTO COMPLETO DE ROTAS

| # | Método | Rota | Auth | RBAC | Validação | Multi-tenant | Usado no Frontend | Status |
|---|--------|------|------|------|-----------|-------------|-------------------|--------|
| 1 | GET/POST | `/api/auth/[...nextauth]` | NextAuth | - | NextAuth | - | Sim | OK |
| 2 | POST | `/api/auth/register` | **NÃO** | **NÃO** | Zod (fraca) | - | Sim | **CRÍTICO** |
| 3 | POST | `/api/auth/registro` | **NÃO** | **NÃO** | Zod (boa) | - | ? | **DUPLICADA** |
| 4 | GET/POST | `/api/produtos` | SIM | SIM | Zod | Parcial | Sim | MÉDIA |
| 5 | GET/PATCH/DELETE | `/api/produtos/[id]` | SIM | SIM | Zod | SIM | Sim | MÉDIA |
| 6 | GET | `/api/public/produtos` | NÃO (público) | - | **NÃO** | - | Sim | BAIXA |
| 7 | GET/POST | `/api/categorias` | SIM | SIM | Zod | **FALSO** | Sim | **CRÍTICO** |
| 8 | GET/PUT/DELETE | `/api/categorias/[id]` | SIM | SIM | Zod | **FALSO** | Sim | **CRÍTICO** |
| 9 | POST | `/api/email/send` | **NÃO** | **NÃO** | Zod | - | ? | **CRÍTICO** |
| 10 | GET | `/api/email/logs` | **NÃO** | **NÃO** | **NÃO** | - | ? | **CRÍTICO** |
| 11 | GET | `/api/email/test` | **NÃO** | **NÃO** | **NÃO** | - | NÃO | **REMOVER** |
| 12 | GET | `/api/email/stats` | **NÃO** | **NÃO** | **NÃO** | - | ? | **CRÍTICO** |
| 13 | GET/POST | `/api/fornecedor/pedidos` | SIM* | SIM* | **NÃO** | **NÃO (mock)** | Sim | ALTA |
| 14 | GET/PATCH | `/api/fornecedor/pedidos/[id]` | SIM* | SIM* | **NÃO** | **NÃO (mock)** | Sim | ALTA |
| 15 | GET/POST/DELETE | `/api/fornecedor/precos` | SIM* | SIM* | **NÃO** | **NÃO (mock)** | Sim | ALTA |
| 16 | GET/PATCH | `/api/fornecedor/estoque` | SIM* | SIM* | Mínima | **NÃO (mock)** | Sim | ALTA |
| 17 | GET | `/api/fornecedor/clientes` | SIM* | SIM* | **NÃO** | **NÃO (mock)** | Sim | ALTA |
| 18 | GET/POST | `/api/audit` | **NÃO** | **NÃO** | **NÃO** | - | NÃO | **CRÍTICO** |
| 19 | GET | `/api/health` | NÃO (público) | - | N/A | - | NÃO | BAIXA |

**\* = usa `getServerSession()` sem `authOptions`** — potencialmente inseguro

### Rotas para remover ou desativar imediatamente:
1. `/api/email/test` — endpoint de teste, não deveria existir em produção
2. `/api/auth/register` — duplicata insegura, usar `/api/auth/registro`

### Rotas redundantes:
- `/api/auth/register` e `/api/auth/registro` fazem a mesma coisa com validações diferentes

### Rotas mortas (sem uso no frontend confirmado):
- `/api/audit` (auth comentada)
- `/api/email/stats`
- `/api/email/logs`

---

# 🧠 3. ANÁLISE DE ARQUITETURA

## 3.1 O que está BOM

| Aspecto | Avaliação | Detalhes |
|---------|-----------|---------|
| Separação em camadas | **Parcial** | Módulos de `produtos` e `categorias` seguem Controller-Service-Repository |
| Erros tipados | **BOM** | Hierarquia de `AppError` bem definida |
| Validação com Zod | **Parcial** | Schemas existem para produtos e auth |
| Logging estruturado | **BOM** | Winston configurado, usado nos módulos novos |
| Base classes | **BOM** | `BaseController`, `BaseService`, `BaseRepository` |
| Paginação | **BOM** | Implementada em produtos e auditoria |
| DTOs | **Parcial** | Alguns endpoints retornam entidades diretamente |

## 3.2 O que está RUIM

### 3.2.1 — Inconsistência arquitetural grave

Existem **dois padrões completamente diferentes** convivendo:

**Padrão A (modular, correto):** `produtos`, `categorias`, `auth`
- Service layer ✅
- Repository layer ✅  
- Schemas Zod ✅
- Tipos definidos ✅
- Logging estruturado ✅

**Padrão B (inline, inseguro):** `fornecedor/*`, `email/*`, `audit`
- Lógica diretamente na route ❌
- Dados mock hardcoded ❌
- Sem validação ❌
- `console.error` ao invés de logger ❌
- Sem repository ❌

### 3.2.2 — Controllers "gordos" nos endpoints de fornecedor

Todos os endpoints em `/api/fornecedor/*` têm a lógica inteira na route. Sem service, sem repository, sem validação.

### 3.2.3 — Resposta de API não padronizada

Padrão A retorna:
```json
{ "success": true, "data": {...}, "meta": {...} }
```

Padrão B retorna:
```json
{ "success": true, "data": [...] }
// ou simplesmente:
{ "error": "Unauthorized" }
```

### 3.2.4 — Módulo de segurança inteiro implementado mas JAMAIS chamado

`lib/security/` contém ~700 linhas de código de segurança (rate limiter, CSRF, sanitizer, headers, file validator) que **não são utilizadas em LUGAR NENHUM**. Código morto.

### 3.2.5 — Categorias sem pertencimento a fornecedor

O model `Categoria` no Prisma não tem `fornecedorId`. As categorias são **globais**. Em um marketplace multi-tenant, cada fornecedor deveria ter suas próprias categorias.

---

# 🚀 4. MELHORIAS FUNCIONAIS

## 4.1 Prioridade CRÍTICA (implementar antes de ir para produção)

### 1. Middleware Global (`middleware.ts`)
**Por quê:** Sem middleware, cada endpoint precisa implementar sua própria segurança. Um esquecimento = vulnerabilidade.

```typescript
// middleware.ts (raiz do projeto)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

const PUBLIC_ROUTES = ['/api/auth', '/api/public', '/api/health', '/login', '/register'];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  // Security headers em TODAS as respostas
  const response = NextResponse.next();
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin
```


## License: MIT
https://github.com/mvolfik/eyp-calls/blob/9b73c12f57172aade13a6592ebf9b45c2571e6e9/frontend-worker/src/index.js

```
Agora tenho toda a informação necessária para compilar o relatório completo. Aqui está a auditoria:

---

# AUDITORIA COMPLETA — B2B MARKETPLACE

## Data: 16/02/2026 | Branch: `copilot/fix-organize-and-complete-frontend`

---

# 🚨🚨🚨 FALHAS CRÍTICAS DE PRODUÇÃO 🚨🚨🚨

Antes de qualquer análise ordenada, destaco imediatamente as falhas que **permitem comprometimento total do sistema**:

### FALHA CRÍTICA #1 — Qualquer pessoa pode se tornar ADMIN

> 🚨 RISCO CRÍTICO DE PRODUÇÃO

**Arquivo:** [app/api/auth/register/route.ts](app/api/auth/register/route.ts#L9)

```typescript
// QUALQUER PESSOA pode chamar esta API e se criar como admin:
const registerSchema = z.object({
  tipo: z.enum(['admin', 'fornecedor', 'cliente']) // ← ACEITA 'admin'
})
```

**Risco:** Escalação de privilégio total. Qualquer atacante faz `POST /api/auth/register` com `{"tipo": "admin"}` e obtém acesso administrativo.

**Classificação:** **CRÍTICO**

**Correção:**
```typescript
const registerSchema = z.object({
  tipo: z.enum(['fornecedor', 'cliente']) // REMOVER 'admin'
})
```

---

### FALHA CRÍTICA #2 — Auditoria totalmente aberta (auth COMENTADA)

> 🚨 RISCO CRÍTICO DE PRODUÇÃO

**Arquivo:** [app/api/audit/route.ts](app/api/audit/route.ts#L16-L21)

```typescript
// TODO: Add authentication check    ← LITERALMENTE UM TODO
// const session = await getServerSession();
// if (!session || session.user.role !== 'ADMIN') {
```

**Risco:** Qualquer pessoa acessa `GET /api/audit` e vê TODOS os logs de auditoria: IPs de usuários, user agents, ações, timestamps. Informação perfeita para um atacante mapear o sistema.

**Classificação:** **CRÍTICO**

---

### FALHA CRÍTICA #3 — Endpoint de email 100% aberto (phishing/spam)

> 🚨 RISCO CRÍTICO DE PRODUÇÃO

**Arquivo:** [app/api/email/send/route.ts](app/api/email/send/route.ts)

**Sem autenticação.** Qualquer pessoa envia e-mails arbitrários (incluindo HTML customizado) para qualquer endereço usando sua infraestrutura:

```bash
curl -X POST /api/email/send -d '{
  "type": "custom",
  "to": "vitima@empresa.com",
  "subject": "Urgente",
  "html": "<h1>Phishing</h1><a href=\"http://malware.com\">Clique aqui</a>"
}'
```

**Risco:** Vetor de phishing e spam usando seu domínio. Pode colocar seu domínio em blacklists de e-mail.

**Classificação:** **CRÍTICO** (todos os 4 endpoints de email: `/send`, `/test`, `/logs`, `/stats`)

---

### FALHA CRÍTICA #4 — Categorias sem filtro de tenant

> 🚨 RISCO CRÍTICO DE PRODUÇÃO

**Arquivo:** [modules/categorias/repository.ts](modules/categorias/repository.ts)

O repository de categorias recebe `fornecedorId` como parâmetro mas **IGNORA completamente**:

```typescript
async findAll(fornecedorId: string): Promise<Categoria[]> {
  return this.prisma.categoria.findMany({
    orderBy: { nome: 'asc' },
    // ← ZERO filtro por fornecedorId!
  })
}

async findById(id: string, fornecedorId: string): Promise<Categoria | null> {
  return this.prisma.categoria.findFirst({
    where: { id },  // ← SEM filtro por fornecedorId!
  })
}
```

**Risco:** Fornecedor A vê, edita e deleta categorias do Fornecedor B. **Vazamento de dados entre tenants.**

**Classificação:** **CRÍTICO** — IDOR / Broken Access Control

**Nota:** O modelo `Categoria` no schema Prisma **não tem campo `fornecedorId`**. A tabela de categorias é **global**, sem isolamento de tenant. Isso precisa ser redesenhado.

---

# 🔐 1. ANÁLISE DE SEGURANÇA COMPLETA

## 1.1 Vulnerabilidades por Severidade

### CRÍTICAS (5)

| # | Vulnerabilidade | Endpoint | Tipo |
|---|---|---|---|
| C1 | Criação de admin público | `/api/auth/register` | Privilege Escalation |
| C2 | Auth comentada em auditoria | `/api/audit` | Broken Auth |
| C3 | Email aberto (4 endpoints) | `/api/email/*` | Broken Auth + Spam |
| C4 | Categorias sem tenant filter | `/api/categorias/*` | IDOR |
| C5 | Sem middleware.ts global | Global | Missing Security Layer |

### ALTAS (8)

| # | Vulnerabilidade | Endpoint | Tipo |
|---|---|---|---|
| A1 | `getServerSession()` sem `authOptions` | `/api/fornecedor/*` (5 rotas) | Broken Auth |
| A2 | Módulo security inteiro não utilizado | Global | Dead Code / Missing Security |
| A3 | Dados mock sem isolamento tenant | `/api/fornecedor/*` | IDOR |
| A4 | `user.fornecedorId!` crash para admin | `/api/produtos` | Runtime Error |
| A5 | Rate limiting não implementado em nenhum endpoint | Global | DoS |
| A6 | CSRF protection não implementada | Global | CSRF |
| A7 | Sanitização de input não utilizada | Global | XSS |
| A8 | bcrypt salt rounds = 10 no register antigo | `/api/auth/register` | Weak Crypto |

### MÉDIAS (6)

| # | Vulnerabilidade | Endpoint | Tipo |
|---|---|---|---|
| M1 | Dois endpoints de registro com regras diferentes | `/register` vs `/registro` | Inconsistência |
| M2 | Senha mínima 6 chars no `/register` vs 8 no schema | `/api/auth/register` | Weak Validation |
| M3 | Health check expõe versão, uptime, DB response times | `/api/health` | Info Disclosure |
| M4 | POST de pedidos aceita qualquer body | `/api/fornecedor/pedidos` | Mass Assignment |
| M5 | `console.error` usado em vários endpoints | Múltiplos | Info Leak |
| M6 | CNPJ temporário com padrão previsível | `/api/auth/register` | Data Integrity |

### BAIXAS (3)

| # | Vulnerabilidade | Endpoint | Tipo |
|---|---|---|---|
| B1 | Sem validação de `parseInt`/`parseFloat` (NaN) | `/api/public/produtos` | Input Validation |
| B2 | Sem limit máximo em `/api/public/produtos` | `/api/public/produtos` | DoS |
| B3 | Error messages em inglês misturado com português | Múltiplos | Usability |

---

## 1.2 Detalhamento das Vulnerabilidades Críticas e Altas

### C1 — Privilege Escalation via Register

**Como explorar:**
```bash
curl -X POST https://seusite.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"nome":"Hacker","email":"hacker@evil.com","senha":"123456","tipo":"admin"}'
```

**Correção completa:**
```typescript
// app/api/auth/register/route.ts — DEVE SER REESCRITO OU REMOVIDO
// Usar apenas /api/auth/registro que já restringe tipos

const registerSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  email: emailSchema, // usar schema compartilhado
  senha: senhaSchema, // usar schema compartilhado (8 chars + complexidade)
  tipo: z.enum(['fornecedor', 'cliente']), // NUNCA aceitar 'admin'
})
```

### A1 — getServerSession() sem authOptions

**Arquivo afetado:** Todos em `/api/fornecedor/*`

**Problema:** Os endpoints importam `getServerSession` diretamente de `next-auth` ao invés do wrapper em [lib/auth/session.ts](lib/auth/session.ts) que passa `authOptions`. Sem `authOptions`, o NextAuth pode retornar uma sessão sem os campos customizados (`tipo`, `fornecedorId`, `clienteId`).

```typescript
// ❌ ERRADO (usado em todos os endpoints de fornecedor)
import { getServerSession } from 'next-auth';
const session = await getServerSession(); // sem authOptions!

// ✅ CORRETO
import { requireRole } from '@/lib/auth/session';
const user = await requireRole(['fornecedor']);
```

### A4 — Non-null assertion crash

**Arquivo:** [app/api/produtos/route.ts](app/api/produtos/route.ts)

```typescript
// Se user.tipo === 'admin', user.fornecedorId é undefined
const resultado = await produtoService.listar(user.fornecedorId!, ...);
// Runtime crash: Cannot read properties of undefined
```

**Correção:**
```typescript
export async function GET(request: Request) {
  const user = await requireRole(['fornecedor', 'admin']);

  let fornecedorId: string;
  
  if (user.tipo === 'admin') {
    // Admin precisa especificar o fornecedor ou ver todos
    fornecedorId = searchParams.get('fornecedorId') || '';
    if (!fornecedorId) {
      // Retornar lista de todos fornecedores ou erro
      return NextResponse.json(
        { error: 'Admin deve especificar fornecedorId' },
        { status: 400 }
      );
    }
  } else {
    if (!user.fornecedorId) {
      return NextResponse.json(
        { error: 'Fornecedor não encontrado' },
        { status: 404 }
      );
    }
    fornecedorId = user.fornecedorId;
  }
}
```

---

# 🧭 2. MAPEAMENTO COMPLETO DE ROTAS

| # | Método | Rota | Auth | RBAC | Validação | Multi-tenant | Usado no Frontend | Status |
|---|--------|------|------|------|-----------|-------------|-------------------|--------|
| 1 | GET/POST | `/api/auth/[...nextauth]` | NextAuth | - | NextAuth | - | Sim | OK |
| 2 | POST | `/api/auth/register` | **NÃO** | **NÃO** | Zod (fraca) | - | Sim | **CRÍTICO** |
| 3 | POST | `/api/auth/registro` | **NÃO** | **NÃO** | Zod (boa) | - | ? | **DUPLICADA** |
| 4 | GET/POST | `/api/produtos` | SIM | SIM | Zod | Parcial | Sim | MÉDIA |
| 5 | GET/PATCH/DELETE | `/api/produtos/[id]` | SIM | SIM | Zod | SIM | Sim | MÉDIA |
| 6 | GET | `/api/public/produtos` | NÃO (público) | - | **NÃO** | - | Sim | BAIXA |
| 7 | GET/POST | `/api/categorias` | SIM | SIM | Zod | **FALSO** | Sim | **CRÍTICO** |
| 8 | GET/PUT/DELETE | `/api/categorias/[id]` | SIM | SIM | Zod | **FALSO** | Sim | **CRÍTICO** |
| 9 | POST | `/api/email/send` | **NÃO** | **NÃO** | Zod | - | ? | **CRÍTICO** |
| 10 | GET | `/api/email/logs` | **NÃO** | **NÃO** | **NÃO** | - | ? | **CRÍTICO** |
| 11 | GET | `/api/email/test` | **NÃO** | **NÃO** | **NÃO** | - | NÃO | **REMOVER** |
| 12 | GET | `/api/email/stats` | **NÃO** | **NÃO** | **NÃO** | - | ? | **CRÍTICO** |
| 13 | GET/POST | `/api/fornecedor/pedidos` | SIM* | SIM* | **NÃO** | **NÃO (mock)** | Sim | ALTA |
| 14 | GET/PATCH | `/api/fornecedor/pedidos/[id]` | SIM* | SIM* | **NÃO** | **NÃO (mock)** | Sim | ALTA |
| 15 | GET/POST/DELETE | `/api/fornecedor/precos` | SIM* | SIM* | **NÃO** | **NÃO (mock)** | Sim | ALTA |
| 16 | GET/PATCH | `/api/fornecedor/estoque` | SIM* | SIM* | Mínima | **NÃO (mock)** | Sim | ALTA |
| 17 | GET | `/api/fornecedor/clientes` | SIM* | SIM* | **NÃO** | **NÃO (mock)** | Sim | ALTA |
| 18 | GET/POST | `/api/audit` | **NÃO** | **NÃO** | **NÃO** | - | NÃO | **CRÍTICO** |
| 19 | GET | `/api/health` | NÃO (público) | - | N/A | - | NÃO | BAIXA |

**\* = usa `getServerSession()` sem `authOptions`** — potencialmente inseguro

### Rotas para remover ou desativar imediatamente:
1. `/api/email/test` — endpoint de teste, não deveria existir em produção
2. `/api/auth/register` — duplicata insegura, usar `/api/auth/registro`

### Rotas redundantes:
- `/api/auth/register` e `/api/auth/registro` fazem a mesma coisa com validações diferentes

### Rotas mortas (sem uso no frontend confirmado):
- `/api/audit` (auth comentada)
- `/api/email/stats`
- `/api/email/logs`

---

# 🧠 3. ANÁLISE DE ARQUITETURA

## 3.1 O que está BOM

| Aspecto | Avaliação | Detalhes |
|---------|-----------|---------|
| Separação em camadas | **Parcial** | Módulos de `produtos` e `categorias` seguem Controller-Service-Repository |
| Erros tipados | **BOM** | Hierarquia de `AppError` bem definida |
| Validação com Zod | **Parcial** | Schemas existem para produtos e auth |
| Logging estruturado | **BOM** | Winston configurado, usado nos módulos novos |
| Base classes | **BOM** | `BaseController`, `BaseService`, `BaseRepository` |
| Paginação | **BOM** | Implementada em produtos e auditoria |
| DTOs | **Parcial** | Alguns endpoints retornam entidades diretamente |

## 3.2 O que está RUIM

### 3.2.1 — Inconsistência arquitetural grave

Existem **dois padrões completamente diferentes** convivendo:

**Padrão A (modular, correto):** `produtos`, `categorias`, `auth`
- Service layer ✅
- Repository layer ✅  
- Schemas Zod ✅
- Tipos definidos ✅
- Logging estruturado ✅

**Padrão B (inline, inseguro):** `fornecedor/*`, `email/*`, `audit`
- Lógica diretamente na route ❌
- Dados mock hardcoded ❌
- Sem validação ❌
- `console.error` ao invés de logger ❌
- Sem repository ❌

### 3.2.2 — Controllers "gordos" nos endpoints de fornecedor

Todos os endpoints em `/api/fornecedor/*` têm a lógica inteira na route. Sem service, sem repository, sem validação.

### 3.2.3 — Resposta de API não padronizada

Padrão A retorna:
```json
{ "success": true, "data": {...}, "meta": {...} }
```

Padrão B retorna:
```json
{ "success": true, "data": [...] }
// ou simplesmente:
{ "error": "Unauthorized" }
```

### 3.2.4 — Módulo de segurança inteiro implementado mas JAMAIS chamado

`lib/security/` contém ~700 linhas de código de segurança (rate limiter, CSRF, sanitizer, headers, file validator) que **não são utilizadas em LUGAR NENHUM**. Código morto.

### 3.2.5 — Categorias sem pertencimento a fornecedor

O model `Categoria` no Prisma não tem `fornecedorId`. As categorias são **globais**. Em um marketplace multi-tenant, cada fornecedor deveria ter suas próprias categorias.

---

# 🚀 4. MELHORIAS FUNCIONAIS

## 4.1 Prioridade CRÍTICA (implementar antes de ir para produção)

### 1. Middleware Global (`middleware.ts`)
**Por quê:** Sem middleware, cada endpoint precisa implementar sua própria segurança. Um esquecimento = vulnerabilidade.

```typescript
// middleware.ts (raiz do projeto)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

const PUBLIC_ROUTES = ['/api/auth', '/api/public', '/api/health', '/login', '/register'];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  // Security headers em TODAS as respostas
  const response = NextResponse.next();
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin
```


## License: MIT
https://github.com/mvolfik/eyp-calls/blob/9b73c12f57172aade13a6592ebf9b45c2571e6e9/frontend-worker/src/index.js

```
Agora tenho toda a informação necessária para compilar o relatório completo. Aqui está a auditoria:

---

# AUDITORIA COMPLETA — B2B MARKETPLACE

## Data: 16/02/2026 | Branch: `copilot/fix-organize-and-complete-frontend`

---

# 🚨🚨🚨 FALHAS CRÍTICAS DE PRODUÇÃO 🚨🚨🚨

Antes de qualquer análise ordenada, destaco imediatamente as falhas que **permitem comprometimento total do sistema**:

### FALHA CRÍTICA #1 — Qualquer pessoa pode se tornar ADMIN

> 🚨 RISCO CRÍTICO DE PRODUÇÃO

**Arquivo:** [app/api/auth/register/route.ts](app/api/auth/register/route.ts#L9)

```typescript
// QUALQUER PESSOA pode chamar esta API e se criar como admin:
const registerSchema = z.object({
  tipo: z.enum(['admin', 'fornecedor', 'cliente']) // ← ACEITA 'admin'
})
```

**Risco:** Escalação de privilégio total. Qualquer atacante faz `POST /api/auth/register` com `{"tipo": "admin"}` e obtém acesso administrativo.

**Classificação:** **CRÍTICO**

**Correção:**
```typescript
const registerSchema = z.object({
  tipo: z.enum(['fornecedor', 'cliente']) // REMOVER 'admin'
})
```

---

### FALHA CRÍTICA #2 — Auditoria totalmente aberta (auth COMENTADA)

> 🚨 RISCO CRÍTICO DE PRODUÇÃO

**Arquivo:** [app/api/audit/route.ts](app/api/audit/route.ts#L16-L21)

```typescript
// TODO: Add authentication check    ← LITERALMENTE UM TODO
// const session = await getServerSession();
// if (!session || session.user.role !== 'ADMIN') {
```

**Risco:** Qualquer pessoa acessa `GET /api/audit` e vê TODOS os logs de auditoria: IPs de usuários, user agents, ações, timestamps. Informação perfeita para um atacante mapear o sistema.

**Classificação:** **CRÍTICO**

---

### FALHA CRÍTICA #3 — Endpoint de email 100% aberto (phishing/spam)

> 🚨 RISCO CRÍTICO DE PRODUÇÃO

**Arquivo:** [app/api/email/send/route.ts](app/api/email/send/route.ts)

**Sem autenticação.** Qualquer pessoa envia e-mails arbitrários (incluindo HTML customizado) para qualquer endereço usando sua infraestrutura:

```bash
curl -X POST /api/email/send -d '{
  "type": "custom",
  "to": "vitima@empresa.com",
  "subject": "Urgente",
  "html": "<h1>Phishing</h1><a href=\"http://malware.com\">Clique aqui</a>"
}'
```

**Risco:** Vetor de phishing e spam usando seu domínio. Pode colocar seu domínio em blacklists de e-mail.

**Classificação:** **CRÍTICO** (todos os 4 endpoints de email: `/send`, `/test`, `/logs`, `/stats`)

---

### FALHA CRÍTICA #4 — Categorias sem filtro de tenant

> 🚨 RISCO CRÍTICO DE PRODUÇÃO

**Arquivo:** [modules/categorias/repository.ts](modules/categorias/repository.ts)

O repository de categorias recebe `fornecedorId` como parâmetro mas **IGNORA completamente**:

```typescript
async findAll(fornecedorId: string): Promise<Categoria[]> {
  return this.prisma.categoria.findMany({
    orderBy: { nome: 'asc' },
    // ← ZERO filtro por fornecedorId!
  })
}

async findById(id: string, fornecedorId: string): Promise<Categoria | null> {
  return this.prisma.categoria.findFirst({
    where: { id },  // ← SEM filtro por fornecedorId!
  })
}
```

**Risco:** Fornecedor A vê, edita e deleta categorias do Fornecedor B. **Vazamento de dados entre tenants.**

**Classificação:** **CRÍTICO** — IDOR / Broken Access Control

**Nota:** O modelo `Categoria` no schema Prisma **não tem campo `fornecedorId`**. A tabela de categorias é **global**, sem isolamento de tenant. Isso precisa ser redesenhado.

---

# 🔐 1. ANÁLISE DE SEGURANÇA COMPLETA

## 1.1 Vulnerabilidades por Severidade

### CRÍTICAS (5)

| # | Vulnerabilidade | Endpoint | Tipo |
|---|---|---|---|
| C1 | Criação de admin público | `/api/auth/register` | Privilege Escalation |
| C2 | Auth comentada em auditoria | `/api/audit` | Broken Auth |
| C3 | Email aberto (4 endpoints) | `/api/email/*` | Broken Auth + Spam |
| C4 | Categorias sem tenant filter | `/api/categorias/*` | IDOR |
| C5 | Sem middleware.ts global | Global | Missing Security Layer |

### ALTAS (8)

| # | Vulnerabilidade | Endpoint | Tipo |
|---|---|---|---|
| A1 | `getServerSession()` sem `authOptions` | `/api/fornecedor/*` (5 rotas) | Broken Auth |
| A2 | Módulo security inteiro não utilizado | Global | Dead Code / Missing Security |
| A3 | Dados mock sem isolamento tenant | `/api/fornecedor/*` | IDOR |
| A4 | `user.fornecedorId!` crash para admin | `/api/produtos` | Runtime Error |
| A5 | Rate limiting não implementado em nenhum endpoint | Global | DoS |
| A6 | CSRF protection não implementada | Global | CSRF |
| A7 | Sanitização de input não utilizada | Global | XSS |
| A8 | bcrypt salt rounds = 10 no register antigo | `/api/auth/register` | Weak Crypto |

### MÉDIAS (6)

| # | Vulnerabilidade | Endpoint | Tipo |
|---|---|---|---|
| M1 | Dois endpoints de registro com regras diferentes | `/register` vs `/registro` | Inconsistência |
| M2 | Senha mínima 6 chars no `/register` vs 8 no schema | `/api/auth/register` | Weak Validation |
| M3 | Health check expõe versão, uptime, DB response times | `/api/health` | Info Disclosure |
| M4 | POST de pedidos aceita qualquer body | `/api/fornecedor/pedidos` | Mass Assignment |
| M5 | `console.error` usado em vários endpoints | Múltiplos | Info Leak |
| M6 | CNPJ temporário com padrão previsível | `/api/auth/register` | Data Integrity |

### BAIXAS (3)

| # | Vulnerabilidade | Endpoint | Tipo |
|---|---|---|---|
| B1 | Sem validação de `parseInt`/`parseFloat` (NaN) | `/api/public/produtos` | Input Validation |
| B2 | Sem limit máximo em `/api/public/produtos` | `/api/public/produtos` | DoS |
| B3 | Error messages em inglês misturado com português | Múltiplos | Usability |

---

## 1.2 Detalhamento das Vulnerabilidades Críticas e Altas

### C1 — Privilege Escalation via Register

**Como explorar:**
```bash
curl -X POST https://seusite.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"nome":"Hacker","email":"hacker@evil.com","senha":"123456","tipo":"admin"}'
```

**Correção completa:**
```typescript
// app/api/auth/register/route.ts — DEVE SER REESCRITO OU REMOVIDO
// Usar apenas /api/auth/registro que já restringe tipos

const registerSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  email: emailSchema, // usar schema compartilhado
  senha: senhaSchema, // usar schema compartilhado (8 chars + complexidade)
  tipo: z.enum(['fornecedor', 'cliente']), // NUNCA aceitar 'admin'
})
```

### A1 — getServerSession() sem authOptions

**Arquivo afetado:** Todos em `/api/fornecedor/*`

**Problema:** Os endpoints importam `getServerSession` diretamente de `next-auth` ao invés do wrapper em [lib/auth/session.ts](lib/auth/session.ts) que passa `authOptions`. Sem `authOptions`, o NextAuth pode retornar uma sessão sem os campos customizados (`tipo`, `fornecedorId`, `clienteId`).

```typescript
// ❌ ERRADO (usado em todos os endpoints de fornecedor)
import { getServerSession } from 'next-auth';
const session = await getServerSession(); // sem authOptions!

// ✅ CORRETO
import { requireRole } from '@/lib/auth/session';
const user = await requireRole(['fornecedor']);
```

### A4 — Non-null assertion crash

**Arquivo:** [app/api/produtos/route.ts](app/api/produtos/route.ts)

```typescript
// Se user.tipo === 'admin', user.fornecedorId é undefined
const resultado = await produtoService.listar(user.fornecedorId!, ...);
// Runtime crash: Cannot read properties of undefined
```

**Correção:**
```typescript
export async function GET(request: Request) {
  const user = await requireRole(['fornecedor', 'admin']);

  let fornecedorId: string;
  
  if (user.tipo === 'admin') {
    // Admin precisa especificar o fornecedor ou ver todos
    fornecedorId = searchParams.get('fornecedorId') || '';
    if (!fornecedorId) {
      // Retornar lista de todos fornecedores ou erro
      return NextResponse.json(
        { error: 'Admin deve especificar fornecedorId' },
        { status: 400 }
      );
    }
  } else {
    if (!user.fornecedorId) {
      return NextResponse.json(
        { error: 'Fornecedor não encontrado' },
        { status: 404 }
      );
    }
    fornecedorId = user.fornecedorId;
  }
}
```

---

# 🧭 2. MAPEAMENTO COMPLETO DE ROTAS

| # | Método | Rota | Auth | RBAC | Validação | Multi-tenant | Usado no Frontend | Status |
|---|--------|------|------|------|-----------|-------------|-------------------|--------|
| 1 | GET/POST | `/api/auth/[...nextauth]` | NextAuth | - | NextAuth | - | Sim | OK |
| 2 | POST | `/api/auth/register` | **NÃO** | **NÃO** | Zod (fraca) | - | Sim | **CRÍTICO** |
| 3 | POST | `/api/auth/registro` | **NÃO** | **NÃO** | Zod (boa) | - | ? | **DUPLICADA** |
| 4 | GET/POST | `/api/produtos` | SIM | SIM | Zod | Parcial | Sim | MÉDIA |
| 5 | GET/PATCH/DELETE | `/api/produtos/[id]` | SIM | SIM | Zod | SIM | Sim | MÉDIA |
| 6 | GET | `/api/public/produtos` | NÃO (público) | - | **NÃO** | - | Sim | BAIXA |
| 7 | GET/POST | `/api/categorias` | SIM | SIM | Zod | **FALSO** | Sim | **CRÍTICO** |
| 8 | GET/PUT/DELETE | `/api/categorias/[id]` | SIM | SIM | Zod | **FALSO** | Sim | **CRÍTICO** |
| 9 | POST | `/api/email/send` | **NÃO** | **NÃO** | Zod | - | ? | **CRÍTICO** |
| 10 | GET | `/api/email/logs` | **NÃO** | **NÃO** | **NÃO** | - | ? | **CRÍTICO** |
| 11 | GET | `/api/email/test` | **NÃO** | **NÃO** | **NÃO** | - | NÃO | **REMOVER** |
| 12 | GET | `/api/email/stats` | **NÃO** | **NÃO** | **NÃO** | - | ? | **CRÍTICO** |
| 13 | GET/POST | `/api/fornecedor/pedidos` | SIM* | SIM* | **NÃO** | **NÃO (mock)** | Sim | ALTA |
| 14 | GET/PATCH | `/api/fornecedor/pedidos/[id]` | SIM* | SIM* | **NÃO** | **NÃO (mock)** | Sim | ALTA |
| 15 | GET/POST/DELETE | `/api/fornecedor/precos` | SIM* | SIM* | **NÃO** | **NÃO (mock)** | Sim | ALTA |
| 16 | GET/PATCH | `/api/fornecedor/estoque` | SIM* | SIM* | Mínima | **NÃO (mock)** | Sim | ALTA |
| 17 | GET | `/api/fornecedor/clientes` | SIM* | SIM* | **NÃO** | **NÃO (mock)** | Sim | ALTA |
| 18 | GET/POST | `/api/audit` | **NÃO** | **NÃO** | **NÃO** | - | NÃO | **CRÍTICO** |
| 19 | GET | `/api/health` | NÃO (público) | - | N/A | - | NÃO | BAIXA |

**\* = usa `getServerSession()` sem `authOptions`** — potencialmente inseguro

### Rotas para remover ou desativar imediatamente:
1. `/api/email/test` — endpoint de teste, não deveria existir em produção
2. `/api/auth/register` — duplicata insegura, usar `/api/auth/registro`

### Rotas redundantes:
- `/api/auth/register` e `/api/auth/registro` fazem a mesma coisa com validações diferentes

### Rotas mortas (sem uso no frontend confirmado):
- `/api/audit` (auth comentada)
- `/api/email/stats`
- `/api/email/logs`

---

# 🧠 3. ANÁLISE DE ARQUITETURA

## 3.1 O que está BOM

| Aspecto | Avaliação | Detalhes |
|---------|-----------|---------|
| Separação em camadas | **Parcial** | Módulos de `produtos` e `categorias` seguem Controller-Service-Repository |
| Erros tipados | **BOM** | Hierarquia de `AppError` bem definida |
| Validação com Zod | **Parcial** | Schemas existem para produtos e auth |
| Logging estruturado | **BOM** | Winston configurado, usado nos módulos novos |
| Base classes | **BOM** | `BaseController`, `BaseService`, `BaseRepository` |
| Paginação | **BOM** | Implementada em produtos e auditoria |
| DTOs | **Parcial** | Alguns endpoints retornam entidades diretamente |

## 3.2 O que está RUIM

### 3.2.1 — Inconsistência arquitetural grave

Existem **dois padrões completamente diferentes** convivendo:

**Padrão A (modular, correto):** `produtos`, `categorias`, `auth`
- Service layer ✅
- Repository layer ✅  
- Schemas Zod ✅
- Tipos definidos ✅
- Logging estruturado ✅

**Padrão B (inline, inseguro):** `fornecedor/*`, `email/*`, `audit`
- Lógica diretamente na route ❌
- Dados mock hardcoded ❌
- Sem validação ❌
- `console.error` ao invés de logger ❌
- Sem repository ❌

### 3.2.2 — Controllers "gordos" nos endpoints de fornecedor

Todos os endpoints em `/api/fornecedor/*` têm a lógica inteira na route. Sem service, sem repository, sem validação.

### 3.2.3 — Resposta de API não padronizada

Padrão A retorna:
```json
{ "success": true, "data": {...}, "meta": {...} }
```

Padrão B retorna:
```json
{ "success": true, "data": [...] }
// ou simplesmente:
{ "error": "Unauthorized" }
```

### 3.2.4 — Módulo de segurança inteiro implementado mas JAMAIS chamado

`lib/security/` contém ~700 linhas de código de segurança (rate limiter, CSRF, sanitizer, headers, file validator) que **não são utilizadas em LUGAR NENHUM**. Código morto.

### 3.2.5 — Categorias sem pertencimento a fornecedor

O model `Categoria` no Prisma não tem `fornecedorId`. As categorias são **globais**. Em um marketplace multi-tenant, cada fornecedor deveria ter suas próprias categorias.

---

# 🚀 4. MELHORIAS FUNCIONAIS

## 4.1 Prioridade CRÍTICA (implementar antes de ir para produção)

### 1. Middleware Global (`middleware.ts`)
**Por quê:** Sem middleware, cada endpoint precisa implementar sua própria segurança. Um esquecimento = vulnerabilidade.

```typescript
// middleware.ts (raiz do projeto)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

const PUBLIC_ROUTES = ['/api/auth', '/api/public', '/api/health', '/login', '/register'];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  // Security headers em TODAS as respostas
  const response = NextResponse.next();
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin
```


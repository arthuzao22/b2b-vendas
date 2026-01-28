# 🛠️ PROMPT DE IMPLEMENTAÇÃO - Correções B2B Vendas

## Contexto do Projeto

Você é um **Engenheiro de Software Sênior Full Stack** trabalhando em um marketplace B2B construído com:
- **Frontend:** Next.js 14+ (App Router), React 18, TypeScript
- **Backend:** Next.js API Routes, Prisma ORM
- **Banco:** PostgreSQL (Supabase)
- **Autenticação:** NextAuth.js
- **Estado:** Zustand
- **Validação:** Zod

O sistema possui 3 perfis: **Admin**, **Fornecedor** e **Cliente**.

---

## 🎯 OBJETIVO

Implementar **TODAS** as correções identificadas na auditoria técnica, seguindo a ordem de prioridade abaixo. Cada item deve ser implementado com código de produção, seguindo as melhores práticas.

---

## ✅ FASE 1 - CORREÇÕES CRÍTICAS (Prioridade Máxima)

### 1.1 Criar Endpoint de Registro

**Arquivo:** `app/api/auth/register/route.ts`

**Requisitos:**
- Validar dados com Zod (email, senha, nome, tipo, dados específicos do perfil)
- Hash de senha com bcryptjs
- Criar usuário + perfil (Fornecedor ou Cliente) em transação
- Retornar token JWT ou redirecionar para login
- Validar unicidade de email e CNPJ

**Schema de validação:**
```typescript
const registerSchema = z.object({
  email: z.string().email(),
  senha: z.string().min(6),
  nome: z.string().min(3),
  tipo: z.enum(['fornecedor', 'cliente']),
  telefone: z.string().optional(),
  // Campos condicionais baseado no tipo
  razaoSocial: z.string().min(3),
  cnpj: z.string().regex(/^\d{14}$/),
  nomeFantasia: z.string().optional(),
  // ... outros campos
});
```

---

### 1.2 Centralizar Tratamento de Erros

**Criar:** `lib/api/error-handler.ts`

**Requisitos:**
- Criar classe `ApiError` com status HTTP
- Handler para erros Zod (422)
- Handler para erros Prisma (409 para unique, 404 para not found)
- Handler para erros de autenticação (401)
- Handler para erros de autorização (403)
- Logging estruturado para todos erros

**Implementação:**
```typescript
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 400,
    public errors?: any
  ) {
    super(message);
  }
}

export function handleApiError(error: unknown): NextResponse {
  if (error instanceof ApiError) {
    return errorResponse(error.message, error.statusCode, error.errors);
  }
  if (error instanceof z.ZodError) {
    return handleZodError(error);
  }
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return handlePrismaError(error);
  }
  // ... outros handlers
}
```

**Atualizar:** Todos os 42 endpoints para usar o novo handler.

---

### 1.3 Corrigir Funções de Autenticação

**Arquivo:** `lib/api-helpers.ts`

**Problema atual:** `requireAuth()` lança `Error` que vira 500.

**Solução:**
```typescript
export async function requireAuth(): Promise<AuthResult> {
  const user = await getUserSession();
  if (!user) {
    throw new ApiError("Não autenticado", 401);
  }
  return user;
}
```

---

### 1.4 Implementar Rate Limiting

**Criar:** `lib/api/rate-limit.ts`

**Requisitos:**
- Rate limit por IP
- Limites diferentes por endpoint:
  - Login: 5 req/min
  - Registro: 3 req/min
  - APIs gerais: 100 req/min
- Retornar headers `X-RateLimit-*`

**Implementação sugerida:**
```typescript
import { LRUCache } from 'lru-cache';

const rateLimiters = new Map<string, LRUCache<string, number>>();

export function rateLimit(options: { limit: number; window: number }) {
  return async (identifier: string) => {
    // Implementação...
  };
}
```

**Aplicar em:** `middleware.ts` para rotas `/api/auth/*`

---

### 1.5 Adicionar Validação de IDs

**Criar:** `lib/api/validators.ts`

```typescript
import { z } from 'zod';

export const cuidSchema = z.string().cuid();
export const uuidSchema = z.string().uuid();

export function validateId(id: string): { valid: boolean; error?: string } {
  const result = cuidSchema.safeParse(id);
  return result.success 
    ? { valid: true } 
    : { valid: false, error: "ID inválido" };
}
```

**Aplicar em:** Todos endpoints com `[id]` no path.

---

## ✅ FASE 2 - PÁGINAS PARA ENDPOINTS NÃO UTILIZADOS

### 2.1 Página de Analytics do Fornecedor

**Criar:** `app/dashboard/fornecedor/analytics/page.tsx`

**Requisitos:**
- Consumir TODOS os endpoints de analytics:
  - `/api/analytics/kpis`
  - `/api/analytics/vendas`
  - `/api/analytics/vendas-por-categoria`
  - `/api/analytics/top-produtos`
  - `/api/analytics/top-clientes`
  - `/api/analytics/pedidos-por-status`
- Filtros de período (7 dias, 30 dias, 90 dias, custom)
- Gráficos com Recharts:
  - Line chart para vendas por período
  - Pie chart para vendas por categoria
  - Bar chart para top produtos
  - Table para top clientes
- Cards de KPIs no topo
- Loading states e error handling
- Responsivo (mobile-first)

---

### 2.2 Página de Preços Customizados

**Criar:** `app/dashboard/fornecedor/precos-customizados/page.tsx`

**Requisitos:**
- Listar todos preços customizados do fornecedor
- Filtrar por cliente ou produto
- Modal/drawer para criar novo preço:
  - Select de cliente (com busca)
  - Select de produto (com busca)
  - Input de preço
- Edição inline ou via modal
- Exclusão com confirmação
- Consumir endpoints:
  - `GET /api/precos-customizados`
  - `POST /api/precos-customizados`
  - `PUT /api/precos-customizados/[id]`
  - `DELETE /api/precos-customizados/[id]`

---

### 2.3 Centro de Notificações

**Criar/Atualizar componentes:**

1. **`components/notifications/NotificationCenter.tsx`**
   - Dropdown no header
   - Lista de notificações não lidas
   - Botão "Marcar todas como lidas"
   - Link para cada notificação

2. **`components/notifications/NotificationBell.tsx`**
   - Ícone de sino
   - Badge com contador de não lidas
   - Consumir `/api/notificacoes/nao-lidas/count`

3. **Atualizar `hooks/useNotifications.ts`**
   - Sincronizar `markAsRead` com API (`PUT /api/notificacoes/[id]/lida`)
   - Sincronizar `markAllAsRead` com API (`PUT /api/notificacoes/marcar-todas-lidas`)
   - Sincronizar `removeNotification` com API (`DELETE /api/notificacoes/[id]`)

---

### 2.4 Página de Rastreio de Pedido

**Criar:** `app/pedidos/[id]/rastreio/page.tsx`

**Requisitos:**
- Timeline visual do status do pedido
- Consumir `/api/pedidos/[id]/rastreio`
- Mapa com localização (se disponível)
- Detalhes do pedido resumidos
- Link para página completa do pedido

---

### 2.5 Histórico de Movimentações por Produto

**Criar:** `app/dashboard/fornecedor/produtos/[id]/movimentacoes/page.tsx`

**Requisitos:**
- Tabela com histórico de movimentações
- Filtros por tipo (entrada/saída/ajuste) e período
- Consumir `/api/estoque/movimentacoes/[produtoId]`
- Gráfico de evolução do estoque

---

### 2.6 Dashboard de Estoque Aprimorado

**Atualizar:** `app/dashboard/fornecedor/estoque/page.tsx`

**Requisitos:**
- Consumir `/api/estoque/dashboard` para KPIs
- Consumir `/api/estoque/alertas` para lista de alertas
- Cards: Total produtos, Estoque baixo, Sem estoque, Valor total
- Lista de produtos críticos com ação rápida
- Integrar com sistema de notificações

---

### 2.7 Atribuição de Lista de Preço a Cliente

**Atualizar:** `app/dashboard/fornecedor/clientes/page.tsx`

**Adicionar:**
- Botão/modal para atribuir lista de preço a cliente
- Consumir `POST /api/clientes/[id]/lista-preco`
- Exibir lista atual do cliente na tabela

---

### 2.8 Cancelamento de Pedido

**Atualizar:** `app/pedidos/[id]/page.tsx` e `app/dashboard/fornecedor/pedidos/page.tsx`

**Adicionar:**
- Botão "Cancelar Pedido" (visível apenas para status permitidos)
- Modal de confirmação com motivo
- Consumir `POST /api/pedidos/[id]/cancelar`

---

### 2.9 Busca por Número de Pedido

**Atualizar:** `app/pedidos/page.tsx` e `app/dashboard/fornecedor/pedidos/page.tsx`

**Adicionar:**
- Campo de busca por número de pedido
- Consumir `GET /api/pedidos/numero/[numero]`

---

## ✅ FASE 3 - REFATORAÇÃO DE ARQUITETURA

### 3.1 Refatorar Dashboards para Usar API

**Arquivos a refatorar:**
- `app/dashboard/fornecedor/page.tsx`
- `app/dashboard/cliente/page.tsx`
- `app/dashboard/admin/page.tsx`

**Requisitos:**
- Remover queries diretas ao Prisma
- Usar `fetch` para consumir endpoints de analytics
- Manter Server Components onde possível (usar cache do Next.js)

**Exemplo:**
```typescript
// Antes (errado)
async function getKPIs(fornecedorId: string) {
  const pedidos = await prisma.pedido.findMany({ ... });
}

// Depois (correto)
async function getKPIs() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/analytics/kpis`, {
    cache: 'no-store', // ou revalidate
    headers: { cookie: cookies().toString() }
  });
  return res.json();
}
```

---

### 3.2 Remover Código Duplicado

**Ação:** Remover `getRedirectByUserType` de `middleware.ts`

**Solução:** Importar de `lib/auth.ts`:
```typescript
import { getRedirectByUserType } from '@/lib/auth';
```

---

### 3.3 Tipar Filtros do Prisma

**Criar:** `types/prisma-filters.ts`

```typescript
import { Prisma } from '@prisma/client';

export type ProdutoWhereInput = Prisma.ProdutoWhereInput;
export type PedidoWhereInput = Prisma.PedidoWhereInput;
// ... outros
```

**Aplicar:** Substituir `any` por tipos específicos em todos endpoints.

---

## ✅ FASE 4 - SEGURANÇA

### 4.1 Configurar CORS

**Criar/Atualizar:** `next.config.ts`

```typescript
const nextConfig = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: process.env.ALLOWED_ORIGINS || '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ];
  },
};
```

---

### 4.2 Implementar Soft Delete

**Atualizar schema Prisma:**

```prisma
model Produto {
  // ... campos existentes
  deletedAt DateTime? @map("deleted_at")
}

model Cliente {
  // ... campos existentes
  deletedAt DateTime? @map("deleted_at")
}
```

**Atualizar endpoints:**
- DELETE deve setar `deletedAt = new Date()`
- GET deve filtrar `deletedAt: null`

---

### 4.3 Rotação de JWT

**Atualizar:** `lib/auth.ts`

```typescript
session: {
  strategy: "jwt",
  maxAge: 24 * 60 * 60, // 24 horas
  updateAge: 60 * 60, // Renovar a cada 1 hora
}
```

---

### 4.4 Sanitização de Inputs

**Instalar:** `npm install dompurify isomorphic-dompurify`

**Criar:** `lib/sanitize.ts`

```typescript
import DOMPurify from 'isomorphic-dompurify';

export function sanitize(input: string): string {
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] });
}
```

**Aplicar:** Em campos de texto livre (observações, descrições).

---

## ✅ FASE 5 - MELHORIAS FINAIS

### 5.1 Persistência de Carrinho

**Criar:** `app/api/carrinho/route.ts`

```typescript
// GET - Buscar carrinho do cliente
// POST - Salvar/atualizar carrinho
// DELETE - Limpar carrinho
```

**Atualizar:** `hooks/useCart.ts` para sincronizar com API.

---

### 5.2 Cache Headers

**Atualizar endpoints de leitura:**

```typescript
return NextResponse.json(data, {
  headers: {
    'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
  },
});
```

---

### 5.3 Documentação Swagger

**Instalar:** `npm install swagger-jsdoc swagger-ui-react`

**Criar:** `app/api/docs/route.ts` - Endpoint de documentação

---

## 📋 CHECKLIST DE ENTREGAS

### Fase 1 - Crítica
- [ ] `app/api/auth/register/route.ts`
- [ ] `lib/api/error-handler.ts`
- [ ] `lib/api/rate-limit.ts`
- [ ] `lib/api/validators.ts`
- [ ] Atualizar `lib/api-helpers.ts`
- [ ] Atualizar `middleware.ts` com rate limiting

### Fase 2 - Páginas
- [ ] `app/dashboard/fornecedor/analytics/page.tsx`
- [ ] `app/dashboard/fornecedor/precos-customizados/page.tsx`
- [ ] `components/notifications/NotificationCenter.tsx`
- [ ] `components/notifications/NotificationBell.tsx`
- [ ] `app/pedidos/[id]/rastreio/page.tsx`
- [ ] `app/dashboard/fornecedor/produtos/[id]/movimentacoes/page.tsx`
- [ ] Atualizar páginas de pedidos com cancelamento e busca

### Fase 3 - Refatoração
- [ ] Refatorar 3 dashboards
- [ ] Remover código duplicado
- [ ] Tipar filtros Prisma

### Fase 4 - Segurança
- [ ] CORS em `next.config.ts`
- [ ] Soft delete no schema
- [ ] Rotação JWT
- [ ] Sanitização de inputs

### Fase 5 - Extras
- [ ] Persistência de carrinho
- [ ] Cache headers
- [ ] Documentação Swagger

---

## ⚠️ REGRAS IMPORTANTES

1. **Não quebrar funcionalidades existentes** - Testar após cada mudança
2. **Manter consistência de código** - Seguir padrões existentes
3. **Commits atômicos** - Um commit por feature/fix
4. **TypeScript strict** - Zero uso de `any`
5. **Tratamento de erros** - Sempre usar try/catch com o handler centralizado
6. **Loading states** - Toda página deve ter skeleton/spinner
7. **Responsividade** - Mobile-first

---

## 🚀 ORDEM DE EXECUÇÃO SUGERIDA

1. Fase 1.2 (Error Handler) → Base para tudo
2. Fase 1.3 (Auth) → Corrige erros 500
3. Fase 1.1 (Register) → Funcionalidade crítica
4. Fase 1.5 (Validação IDs) → Segurança
5. Fase 2.1 (Analytics) → Maior impacto visual
6. Fase 2.2 (Preços Customizados) → Feature importante
7. Fase 2.3 (Notificações) → UX
8. Restante da Fase 2
9. Fase 3 (Refatoração)
10. Fase 4 (Segurança)
11. Fase 5 (Extras)

---

*Prompt gerado em 27/01/2026 baseado na Auditoria Técnica Completa do Sistema B2B Vendas.*

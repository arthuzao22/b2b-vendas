# 📋 AUDITORIA TÉCNICA COMPLETA - Sistema B2B Vendas

**Data:** 27/01/2026  
**Arquiteto Responsável:** Avaliação Técnica Automatizada  
**Tecnologias:** Next.js 14+ | TypeScript | Prisma | PostgreSQL | NextAuth.js

---

## 📌 RESUMO GERAL DO SISTEMA

### Arquitetura Atual

O sistema é um **marketplace B2B** com três perfis de usuário:
- **Admin**: Gerencia fornecedores, usuários e relatórios gerais
- **Fornecedor**: Cadastra produtos, gerencia preços, clientes e pedidos
- **Cliente**: Visualiza catálogo, faz pedidos e acompanha entregas

### Estrutura de Pastas

```
b2b/
├── app/                    # Next.js App Router
│   ├── api/               # 42 endpoints REST
│   ├── dashboard/         # Painéis por perfil
│   ├── auth/              # Autenticação
│   └── ...
├── components/            # Componentes React
├── hooks/                 # Custom hooks (5)
├── lib/                   # Utilitários e configurações
├── store/                 # Estado global (Zustand)
├── types/                 # Definições TypeScript
└── prisma/                # Schema do banco
```

### Métricas do Sistema

| Recurso | Quantidade |
|---------|------------|
| Endpoints API | 42 |
| Páginas Frontend | 32 |
| Modelos Prisma | 16 |
| Hooks Customizados | 5 |

---

## 🔴 ENDPOINTS NÃO UTILIZADOS PELO FRONTEND

### ⚠️ Analytics (6 endpoints - **0% de uso no frontend**)

| Endpoint | Método | Status | Recomendação |
|----------|--------|--------|--------------|
| `/api/analytics/kpis` | GET | ❌ Não utilizado | **CRIAR página de relatórios** |
| `/api/analytics/vendas` | GET | ❌ Não utilizado | **CRIAR página de relatórios** |
| `/api/analytics/vendas-por-categoria` | GET | ❌ Não utilizado | **CRIAR página de relatórios** |
| `/api/analytics/top-produtos` | GET | ❌ Não utilizado | **CRIAR página de relatórios** |
| `/api/analytics/top-clientes` | GET | ❌ Não utilizado | **CRIAR página de relatórios** |
| `/api/analytics/pedidos-por-status` | GET | ❌ Não utilizado | **CRIAR página de relatórios** |

> **📍 Crítica:** Foram criados 6 endpoints de analytics completos e funcionais, mas **nenhum deles é consumido pelo frontend**. Os dashboards (fornecedor/admin) fazem queries diretas ao Prisma ao invés de usar a API.

### ⚠️ Estoque (3 de 4 endpoints não utilizados)

| Endpoint | Método | Status | Recomendação |
|----------|--------|--------|--------------|
| `/api/estoque/dashboard` | GET | ❌ Não utilizado | **CRIAR dashboard de estoque** |
| `/api/estoque/alertas` | GET | ❌ Não utilizado | **INTEGRAR com notificações** |
| `/api/estoque/movimentacoes/[produtoId]` | GET | ❌ Não utilizado | **CRIAR histórico por produto** |
| `/api/estoque/movimentacoes` | GET/POST | ✅ Utilizado | Manter |

### ⚠️ Preços Customizados (100% não utilizado)

| Endpoint | Método | Status | Recomendação |
|----------|--------|--------|--------------|
| `/api/precos-customizados` | GET/POST | ❌ Não utilizado | **CRIAR página de preços por cliente** |
| `/api/precos-customizados/[id]` | GET/PUT/DELETE | ❌ Não utilizado | **CRIAR gestão de preços** |

> **📍 Crítica:** O sistema suporta preços customizados por cliente (funciona no cálculo de catálogo), mas **não há interface para gerenciá-los**.

### ⚠️ Notificações (Parcialmente utilizado)

| Endpoint | Método | Status | Recomendação |
|----------|--------|--------|--------------|
| `/api/notificacoes` | GET | ✅ Usado pelo hook | Manter |
| `/api/notificacoes` | POST | ❌ Não utilizado | Sistema interno apenas |
| `/api/notificacoes/[id]` | DELETE | ❌ Não utilizado | **IMPLEMENTAR no frontend** |
| `/api/notificacoes/[id]/lida` | PUT | ❌ Não utilizado | **IMPLEMENTAR no frontend** |
| `/api/notificacoes/marcar-todas-lidas` | PUT | ❌ Não utilizado | **IMPLEMENTAR no frontend** |
| `/api/notificacoes/nao-lidas/count` | GET | ❌ Não utilizado | **IMPLEMENTAR contador** |

### ⚠️ Clientes (Parcialmente utilizado)

| Endpoint | Método | Status | Recomendação |
|----------|--------|--------|--------------|
| `/api/clientes/[id]/pedidos` | GET | ❌ Não utilizado | **Usar na página do cliente** |
| `/api/clientes/[id]/lista-preco` | POST | ❌ Não utilizado | **CRIAR atribuição de listas** |

### ⚠️ Pedidos (Parcialmente utilizado)

| Endpoint | Método | Status | Recomendação |
|----------|--------|--------|--------------|
| `/api/pedidos/[id]/cancelar` | POST | ❌ Não utilizado | **IMPLEMENTAR cancelamento** |
| `/api/pedidos/[id]/rastreio` | GET/PUT | ❌ Não utilizado | **CRIAR página de rastreio** |
| `/api/pedidos/[id]/historico` | GET | ❌ Não utilizado | **EXIBIR timeline na página** |
| `/api/pedidos/numero/[numero]` | GET | ❌ Não utilizado | **IMPLEMENTAR busca** |

### ⚠️ Produtos

| Endpoint | Método | Status | Recomendação |
|----------|--------|--------|--------------|
| `/api/produtos/[id]/preco` | GET | ❌ Não utilizado | Já existe `/api/catalogo` |

---

## 🔴 ENDPOINTS QUE PRECISAM DE PÁGINA NO FRONTEND

### 1. Dashboard de Analytics (PRIORIDADE ALTA)

**Criar:** `/dashboard/fornecedor/analytics/page.tsx`

```tsx
// Página sugerida - consome todos endpoints de analytics
"use client";

import { useEffect, useState } from 'react';

export default function AnalyticsPage() {
  const [kpis, setKpis] = useState(null);
  const [vendas, setVendas] = useState([]);
  const [topProdutos, setTopProdutos] = useState([]);
  
  useEffect(() => {
    Promise.all([
      fetch('/api/analytics/kpis').then(r => r.json()),
      fetch('/api/analytics/vendas?periodo=mes').then(r => r.json()),
      fetch('/api/analytics/top-produtos?limit=10').then(r => r.json()),
      fetch('/api/analytics/top-clientes?limit=10').then(r => r.json()),
    ]).then(([kpisData, vendasData, produtosData, clientesData]) => {
      // Processar dados...
    });
  }, []);

  return (/* UI com gráficos */);
}
```

### 2. Gestão de Preços Customizados (PRIORIDADE ALTA)

**Criar:** `/dashboard/fornecedor/precos-customizados/page.tsx`

Funcionalidades:
- Listar todos preços customizados
- Criar novo preço customizado (cliente + produto + valor)
- Editar/excluir preços existentes

### 3. Gestão de Notificações (PRIORIDADE MÉDIA)

O `useNotifications` hook **não está vinculado à UI**. Precisa:
- Centro de notificações (dropdown no header)
- Ações de marcar como lida/todas lidas
- Contador de não lidas

### 4. Página de Rastreio de Pedido (PRIORIDADE MÉDIA)

**Criar:** `/pedidos/[id]/rastreio/page.tsx`

Consome `/api/pedidos/[id]/rastreio`

### 5. Histórico de Movimentações por Produto (PRIORIDADE BAIXA)

**Criar:** `/dashboard/fornecedor/produtos/[id]/movimentacoes/page.tsx`

---

## 🔴 ERROS E PROBLEMAS ENCONTRADOS

### 1. **CRÍTICO: Inconsistência de Autenticação em API Routes**

**Arquivo:** `lib/api-helpers.ts`

```typescript
// ❌ Problema: Erro genérico não retorna Response
export async function requireAuth() {
  const user = await getUserSession();
  if (!user) {
    throw new Error("Não autenticado"); // ← Isso causa 500, não 401
  }
  return user;
}
```

**Solução:**
```typescript
import { NextResponse } from 'next/server';

export async function requireAuth() {
  const user = await getUserSession();
  if (!user) {
    // Retornar diretamente uma resposta de erro
    return { error: NextResponse.json({ error: "Não autenticado" }, { status: 401 }) };
  }
  return { user };
}
```

### 2. **CRÍTICO: Endpoint de registro não existe**

**Arquivo:** `app/api/auth/register/route.ts`

O endpoint `/api/auth/register` **não existe**! O frontend tenta usá-lo mas não há implementação.

### 3. **ALTO: Falta de Rate Limiting**

Nenhum endpoint possui rate limiting. APIs públicas são vulneráveis a:
- Ataques de força bruta (login)
- DDoS
- Enumeração de dados

**Solução:** Implementar middleware de rate limiting com `@vercel/edge-throttle` ou similar.

### 4. **ALTO: CORS não configurado**

O sistema não tem configuração explícita de CORS. Em produção, pode causar problemas de segurança ou bloqueio de requisições.

### 5. **MÉDIO: Tratamento de erro inconsistente**

```typescript
// ❌ Padrão 1 - em alguns arquivos
} catch (error) {
  if (error instanceof z.ZodError) {
    return handleZodError(error);
  }
  return errorResponse(error.message, 400);
}

// ❌ Padrão 2 - em outros arquivos
} catch (error: any) {
  return errorResponse(error.message || "Erro genérico", 500);
}
```

**Solução:** Criar handler centralizado de erros.

### 6. **MÉDIO: Falta de validação de UUID**

Endpoints que recebem IDs (como `/api/produtos/[id]`) não validam se é um UUID válido antes de consultar o banco.

```typescript
// ❌ Atual - pode causar erros de banco
const produto = await prisma.produto.findUnique({
  where: { id } // Se id for inválido, erro de sintaxe
});

// ✅ Correto
import { z } from 'zod';
const idSchema = z.string().cuid();
const result = idSchema.safeParse(id);
if (!result.success) {
  return errorResponse("ID inválido", 400);
}
```

### 7. **MÉDIO: Tipos any em varios lugares**

```typescript
// ❌ Encontrado em vários endpoints
const where: any = {};
const dateFilter: any = {};
```

**Solução:** Criar types específicos para filtros do Prisma.

### 8. **BAIXO: Código morto/duplicado**

A função `getRedirectByUserType` está definida em dois arquivos:
- `lib/auth.ts`
- `middleware.ts`

---

## 🔴 PROBLEMAS DE ARQUITETURA

### 1. **Dashboard queries diretas vs API**

Os dashboards (fornecedor/cliente/admin) fazem queries **diretas ao Prisma** ao invés de consumir a API REST. Isso causa:

- Duplicação de lógica
- Endpoints de analytics inúteis
- Inconsistência de dados

**Antes (atual):**
```tsx
// dashboard/fornecedor/page.tsx
async function getKPIs(fornecedorId: string) {
  const [pedidos, clientes, produtos] = await Promise.all([
    prisma.pedido.findMany({ ... }),
    prisma.clienteFornecedor.count({ ... }),
    // ...
  ]);
}
```

**Depois (recomendado):**
```tsx
async function getKPIs() {
  const response = await fetch('/api/analytics/kpis');
  return response.json();
}
```

### 2. **Hook useNotifications parcialmente implementado**

O hook busca notificações da API mas **não sincroniza ações**:

```typescript
// ✅ Implementado
useEffect(() => {
  fetch('/api/notificacoes').then(...)
}, []);

// ❌ Não implementado (marca só localmente)
markAsRead: (id) => {
  // Não chama /api/notificacoes/[id]/lida
  set(state => ({ ... }));
}
```

### 3. **Carrinho não persiste no servidor**

O carrinho usa apenas `localStorage` via Zustand. Se o usuário trocar de dispositivo, perde tudo.

**Recomendação:** Criar endpoint `/api/carrinho` para persistir no banco.

### 4. **Falta de cache/otimização**

Nenhum endpoint implementa:
- Cache-Control headers
- ETags
- Stale-while-revalidate

---

## 🔴 PROBLEMAS DE SEGURANÇA

### 1. **Exposição de dados sensíveis**

O endpoint `/api/clientes/[id]` retorna informações como CNPJ e inscrição estadual para qualquer usuário autenticado do mesmo fornecedor.

### 2. **Falta de sanitização de inputs**

Campos como `observacoes` em pedidos não são sanitizados contra XSS.

### 3. **JWT sem rotação**

```typescript
session: {
  strategy: "jwt",
  maxAge: 30 * 24 * 60 * 60, // 30 dias sem rotação!
}
```

### 4. **Soft delete não implementado**

Produtos/clientes são deletados permanentemente. Deveria haver `deletedAt`.

---

## ✅ MELHORIAS ARQUITETURAIS PRIORITÁRIAS

### Prioridade 1 (CRÍTICA)

1. **Criar handler centralizado de erros**
```typescript
// lib/api-error-handler.ts
export function handleApiError(error: unknown) {
  if (error instanceof z.ZodError) {
    return handleZodError(error);
  }
  if (error instanceof PrismaClientKnownRequestError) {
    return handlePrismaError(error);
  }
  if (error instanceof AuthError) {
    return errorResponse(error.message, 401);
  }
  return errorResponse("Erro interno", 500);
}
```

2. **Implementar rate limiting**
```typescript
// middleware.ts - adicionar
import { Ratelimit } from "@upstash/ratelimit";
```

3. **Criar endpoint de registro**
```
/api/auth/register - POST
```

### Prioridade 2 (ALTA)

1. **Refatorar dashboards para usar API**
2. **Criar página de analytics**
3. **Implementar gestão de preços customizados**
4. **Sincronizar useNotifications com API**

### Prioridade 3 (MÉDIA)

1. **Adicionar validação de UUID em todos endpoints**
2. **Remover código duplicado**
3. **Adicionar tipos Prisma específicos**
4. **Implementar soft delete**

### Prioridade 4 (BAIXA)

1. **Adicionar cache headers**
2. **Implementar carrinho persistente**
3. **Criar endpoint de busca por número de pedido no frontend**

---

## 📁 ESTRUTURA DE PASTAS RECOMENDADA

```
app/
├── api/
│   ├── auth/
│   │   ├── [...nextauth]/
│   │   ├── register/          # ⚠️ CRIAR
│   │   └── forgot-password/   # ⚠️ CRIAR
│   └── v1/                    # Versionar API
│       ├── analytics/
│       ├── produtos/
│       └── ...
├── dashboard/
│   ├── fornecedor/
│   │   ├── analytics/         # ⚠️ CRIAR
│   │   ├── precos-customizados/ # ⚠️ CRIAR
│   │   └── ...
│   └── ...
├── (shared)/                  # Layouts compartilhados
└── ...

lib/
├── api/
│   ├── error-handler.ts       # ⚠️ CRIAR
│   ├── rate-limit.ts          # ⚠️ CRIAR
│   └── validators.ts          # ⚠️ CRIAR
└── ...
```

---

## 📊 RESUMO EXECUTIVO

| Categoria | Status | Ação Necessária |
|-----------|--------|-----------------|
| Endpoints não utilizados | 🔴 18/42 (43%) | Criar páginas ou remover |
| Segurança | 🟡 Média | Rate limit, sanitização |
| Tratamento de erros | 🔴 Inconsistente | Centralizar |
| Tipagem | 🟡 Parcial | Remover `any` |
| Testes | 🔴 Inexistentes | Implementar |
| Documentação API | 🔴 Inexistente | Criar com Swagger |

---

## 🎯 PRÓXIMOS PASSOS RECOMENDADOS

1. **Semana 1:** Corrigir problemas críticos de segurança e erros
2. **Semana 2:** Criar páginas para endpoints não utilizados
3. **Semana 3:** Refatorar dashboards para usar API
4. **Semana 4:** Adicionar testes e documentação

---

*Auditoria realizada analisando 42 endpoints, 32 páginas e toda a estrutura do projeto.*

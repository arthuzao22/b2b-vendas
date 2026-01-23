# 🚀 Prompt de Continuação: Sistema B2B Marketplace - Fase 2

## 🎯 Contexto do Projeto

O **Sistema B2B Marketplace** é uma plataforma que conecta fornecedores e compradores empresariais, desenvolvida com Next.js 14+, TypeScript, Prisma, PostgreSQL (Supabase) e NextAuth.js.

**Estado Atual:**
- ✅ Schema Prisma completo (368 linhas, 17 modelos)
- ✅ Autenticação NextAuth.js configurada com JWT
- ✅ Middleware de proteção por RBAC implementado
- ✅ APIs backend: 11 áreas funcionais implementadas
- ✅ Dashboard do Fornecedor: KPIs, pedidos, produtos
- ⚠️ Frontend: Maioria das páginas não implementadas
- ❌ Sistema de carrinho/checkout inexistente
- ❌ Área do cliente vazia
- ❌ Área do admin vazia

---

## 🧩 Objetivo da Nova Task

**Completar as funcionalidades faltantes** do sistema B2B, focando nas páginas de frontend e funcionalidades do lado cliente, mantendo toda a arquitetura e convenções já estabelecidas sem retrabalho do que já existe.

---

## 📌 Escopo de Implementação

### 🔧 Funcionalidades a Implementar (Não Iniciadas)

#### Frontend - Área do Cliente

| # | Funcionalidade | Rota | Referência Original |
|---|----------------|------|---------------------|
| 1 | Dashboard do cliente | `/dashboard/cliente` | Prompt L.55-69 |
| 2 | Catálogo personalizado | `/dashboard/cliente/catalogo` | Prompt L.56 |
| 3 | Carrinho de compras | `/carrinho` | Prompt L.57, L.314-340 |
| 4 | Checkout | `/checkout` | Prompt L.58 |
| 5 | Histórico de pedidos | `/pedidos` | Prompt L.59 |
| 6 | Detalhes do pedido | `/pedidos/:id` | Prompt L.60 |
| 7 | Rastreamento | `/rastreamento/:id` | Prompt L.61 |

#### Frontend - Área do Admin

| # | Funcionalidade | Rota | Referência Original |
|---|----------------|------|---------------------|
| 8 | Dashboard admin | `/dashboard/admin` | Prompt L.112 |
| 9 | Gestão de usuários | `/dashboard/admin/usuarios` | Prompt L.113 |
| 10 | Gestão de fornecedores | `/dashboard/admin/fornecedores` | Prompt L.114 |
| 11 | Relatórios consolidados | `/dashboard/admin/relatorios` | Prompt L.115 |

#### Frontend - Páginas Públicas

| # | Funcionalidade | Rota | Referência Original |
|---|----------------|------|---------------------|
| 12 | Lista de fornecedores | `/fornecedores` | Prompt L.43 |
| 13 | Catálogo público de produtos | `/catalogo-publico` | Prompt L.44 |
| 14 | Página do fornecedor (slug) | `/fornecedor/:slug` | Prompt L.45 |

#### Frontend - Autenticação

| # | Funcionalidade | Rota | Referência Original |
|---|----------------|------|---------------------|
| 15 | Página de login | `/auth/login` | Prompt L.161-167 |
| 16 | Página de registro | `/auth/register` | Prompt L.162 |
| 17 | Recuperação de senha | `/auth/forgot` | Prompt L.165 |

#### Estado Global (Zustand)

| # | Funcionalidade | Local | Referência Original |
|---|----------------|-------|---------------------|
| 18 | Store do carrinho | `/store/cart.ts` | Prompt L.314-340 |
| 19 | Store de notificações | `/store/notifications.ts` | Prompt L.376-387 |
| 20 | Store de UI/Tema | `/store/ui.ts` | - |

---

### ⚠️ Funcionalidades a Completar (Parciais)

#### 1. Dashboard do Fornecedor
- **Existe:** `/dashboard/fornecedor/page.tsx` com KPIs, pedidos recentes, alertas de estoque
- **Falta completar:**
  - Gráficos de vendas por período (Recharts)
  - Gestão de categorias (`/dashboard/fornecedor/categorias`)
  - Controle de estoque completo (`/dashboard/fornecedor/estoque`)
  - Sistema de preços completo (`/dashboard/fornecedor/precos`)
  - Página de configurações (`/dashboard/fornecedor/configuracoes`)

#### 2. Componentes UI Reutilizáveis
- **Existe:** `button.tsx`, `card.tsx`, `badge.tsx`, `input.tsx`, `label.tsx`
- **Falta implementar (conforme Prompt L.271-285):**
  - `DataTable` - Tabela com paginação, busca, ordenação, filtros
  - `FormField` - Input com label, erro, validação visual
  - `Modal/Dialog` - Para confirmações e formulários
  - `Drawer` - Painel lateral para detalhes
  - `StatusBadge` - Badge colorido por status (existente parcial)
  - `PriceDisplay` - Formatação de preço em BRL
  - `QuantitySelector` - Input de quantidade com +/-
  - `ImageUpload` - Upload de imagens com preview
  - `LoadingSkeleton` - Skeletons para loading states
  - `EmptyState` - Mensagem quando não há dados
  - `ErrorBoundary` - Tratamento de erros
  - `Breadcrumbs` - Navegação hierárquica
  - `NotificationDropdown` - Dropdown de notificações
  - `SearchInput` - Input com debounce

#### 3. Sistema de Precificação
- **API existe:** `/api/produtos/:id/preco`
- **Falta no frontend:**
  - Tela de gestão de listas de preço
  - Tela de preços customizados por cliente
  - Visualização da hierarquia de preços

---

### 🔄 Correções Arquiteturais Necessárias

| Camada | Problema Identificado | Correção Necessária | Impacto |
|--------|----------------------|---------------------|---------|
| Store | Diretório `/store` vazio (apenas `.gitkeep`) | Implementar stores Zustand: `cartStore`, `notificationStore` | Carrinho não funciona sem persistência cliente |
| Hooks | Diretório `/hooks` vazio | Implementar hooks: `useCart`, `useAuth`, `useNotifications`, `usePricing` | DX e reuso de lógica prejudicados |
| Types | Tipos básicos existem | Ampliar tipos para Cart, Notification, Session estendida | TypeScript incompleto |
| UI | Componentes mínimos | Implementar design system completo (15 componentes listados) | UX inconsistente |

---

### 🔐 Ajustes de Segurança e Acesso

#### RBAC (Já Implementado - Verificar Cobertura)

O middleware (`/middleware.ts`) já implementa:
- ✅ Proteção de rotas por `TipoUsuario`
- ✅ Redirecionamento automático por role
- ✅ Verificação de token JWT

**Verificar nas novas páginas:**
- [ ] Todas as rotas `/dashboard/cliente/*` validam `clienteId`
- [ ] Todas as rotas `/dashboard/admin/*` validam `tipo === 'admin'`
- [ ] APIs devem ter validação de `fornecedorId` para operações

#### Validações Obrigatórias

| Área | Validação Necessária |
|------|---------------------|
| Carrinho | Validar estoque disponível antes de adicionar |
| Checkout | Validar preços no servidor (não confiar no cliente) |
| Pedidos | Validar que cliente pertence ao fornecedor |
| Preços | Aplicar hierarquia: Customizado > Lista > Base |
| Estoque | Decrementar apenas ao confirmar pedido |

---

## 🏗️ Diretrizes Técnicas Obrigatórias

### Estrutura de Pastas (Manter)

```
b2b/
├── app/
│   ├── (auth)/           # Páginas de autenticação
│   ├── (public)/         # Páginas públicas
│   ├── api/              # API Routes (já implementado)
│   ├── dashboard/
│   │   ├── admin/        # ❌ Implementar
│   │   ├── cliente/      # ❌ Implementar
│   │   └── fornecedor/   # ⚠️ Completar
│   ├── carrinho/         # ❌ Implementar
│   ├── checkout/         # ❌ Implementar
│   └── pedidos/          # ❌ Implementar
├── components/
│   ├── ui/               # Componentes base (ampliar)
│   ├── forms/            # Formulários
│   ├── tables/           # Tabelas
│   ├── charts/           # Gráficos
│   └── layout/           # Layout
├── hooks/                # ❌ Implementar hooks
├── lib/                  # Utilitários (existe)
├── store/                # ❌ Implementar Zustand
└── types/                # Ampliar tipos
```

### Convenções de Código

- **Naming:** camelCase para funções, PascalCase para componentes
- **Imports:** Ordenados (react, next, third-party, local)
- **TypeScript:** Strict mode, sem `any` explícito
- **Async:** Server Actions ou API Routes, nunca `use client` para dados críticos
- **Validação:** Zod para schemas
- **Estilo:** Tailwind CSS, sem CSS modules

### Padrões de Interface

- **Design System:** shadcn/ui + Radix UI
- **Cores:** Azul primário (#2563EB), modo claro
- **Responsivo:** Mobile-first
- **Loading:** Skeletons, não spinners genéricos
- **Erros:** Error boundaries + toast notifications

---

## ⛔ Limites e Restrições

> [!CAUTION]
> **NÃO FAZER:**

1. ❌ **Não modificar schema Prisma** - Já está completo
2. ❌ **Não reimplementar APIs existentes** - 11 áreas já funcionais
3. ❌ **Não alterar lib/auth.ts** - NextAuth configurado
4. ❌ **Não mudar middleware.ts** - RBAC implementado
5. ❌ **Não refatorar dashboard/fornecedor/page.tsx** - Functional
6. ❌ **Não trocar stack** - Next.js, Prisma, Tailwind, shadcn
7. ❌ **Não simplificar hierarquia de preços** - Regra de negócio crítica
8. ❌ **Não ignorar validações de estoque** - Integridade de dados

---

## ✅ Critérios de Aceitação

### Fase 1 - Páginas Públicas e Autenticação
- [ ] `/auth/login` funcional com NextAuth
- [ ] `/auth/register` criando usuário + cliente/fornecedor
- [ ] `/fornecedores` listando fornecedores verificados
- [ ] `/catalogo-publico` exibindo produtos
- [ ] `/fornecedor/:slug` mostrando catálogo do fornecedor

### Fase 2 - Área do Cliente
- [ ] Zustand store para carrinho implementado
- [ ] `/dashboard/cliente` com resumo de pedidos
- [ ] `/carrinho` com adição/remoção/quantidade
- [ ] `/checkout` com validação de estoque e preços
- [ ] `/pedidos` listando histórico
- [ ] `/pedidos/:id` com detalhes e status

### Fase 3 - Área do Fornecedor (Completar)
- [ ] Gráficos com Recharts no dashboard
- [ ] `/dashboard/fornecedor/categorias` CRUD
- [ ] `/dashboard/fornecedor/estoque` movimentações
- [ ] `/dashboard/fornecedor/precos` listas e customizados
- [ ] `/dashboard/fornecedor/configuracoes` dados do fornecedor

### Fase 4 - Área do Admin
- [ ] `/dashboard/admin` com métricas do marketplace
- [ ] `/dashboard/admin/usuarios` CRUD de usuários
- [ ] `/dashboard/admin/fornecedores` aprovação/gestão
- [ ] `/dashboard/admin/relatorios` consolidados

### Fase 5 - Componentes e UX
- [ ] 15 componentes UI listados implementados
- [ ] Loading states em todas as páginas
- [ ] Empty states quando sem dados
- [ ] Error boundaries funcionais
- [ ] Responsivo em todas as páginas

### Fase 6 - Funcionalidades Avançadas
- [ ] Notificações em tempo real (Socket.io) - **Dependente de decisão técnica prévia**
- [ ] Sistema de emails - **Dependente de decisão técnica prévia** (qual provider?)
- [ ] Busca avançada com debounce
- [ ] Importação/Exportação CSV - **Dependente de prioridade de negócio**

---

## 📊 Resumo do Gap Analysis

| Área | Implementado | Faltando | Prioridade |
|------|--------------|----------|------------|
| Schema Prisma | 100% | 0% | - |
| APIs Backend | ~90% | ~10% | Baixa |
| Autenticação | 80% | 20% (páginas) | Alta |
| Dashboard Fornecedor | 60% | 40% | Média |
| Dashboard Cliente | 0% | 100% | **Crítica** |
| Dashboard Admin | 0% | 100% | Alta |
| Páginas Públicas | 10% | 90% | Alta |
| Carrinho/Checkout | 0% | 100% | **Crítica** |
| Componentes UI | 20% | 80% | Alta |
| Zustand Stores | 0% | 100% | **Crítica** |
| Hooks | 0% | 100% | Alta |
| Real-time | 0% | 100% | Baixa |

---

## 🔍 Dependências de Decisão Técnica

1. **Socket.io**: Implementar com servidor separado ou integrado ao Next.js?
2. **Email Provider**: Qual serviço utilizar (Resend, SendGrid, Nodemailer)?
3. **Image Upload**: Vercel Blob, Cloudinary ou Supabase Storage?
4. **CSV Import**: Processamento síncrono ou com filas?

---

*Este prompt foi gerado automaticamente com base na auditoria técnica do projeto em 2026-01-23.*

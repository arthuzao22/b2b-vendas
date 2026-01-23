# 🚀 Prompt de Implementação: Sistema B2B Marketplace - Fase de Continuação

---

## 🎯 Contexto do Projeto

O **Sistema B2B Marketplace** é uma plataforma e-commerce Business-to-Business que conecta fornecedores e compradores empresariais, desenvolvida com:

| Camada | Tecnologia | Status |
|--------|------------|--------|
| Framework | Next.js 14+ (App Router) | ✅ Configurado |
| Linguagem | TypeScript (strict mode) | ✅ Configurado |
| Banco de Dados | PostgreSQL (Supabase) + Prisma | ✅ Schema completo (17 modelos) |
| Autenticação | NextAuth.js com JWT | ✅ Implementado |
| Middleware RBAC | next-auth/jwt | ✅ Implementado |
| APIs Backend | 11 áreas de rotas | ✅ ~90% completo |
| UI | shadcn/ui + Tailwind CSS | ⚠️ Parcial (5 componentes) |
| Estado Global | Zustand | ❌ Não implementado |
| Gráficos | Recharts | ❌ Não implementado |
| Real-time | Socket.io | ❌ Não implementado |

**O que já está funcional:**
- Schema Prisma completo (`/prisma/schema.prisma` - 368 linhas, 17 modelos)
- Autenticação NextAuth.js (`/lib/auth.ts`)
- Middleware de proteção por roles (`/middleware.ts`)
- Dashboard do Fornecedor com KPIs (`/app/dashboard/fornecedor/page.tsx`)
- APIs: categorias, produtos, clientes, estoque, pedidos, listas-preco, precos-customizados, notificacoes, analytics

---

## 🧩 Objetivo da Nova Task

**Completar as funcionalidades faltantes do sistema B2B**, focando exclusivamente em:

1. Páginas de frontend não implementadas
2. Stores Zustand para estado global do cliente
3. Hooks reutilizáveis
4. Componentes UI faltantes
5. Completar páginas parciais do dashboard fornecedor

> [!IMPORTANT]
> **NÃO reimplementar** o que já existe e funciona. O objetivo é preencher as lacunas identificadas na auditoria técnica.

---

## 📌 Escopo de Implementação

### 🔧 Funcionalidades a Implementar

#### 1. Estado Global (Zustand) - PRIORIDADE CRÍTICA

| # | Arquivo | Descrição | Ref. Original |
|---|---------|-----------|---------------|
| 1.1 | `/store/cart-store.ts` | Store do carrinho de compras com persistência localStorage | prompt.md L.314-340 |
| 1.2 | `/store/notification-store.ts` | Store de notificações com contador não-lidas | prompt.md L.376-387 |
| 1.3 | `/store/ui-store.ts` | Store de UI (sidebar, modals, toasts) | - |

**Interface obrigatória do carrinho (conforme prompt.md L.316-333):**
```typescript
interface CartState {
  supplierId: string;
  supplierName: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
}
```

---

#### 2. Hooks Customizados - PRIORIDADE ALTA

| # | Arquivo | Descrição |
|---|---------|-----------|
| 2.1 | `/hooks/use-cart.ts` | Hook para interagir com cartStore |
| 2.2 | `/hooks/use-auth.ts` | Hook para sessão NextAuth |
| 2.3 | `/hooks/use-notifications.ts` | Hook para notificações |
| 2.4 | `/hooks/use-pricing.ts` | Hook para cálculo de preços |
| 2.5 | `/hooks/use-debounce.ts` | Hook para debounce em buscas |

---

#### 3. Páginas de Autenticação - PRIORIDADE ALTA

| # | Rota | Página | Ref. Original |
|---|------|--------|---------------|
| 3.1 | `/auth/login` | Formulário de login com NextAuth | prompt.md L.162-163 |
| 3.2 | `/auth/register` | Registro (cliente OU fornecedor) | prompt.md L.162 |
| 3.3 | `/auth/forgot-password` | Recuperação de senha | prompt.md L.165 |
| 3.4 | `/auth/reset-password` | Redefinição de senha | prompt.md L.166 |

**Requisitos:**
- Usar `signIn()` do NextAuth para login
- Registro deve criar Usuario + (Cliente OU Fornecedor) conforme tipo
- Validação com Zod
- Redirecionamento por tipo após login (prompt.md L.306-310)

---

#### 4. Páginas Públicas - PRIORIDADE ALTA

| # | Rota | Página | Ref. Original |
|---|------|--------|---------------|
| 4.1 | `/fornecedores` | Lista de fornecedores verificados | prompt.md L.43 |
| 4.2 | `/catalogo-publico` | Catálogo público de todos os produtos | prompt.md L.44 |
| 4.3 | `/fornecedor/[slug]` | Catálogo de fornecedor específico | prompt.md L.45 |

**Requisitos:**
- Busca e filtros de produtos (prompt.md L.49)
- Paginação
- Cards de produtos com imagem, nome, preço

---

#### 5. Área do Cliente - PRIORIDADE CRÍTICA

| # | Rota | Página | Ref. Original |
|---|------|--------|---------------|
| 5.1 | `/dashboard/cliente` | Dashboard com resumo de pedidos | prompt.md L.55 |
| 5.2 | `/dashboard/cliente/catalogo` | Catálogo personalizado (preços calculados) | prompt.md L.56 |
| 5.3 | `/carrinho` | Carrinho de compras | prompt.md L.57 |
| 5.4 | `/checkout` | Finalização do pedido | prompt.md L.58 |
| 5.5 | `/pedidos` | Histórico de pedidos | prompt.md L.59 |
| 5.6 | `/pedidos/[id]` | Detalhes do pedido | prompt.md L.60 |
| 5.7 | `/rastreamento/[id]` | Rastreamento de entrega | prompt.md L.61 |

**Requisitos Críticos:**
- Preços personalizados via hierarquia: Customizado > Lista > Base (prompt.md L.107)
- Carrinho persistente com Zustand + localStorage (prompt.md L.338)
- Validar estoque no checkout (prompt.md L.371)
- Não permitir pedido se quantidade > estoque

---

#### 6. Área do Admin - PRIORIDADE ALTA

| # | Rota | Página | Ref. Original |
|---|------|--------|---------------|
| 6.1 | `/dashboard/admin` | Dashboard com visão geral do marketplace | prompt.md L.112 |
| 6.2 | `/dashboard/admin/usuarios` | CRUD de usuários | prompt.md L.113 |
| 6.3 | `/dashboard/admin/fornecedores` | Gestão e aprovação de fornecedores | prompt.md L.114 |
| 6.4 | `/dashboard/admin/relatorios` | Relatórios consolidados | prompt.md L.115 |

**Requisitos:**
- Visão de KPIs do marketplace inteiro
- Aprovar/suspender fornecedores
- Gerenciar usuários (ativar/desativar)

---

#### 7. Componentes UI Faltantes - PRIORIDADE ALTA

Implementar em `/components/ui/` conforme prompt.md L.271-285:

| # | Componente | Descrição |
|---|------------|-----------|
| 7.1 | `DataTable` | Tabela com paginação, busca, ordenação, filtros |
| 7.2 | `FormField` | Input com label, erro, validação visual |
| 7.3 | `Dialog` | Modal para confirmações e formulários |
| 7.4 | `Drawer` | Painel lateral para detalhes |
| 7.5 | `StatusBadge` | Badge colorido por status de pedido |
| 7.6 | `PriceDisplay` | Formatação de preço em BRL |
| 7.7 | `QuantitySelector` | Input de quantidade com botões +/- |
| 7.8 | `ImageUpload` | Upload de imagens com preview |
| 7.9 | `Skeleton` | Skeletons para loading states |
| 7.10 | `EmptyState` | Mensagem quando não há dados |
| 7.11 | `ErrorBoundary` | Tratamento de erros React |
| 7.12 | `Breadcrumbs` | Navegação hierárquica |
| 7.13 | `NotificationDropdown` | Dropdown de notificações no header |
| 7.14 | `SearchInput` | Input com debounce |

---

### ⚠️ Funcionalidades a Completar

#### 1. Dashboard do Fornecedor

**O que existe:**
- `/app/dashboard/fornecedor/page.tsx` - KPIs, pedidos recentes, alertas estoque
- `/app/dashboard/fornecedor/produtos/` - Listagem e formulário
- `/app/dashboard/fornecedor/pedidos/` - Listagem
- `/app/dashboard/fornecedor/clientes/` - Listagem

**O que falta implementar:**

| # | Rota | Funcionalidade | Ref. Original |
|---|------|----------------|---------------|
| 1.1 | `/dashboard/fornecedor` | Gráficos de vendas com Recharts | prompt.md L.87 |
| 1.2 | `/dashboard/fornecedor/categorias` | CRUD de categorias hierárquicas | prompt.md L.76 |
| 1.3 | `/dashboard/fornecedor/estoque` | Movimentações de estoque | prompt.md L.78 |
| 1.4 | `/dashboard/fornecedor/precos` | Gestão de listas de preço | prompt.md L.79 |
| 1.5 | `/dashboard/fornecedor/configuracoes` | Configurações do fornecedor | prompt.md L.81 |

---

### 🔄 Correções Arquiteturais Necessárias

| # | Camada | Problema | Correção | Impacto se não corrigir |
|---|--------|----------|----------|-------------------------|
| 1 | `/store/` | Diretório vazio (apenas `.gitkeep`) | Implementar stores Zustand | Carrinho não funciona, notificações não persistem |
| 2 | `/hooks/` | Diretório vazio (apenas `.gitkeep`) | Implementar hooks customizados | Código duplicado, DX prejudicada |
| 3 | `/types/` | Tipos incompletos | Adicionar tipos para Cart, Notification, Session extendida | TypeScript com `any` implícitos |
| 4 | `/components/ui/` | Apenas 5 componentes básicos | Implementar 14 componentes adicionais | UX inconsistente, retrabalho |

---

### 🔐 Ajustes de Segurança e Acesso

#### RBAC - Verificações Obrigatórias

O middleware já implementa proteção por `TipoUsuario`. Nas novas páginas:

| Área | Validação Obrigatória |
|------|----------------------|
| `/dashboard/cliente/*` | Verificar `session.user.clienteId` existe |
| `/dashboard/admin/*` | Verificar `session.user.tipo === 'admin'` |
| `/carrinho`, `/checkout` | Verificar usuário autenticado como cliente |
| APIs de escrita | Validar `fornecedorId` do token corresponde ao recurso |

#### Validações de Negócio Obrigatórias

| Operação | Validação | Local |
|----------|-----------|-------|
| Adicionar ao carrinho | `quantidade <= quantidadeEstoque` | Frontend + API |
| Checkout | Recalcular preços no servidor | API `/api/pedidos` |
| Criar pedido | Decrementar estoque atomicamente | API `/api/pedidos` |
| Cancelar pedido | Incrementar estoque | API `/api/pedidos/:id/cancelar` |
| Cálculo de preço | Hierarquia: Customizado > Lista > Base | API `/api/produtos/:id/preco` |

#### Proteção de Rotas (já implementado em `/middleware.ts`)

```typescript
// Mapeamento existente - NÃO ALTERAR
routesByRole: {
  admin: ["/dashboard/admin"],
  fornecedor: ["/dashboard/fornecedor"],
  cliente: ["/dashboard/cliente", "/carrinho", "/checkout", "/pedidos", "/rastreamento"]
}
```

---

## 🏗️ Diretrizes Técnicas Obrigatórias

### Estrutura de Pastas

```
b2b/
├── app/
│   ├── (auth)/                    # Grupo de rotas de auth (implementar páginas)
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── forgot-password/page.tsx
│   ├── (public)/                  # Grupo de rotas públicas (implementar)
│   │   ├── fornecedores/page.tsx
│   │   ├── catalogo-publico/page.tsx
│   │   └── fornecedor/[slug]/page.tsx
│   ├── api/                       # ✅ JÁ IMPLEMENTADO - NÃO ALTERAR
│   ├── dashboard/
│   │   ├── admin/                 # Implementar
│   │   ├── cliente/               # Implementar  
│   │   └── fornecedor/            # Completar
│   ├── carrinho/page.tsx          # Implementar
│   ├── checkout/page.tsx          # Implementar
│   └── pedidos/                   # Implementar
├── components/
│   ├── ui/                        # Ampliar com 14 componentes
│   ├── forms/                     # Formulários específicos
│   ├── tables/                    # DataTable e variantes
│   ├── charts/                    # Componentes Recharts
│   └── layout/                    # Header, Sidebar, Footer
├── hooks/                         # Implementar hooks
├── lib/                           # ✅ JÁ EXISTE - NÃO ALTERAR
├── store/                         # Implementar stores Zustand
├── types/                         # Ampliar tipos
└── prisma/                        # ✅ JÁ EXISTE - NÃO ALTERAR
```

### Convenções de Código

- **Naming:** camelCase para funções/variáveis, PascalCase para componentes/tipos
- **Imports:** Ordenar: react → next → third-party → @/ aliases → relativos
- **TypeScript:** Strict mode ativo, evitar `any` explícito
- **Server vs Client:** 
  - Dados críticos: Server Components ou Server Actions
  - Interatividade: `'use client'` apenas quando necessário
- **Validação:** Zod para todos os schemas de formulário
- **Estilo:** Tailwind CSS classes, nunca CSS modules
- **Formatação:** Usar `cn()` de `/lib/utils` para classes condicionais

### Padrões de Interface (prompt.md L.466-473)

- **Design System:** shadcn/ui + Radix UI primitives
- **Cores:** Azul primário (#2563EB), texto cinza escuro
- **Layout:** Mobile-first, breakpoints Tailwind padrão
- **Loading:** Skeletons, não spinners genéricos
- **Erros:** Toast notifications + error boundaries
- **Feedback:** Estados visuais para loading, success, error

---

## ⛔ Limites e Restrições

> [!CAUTION]
> **PROIBIDO:**

| # | Restrição | Motivo |
|---|-----------|--------|
| 1 | ❌ Modificar `/prisma/schema.prisma` | Schema está completo e em produção |
| 2 | ❌ Alterar `/lib/auth.ts` | Autenticação já configurada |
| 3 | ❌ Modificar `/middleware.ts` | RBAC implementado e funcional |
| 4 | ❌ Refatorar APIs em `/app/api/` | Backend ~90% completo |
| 5 | ❌ Trocar stack (Next.js, Prisma, Tailwind) | Decisão arquitetural definida |
| 6 | ❌ Simplificar hierarquia de preços | Regra de negócio crítica |
| 7 | ❌ Ignorar validações de estoque | Integridade de dados |
| 8 | ❌ Adicionar features não especificadas | Manter escopo original |
| 9 | ❌ Usar CSS modules ou styled-components | Padrão é Tailwind |
| 10 | ❌ Criar Server Actions para dados críticos sem validação | Segurança |

---

## ✅ Critérios de Aceitação

### Fase 1 - Infraestrutura Base
- [ ] Store Zustand do carrinho implementado com persistência
- [ ] Store Zustand de notificações implementado
- [ ] Hooks `useCart`, `useAuth`, `useNotifications` funcionais
- [ ] Tipos TypeScript para Cart, Notification, Session estendida

### Fase 2 - Autenticação
- [ ] `/auth/login` funcional com NextAuth signIn
- [ ] `/auth/register` criando Usuario + Cliente/Fornecedor
- [ ] `/auth/forgot-password` enviando email (se email provider configurado)
- [ ] Redirecionamento correto por tipo de usuário após login

### Fase 3 - Páginas Públicas
- [ ] `/fornecedores` listando fornecedores verificados com cards
- [ ] `/catalogo-publico` com busca, filtros e paginação
- [ ] `/fornecedor/[slug]` exibindo catálogo do fornecedor

### Fase 4 - Área do Cliente
- [ ] `/dashboard/cliente` com resumo de pedidos e KPIs
- [ ] `/dashboard/cliente/catalogo` com preços personalizados
- [ ] `/carrinho` com adição/remoção/alteração de quantidade
- [ ] `/checkout` com validação de estoque e preços no servidor
- [ ] `/pedidos` listando histórico com status
- [ ] `/pedidos/[id]` com timeline de status

### Fase 5 - Área do Fornecedor (Completar)
- [ ] Gráficos Recharts no dashboard principal
- [ ] `/dashboard/fornecedor/categorias` com CRUD hierárquico
- [ ] `/dashboard/fornecedor/estoque` com movimentações
- [ ] `/dashboard/fornecedor/precos` com listas e customizados
- [ ] `/dashboard/fornecedor/configuracoes` com dados da empresa

### Fase 6 - Área do Admin
- [ ] `/dashboard/admin` com métricas do marketplace
- [ ] `/dashboard/admin/usuarios` com CRUD
- [ ] `/dashboard/admin/fornecedores` com aprovação/gestão
- [ ] `/dashboard/admin/relatorios` com dados consolidados

### Fase 7 - Componentes UI
- [ ] 14 componentes UI implementados conforme lista
- [ ] Loading states (Skeleton) em todas as páginas
- [ ] Empty states quando sem dados
- [ ] Error boundaries funcionais
- [ ] Responsividade em todas as páginas

### Fase 8 - Funcionalidades Avançadas
- [ ] Notificações em tempo real com Socket.io - **Dependente de decisão técnica**
- [ ] Sistema de emails - **Dependente de provider (Resend/SendGrid)**
- [ ] Busca avançada com debounce
- [ ] Importação/Exportação CSV - **Dependente de prioridade**

---

## 🔍 Decisões Técnicas Pendentes

Antes de implementar certas funcionalidades, é necessário definir:

| Item | Opções | Impacto |
|------|--------|---------|
| **Socket.io** | Servidor separado vs integrado ao Next.js | Arquitetura de deploy |
| **Email Provider** | Resend, SendGrid, Nodemailer | API de envio, templates |
| **Image Upload** | Vercel Blob, Cloudinary, Supabase Storage | Custo, CDN |
| **CSV Import** | Síncrono vs filas (Redis/BullMQ) | Performance para grandes arquivos |

> [!NOTE]
> Marcar como **"Dependente de decisão técnica prévia"** qualquer implementação que dependa dessas definições.

---

## 📊 Priorização de Implementação

| Prioridade | Área | Justificativa |
|------------|------|---------------|
| 🔴 CRÍTICA | Zustand Stores | Base para carrinho e estado |
| 🔴 CRÍTICA | Área do Cliente | Core business do marketplace |
| 🟠 ALTA | Páginas de Autenticação | Fluxo de entrada |
| 🟠 ALTA | Páginas Públicas | Vitrine do marketplace |
| 🟠 ALTA | Componentes UI | Reuso em todas as páginas |
| 🟡 MÉDIA | Completar Fornecedor | Já parcialmente funcional |
| 🟡 MÉDIA | Área do Admin | Gestão do marketplace |
| 🟢 BAIXA | Real-time/Emails | Funcionalidades avançadas |

---

*Prompt gerado em 2026-01-23 baseado na auditoria técnica do projeto b2b-vendas.*

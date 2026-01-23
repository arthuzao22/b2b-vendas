# 🚀 Prompt Unificado: Sistema B2B Marketplace Completo

## 📋 Objetivo Principal

Desenvolver o **sistema completo de e-commerce B2B (Business-to-Business)** - uma plataforma marketplace moderna e profissional que conecta fornecedores e compradores empresariais. O sistema deve incluir **backend completo com API** e **frontend completo** funcionando de forma integrada com o banco de dados PostgreSQL.

> [!IMPORTANT]
> **Este projeto já possui:**
> - ✅ Estrutura de pastas configurada
> - ✅ Schema Prisma completo (`/prisma/schema.prisma`)
> - ✅ Configuração inicial do Next.js 14+
> 
> **Usar o schema Prisma existente sem modificações.**

---

## 🛠️ Stack Tecnológica

| Tecnologia | Versão/Detalhes |
|------------|-----------------|
| **Framework** | Next.js 14+ (App Router) |
| **Linguagem** | TypeScript (strict mode) |
| **Estilização** | Tailwind CSS |
| **UI Components** | shadcn/ui + Radix UI |
| **Banco de Dados** | PostgreSQL (Supabase) |
| **ORM** | Prisma 7+ |
| **Autenticação** | NextAuth.js com JWT |
| **Estado Global** | Zustand |
| **Validação** | Zod |
| **Logs** | Winston |
| **Real-time** | Socket.io (WebSockets) |
| **Gráficos** | Recharts |
| **Ícones** | Lucide React |

---

## 👥 Perfis de Usuário

### 1. 🌐 Visitantes Públicos (Sem Autenticação)

**Rotas:**
- `/` - Landing page
- `/fornecedores` - Lista de fornecedores
- `/catalogo-publico` - Catálogo público de produtos
- `/fornecedor/:slug` - Catálogo de fornecedor específico

**Funcionalidades:**
- Visualização de catálogos sem login
- Busca e filtros de produtos
- Informações dos fornecedores

### 2. 🛒 Clientes (Compradores) - `TipoUsuario.cliente`

**Rotas:**
- `/dashboard/cliente` - Dashboard principal
- `/dashboard/cliente/catalogo` - Catálogo personalizado
- `/carrinho` - Carrinho de compras
- `/checkout` - Finalização do pedido
- `/pedidos` - Histórico de pedidos
- `/pedidos/:id` - Detalhes do pedido
- `/rastreamento/:id` - Rastreamento

**Funcionalidades:**
- Preços personalizados baseados em listas de preços
- Carrinho de compras persistente
- Fluxo de checkout completo
- Histórico de pedidos
- Rastreamento de entregas
- Notificações em tempo real

### 3. 🏭 Fornecedores - `TipoUsuario.fornecedor`

**Rotas:**
- `/dashboard/fornecedor` - Dashboard com analytics
- `/dashboard/fornecedor/produtos` - CRUD de produtos
- `/dashboard/fornecedor/categorias` - Gestão de categorias
- `/dashboard/fornecedor/pedidos` - Gestão de pedidos
- `/dashboard/fornecedor/estoque` - Controle de estoque
- `/dashboard/fornecedor/precos` - Listas de preços
- `/dashboard/fornecedor/clientes` - Gestão de clientes
- `/dashboard/fornecedor/configuracoes` - Configurações

**Funcionalidades:**

**Dashboard Analytics:**
- KPIs: Faturamento, Pedidos, Ticket médio, Clientes ativos
- Gráficos de vendas por período
- Top 10 produtos mais vendidos
- Alertas de estoque baixo

**Gestão de Produtos:**
- CRUD completo
- Upload de múltiplas imagens
- Categorização hierárquica
- SKU único por fornecedor

**Controle de Estoque:**
- Movimentações: entrada, saída, ajuste
- Alertas automáticos (estoque ≤ mínimo)
- Histórico de movimentações

**Precificação Avançada:**
1. **Preço Base**: Definido no produto
2. **Listas de Preços**: Grupos de clientes com desconto
3. **Preços Customizados**: Preço específico por cliente/produto

**Hierarquia:** `Preço Customizado > Lista de Preços > Preço Base`

### 4. 👑 Administradores - `TipoUsuario.admin`

**Rotas:**
- `/dashboard/admin` - Visão geral do marketplace
- `/dashboard/admin/usuarios` - Gestão de usuários
- `/dashboard/admin/fornecedores` - Gestão de fornecedores
- `/dashboard/admin/relatorios` - Relatórios consolidados

**Funcionalidades:**
- Gestão completa de usuários
- Aprovação de fornecedores
- Relatórios do marketplace
- Configurações globais

---

## 🗄️ Modelos do Banco de Dados (Referência)

> [!NOTE]
> O schema Prisma completo já existe em `/prisma/schema.prisma`. Abaixo está a referência dos modelos:

| Modelo | Descrição |
|--------|-----------|
| `Usuario` | Usuários do sistema (admin, fornecedor, cliente) |
| `Fornecedor` | Empresas vendedoras (dados fiscais, slug, logo) |
| `Cliente` | Empresas compradoras (dados fiscais, endereço) |
| `ClienteFornecedor` | Relacionamento N:N Cliente ↔ Fornecedor |
| `Categoria` | Categorias hierárquicas de produtos |
| `Produto` | Produtos do catálogo (preço, estoque, imagens) |
| `ListaPreco` | Listas de preços com descontos |
| `ItemListaPreco` | Produtos em uma lista de preços |
| `PrecoCustomizado` | Preço específico por cliente/produto |
| `Pedido` | Pedidos de compra |
| `ItemPedido` | Itens de um pedido |
| `HistoricoStatusPedido` | Histórico de alterações de status |
| `MovimentacaoEstoque` | Movimentações de estoque |
| `Notificacao` | Notificações do sistema |
| `EmailLog` | Registro de emails enviados |
| `AuditLog` | Auditoria de ações |

**Enums:**
- `TipoUsuario`: admin, fornecedor, cliente
- `StatusPedido`: pendente, confirmado, processando, enviado, entregue, cancelado
- `TipoMovimentacao`: entrada, saida, ajuste
- `TipoDesconto`: percentual, fixo
- `EmailStatus`: pending, sent, failed, bounced, delivered, opened, clicked

---

## 🔌 API Routes

### Autenticação
```
POST   /api/auth/register      → Cadastro de usuário
POST   /api/auth/login         → Login
POST   /api/auth/logout        → Logout
POST   /api/auth/forgot        → Recuperar senha
POST   /api/auth/reset         → Redefinir senha
GET    /api/auth/session       → Sessão atual
```

### Categorias
```
POST   /api/categorias            → Criar categoria
GET    /api/categorias            → Listar (com hierarquia)
GET    /api/categorias/:id        → Buscar por ID
PUT    /api/categorias/:id        → Atualizar
DELETE /api/categorias/:id        → Deletar
```

### Produtos
```
POST   /api/produtos              → Criar produto
GET    /api/produtos              → Listar (paginado, filtros)
GET    /api/produtos/:id          → Buscar por ID
PUT    /api/produtos/:id          → Atualizar
DELETE /api/produtos/:id          → Deletar
GET    /api/produtos/:id/preco    → Calcular preço para cliente
```

### Clientes
```
POST   /api/clientes                    → Criar cliente
GET    /api/clientes                    → Listar clientes
GET    /api/clientes/:id                → Buscar por ID
PUT    /api/clientes/:id                → Atualizar
DELETE /api/clientes/:id                → Deletar
POST   /api/clientes/:id/lista-preco    → Atribuir lista de preços
GET    /api/clientes/:id/pedidos        → Pedidos do cliente
```

### Listas de Preço
```
POST   /api/listas-preco                      → Criar lista
GET    /api/listas-preco                      → Listar todas
GET    /api/listas-preco/:id                  → Buscar por ID
PUT    /api/listas-preco/:id                  → Atualizar
DELETE /api/listas-preco/:id                  → Deletar
POST   /api/listas-preco/:id/produtos         → Adicionar produto
DELETE /api/listas-preco/:id/produtos/:prodId → Remover produto
```

### Preços Customizados
```
POST   /api/precos-customizados     → Criar
GET    /api/precos-customizados     → Listar por cliente
PUT    /api/precos-customizados/:id → Atualizar
DELETE /api/precos-customizados/:id → Deletar
```

### Estoque
```
POST   /api/estoque/movimentacoes            → Criar movimentação
GET    /api/estoque/movimentacoes            → Listar movimentações
GET    /api/estoque/movimentacoes/:produtoId → Histórico do produto
GET    /api/estoque/alertas                  → Produtos estoque baixo
GET    /api/estoque/dashboard                → Métricas de estoque
```

### Pedidos
```
POST   /api/carrinho/calcular         → Calcular totais do carrinho
POST   /api/pedidos                   → Criar pedido
GET    /api/pedidos                   → Listar pedidos
GET    /api/pedidos/:id               → Buscar por ID
GET    /api/pedidos/numero/:numero    → Buscar por número
PUT    /api/pedidos/:id/status        → Atualizar status
PUT    /api/pedidos/:id/rastreio      → Adicionar rastreio
POST   /api/pedidos/:id/cancelar      → Cancelar pedido
GET    /api/pedidos/:id/historico     → Histórico de status
```

### Notificações
```
GET    /api/notificacoes                    → Listar notificações
GET    /api/notificacoes/nao-lidas/count    → Contador
PUT    /api/notificacoes/:id/lida           → Marcar como lida
PUT    /api/notificacoes/marcar-todas-lidas → Marcar todas
DELETE /api/notificacoes/:id                → Deletar
```

### Analytics
```
GET    /api/analytics/kpis                   → KPIs gerais
GET    /api/analytics/vendas                 → Vendas por período
GET    /api/analytics/top-produtos           → Top produtos
GET    /api/analytics/pedidos-por-status     → Distribuição status
GET    /api/analytics/vendas-por-categoria   → Por categoria
GET    /api/analytics/top-clientes           → Clientes mais ativos
```

### Emails
```
POST   /api/email/send        → Enviar email
GET    /api/email/logs        → Logs de emails
GET    /api/email/stats       → Estatísticas
```

---

## 🎨 Componentes UI

### Componentes Reutilizáveis
- [ ] **DataTable** - Tabela com paginação, busca, ordenação, filtros
- [ ] **FormField** - Input com label, erro, validação visual
- [ ] **Modal/Dialog** - Para confirmações e formulários
- [ ] **Drawer** - Painel lateral para detalhes
- [ ] **StatusBadge** - Badge colorido por status
- [ ] **PriceDisplay** - Formatação de preço em BRL
- [ ] **QuantitySelector** - Input de quantidade com +/-
- [ ] **ImageUpload** - Upload de imagens com preview
- [ ] **LoadingSkeleton** - Skeletons para loading states
- [ ] **EmptyState** - Mensagem quando não há dados
- [ ] **ErrorBoundary** - Tratamento de erros
- [ ] **Breadcrumbs** - Navegação hierárquica
- [ ] **NotificationDropdown** - Dropdown de notificações
- [ ] **SearchInput** - Input com debounce

### Design System
- **Tema**: Moderno, profissional, modo claro
- **Cores Primárias**: Azul (#2563EB), Cinza escuro para texto
- **Estilo**: Clean, cards, sombras suaves, bordas arredondadas
- **Responsivo**: Mobile-first

---

## 🔐 Autenticação (NextAuth.js)

```typescript
// Configuração:
- Provider: Credentials (email/senha)
- Strategy: JWT
- Session: Dados do usuário + tipo (role)
- Middleware: Proteção de rotas por role
```

### Redirecionamento por Tipo:
```
TipoUsuario.admin      → /dashboard/admin
TipoUsuario.fornecedor → /dashboard/fornecedor
TipoUsuario.cliente    → /dashboard/cliente
```

---

## 🛒 Sistema de Carrinho

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

interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
  unitPrice: number; // Preço aplicado
  totalPrice: number;
}
```

**Regras:**
- Um carrinho por fornecedor
- Estado persistente (Zustand + localStorage)
- Cálculos automáticos

---

## 💰 Sistema de Precificação

```typescript
async function calcularPreco(produtoId: string, clienteId: string): Promise<Decimal> {
  // 1. Verificar preço customizado
  const precoCustomizado = await getPrecoCustomizado(produtoId, clienteId);
  if (precoCustomizado) return precoCustomizado.preco;
  
  // 2. Verificar lista de preços
  const itemLista = await getItemListaPreco(produtoId, clienteId);
  if (itemLista) {
    if (itemLista.precoEspecial) return itemLista.precoEspecial;
    return aplicarDesconto(produto.precoBase, lista.tipoDesconto, lista.valorDesconto);
  }
  
  // 3. Retornar preço base
  return produto.precoBase;
}
```

---

## 📦 Sistema de Estoque

**Regras:**
1. Ao confirmar pedido → Decrementar estoque
2. Ao cancelar pedido → Incrementar estoque
3. Quando `quantidadeEstoque ≤ estoqueMinimo` → Gerar alerta
4. Não permitir pedido se `quantidade > quantidadeEstoque`
5. Toda movimentação deve ter motivo registrado

---

## 🔔 Notificações em Tempo Real (Socket.io)

```typescript
// Servidor → Cliente
'nova-notificacao'     → Notificação criada
'pedido-atualizado'    → Status do pedido alterado
'estoque-baixo'        → Alerta de estoque

// Cliente → Servidor
'entrar-sala'          → Join room do usuário
'marcar-lida'          → Marcar notificação
```

---

## 📧 Sistema de Emails

**Templates:**
- Boas-vindas ao cadastrar
- Confirmação de pedido
- Atualização de status
- Pedido enviado (com rastreio)
- Recuperação de senha
- Alerta de estoque baixo

---

## ✅ Checklist de Implementação

### Fase 1: Backend Completo
- [ ] Configurar Prisma Client
- [ ] Implementar NextAuth.js com JWT
- [ ] Configurar Winston logger
- [ ] API de Categorias (CRUD + hierarquia)
- [ ] API de Produtos (CRUD + paginação)
- [ ] API de Clientes (CRUD + associações)
- [ ] API de Listas de Preço
- [ ] API de Preços Customizados
- [ ] API de Estoque
- [ ] API de Pedidos
- [ ] API de Notificações
- [ ] API de Analytics

### Fase 2: Frontend - Páginas Públicas
- [ ] Landing page atraente
- [ ] Lista de fornecedores
- [ ] Catálogo público de produtos
- [ ] Página do fornecedor (por slug)

### Fase 3: Frontend - Área do Fornecedor
- [ ] Dashboard com KPIs e gráficos
- [ ] CRUD de produtos
- [ ] Gestão de categorias
- [ ] Gestão de pedidos
- [ ] Controle de estoque
- [ ] Sistema de preços
- [ ] Gestão de clientes
- [ ] Configurações

### Fase 4: Frontend - Área do Cliente
- [ ] Dashboard do cliente
- [ ] Catálogo personalizado
- [ ] Carrinho de compras
- [ ] Checkout
- [ ] Histórico de pedidos
- [ ] Rastreamento

### Fase 5: Frontend - Área Admin
- [ ] Dashboard administrativo
- [ ] Gestão de usuários
- [ ] Gestão de fornecedores
- [ ] Relatórios

### Fase 6: Funcionalidades Avançadas
- [ ] Notificações em tempo real (Socket.io)
- [ ] Sistema de emails
- [ ] Busca avançada
- [ ] Importação/Exportação CSV
- [ ] Push notifications

### Fase 7: Polimento e UX
- [ ] Loading states e skeletons
- [ ] Empty states
- [ ] Error handling visual
- [ ] Responsividade completa
- [ ] Acessibilidade (WCAG 2.1)
- [ ] Animações e transições

---

## 🎨 Diretrizes de Design

1. **Interface Profissional**: Design limpo e moderno
2. **Feedback Visual**: Loading, success, error states
3. **Responsivo**: Mobile-first, funcional em todos os dispositivos
4. **Acessível**: Contraste adequado, navegação por teclado
5. **Consistente**: Uso do design system em todas as páginas
6. **Performático**: Lazy loading, otimização de imagens

---

## 📝 Resultado Esperado

Uma aplicação B2B completamente funcional com:
- ✅ Interface profissional e responsiva
- ✅ Backend robusto com APIs completas
- ✅ Banco de dados integrado com Prisma
- ✅ Autenticação e autorização por roles
- ✅ Sistema de precificação multinível
- ✅ Gestão completa de estoque
- ✅ Fluxo de pedidos completo
- ✅ Notificações em tempo real
- ✅ Dashboard com analytics
- ✅ Zero erros de TypeScript
- ✅ Código organizado e manutenível
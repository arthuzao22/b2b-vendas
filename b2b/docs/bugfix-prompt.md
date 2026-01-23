# 🔧 Prompt de Correção: Sistema B2B Marketplace - Bugs Identificados

---

## 🎯 Contexto

O sistema B2B Marketplace está em desenvolvimento com Next.js 16.1.4 (Turbopack). Durante os testes, foram identificados múltiplos erros no dashboard do fornecedor que impedem o uso adequado do sistema.

**Ambiente:**
- Next.js 16.1.4 (Turbopack)
- TypeScript (strict mode)
- Prisma ORM
- PostgreSQL (Supabase)

---

## 🧩 Objetivo

Corrigir TODOS os bugs identificados abaixo, além de implementar uma **navbar/sidebar de navegação** nas áreas onde está faltando. As correções devem:

- Manter a arquitetura existente
- Não alterar o schema Prisma
- Não modificar estruturas de API que funcionam
- Garantir type-safety completo

---

## 🐛 Bugs a Corrigir

### Bug #1: Edição de Produto - 404

**Rota:** `/dashboard/fornecedor/produtos/[id]/editar`

**Erro:** Página retorna 404 ao tentar editar um produto

**Causa Provável:** Rota dinâmica `[id]/editar/page.tsx` não existe

**Correção Necessária:**
1. Criar arquivo `/app/dashboard/fornecedor/produtos/[id]/editar/page.tsx`
2. Implementar formulário de edição pre-populado com dados do produto
3. Usar API `GET /api/produtos/:id` para carregar dados
4. Usar API `PUT /api/produtos/:id` para salvar alterações

---

### Bug #2: Cadastro de Produto - TypeError

**Rota:** `/dashboard/fornecedor/produtos/novo`

**Erro:** `categorias.map is not a function`

**Stack Trace:**
```
at NovoProdutoPage (page.tsx:602:68)
```

**Causa:** A variável `categorias` está recebendo `undefined` ou um objeto ao invés de array

**Correção Necessária:**
1. Verificar fetch de categorias na página
2. Garantir que a API `/api/categorias` retorna um array
3. Adicionar fallback: `const categorias = data?.categorias || []`
4. Adicionar loading state enquanto carrega categorias
5. Tratar erro de API com try/catch

---

### Bug #3: Atualização de Status do Pedido - 405

**Rota:** `/dashboard/fornecedor/pedidos`  
**API:** `PATCH /api/pedidos/[id]/status`

**Erro:** `PATCH /api/pedidos/cmko8k9y0000sbkujjzce9aiu/status 405 (Method Not Allowed)`

**Causa:** Método PATCH não está implementado na rota de API

**Correção Necessária:**
1. Verificar se existe `/app/api/pedidos/[id]/status/route.ts`
2. Se não existir, criar a rota com handler PATCH
3. Se existir, verificar se `export async function PATCH` está definido
4. Implementar lógica de atualização de status do pedido

---

### Bug #4: Visualização de Pedido - Modal Não Funciona

**Rota:** `/dashboard/fornecedor/pedidos`

**Erro:** Ao clicar para visualizar/ampliar pedido, nada acontece

**Causa Provável:** 
- Modal/Drawer não está implementado
- Estado de abertura não está sendo gerenciado
- Handler onClick não está conectado

**Correção Necessária:**
1. Implementar componente Dialog/Drawer para detalhes do pedido
2. Adicionar estado para controlar abertura (`isOpen`, `selectedPedido`)
3. Conectar onClick do botão "Visualizar" ao estado
4. Buscar detalhes completos do pedido na abertura

---

### Bug #5: Gestão de Clientes - Ações Não Funcionam

**Rota:** `/dashboard/fornecedor/clientes`

**Erros:**
- Visualizar detalhes do cliente: não funciona
- Editar cliente: não funciona
- Adicionar cliente: não funciona

**Causa Provável:**
- Handlers de onClick não implementados
- Modals/Drawers não existem
- Rotas de navegação incorretas

**Correção Necessária:**
1. Implementar Modal/Drawer para visualizar detalhes do cliente
2. Implementar Modal/formulário para edição de cliente
3. Implementar Modal/formulário para adicionar novo cliente
4. Conectar APIs:
   - `GET /api/clientes/:id` - detalhes
   - `PUT /api/clientes/:id` - edição
   - `POST /api/clientes` - criação
5. Verificar se cliente está associado ao fornecedor logado

---

### Bug #6: Categorias - TypeError

**Rota:** `/dashboard/fornecedor/categorias`

**Erro:** `categorias.filter is not a function`

**Stack Trace:**
```
at CategoriasPage (page.tsx:1445:60)
```

**Causa:** Variável `categorias` não é um array

**Correção Necessária:**
1. Verificar fetch de categorias do fornecedor
2. Garantir que API retorna array
3. Adicionar fallback: `const categorias = Array.isArray(data) ? data : []`
4. Tratar loading e erro de API

---

### Bug #7: Estoque - Server Component Error

**Rota:** `/dashboard/fornecedor/estoque`

**Erro:** 
```
Functions cannot be passed directly to Client Components unless you explicitly expose it by marking it with "use server".
{key: ..., label: "Data", sortable: ..., render: function render}
```

**Stack Trace:**
```
at EstoquePage (page.tsx:182:9)
```

**Causa:** Componente `DataTable` está recebendo funções (render) de um Server Component

**Correção Necessária:**
1. Adicionar `'use client'` no topo da página de estoque
2. OU separar a lógica em:
   - Server Component para fetch de dados
   - Client Component para DataTable com renders
3. Mover definição de `columns` com funções `render` para Client Component
4. Alternativamente, passar dados já renderizados (strings/JSX.Element) ao invés de funções

---

### Bug #8: Preços - TypeError no DataTable

**Rota:** `/dashboard/fornecedor/precos`

**Erro:** `sortedData.map is not a function`

**Stack Trace:**
```
at DataTable (page.tsx:416:54)
at PrecosPage (page.tsx:1404:244)
```

**Causa:** `sortedData` não é um array (provavelmente `undefined`)

**Correção Necessária:**
1. Verificar fetch de listas de preço
2. Garantir que componente `DataTable` recebe `data` como array
3. No `DataTable`, adicionar validação:
   ```typescript
   const sortedData = Array.isArray(data) ? [...data].sort(...) : []
   ```
4. Adicionar prop validation no DataTable para garantir array

---

## 🧭 Navbar/Sidebar Faltando

**Problema:** Algumas páginas não possuem navegação lateral consistente

**Correção Necessária:**
1. Verificar se existe `/components/dashboard-sidebar.tsx`
2. Garantir que o layout `/app/dashboard/fornecedor/layout.tsx` inclui a sidebar
3. Verificar que todas as sub-rotas herdam o layout
4. A sidebar deve conter links para:
   - Dashboard (home)
   - Produtos
   - Categorias
   - Pedidos
   - Estoque
   - Preços
   - Clientes
   - Configurações

---

## 🏗️ Diretrizes Técnicas

### Padrão de Fetch de Dados

```typescript
// ✅ CORRETO - Com fallback e tratamento de erro
async function getData() {
  try {
    const res = await fetch('/api/endpoint')
    if (!res.ok) throw new Error('Failed to fetch')
    const data = await res.json()
    return Array.isArray(data) ? data : data?.items || []
  } catch (error) {
    console.error(error)
    return []
  }
}
```

### Padrão Server vs Client Components

```typescript
// Server Component - Fetch dados
// app/dashboard/fornecedor/estoque/page.tsx
import { EstoqueClient } from './estoque-client'

export default async function EstoquePage() {
  const movimentacoes = await getMovimentacoes()
  return <EstoqueClient movimentacoes={movimentacoes} />
}

// Client Component - Interatividade
// app/dashboard/fornecedor/estoque/estoque-client.tsx
'use client'

export function EstoqueClient({ movimentacoes }) {
  const columns = [
    { key: 'data', label: 'Data', render: (row) => formatDate(row.criadoEm) }
  ]
  return <DataTable data={movimentacoes} columns={columns} />
}
```

### Padrão de DataTable Defensivo

```typescript
// components/ui/data-table.tsx
'use client'

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
}

export function DataTable<T>({ data, columns }: DataTableProps<T>) {
  // Garantir que data é array
  const safeData = Array.isArray(data) ? data : []
  
  const sortedData = useMemo(() => {
    return [...safeData].sort(...)
  }, [safeData, sortConfig])
  
  // ...
}
```

---

## ⛔ Restrições

1. ❌ NÃO modificar `/prisma/schema.prisma`
2. ❌ NÃO alterar `/lib/auth.ts`
3. ❌ NÃO modificar APIs funcionais
4. ❌ NÃO mudar estrutura de pastas
5. ❌ NÃO trocar componentes shadcn/ui

---

## ✅ Critérios de Aceitação

### Rotas de Produtos
- [ ] `/dashboard/fornecedor/produtos/novo` carrega sem erro
- [ ] `/dashboard/fornecedor/produtos/[id]/editar` existe e funciona
- [ ] Formulários salvam dados corretamente

### Rota de Pedidos
- [ ] Atualização de status funciona (PATCH 200)
- [ ] Modal de visualização de pedido abre
- [ ] Detalhes do pedido são exibidos

### Rota de Clientes
- [ ] Visualizar detalhes do cliente funciona
- [ ] Editar cliente funciona
- [ ] Adicionar cliente funciona

### Rota de Categorias
- [ ] Página carrega sem `TypeError`
- [ ] Lista categorias corretamente
- [ ] CRUD funciona

### Rota de Estoque
- [ ] Página carrega sem erro de Server/Client Component
- [ ] DataTable renderiza movimentações
- [ ] Filtros funcionam

### Rota de Preços
- [ ] Página carrega sem `TypeError`
- [ ] DataTable renderiza listas de preço
- [ ] CRUD funciona

### Navegação
- [ ] Sidebar presente em todas as páginas do dashboard fornecedor
- [ ] Links de navegação funcionam
- [ ] Destaque visual na página atual

---

## 📋 Ordem de Execução Recomendada

1. **Primeiro:** Corrigir componente `DataTable` para ser defensivo (Bugs #7, #8)
2. **Segundo:** Corrigir fetches de categorias (Bugs #2, #6)
3. **Terceiro:** Criar rota de edição de produto (Bug #1)
4. **Quarto:** Implementar PATCH de status de pedido (Bug #3)
5. **Quinto:** Implementar modals de visualização (Bugs #4, #5)
6. **Sexto:** Verificar sidebar/navegação

---

*Prompt gerado em 2026-01-23 baseado nos erros reportados pelo usuário.*

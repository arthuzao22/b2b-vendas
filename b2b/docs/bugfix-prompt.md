# 🔧 Prompt de Correção v2: Sistema B2B Marketplace - Bugs e Melhorias

---

## 🎯 Contexto

O sistema B2B Marketplace está em desenvolvimento com Next.js 16.1.4 (Turbopack). Durante os testes, foram identificados múltiplos erros e páginas sem navegação adequada.

**Ambiente:**
- Next.js 16.1.4 (Turbopack)
- TypeScript (strict mode)
- Prisma ORM
- PostgreSQL (Supabase)

---

## 🧩 Objetivo

1. **Implementar Navbar e Footer** em todas as páginas onde está faltando
2. **Melhorar a experiência do Dashboard do Cliente** (layout, UX)
3. **Corrigir todos os bugs** identificados no Dashboard do Fornecedor

---

## 🧭 Parte 1: Navbar e Footer Faltando

### Páginas Afetadas

| # | Rota | Tipo de Página | Navegação Necessária |
|---|------|----------------|---------------------|
| 1 | `/fornecedores` | Pública | Header público + Footer |
| 2 | `/fornecedor/[slug]` | Pública | Header público + Footer |
| 3 | `/dashboard/cliente` | Cliente autenticado | Header cliente + Sidebar cliente |
| 4 | `/pedidos` | Cliente autenticado | Header cliente + Sidebar cliente |
| 5 | `/pedidos/[id]` | Cliente autenticado | Header cliente + Sidebar cliente |

### Correção Necessária

#### 1. Verificar/Criar Layouts

```
app/
├── (public)/
│   ├── layout.tsx          ← VERIFICAR: deve ter Header público + Footer
│   ├── fornecedores/
│   └── fornecedor/[slug]/
├── dashboard/
│   └── cliente/
│       └── layout.tsx      ← VERIFICAR: deve ter Header + Sidebar cliente
├── pedidos/
│   └── layout.tsx          ← CRIAR: mesmo layout do dashboard cliente
```

#### 2. Componentes de Navegação Necessários

| Componente | Local | Funcionalidade |
|------------|-------|----------------|
| `Header` | `/components/header.tsx` | Navbar pública (logo, links, login/signup) |
| `Footer` | `/components/footer.tsx` | Footer com links e copyright |
| `ClientSidebar` | `/components/client-sidebar.tsx` | Sidebar para área do cliente |
| `DashboardSidebar` | `/components/dashboard-sidebar.tsx` | Sidebar para fornecedor (já existe?) |

#### 3. Links da Sidebar do Cliente

```typescript
const clienteLinks = [
  { href: '/dashboard/cliente', label: 'Dashboard', icon: Home },
  { href: '/dashboard/cliente/catalogo', label: 'Catálogo', icon: ShoppingBag },
  { href: '/carrinho', label: 'Carrinho', icon: ShoppingCart },
  { href: '/pedidos', label: 'Meus Pedidos', icon: Package },
  { href: '/dashboard/cliente/configuracoes', label: 'Configurações', icon: Settings },
]
```

---

## 🎨 Parte 2: Melhorar Dashboard do Cliente

### Problema

A tela do cliente está "muito ruim" e precisa de melhorias visuais e funcionais.

### Melhorias Necessárias

#### Layout e Design

1. **Adicionar Sidebar de navegação** (links listados acima)
2. **Cards de resumo no topo:**
   - Total de pedidos
   - Pedidos em andamento
   - Último pedido
   - Total gasto (opcional)
3. **Seção "Pedidos Recentes"** com tabela/cards
4. **Seção "Ações Rápidas":**
   - Ir para catálogo
   - Ver carrinho
   - Repetir último pedido
5. **Design responsivo** e moderno (usar shadcn/ui)

#### Exemplo de Estrutura

```tsx
export default function ClienteDashboard() {
  return (
    <div className="flex min-h-screen">
      <ClientSidebar />
      <main className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-6">Bem-vindo, {cliente.nome}</h1>
        
        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>Total Pedidos: {stats.totalPedidos}</Card>
          <Card>Em Andamento: {stats.emAndamento}</Card>
          <Card>Último Pedido: {stats.ultimoPedido}</Card>
          <Card>Total Gasto: {formatCurrency(stats.totalGasto)}</Card>
        </div>
        
        {/* Pedidos Recentes */}
        <Card>
          <CardHeader>Pedidos Recentes</CardHeader>
          <CardContent>
            <Table>...</Table>
          </CardContent>
        </Card>
        
        {/* Ações Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <Button asChild><Link href="/dashboard/cliente/catalogo">Ver Catálogo</Link></Button>
          <Button asChild><Link href="/carrinho">Ver Carrinho</Link></Button>
          <Button variant="outline">Repetir Último Pedido</Button>
        </div>
      </main>
    </div>
  )
}
```

---

## 🐛 Parte 3: Bugs do Dashboard Fornecedor

### Bug #1: Edição de Produto - Permissão Negada

**Rota:** `/dashboard/fornecedor/produtos/[id]/editar`

**Erro:** "Você não tem permissão para editar este produto"

**Causa Provável:**
- Verificação de `fornecedorId` está falhando
- Token JWT não contém `fornecedorId` correto
- Comparação de IDs com tipos diferentes (string vs object)

**Correção Necessária:**
1. Verificar na página de edição como o `fornecedorId` da sessão está sendo obtido
2. Verificar se a comparação é feita corretamente:
   ```typescript
   // ❌ ERRADO - pode falhar com objetos
   if (produto.fornecedorId !== session.user.fornecedorId)
   
   // ✅ CORRETO - converter para string
   if (String(produto.fornecedorId) !== String(session.user.fornecedorId))
   ```
3. Verificar se `session.user.fornecedorId` está definido (não `undefined`)
4. Adicionar logs para debug:
   ```typescript
   console.log('Produto fornecedorId:', produto.fornecedorId)
   console.log('Session fornecedorId:', session.user.fornecedorId)
   ```

---

### Bug #2: Atualização de Status do Pedido - Erro 422

**Rota:** `/dashboard/fornecedor/pedidos`  
**API:** `PUT /api/pedidos/[id]/status`

**Erro:** 
```
Erro de validação {"status":422,"errors":[{"path":"status","message":"Status inválido"}]}
```

**Causa:** O valor do status sendo enviado não corresponde aos valores esperados pelo schema de validação

**Correção Necessária:**
1. Verificar quais valores o schema Zod da API aceita:
   ```typescript
   // Provavelmente espera valores do enum StatusPedido
   enum StatusPedido {
     pendente = 'pendente',
     confirmado = 'confirmado',
     processando = 'processando',
     enviado = 'enviado',
     entregue = 'entregue',
     cancelado = 'cancelado'
   }
   ```
2. Verificar o que o frontend está enviando:
   - Pode estar enviando `"Confirmado"` ao invés de `"confirmado"` (case sensitive)
   - Pode estar enviando um valor do label e não do enum
3. Corrigir o select/dropdown para enviar o valor correto:
   ```typescript
   // ❌ ERRADO
   <option value="Confirmado">Confirmado</option>
   
   // ✅ CORRETO
   <option value="confirmado">Confirmado</option>
   ```
4. Verificar o body da requisição antes de enviar

---

### Bug #3: Modal de Clientes Transparente

**Rota:** `/dashboard/fornecedor/clientes`

**Erro:** Modal de visualizar/editar cliente aparece transparente

**Causa Provável:**
- CSS do Dialog/Modal sem background
- Overlay não configurado
- Z-index conflitante

**Correção Necessária:**
1. Verificar se o componente Dialog está usando shadcn/ui corretamente
2. Adicionar overlay com background:
   ```tsx
   <Dialog>
     <DialogOverlay className="fixed inset-0 bg-black/50" />
     <DialogContent className="bg-white dark:bg-gray-900 ...">
       {/* conteúdo */}
     </DialogContent>
   </Dialog>
   ```
3. Se usar shadcn/ui Dialog, verificar se o CSS está importado
4. Adicionar classes de background ao DialogContent:
   ```tsx
   <DialogContent className="bg-white border shadow-lg">
   ```

---

### Bug #4: Input Não Controlado para Controlado

**Rota:** `/dashboard/fornecedor/precos`

**Erro:** 
```
A component is changing an uncontrolled input to be controlled. 
This is likely caused by the value changing from undefined to a defined value.
```

**Causa:** Um input está recebendo `value={undefined}` inicialmente e depois um valor definido

**Correção Necessária:**
1. Inicializar todos os valores de estado com valores vazios, não `undefined`:
   ```typescript
   // ❌ ERRADO
   const [nome, setNome] = useState()
   const [preco, setPreco] = useState()
   
   // ✅ CORRETO
   const [nome, setNome] = useState('')
   const [preco, setPreco] = useState('')
   ```

2. Para formulários com objeto, garantir valores padrão:
   ```typescript
   // ❌ ERRADO
   const [formData, setFormData] = useState({})
   
   // ✅ CORRETO
   const [formData, setFormData] = useState({
     nome: '',
     descricao: '',
     valorDesconto: '',
     tipoDesconto: 'percentual'
   })
   ```

3. Para inputs que podem vir de API, usar fallback:
   ```tsx
   <input value={item?.nome ?? ''} onChange={...} />
   ```

4. No DataTable, verificar inputs de busca/filtro:
   ```tsx
   // ✅ CORRETO
   const [searchTerm, setSearchTerm] = useState('')
   
   <input 
     value={searchTerm} 
     onChange={(e) => setSearchTerm(e.target.value)}
   />
   ```

---

## 🏗️ Diretrizes Técnicas

### Estrutura de Layouts

```
app/
├── layout.tsx                    # Layout raiz (providers, fonts)
├── (public)/
│   └── layout.tsx               # Header público + Footer
├── (auth)/
│   └── layout.tsx               # Minimalista (login/register)
├── dashboard/
│   ├── fornecedor/
│   │   └── layout.tsx           # Sidebar fornecedor
│   └── cliente/
│       └── layout.tsx           # Sidebar cliente
├── pedidos/
│   └── layout.tsx               # Mesmo que dashboard/cliente
├── carrinho/
│   └── layout.tsx               # Mesmo que dashboard/cliente
└── checkout/
    └── layout.tsx               # Minimalista (foco no checkout)
```

### Padrão de Input Controlado

```typescript
// Hook de formulário recomendado
function useForm<T>(initialValues: T) {
  const [values, setValues] = useState<T>(initialValues)
  
  const handleChange = (field: keyof T) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setValues(prev => ({ ...prev, [field]: e.target.value }))
  }
  
  return { values, setValues, handleChange }
}

// Uso
const { values, handleChange } = useForm({
  nome: '',
  descricao: '',
  preco: ''
})

<input value={values.nome} onChange={handleChange('nome')} />
```

### Padrão de Modal/Dialog

```tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent className="sm:max-w-[425px] bg-white">
    <DialogHeader>
      <DialogTitle>Título</DialogTitle>
      <DialogDescription>Descrição</DialogDescription>
    </DialogHeader>
    {/* Conteúdo */}
  </DialogContent>
</Dialog>
```

---

## ⛔ Restrições

1. ❌ NÃO modificar `/prisma/schema.prisma`
2. ❌ NÃO alterar `/lib/auth.ts`
3. ❌ NÃO mudar valores do enum `StatusPedido` no schema
4. ❌ NÃO remover validações de permissão, apenas corrigir
5. ❌ NÃO usar inline styles, usar Tailwind CSS

---

## ✅ Critérios de Aceitação

### Navegação
- [ ] `/fornecedores` tem Header público e Footer
- [ ] `/fornecedor/[slug]` tem Header público e Footer
- [ ] `/dashboard/cliente` tem Header e Sidebar do cliente
- [ ] `/pedidos` tem Header e Sidebar do cliente
- [ ] `/pedidos/[id]` tem Header e Sidebar do cliente
- [ ] Todas as páginas têm navegação consistente

### Dashboard Cliente
- [ ] Layout melhorado com cards de KPIs
- [ ] Sidebar de navegação funcional
- [ ] Pedidos recentes visíveis
- [ ] Ações rápidas disponíveis
- [ ] Design responsivo

### Bugs Fornecedor
- [ ] Edição de produto funciona (sem erro de permissão)
- [ ] Atualização de status de pedido funciona (sem erro 422)
- [ ] Modal de clientes tem background visível
- [ ] Página de preços sem erro de input controlado

---

## 📋 Ordem de Execução Recomendada

1. **Primeiro:** Criar/ajustar layouts com navbar e footer
2. **Segundo:** Implementar ClientSidebar e adicionar aos layouts
3. **Terceiro:** Melhorar dashboard do cliente
4. **Quarto:** Corrigir bug de permissão de edição de produto
5. **Quinto:** Corrigir validação de status de pedido
6. **Sexto:** Corrigir CSS do modal de clientes
7. **Sétimo:** Corrigir inputs controlados na página de preços

---

*Prompt gerado em 2026-01-23 baseado nos erros reportados pelo usuário.*

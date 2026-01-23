# B2B Marketplace APIs - Complete Documentation

## Overview
This document provides comprehensive documentation for all APIs created for the B2B marketplace system, including Clients Management, Pricing, Orders, and Stock Management.

## API Endpoints Created

### 1. CLIENTES (Clients)

#### POST /api/clientes
**Description:** Create a new client (fornecedor only)
- Creates Usuario + Cliente + ClienteFornecedor relationship in a single transaction
- Validates email and CNPJ uniqueness
- Hashes password securely with bcrypt
- **Auth:** Requires fornecedor authentication

**Request Body:**
```json
{
  "email": "string",
  "senha": "string (min 6 chars)",
  "nome": "string (min 3 chars)",
  "telefone": "string (optional)",
  "razaoSocial": "string (min 3 chars)",
  "nomeFantasia": "string (optional)",
  "cnpj": "string (14 digits)",
  "inscricaoEstadual": "string (optional)",
  "endereco": "string (optional)",
  "cidade": "string (optional)",
  "estado": "string (optional)",
  "cep": "string (optional)"
}
```

#### GET /api/clientes
**Description:** List all clients belonging to the logged-in fornecedor
- Supports pagination (page, limit)
- Supports search (razaoSocial, nomeFantasia, cnpj, email)
- Includes associated price list information
- **Auth:** Requires fornecedor authentication

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 20, max: 100)
- `search` (optional)

#### GET /api/clientes/[id]
**Description:** Get detailed information about a specific client
- Returns client with usuario data
- Includes assigned price list
- Includes custom prices for this client
- Verifies client belongs to fornecedor
- **Auth:** Requires fornecedor authentication

#### PUT /api/clientes/[id]
**Description:** Update client information
- Updates both Usuario and Cliente tables in transaction
- Only updates provided fields
- Can activate/deactivate client
- **Auth:** Requires fornecedor authentication

#### DELETE /api/clientes/[id]
**Description:** Delete a client
- Checks for existing orders (prevents deletion if orders exist)
- Deletes ClienteFornecedor relationship
- Only deletes Cliente and Usuario if no other fornecedor relationships exist
- **Auth:** Requires fornecedor authentication

#### POST /api/clientes/[id]/lista-preco
**Description:** Assign or remove a price list from client
- Updates ClienteFornecedor.listaPrecoId
- Validates price list belongs to fornecedor
- Validates price list is active
- Accepts null to remove price list
- **Auth:** Requires fornecedor authentication

**Request Body:**
```json
{
  "listaPrecoId": "string | null"
}
```

#### GET /api/clientes/[id]/pedidos
**Description:** Get all orders from a specific client
- Supports pagination
- Supports status filtering
- Includes order items with product information
- **Auth:** Requires fornecedor authentication

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 20, max: 100)
- `status` (optional)

---

### 2. LISTAS DE PREÇO (Price Lists)

#### POST /api/listas-preco
**Description:** Create a new price list (fornecedor only)
- Validates percentage discounts <= 100%
- Supports both "percentual" and "fixo" discount types
- **Auth:** Requires fornecedor authentication

**Request Body:**
```json
{
  "nome": "string (min 3 chars)",
  "descricao": "string (optional)",
  "tipoDesconto": "percentual | fixo",
  "valorDesconto": "number | string",
  "ativo": "boolean (default: true)"
}
```

#### GET /api/listas-preco
**Description:** List all price lists for the fornecedor
- Supports pagination
- Supports search (nome, descricao)
- Supports active/inactive filtering
- Returns count of products and clients for each list
- **Auth:** Requires fornecedor authentication

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 20, max: 100)
- `search` (optional)
- `ativo` (optional: "true" | "false")

#### GET /api/listas-preco/[id]
**Description:** Get price list details with all products
- Includes all products in the list with their special prices
- Includes product base prices for comparison
- Includes count of clients using this list
- **Auth:** Requires fornecedor authentication

#### PUT /api/listas-preco/[id]
**Description:** Update price list information
- Validates percentage discounts <= 100%
- Only updates provided fields
- **Auth:** Requires fornecedor authentication

#### DELETE /api/listas-preco/[id]
**Description:** Delete a price list
- Checks if assigned to any clients (prevents deletion if assigned)
- Deletes all ItemListaPreco in cascade
- **Auth:** Requires fornecedor authentication

#### POST /api/listas-preco/[id]/produtos
**Description:** Add a product to the price list
- Creates ItemListaPreco record
- Validates product belongs to fornecedor
- Prevents duplicate product in same list
- Optional special price override
- **Auth:** Requires fornecedor authentication

**Request Body:**
```json
{
  "produtoId": "string",
  "precoEspecial": "number | string | null (optional)"
}
```

#### GET /api/listas-preco/[id]/produtos
**Description:** List all products in a price list
- Supports pagination
- Returns product details with base and special prices
- Includes stock information
- **Auth:** Requires fornecedor authentication

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 50, max: 100)

#### DELETE /api/listas-preco/[id]/produtos/[produtoId]
**Description:** Remove a product from price list
- Deletes ItemListaPreco record
- **Auth:** Requires fornecedor authentication

---

### 3. PREÇOS CUSTOMIZADOS (Custom Prices)

#### POST /api/precos-customizados
**Description:** Create a custom price for a specific client-product pair
- Validates client belongs to fornecedor
- Validates product belongs to fornecedor
- Prevents duplicate custom prices
- **Auth:** Requires fornecedor authentication

**Request Body:**
```json
{
  "clienteId": "string",
  "produtoId": "string",
  "preco": "number | string"
}
```

#### GET /api/precos-customizados
**Description:** List custom prices
- Can filter by clienteId
- Can filter by produtoId
- Only shows custom prices for fornecedor's clients and products
- Supports pagination
- **Auth:** Requires fornecedor authentication

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 20, max: 100)
- `clienteId` (optional)
- `produtoId` (optional)

#### GET /api/precos-customizados/[id]
**Description:** Get specific custom price details
- Includes cliente and produto information
- Shows base price for comparison
- **Auth:** Requires fornecedor authentication

#### PUT /api/precos-customizados/[id]
**Description:** Update custom price value
- Only updates the price field
- **Auth:** Requires fornecedor authentication

**Request Body:**
```json
{
  "preco": "number | string"
}
```

#### DELETE /api/precos-customizados/[id]
**Description:** Delete custom price
- Removes the custom pricing, reverting to list or base price
- **Auth:** Requires fornecedor authentication

---

## Security Features

### Authentication & Authorization
- All endpoints require fornecedor authentication via `requireFornecedor()`
- Ownership verification: all queries verify resources belong to logged-in fornecedor
- Protected against unauthorized access across fornecedor boundaries

### Data Validation
- Comprehensive Zod schemas for all input validation
- CNPJ uniqueness validation
- Email uniqueness validation
- Decimal/numeric field validation with proper transformations
- Enum validation for tipoDesconto (percentual, fixo)

### Data Integrity
- Transaction support for multi-table operations
- Cascade delete checks (prevents deletion of assigned resources)
- Foreign key validation before operations
- Proper error handling and logging

## Key Implementation Details

### Decimal Handling
All Decimal fields (prices, discounts) are:
- Stored as Prisma Decimal in database
- Accepted as number or string in API input
- Returned as string in API responses (for JSON serialization)

### Pagination
Standard pagination implemented across all list endpoints:
- Default: page=1, limit=20
- Maximum limit: 100
- Response includes: page, limit, total, totalPages

### Error Responses
Consistent error response format:
```json
{
  "success": false,
  "error": "Error message",
  "errors": [] // For validation errors
}
```

### Success Responses
Consistent success response format:
```json
{
  "success": true,
  "data": { /* response data */ }
}
```

### Logging
All important operations are logged using the logger service:
- Creation operations
- Update operations
- Delete operations
- Includes relevant IDs and fornecedorId for audit trail

## Price Calculation Priority

When determining product price for a client:
1. **Custom Price** (PrecoCustomizado) - Highest priority
2. **Price List** (ListaPreco with ItemListaPreco)
   - If product has precoEspecial in list, use that
   - Otherwise apply discount from lista to product's precoBase
3. **Base Price** (Produto.precoBase) - Default fallback

## Database Models Used

- **Usuario** - User authentication and basic info
- **Fornecedor** - Supplier information
- **Cliente** - Client/buyer information
- **ClienteFornecedor** - Many-to-many relationship with price list assignment
- **ListaPreco** - Price list definition with discount rules
- **ItemListaPreco** - Products in a price list with optional special prices
- **PrecoCustomizado** - Individual custom prices per client-product pair
- **Produto** - Product information with base prices
- **Pedido** - Orders (used for validation only)

## Files Created

1. `/app/api/clientes/route.ts` - List and create clients
2. `/app/api/clientes/[id]/route.ts` - Get, update, delete by ID
3. `/app/api/clientes/[id]/lista-preco/route.ts` - Assign price list
4. `/app/api/clientes/[id]/pedidos/route.ts` - Get client orders
5. `/app/api/listas-preco/route.ts` - List and create price lists
6. `/app/api/listas-preco/[id]/route.ts` - Get, update, delete by ID
7. `/app/api/listas-preco/[id]/produtos/route.ts` - Add/list products
8. `/app/api/listas-preco/[id]/produtos/[produtoId]/route.ts` - Remove product
9. `/app/api/precos-customizados/route.ts` - List and create custom prices
10. `/app/api/precos-customizados/[id]/route.ts` - Get, update, delete

---

## 4. CARRINHO (Cart)

#### POST /api/carrinho/calcular
**Description:** Calculate cart totals with pricing logic
- Calculates prices based on custom pricing, price lists, and base prices
- Validates stock availability for all items
- Returns detailed breakdown of each item with prices
- Can be used by authenticated or unauthenticated users (clienteId optional)
- **Auth:** Optional authentication (uses getUserSession)

**Request Body:**
```json
{
  "fornecedorId": "string",
  "clienteId": "string (optional)",
  "items": [
    {
      "produtoId": "string",
      "quantidade": "number (min 1)"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "produto": {
          "id": "string",
          "nome": "string",
          "sku": "string",
          "imagens": ["string"],
          "quantidadeEstoque": "number"
        },
        "quantidade": "number",
        "precoUnitario": "string",
        "precoTotal": "string"
      }
    ],
    "subtotal": "string",
    "desconto": "string",
    "frete": "string",
    "total": "string"
  }
}
```

---

## 5. PEDIDOS (Orders)

### Order Creation

#### POST /api/pedidos
**Description:** Create a new order (cliente only)
- Generates unique order number using `generateOrderNumber()`
- Creates order with items in a single transaction
- Automatically decrements stock for each product
- Creates stock movement records (saida) for each item
- Creates initial status history entry (pendente)
- Validates stock availability before creation
- **Auth:** Requires cliente authentication

**Request Body:**
```json
{
  "fornecedorId": "string",
  "items": [
    {
      "produtoId": "string",
      "quantidade": "number (min 1)"
    }
  ],
  "enderecoEntrega": "string (optional)",
  "cidadeEntrega": "string (optional)",
  "estadoEntrega": "string (optional)",
  "cepEntrega": "string (optional)",
  "observacoes": "string (optional)"
}
```

### Order Listing

#### GET /api/pedidos
**Description:** List orders with role-based filtering
- **Cliente:** Only their own orders
- **Fornecedor:** Only orders for their products
- **Admin:** All orders with optional filters
- Supports pagination and status filtering
- **Auth:** Requires authentication (cliente, fornecedor, or admin)

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 20, max: 100)
- `status` (optional: pendente, confirmado, processando, enviado, entregue, cancelado)
- `fornecedorId` (optional, admin only)
- `clienteId` (optional, admin only)

#### GET /api/pedidos/[id]
**Description:** Get detailed order information
- Includes cliente, fornecedor, items, and status history
- Role-based access control (only own orders)
- **Auth:** Requires authentication

#### GET /api/pedidos/numero/[numero]
**Description:** Get order by numeroPedido
- Same as GET by ID but uses order number
- Role-based access control
- **Auth:** Requires authentication

### Order Management

#### PUT /api/pedidos/[id]/status
**Description:** Update order status (fornecedor/admin only)
- Creates status history entry
- If changing to "cancelado": automatically increments stock back
- Validates fornecedor owns the order
- **Auth:** Requires fornecedor or admin authentication

**Request Body:**
```json
{
  "status": "pendente | confirmado | processando | enviado | entregue | cancelado",
  "observacao": "string (optional)"
}
```

#### PUT /api/pedidos/[id]/rastreio
**Description:** Add tracking code to order (fornecedor/admin only)
- Updates tracking code and delivery estimate
- **Auth:** Requires fornecedor or admin authentication

**Request Body:**
```json
{
  "codigoRastreio": "string",
  "previsaoEntrega": "string (ISO date, optional)"
}
```

#### POST /api/pedidos/[id]/cancelar
**Description:** Cancel an order (cliente/fornecedor)
- Only works for orders with status "pendente" or "confirmado"
- Automatically increments stock back
- Creates stock movement records (entrada) with cancellation reason
- Updates status to "cancelado"
- Creates status history entry
- **Auth:** Requires authentication (cliente or fornecedor)

#### GET /api/pedidos/[id]/historico
**Description:** Get order status history
- Returns all status changes with timestamps
- Includes who made each change (criadoPor)
- Role-based access control
- **Auth:** Requires authentication

---

## 6. ESTOQUE (Stock Management)

### Stock Movements

#### POST /api/estoque/movimentacoes
**Description:** Create stock movement (fornecedor only)
- Updates product stock quantity
- Creates movement record with before/after quantities
- Supports three types: entrada (in), saida (out), ajuste (adjustment)
- Prevents negative stock
- Logs who created the movement
- **Auth:** Requires fornecedor authentication

**Request Body:**
```json
{
  "produtoId": "string",
  "tipo": "entrada | saida | ajuste",
  "quantidade": "number (min 1)",
  "motivo": "string (min 3 chars)",
  "referencia": "string (optional)"
}
```

**Movement Types:**
- **entrada:** Adds quantity to stock (e.g., purchase, return)
- **saida:** Removes quantity from stock (e.g., sale, damage)
- **ajuste:** Sets stock to exact quantity (for inventory corrections)

#### GET /api/estoque/movimentacoes
**Description:** List stock movements (fornecedor only)
- Filter by produtoId, tipo, date range
- Supports pagination
- Includes product information
- **Auth:** Requires fornecedor authentication

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 20, max: 100)
- `produtoId` (optional)
- `tipo` (optional: entrada, saida, ajuste)
- `dataInicio` (optional, ISO date)
- `dataFim` (optional, ISO date)

#### GET /api/estoque/movimentacoes/[produtoId]
**Description:** Get movement history for specific product
- Returns all movements for the product
- Includes current stock levels
- Supports pagination (default 50 items)
- **Auth:** Requires fornecedor authentication

### Stock Alerts and Metrics

#### GET /api/estoque/alertas
**Description:** Get products with low stock
- Returns products where quantidadeEstoque <= estoqueMinimo
- Sorted by criticality (lowest percentage first)
- Includes criticality levels: critico (0), alto (<50%), medio (50-100%)
- Fornecedor: only their products
- Cliente: no access
- **Auth:** Requires fornecedor or admin authentication

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 20, max: 100)

**Response:**
```json
{
  "success": true,
  "data": {
    "alertas": [
      {
        "id": "string",
        "nome": "string",
        "sku": "string",
        "quantidadeEstoque": "number",
        "estoqueMinimo": "number",
        "estoqueMaximo": "number",
        "percentualEstoque": "number",
        "criticidade": "critico | alto | medio",
        "fornecedorId": "string",
        "fornecedorNomeFantasia": "string"
      }
    ],
    "pagination": { /* ... */ }
  }
}
```

#### GET /api/estoque/dashboard
**Description:** Get stock metrics dashboard (fornecedor only)
- Total products count
- Products with low stock count
- Products out of stock count
- Total stock value (sum of quantidadeEstoque * precoBase)
- Recent movements count (last 7 days)
- Movements by type (last 30 days)
- Top 5 products with lowest stock
- **Auth:** Requires fornecedor authentication

**Response:**
```json
{
  "success": true,
  "data": {
    "resumo": {
      "totalProdutos": "number",
      "totalProdutosEstoqueBaixo": "number",
      "totalProdutosSemEstoque": "number",
      "valorTotalEstoque": "string",
      "movimentacoesRecentes": "number"
    },
    "movimentacoesPorTipo": {
      "periodo": "Últimos 30 dias",
      "entradas": "number",
      "saidas": "number",
      "ajustes": "number"
    },
    "topProdutosEstoqueBaixo": [
      {
        "id": "string",
        "nome": "string",
        "quantidadeEstoque": "number",
        "estoqueMinimo": "number",
        "percentual": "number"
      }
    ]
  }
}
```

---

## Business Rules Implementation

### Order Creation Flow
1. Validate stock availability for all items
2. Calculate prices using pricing logic (custom > list > base)
3. Generate unique order number
4. Create order with items in transaction
5. Decrement stock for each product
6. Create stock movement records (tipo: saida)
7. Create initial status history (status: pendente)

### Order Cancellation Flow
1. Verify order status (only pendente or confirmado can be cancelled)
2. Check user permissions (cliente or fornecedor)
3. Update order status to cancelado
4. Increment stock back for each item
5. Create stock movement records (tipo: entrada) with cancellation reference
6. Create status history entry

### Stock Movement Rules
- **entrada:** estoqueAtual = estoqueAnterior + quantidade
- **saida:** estoqueAtual = estoqueAnterior - quantidade (must not be negative)
- **ajuste:** estoqueAtual = quantidade (sets absolute value)
- All movements tracked with estoqueAnterior and estoqueAtual
- All movements include criadoPor (userId) for audit

### Price Calculation Priority
1. **PrecoCustomizado** - Custom price for specific client-product
2. **ItemListaPreco.precoEspecial** - Special price in price list
3. **ListaPreco discount** - Apply percentage or fixed discount
4. **Produto.precoBase** - Default base price

---

## Security & Authorization

### Authentication Helpers Used
- `requireAuth()` - Any authenticated user
- `requireCliente()` - Cliente role only
- `requireFornecedor()` - Fornecedor role only
- `requireAdmin()` - Admin role only (not explicitly used yet)
- `getUserSession()` - Optional authentication

### Role-Based Access Control

**Cliente:**
- Can create orders
- Can view only their own orders
- Can cancel their own orders (if status allows)
- Cannot access stock management

**Fornecedor:**
- Can manage their own clients
- Can manage price lists and custom prices
- Can view orders for their products
- Can update order status and tracking
- Can cancel orders for their products
- Can manage stock movements
- Can view stock alerts and dashboard

**Admin:**
- Can view all orders with filters
- Can update order status
- Can view stock alerts across all fornecedores

---

## Data Validation

### Zod Schemas
All endpoints use comprehensive Zod schemas for validation:
- Required fields validation
- Type validation (string, number, enum)
- Min/max length validation
- Email format validation
- CNPJ format validation (14 digits)
- Decimal number transformation
- Enum validation (StatusPedido, TipoMovimentacao, TipoDesconto)

### Stock Validation
- Always check stock availability before order creation
- Prevent negative stock in movements
- Validate product belongs to fornecedor

### Ownership Validation
- Clients belong to fornecedor
- Products belong to fornecedor
- Orders belong to cliente/fornecedor
- Price lists belong to fornecedor

---

## Database Models and Enums

### Enums
```typescript
enum TipoUsuario {
  admin
  fornecedor
  cliente
}

enum StatusPedido {
  pendente
  confirmado
  processando
  enviado
  entregue
  cancelado
}

enum TipoMovimentacao {
  entrada
  saida
  ajuste
}

enum TipoDesconto {
  percentual
  fixo
}
```

### Key Models
- **Usuario** - User authentication and profile
- **Fornecedor** - Supplier/vendor information
- **Cliente** - B2B client/buyer information
- **ClienteFornecedor** - Relationship with price list assignment
- **Produto** - Products with stock levels
- **Pedido** - Orders with totals
- **ItemPedido** - Order line items
- **HistoricoStatusPedido** - Order status change history
- **MovimentacaoEstoque** - Stock movement history
- **ListaPreco** - Price lists with discount rules
- **ItemListaPreco** - Products in price lists
- **PrecoCustomizado** - Custom prices per client-product

---

## Files Created

### Clients and Pricing (Previous Implementation)
1. `/app/api/clientes/route.ts` - List and create clients
2. `/app/api/clientes/[id]/route.ts` - Get, update, delete by ID
3. `/app/api/clientes/[id]/lista-preco/route.ts` - Assign price list
4. `/app/api/clientes/[id]/pedidos/route.ts` - Get client orders
5. `/app/api/listas-preco/route.ts` - List and create price lists
6. `/app/api/listas-preco/[id]/route.ts` - Get, update, delete by ID
7. `/app/api/listas-preco/[id]/produtos/route.ts` - Add/list products
8. `/app/api/listas-preco/[id]/produtos/[produtoId]/route.ts` - Remove product
9. `/app/api/precos-customizados/route.ts` - List and create custom prices
10. `/app/api/precos-customizados/[id]/route.ts` - Get, update, delete

### Orders and Stock (Current Implementation)
11. `/app/api/carrinho/calcular/route.ts` - Calculate cart totals
12. `/app/api/pedidos/route.ts` - List and create orders
13. `/app/api/pedidos/[id]/route.ts` - Get order details
14. `/app/api/pedidos/[id]/status/route.ts` - Update order status
15. `/app/api/pedidos/[id]/rastreio/route.ts` - Add tracking code
16. `/app/api/pedidos/[id]/cancelar/route.ts` - Cancel order
17. `/app/api/pedidos/[id]/historico/route.ts` - Get status history
18. `/app/api/pedidos/numero/[numero]/route.ts` - Get by order number
19. `/app/api/estoque/movimentacoes/route.ts` - List and create movements
20. `/app/api/estoque/movimentacoes/[produtoId]/route.ts` - Product history
21. `/app/api/estoque/alertas/route.ts` - Low stock alerts
22. `/app/api/estoque/dashboard/route.ts` - Stock metrics

---

## Error Handling

### Consistent Error Responses
```json
{
  "success": false,
  "error": "Error message",
  "errors": [] // For validation errors
}
```

### Common HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors, business logic errors)
- `401` - Unauthorized (not authenticated)
- `403` - Forbidden (not authorized)
- `404` - Not Found
- `409` - Conflict (duplicate entries)
- `422` - Unprocessable Entity (Zod validation errors)
- `500` - Internal Server Error

---

## Logging

All important operations are logged using the Winston logger:
- Order creation, updates, cancellation
- Stock movements
- Status changes
- Price assignments
- Includes relevant IDs and user context for audit trail

---

## Next.js 15+ Compatibility

All routes properly handle the new async params pattern introduced in Next.js 15:
```typescript
{ params }: { params: Promise<{ id: string }> }
```

All params are properly awaited before use.

---

## Testing Recommendations

### Cart Calculation
- Test with and without clienteId
- Test with custom prices
- Test with price list discounts
- Test with insufficient stock
- Test with mixed pricing strategies

### Order Creation
- Test stock decrement
- Test movement record creation
- Test status history creation
- Test with insufficient stock
- Test order number generation uniqueness

### Order Cancellation
- Test stock increment
- Test status validation (should fail for enviado/entregue)
- Test both cliente and fornecedor cancellation
- Test unauthorized cancellation attempts

### Stock Management
- Test entrada (addition)
- Test saida (subtraction with negative check)
- Test ajuste (absolute value)
- Test movement history tracking
- Test low stock alerts
- Test dashboard metrics

---

## Future Enhancements

Potential improvements for future iterations:
1. Webhook notifications for order status changes
2. Email notifications for low stock alerts
3. Bulk stock import/export
4. Order invoice generation
5. Payment integration
6. Shipping integration with tracking APIs
7. Analytics and reporting endpoints
8. Order approval workflow
9. Return/refund management
10. Multi-warehouse support

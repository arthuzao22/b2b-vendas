# Clients and Pricing Management APIs - Summary

## Overview
This document summarizes the comprehensive Clients and Pricing management APIs created for the B2B marketplace system.

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

## Next.js 15+ Compatibility

All routes properly handle the new async params pattern introduced in Next.js 15:
```typescript
{ params }: { params: Promise<{ id: string }> }
```

All params are properly awaited before use.

# PROMPT: REFATORAÇÃO COMPLETA DO FRONTEND — B2B MARKETPLACE DESIGN SYSTEM

---

## 0. CONTEXTO E ESCOPO

Você é um Frontend Engineer Sênior e Design System Architect. Sua missão é refatorar **TODO** o frontend de uma aplicação B2B Marketplace construída com a seguinte stack:

- **Framework**: Next.js 16 (App Router)
- **Linguagem**: TypeScript
- **Estilização**: Tailwind CSS v4 (via `@tailwindcss/postcss`)
- **Componentes Base**: Radix UI Primitives com padrão shadcn/ui
- **Icons**: Lucide React
- **State Management**: Zustand
- **Charts**: Recharts
- **Auth**: NextAuth v4
- **ORM**: Prisma

**Referências visuais obrigatórias** (extrair padrões de layout, hierarquia, spacing, components):
- **Stripe** (tom enterprise clean, tipografia, whitespace, formulários)
- **Shopify Admin** (dashboard, sidebar, cards, data tables)
- **Mercado Livre** (catálogo de produtos, cards de produto, carrinho, checkout B2B)
- **Amazon Business** (listagem de fornecedores, filtros, breadcrumbs, sistema de pedidos)

**Tom visual da aplicação**: Enterprise Clean, Profissional, Minimalista com personalidade. NÃO é flat genérico. É premium, sofisticado, com micro-interações sutis.

---

## 1. DESIGN TOKENS — OBRIGATÓRIOS

Todos os valores abaixo devem ser implementados como CSS Custom Properties em `globals.css` dentro de `:root`. Todos os componentes e páginas DEVEM usar exclusivamente estes tokens. **É PROIBIDO usar valores hardcoded de cor, font-size, spacing, border-radius ou shadow em qualquer componente.**

### 1.1 Paleta de Cores

```css
:root {
  /* ═══ BRAND ═══ */
  --color-brand-50: 220 70% 97%;
  --color-brand-100: 220 70% 93%;
  --color-brand-200: 220 68% 85%;
  --color-brand-300: 220 66% 73%;
  --color-brand-400: 220 65% 60%;
  --color-brand-500: 220 72% 50%;   /* PRIMARY — cor principal de botões, links, ícones ativos */
  --color-brand-600: 220 78% 43%;
  --color-brand-700: 220 80% 36%;
  --color-brand-800: 220 75% 28%;
  --color-brand-900: 220 70% 20%;

  /* ═══ NEUTRAL (uso em textos, backgrounds, borders) ═══ */
  --color-neutral-0: 0 0% 100%;      /* branco puro — fundo principal */
  --color-neutral-25: 220 20% 98%;   /* fundo de cards secundários */
  --color-neutral-50: 220 17% 96%;   /* fundo de seções alternadas */
  --color-neutral-100: 220 15% 93%;  /* borders sutis, dividers */
  --color-neutral-200: 220 13% 87%;  /* borders de inputs, cards */
  --color-neutral-300: 220 11% 78%;  /* placeholder text */
  --color-neutral-400: 220 9% 64%;   /* texto desabilitado */
  --color-neutral-500: 220 8% 50%;   /* texto secundário, captions */
  --color-neutral-600: 220 10% 38%;  /* texto de suporte, labels */
  --color-neutral-700: 220 14% 28%;  /* texto de corpo (body text) */
  --color-neutral-800: 220 18% 18%;  /* texto de títulos secundários */
  --color-neutral-900: 220 22% 10%;  /* texto de headings principais */

  /* ═══ SEMANTIC ═══ */
  --color-success-50: 145 60% 95%;
  --color-success-500: 145 63% 42%;
  --color-success-700: 145 70% 30%;

  --color-warning-50: 38 92% 95%;
  --color-warning-500: 38 92% 50%;
  --color-warning-700: 30 80% 38%;

  --color-error-50: 0 86% 96%;
  --color-error-500: 0 84% 60%;
  --color-error-700: 0 72% 45%;

  --color-info-50: 200 80% 95%;
  --color-info-500: 200 80% 50%;
  --color-info-700: 200 75% 38%;
}
```

**REGRAS DE COR:**
- Todo texto sobre fundo branco DEVE usar `neutral-700` a `neutral-900`.
- Texto secundário: `neutral-500` a `neutral-600`.
- Placeholders: `neutral-300` a `neutral-400`.
- Links e ações primárias: `brand-500` com hover em `brand-600`.
- Backgrounds de página: `neutral-0` ou `neutral-50`.
- Backgrounds de cards: `neutral-0` com border `neutral-200`.
- **PROIBIDO**: usar `text-white` sobre fundo branco. PROIBIDO usar `bg-gray-800/900` para cards em modo light.

### 1.2 Tipografia

**Fonte principal**: Inter (Google Fonts) — carregar weights 400, 500, 600, 700.
**Fallback**: `-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`.

```css
:root {
  /* ═══ FONT SIZES ═══ */
  --text-xs: 0.75rem;      /* 12px — captions, badges */
  --text-sm: 0.8125rem;    /* 13px — labels, meta info */
  --text-base: 0.875rem;   /* 14px — body text, inputs, table cells */
  --text-md: 1rem;         /* 16px — subtítulos, card titles */
  --text-lg: 1.125rem;     /* 18px — section headers */
  --text-xl: 1.25rem;      /* 20px — page titles secundários */
  --text-2xl: 1.5rem;      /* 24px — page titles */
  --text-3xl: 1.875rem;    /* 30px — hero section */
  --text-4xl: 2.25rem;     /* 36px — hero headline */

  /* ═══ LINE HEIGHTS ═══ */
  --leading-tight: 1.25;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;

  /* ═══ FONT WEIGHTS ═══ */
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;

  /* ═══ LETTER SPACING ═══ */
  --tracking-tight: -0.01em;
  --tracking-normal: 0em;
  --tracking-wide: 0.025em;
  --tracking-wider: 0.05em;
}
```

**HIERARQUIA TIPOGRÁFICA OBRIGATÓRIA:**

| Elemento                   | Size         | Weight     | Color            | Letter-spacing |
|---------------------------|-------------|-----------|-----------------|---------------|
| H1 (Hero headline)        | `text-4xl`  | `bold`    | `neutral-900`   | `tight`       |
| H2 (Page Title)           | `text-2xl`  | `bold`    | `neutral-900`   | `tight`       |
| H3 (Section Title)        | `text-lg`   | `semibold`| `neutral-800`   | `normal`      |
| H4 (Card Title)           | `text-md`   | `semibold`| `neutral-800`   | `normal`      |
| Body                      | `text-base` | `normal`  | `neutral-700`   | `normal`      |
| Body Small                | `text-sm`   | `normal`  | `neutral-600`   | `normal`      |
| Caption                   | `text-xs`   | `medium`  | `neutral-500`   | `wide`        |
| Label (form)              | `text-sm`   | `medium`  | `neutral-700`   | `normal`      |
| Overline                  | `text-xs`   | `semibold`| `neutral-500`   | `wider`       |
| Button Text               | `text-sm`   | `medium`  | —               | `wide`        |

### 1.3 Espaçamento (Spacing Scale)

Usar escala de 4px. Todo espaçamento DEVE seguir esta escala.

```
--space-0: 0px
--space-0.5: 2px
--space-1: 4px
--space-1.5: 6px
--space-2: 8px
--space-3: 12px
--space-4: 16px
--space-5: 20px
--space-6: 24px
--space-8: 32px
--space-10: 40px
--space-12: 48px
--space-16: 64px
--space-20: 80px
--space-24: 96px
```

**REGRAS DE ESPAÇAMENTO:**
- Padding interno de cards: `space-5` (20px) a `space-6` (24px).
- Gap entre cards em grid: `space-4` (16px) a `space-6` (24px).
- Padding de página (container): `space-6` em mobile, `space-8` em tablet, `space-12` em desktop.
- Margin entre seções de página: `space-12` a `space-16`.
- Padding interno de inputs: `space-2` vertical, `space-3` horizontal.
- Padding de botões: `space-2` vertical, `space-4` horizontal (sm), `space-3`/`space-5` (md), `space-4`/`space-6` (lg).
- Espaço entre label e input em formulários: `space-1.5`.
- Espaço entre campos de formulário: `space-5`.

### 1.4 Border Radius

```
--radius-sm: 6px       /* badges, tags, chips */
--radius-md: 8px       /* inputs, buttons, small cards */
--radius-lg: 12px      /* cards, modals, dropdowns */
--radius-xl: 16px      /* hero cards, feature cards */
--radius-full: 9999px  /* avatares, pills */
```

### 1.5 Shadows (Elevation System)

```
--shadow-xs: 0 1px 2px 0 rgb(0 0 0 / 0.03);
--shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.04), 0 1px 2px -1px rgb(0 0 0 / 0.03);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.03);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.06), 0 4px 6px -4px rgb(0 0 0 / 0.04);
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.07), 0 8px 10px -6px rgb(0 0 0 / 0.04);
```

**REGRAS DE SHADOW:**
- Cards em repouso: `shadow-xs` + border `neutral-200`.
- Cards em hover: transição para `shadow-md`.
- Modals e Dialogs: `shadow-xl`.
- Dropdowns e Popovers: `shadow-lg`.
- Inputs em focus: NÃO usar shadow. Usar outline com `brand-500` 2px.
- **PROIBIDO**: shadows com opacidade acima de 0.1. Shadows devem ser sutis, nunca pesadas.

### 1.6 Transições e Animações

```
--transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-base: 200ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-slow: 300ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-spring: 400ms cubic-bezier(0.34, 1.56, 0.64, 1);
```

**REGRAS DE TRANSIÇÃO:**
- Hover em botões e links: `transition-fast`.
- Abertura/fechamento de dropdowns, modals: `transition-base`.
- Sidebar slide (mobile): `transition-slow`.
- Micro-animações de feedback (toast, notification badge): `transition-spring`.

### 1.7 Z-Index Scale

```
--z-base: 0
--z-dropdown: 100
--z-sticky: 200
--z-overlay: 300
--z-modal: 400
--z-popover: 500
--z-toast: 600
--z-tooltip: 700
```

---

## 2. LAYOUT SYSTEM

### 2.1 Container

- Largura máxima: `1280px` para páginas de conteúdo, `1440px` para dashboards.
- Padding horizontal: `16px` (mobile), `24px` (tablet), `48px` (desktop).
- Centralizado com `margin: 0 auto`.

### 2.2 Header (Público)

**Estrutura**: Sticky no topo, `height: 64px`, fundo branco (`neutral-0`) com `border-bottom: 1px solid neutral-100`, `backdrop-blur: 12px`.

| Elemento            | Posição   | Estilo                                                         |
|---------------------|----------|---------------------------------------------------------------|
| Logo                | Esquerda | Ícone SVG 28px + texto `text-md` `font-bold` `neutral-900`   |
| Nav Links           | Centro   | `text-sm` `font-medium` `neutral-600` com hover `brand-500`  |
| Auth Buttons        | Direita  | "Login" (ghost) + "Cadastrar" (primary filled)                |
| Mobile: Hamburguer  | Direita  | `Menu` icon 24px, abre drawer fullscreen por cima             |

- Nav links ativos: `brand-500` com underline `2px` bottom offset `4px`.
- Transição de cor em links: `transition-fast`.
- Em mobile: o menu deve ser um drawer que desliza da direita para a esquerda, com overlay `neutral-900/50`.

### 2.3 Dashboard Layout (Autenticado)

**Estrutura**: Sidebar fixa + Content Area.

```
┌──────────┬──────────────────────────────────────────┐
│          │  Top Bar (breadcrumb + actions)           │
│ SIDEBAR  ├──────────────────────────────────────────┤
│ 256px    │                                          │
│ (fixed)  │  Main Content Area                       │
│          │  (padding: 24px desktop / 16px mobile)   │
│          │                                          │
└──────────┴──────────────────────────────────────────┘
```

**Sidebar:**
- Largura: `256px` em desktop. Oculta em mobile (drawer).
- Background: `neutral-0` com `border-right: 1px solid neutral-100`.
- Logo no topo: padding `24px`.
- Seção de Usuário: Avatar circle com iniciais + nome + role, padding `20px 24px`.
- Nav Items: `height: 40px`, `padding: 0 16px`, `border-radius: radius-md`, `text-sm` `font-medium`.
  - Default: ícone `neutral-400` + texto `neutral-600`.
  - Hover: fundo `neutral-50`, texto `neutral-800`.
  - Active: fundo `brand-50`, texto `brand-600`, ícone `brand-500`, com `border-left: 3px solid brand-500`.
- Dividers entre seções de nav: `1px solid neutral-100` com `margin: 8px 16px`.
- Botão Logout: no footer da sidebar, separado por border-top.

**Top Bar (dentro do content area):**
- Height: `56px`.
- Contém: Breadcrumbs (esquerda) + Ações de página (direita).
- Breadcrumb: `text-xs`, separador `/`, item ativo `neutral-800`, items inativos `neutral-500` com link hover `brand-500`.

**Content Area:**
- Background: `neutral-50`.
- Padding: `24px` em desktop, `16px` em mobile.
- Max-width do conteúdo interno: `1200px`.

### 2.4 Footer (Público)

- Background: `neutral-900`.
- Texto: `neutral-400` (body), `neutral-0` (headings).
- Links com hover `brand-400`.
- Layout: 4 colunas em desktop (Logo+descrição | Links Rápidos | Suporte | Contato), 2 colunas em tablet, 1 coluna em mobile.
- Padding: `64px` top/bottom.
- Bottom bar: copyright + links termos/privacidade, separado por `border-top: 1px solid neutral-800`.

---

## 3. COMPONENTES — ESPECIFICAÇÃO OBRIGATÓRIA

### 3.1 Button

**Variantes obrigatórias:**

| Variante      | Background       | Text        | Border           | Hover                           |
|---------------|-----------------|-------------|------------------|---------------------------------|
| `primary`     | `brand-500`     | `white`     | none             | `brand-600`, `shadow-sm`        |
| `secondary`   | `neutral-0`     | `neutral-700`| `neutral-200`   | `neutral-50`, border `neutral-300` |
| `ghost`       | `transparent`   | `neutral-600`| none            | `neutral-50`                    |
| `destructive` | `error-500`     | `white`     | none             | `error-700`                     |
| `link`        | `transparent`   | `brand-500` | none             | underline, `brand-600`          |

**Tamanhos:**

| Size  | Height | Padding H  | Font Size  | Icon Size |
|-------|--------|-----------|-----------|-----------|
| `sm`  | 32px   | 12px      | `text-xs` | 14px      |
| `md`  | 36px   | 16px      | `text-sm` | 16px      |
| `lg`  | 44px   | 24px      | `text-sm` | 18px      |

**Estados:**
- `hover`: conforme tabela acima + `transition-fast`.
- `active`: opacidade 0.9, scale(0.98) com `transition: 50ms`.
- `focus-visible`: outline `2px solid brand-500`, offset `2px`.
- `disabled`: opacidade 0.5, `cursor: not-allowed`, sem hover effects.
- `loading`: texto substituído por spinner SVG animado 16px, botão mantém largura original (usar `min-width`).

**REGRAS DE BOTÃO:**
- Botões primários: máximo 1 por seção visível. Não usar dois botões primários lado a lado.
- Ação principal + secundária: primary + secondary.
- Ícone antes do texto: `gap: 8px`, ícone `16px`.
- Botões icon-only: usar variante `ghost`, shape `circle` ou `square` com border-radius `radius-md`.
- Text nunca faz wrap. Usar `white-space: nowrap`.

### 3.2 Input / Text Field

- Height: `40px` (md), `36px` (sm).
- Border: `1px solid neutral-200`.
- Border-radius: `radius-md`.
- Font: `text-base`.
- Placeholder: `neutral-400`.
- Focus: border `brand-500`, `outline: 2px solid brand-500/20`.
- Error: border `error-500`, texto de erro `text-xs` `error-500` abaixo do input com `margin-top: 4px`.
- Disabled: background `neutral-50`, border `neutral-100`, texto `neutral-400`, `cursor: not-allowed`.
- Com ícone: ícone `16px` alinhado à esquerda, padding-left `40px`.
- Com Label: label acima do input, `text-sm` `font-medium` `neutral-700`, gap `6px`.

### 3.3 Card

**Variantes:**

| Variante        | Background    | Border          | Shadow       | Radius      |
|----------------|--------------|----------------|-------------|-------------|
| `default`      | `neutral-0`  | `neutral-200`  | `shadow-xs` | `radius-lg` |
| `elevated`     | `neutral-0`  | none           | `shadow-md` | `radius-lg` |
| `interactive`  | `neutral-0`  | `neutral-200`  | `shadow-xs` | `radius-lg` |
| `highlighted`  | `brand-50`   | `brand-200`    | none        | `radius-lg` |

- `interactive` hover: `shadow-md`, border `neutral-300`, `transition-base`. Cursor `pointer`.
- Padding interno: `20px` a `24px`.
- Card Header: `padding-bottom: 16px`, opcionalmente com `border-bottom: 1px solid neutral-100`.
- Card Title: `text-md` `font-semibold` `neutral-800`.
- Card Description: `text-sm` `neutral-500`.

### 3.4 Product Card (Catálogo)

**Estrutura obrigatória:**

```
┌─────────────────────────┐
│       IMAGE AREA        │  ← aspect-ratio: 1/1, object-fit: cover, radius-lg top
│      (com skeleton)     │
├─────────────────────────┤
│  Badge (categoria)      │  ← tag no canto superior esquerdo da imagem
│                         │
│  Nome do Produto        │  ← text-base, font-semibold, neutral-800, max 2 linhas (clamp)
│  Fornecedor             │  ← text-xs, neutral-500
│                         │
│  R$ 99,90               │  ← text-lg, font-bold, brand-600
│  un / cx / kg           │  ← text-xs, neutral-400
│                         │
│  ★ 4.5 (23 avaliações)  │  ← text-xs, warning-500 (estrela), neutral-500 (texto)
│                         │
│  [Adicionar ao Carrinho] │  ← Button secondary, sm, full-width
└─────────────────────────┘
```

- Hover no card inteiro: `shadow-md`, imagem com `scale(1.03)` e `transition-slow`.
- Badge de categoria: `text-xs`, `font-medium`, `brand-50` bg, `brand-600` text, `radius-full`, padding `2px 10px`.
- Se produto sem imagem: placeholder com ícone `Package` centralizado em fundo `neutral-100`.
- Grid de produtos: `grid-cols-2` mobile, `grid-cols-3` tablet, `grid-cols-4` desktop. Gap `16px`.
- Minimum card width: `220px`.

### 3.5 Data Table

- Header row: background `neutral-50`, `text-xs` `font-semibold` `neutral-500` `uppercase`, `letter-spacing: wider`, `height: 44px`.
- Body rows: `height: 52px`, `text-sm` `neutral-700`, alternating row bg: `neutral-0` / `neutral-25`.
- Row hover: `neutral-50`.
- Borders: horizontal only, `1px solid neutral-100`.
- Checkbox column (se presente): width `48px`.
- Action column: ícones ghost `16px`, gap `8px`. Dropdown com "..." (MoreHorizontal) para 3+ ações.
- Pagination: abaixo da tabela, `height: 48px`, com "Mostrando X de Y" à esquerda e controles de página à direita.
- Empty state: ilustração SVG + texto `neutral-500` + CTA button, centralizado.
- Sorting: ícone seta `12px` ao lado do header text, `neutral-400` default, `brand-500` quando ativo.

### 3.6 Badge / Status Badge

| Status       | Background     | Text          | Dot color     |
|-------------|---------------|--------------|--------------|
| `success`   | `success-50`  | `success-700`| `success-500`|
| `warning`   | `warning-50`  | `warning-700`| `warning-500`|
| `error`     | `error-50`    | `error-700`  | `error-500`  |
| `info`      | `info-50`     | `info-700`   | `info-500`   |
| `neutral`   | `neutral-100` | `neutral-600`| `neutral-400`|

- Border-radius: `radius-full`.
- Font: `text-xs` `font-medium`.
- Padding: `2px 10px`.
- Incluir dot animado (pulsing) para status `success` (indicar ativo/online).

### 3.7 Modal / Dialog

- Overlay: `neutral-900` com opacidade `50%`, `backdrop-blur: 4px`.
- Container: `neutral-0`, `radius-xl`, `shadow-xl`, max-width `520px` (sm) / `680px` (md) / `960px` (lg).
- Header: `padding: 24px 24px 0`, título `text-lg` `font-semibold` `neutral-900`, botão fechar no canto superior direito.
- Body: `padding: 16px 24px`, com overflow-y se necessário, max-height `calc(80vh - 140px)`.
- Footer: `padding: 16px 24px 24px`, alinhado à direita, botões com `gap: 12px`, separado por `border-top: 1px solid neutral-100`.
- Animação de entrada: fadeIn + slideUp `transition-base`.
- Animação de saída: fadeOut + slideDown `transition-fast`.

### 3.8 Toast / Notification

- Posição: `bottom-right`, offset `24px`.
- Max-width: `400px`.
- Background: `neutral-0` com `shadow-lg` e `border: 1px solid neutral-200`.
- Border-left: `3px solid` com cor semântica (success/error/warning/info).
- Ícone semântico `20px` + texto `text-sm`.
- Auto-dismiss: `5s` com barra de progresso animada.
- Animação: slideIn da direita + fadeIn.
- Botão dismiss: `X` icon `14px`, `neutral-400`, hover `neutral-600`.
- Stack: se múltiplos toasts, empilhar com gap `8px`, max 3 visíveis.

### 3.9 Select / Dropdown

- Trigger: mesma aparência do Input (`40px` height, border `neutral-200`).
- Chevron icon `16px` à direita, `neutral-400`.
- Dropdown panel: `neutral-0`, `shadow-lg`, `radius-md`, `border: 1px solid neutral-100`.
- Item: `height: 36px`, `padding: 0 12px`, `text-sm`.
- Item hover: `neutral-50`.
- Item selected: `brand-50`, texto `brand-600`, checkmark icon à direita.
- Animação de abertura: fadeIn + scaleY from top, `transition-fast`.

### 3.10 Sidebar Navigation Items

- Seguir especificação da seção 2.3 (Dashboard Layout).
- Ícones DEVEM ser da biblioteca Lucide React, tamanho `20px`.
- O item ativo deve ter uma barra lateral de `3px` em `brand-500`.
- Ao trocar de item ativo, a transição do highlight deve ser suave (`transition-base`).
- Suportar sub-items colapsáveis com chevron de rotação animada (`90deg` quando aberto).
- Contadores/badges nos items: `text-xs`, pill `brand-500` cor com texto branco, alinhado à direita.

### 3.11 Empty State

- Centralizado vertical e horizontalmente no container pai.
- Ilustração/ícone: `64px`, cor `neutral-300`.
- Título: `text-md` `font-semibold` `neutral-700`.
- Descrição: `text-sm` `neutral-500`, max-width `360px`, centralized.
- CTA: botão `primary` ou `secondary` abaixo com `margin-top: 24px`.

### 3.12 Loading States

**Skeleton:**
- Background: gradiente animado de `neutral-100` para `neutral-200` (shimmer effect), animação `1.5s` infinite.
- Radius: mesmo do componente que está substituindo.
- Deve replicar o layout exato do componente final (text lines, avatar circles, image rects).

**Spinner:**
- SVG circular com stroke `brand-500`, `2px` width.
- Tamanhos: `16px` (inline/button), `24px` (small), `40px` (page-level).
- Animação: rotate `600ms` linear infinite.

**Page Loading:**
- Barra de progresso no topo (como NProgress), `2px` height, cor `brand-500`, animação indeterminate.

### 3.13 Form Layout

- Labels acima dos inputs (NUNCA ao lado em mobile).
- Campos de formulário: max-width `480px` para formulários de dados single-column.
- Formulários de 2 colunas em desktop: `grid-cols-2` com `gap: 20px`.
- Required indicator: asterisco `*` em `error-500` após o label text.
- Helper text: `text-xs` `neutral-500`, abaixo do input, `margin-top: 4px`.
- Error text: substitui helper text quando há erro, `text-xs` `error-500`.
- Form sections: separar com heading `text-sm` `font-semibold` `neutral-800` + `border-bottom: 1px solid neutral-100` + `padding-bottom: 12px`.
- Form actions (submit/cancel): alinhados à direita, primary + secondary buttons.

### 3.14 Breadcrumbs

- Separador: `/` em `neutral-300`, ou chevron icon `12px`.
- Items: `text-xs` `font-medium`.
- Items link: `neutral-500`, hover `brand-500`.
- Item atual (último): `neutral-800`, sem link.
- Ícone Home no primeiro item: `14px`.

### 3.15 Search Input

- Ícone `Search` `16px` à esquerda dentro do input.
- Placeholder: "Buscar produtos, fornecedores..." (contextual).
- Keyboard shortcut hint: badge `⌘K` ou `Ctrl+K` à direita dentro do input, `text-xs` `neutral-400` bg `neutral-100` `radius-sm`.
- Em dashboard: width `320px`.
- Em catálogo público: `full-width` com max-width `640px`, centralizado, height `48px` (maior).
- Clear button (`X`): aparece quando há texto, `14px` `neutral-400`.

### 3.16 Quantity Selector

- Layout: botão "−" | input numérico | botão "+"
- Botões: `32px` square, border `neutral-200`, `radius-sm`, ícone `14px`.
- Input: `48px` width, text-center, `text-sm` `font-medium`.
- Min value: 1 (botão "−" desabilita em 1).
- Validação de estoque: se > estoque, border `error-500`, tooltip "Máximo: X unidades".

### 3.17 Price Display

- Preço principal: `text-lg` a `text-2xl` `font-bold` `neutral-900`.
- Preço por unidade: `text-xs` `neutral-500`.
- Desconto (se aplicável): preço original riscado `text-sm` `neutral-400` `line-through` + badge "−15%" `error-50` `error-600`.
- Moeda: sempre `R$` com espaço, formato `R$ 1.234,56`.

---

## 4. PÁGINAS — ESPECIFICAÇÃO INDIVIDUAL

### 4.1 Landing Page (`/`)

**Layout:**
1. **Hero Section**: background `neutral-0` com decorative gradient blob sutil `brand-100/30`. Grid 2 colunas: Texto esquerda (H1 + subtitle + 2 CTAs + stats badges) | Ilustração/mockup direita.
2. **Features Section**: heading centralizado + grid 3 colunas de feature cards (`elevated` variant).
3. **How it Works**: background `neutral-50`, 2 cards lado a lado (Para Fornecedores | Para Clientes) com steps numerados (stepper visual).
4. **CTA Section**: card `highlighted` com gradient `brand-500` → `brand-700`, texto white, 2 botões.
5. **Footer**: conforme seção 2.4.

### 4.2 Auth Pages (`/auth/login`, `/auth/register`)

- Layout: 2 colunas em desktop. Esquerda: painel decorativo com pattern/gradient `brand-500`→`brand-700` + logo + quote. Direita: formulário centralizado.
- Mobile: coluna única, sem painel decorativo, logo + form.
- Form card: `neutral-0`, `shadow-lg`, `radius-xl`, padding `32px`.
- Social login buttons: `secondary` variant com ícone SVG do provider.
- Divider "ou": `1px solid neutral-200` com texto "ou" centralizado em `neutral-500`.
- Link entre login/registro: `text-sm`, `brand-500`.

### 4.3 Dashboard Home (`/dashboard/fornecedor`)

- Page title: H2 + subtitle com data atual.
- KPI Row: 4 cards em grid (Vendas do mês, Pedidos pendentes, Novos clientes, Ticket médio). Cada card: ícone em círculo `brand-50`/`success-50` + valor `text-2xl` `font-bold` + label `text-sm` `neutral-500` + trend indicator (+12% `success-500` ou −5% `error-500`) com seta.
- Gráfico de vendas: `Recharts` AreaChart, cores `brand-500` fill `brand-100/50`, grid lines `neutral-100`, axis text `neutral-500`.
- Pedidos recentes: data table com 5 últimos pedidos, sem paginação, com link "Ver todos".
- Produtos populares: lista horizontal scrollable de product mini-cards (imagem `64px` + nome + vendas).

### 4.4 Product Listing / Catálogo (`/catalogo`)

- Toolbar: filtros + search + sort + view toggle (grid/list).
- Filtro sidebar (desktop): painel lateral colapsável `240px`, com checkboxes para categorias, range slider para preço, radio buttons para rating.
- Product grid: conforme seção 3.4.
- List view alternative: rows horizontais com imagem `80px` + info + preço + CTA.
- Paginação: bottom, com page numbers + prev/next.

### 4.5 Cart (`/carrinho`)

- Layout: 2 colunas em desktop (itens 60% | resumo 40%).
- Item do carrinho: card com imagem `80px` + nome + fornecedor + preço unitário + quantity selector + subtotal + botão remover.
- Resumo: card `elevated`, sticky em desktop. Subtotal + Frete (estimativa) + Total `text-xl` `font-bold` + CTA "Finalizar Pedido" `primary` `lg` full-width.
- Cart vazio: empty state com ícone carrinho + "Seu carrinho está vazio" + CTA para catálogo.

### 4.6 Checkout (`/checkout`)

- Stepper visual no topo: "Endereço → Pagamento → Revisão → Confirmação".
- Step ativo: círculo `brand-500` + texto `brand-600`.
- Step completo: círculo `success-500` com check.
- Step pendente: círculo `neutral-200` + texto `neutral-400`.
- Conector entre steps: linha `2px`, `success-500` se completo, `neutral-200` se pendente.
- Layout de conteúdo do step: form fields conforme seção 3.13.

---

## 5. RESPONSIVIDADE — BREAKPOINTS OBRIGATÓRIOS

```
Mobile:    0px — 639px     (sm:)
Tablet:    640px — 1023px   (md:)
Desktop:   1024px — 1279px  (lg:)
Wide:      1280px+          (xl:)
```

**REGRAS:**
- Sidebar: visível em `lg:`, drawer em `< lg:`.
- Product grid: `2 cols` (sm), `3 cols` (md), `4 cols` (lg+).
- Data tables: scroll horizontal em mobile com min-width fixo por coluna.
- Formulários 2 colunas: `2 cols` em `md:`, `1 col` em mobile.
- Hero section: `2 cols` em `md:`, coluna única em mobile, ilustração oculta em mobile.
- Hide: breadcrumbs em mobile. Manter em tablet+.
- Font-size reduction em mobile: H1 de `text-4xl` para `text-2xl`. H2 de `text-2xl` para `text-xl`.
- Touch targets: mínimo `44px` height em mobile para todos os elementos interativos.

---

## 6. MICRO-INTERAÇÕES OBRIGATÓRIAS

| Interação                           | Comportamento                                                              |
|------------------------------------|---------------------------------------------------------------------------|
| Hover em card interativo            | `shadow-xs` → `shadow-md`, border sutil escurece, `transition-base`       |
| Hover em product image              | `scale(1.03)`, `transition-slow`                                          |
| Click em botão primary              | `scale(0.98)` → `scale(1)`, `transition: 80ms`                           |
| Abertura de modal                   | Overlay fadeIn `100ms` → Modal slideUp+fadeIn `200ms`                     |
| Toast aparece                       | SlideIn da direita `200ms` + fadeIn, progress bar anima linearmente `5s`  |
| Toggle sidebar mobile               | SlideIn da esquerda `300ms`, overlay fadeIn simultâneo                     |
| Focus em input                      | Border transiciona para `brand-500` `transition-fast`                     |
| Adicionar ao carrinho               | Botão → animação check `300ms` → volta ao texto original `500ms`         |
| Badge de notificação                | Bounce exagerado sutil na entrada + pulse contínuo se unread              |
| Skeleton loading                    | Shimmer gradiente da esquerda para direita `1.5s` infinite               |
| Hover em row de tabela              | Background fadeIn para `neutral-50` `transition-fast`                    |
| Ordenação de tabela                 | Ícone rotaciona `180deg` `transition-fast` ao alternar asc/desc          |

---

## 7. ACESSIBILIDADE — REQUISITOS OBRIGATÓRIOS

- Contrast ratio: mínimo `4.5:1` para texto normal, `3:1` para texto large (18px+ bold).
- Todo elemento interativo DEVE ter `focus-visible` estilo com outline `2px solid brand-500`.
- Imagens: `alt` text descritivo obrigatório. Ícones decorativos: `aria-hidden="true"`.
- Forms: todo input DEVE ter `<label>` associado via `htmlFor`/`id`. Usar `aria-describedby` para helper/error text.
- Modals: focus trap obrigatório. `Escape` fecha o modal. `aria-modal="true"`.
- `role` e `aria-*` corretos em todos os componentes interativos (tabs, accordions, dropdowns).
- Botões icon-only: `aria-label` obrigatório descritivo.
- Skip-to-content link: primeiro elemento focável da página, visível apenas no focus.
- Keyboard navigation: Tab order lógico. Enter/Space para ativação. Arrows para navegação em menus/selects.

---

## 8. REGRAS ABSOLUTAS — PROIBIÇÕES

1. **PROIBIDO** usar cores fora do design token system.
2. **PROIBIDO** usar `font-size` hardcoded. Usar a escala typográfica.
3. **PROIBIDO** usar `margin` ou `padding` que não seguem a spacing scale (múltiplos de 4px).
4. **PROIBIDO** usar `box-shadow` fora da elevation system definida.
5. **PROIBIDO** usar `border-radius` fora da scale definida.
6. **PROIBIDO** usar `z-index` arbitrário. Seguir a z-index scale.
7. **PROIBIDO** ter botões sem estados de hover, focus, disabled e loading.
8. **PROIBIDO** ter inputs sem estados de focus, error e disabled.
9. **PROIBIDO** ter transições sem `cubic-bezier`. Nunca usar `linear` para UI (exceto spinner rotation e progress bars).
10. **PROIBIDO** decisões subjetivas de design. Se não está especificado neste prompt, consultar as referências (Stripe, Shopify, Mercado Livre, Amazon Business) e seguir o padrão mais enterprise/clean.
11. **PROIBIDO** usar `!important` em CSS.
12. **PROIBIDO** duplicar estilos. Se dois componentes compartilham estilo, create um componente base.
13. **PROIBIDO** cards com fundo escuro em tema light.
14. **PROIBIDO** texto com contraste insuficiente.
15. **PROIBIDO** elementos interativos sem feedback visual de hover/focus.
16. **PROIBIDO** placeholders de cor/imagem em produção. Tudo deve ser final e consistente.
17. **PROIBIDO** misturar padrões de espaçamento (rem + px arbitrário). Usar a scale.
18. **PROIBIDO** componentes sem bordas definidas flutuando sobre background do mesmo tom (card branco sobre fundo branco sem border = PROIBIDO).
19. **PROIBIDO** fontes sem carregamento otimizado (usar `next/font` para Inter).
20. **PROIBIDO** scroll horizontal na página em qualquer viewport (exceto tabelas com indicador de scroll e carousels).

---

## 9. INSTRUÇÕES DE IMPLEMENTAÇÃO

### 9.1 Estrutura de Arquivos (Padronizar)

```
components/
├── ui/                     # Componentes primitivos (Button, Input, Card, Badge, etc.)
│   ├── button.tsx
│   ├── input.tsx
│   ├── card.tsx
│   ├── badge.tsx
│   ├── dialog.tsx
│   ├── select.tsx
│   ├── toast.tsx
│   ├── skeleton.tsx
│   ├── data-table.tsx
│   ├── breadcrumbs.tsx
│   ├── empty-state.tsx
│   ├── search-input.tsx
│   ├── quantity-selector.tsx
│   ├── price-display.tsx
│   └── status-badge.tsx
├── layout/                  # Componentes de layout
│   ├── header.tsx
│   ├── footer.tsx
│   ├── dashboard-sidebar.tsx
│   ├── page-header.tsx      # [NEW] Título + breadcrumb + actions da página
│   └── container.tsx        # [NEW] Wrapper com max-width e padding
├── product/                 # [NEW] Componentes específicos de produto
│   ├── product-card.tsx
│   ├── product-grid.tsx
│   └── product-filters.tsx
├── cart/                    # [NEW] Componentes específicos do carrinho
│   ├── cart-item.tsx
│   ├── cart-summary.tsx
│   └── cart-empty.tsx
├── order/                   # Componentes de pedidos
│   ├── order-table.tsx
│   └── order-status.tsx
└── charts/                  # Componentes de gráficos
    └── ...
```

### 9.2 Ordem de Execução

**FASE 1 — Foundation (executar primeiro, sem pular)**
1. Atualizar `globals.css` com todos os design tokens da seção 1.
2. Configurar `next/font` para Inter no `layout.tsx` root.
3. Refatorar todos os componentes em `components/ui/` para usar design tokens.
4. Criar `components/layout/container.tsx` e `components/layout/page-header.tsx`.

**FASE 2 — Layout Shell**
5. Refatorar `components/header.tsx` conforme seção 2.2.
6. Refatorar `components/dashboard-sidebar.tsx` conforme seção 2.3.
7. Refatorar `components/footer.tsx` conforme seção 2.4.
8. Atualizar layouts do dashboard (fornecedor, cliente, admin) para usar nova sidebar + top bar.

**FASE 3 — Public Pages**
9. Refatorar `/app/page.tsx` (Landing) conforme seção 4.1.
10. Refatorar pages de auth conforme seção 4.2.
11. Refatorar `/app/catalogo/` e `/app/fornecedores/` conforme seção 4.4.

**FASE 4 — Dashboard Pages**
12. Refatorar dashboard home pages (fornecedor, cliente, admin) conforme seção 4.3.
13. Refatorar todas as sub-pages do dashboard (produtos, pedidos, clientes, estoque, preços, etc.) usando page-header + data-table + card refinados.

**FASE 5 — E-Commerce Flow**
14. Refatorar `/app/carrinho/` conforme seção 4.5.
15. Refatorar `/app/checkout/` conforme seção 4.6.
16. Refatorar `/app/pedidos/` com nova data-table e status badges.

**FASE 6 — Polish**
17. Implementar todas as micro-interações da seção 6.
18. Verificar todos os empty states.
19. Implementar skeletons em todas as páginas com data fetching.
20. Audit de acessibilidade (contrast, focus, aria).
21. Audit de responsividade em todos os breakpoints.

### 9.3 Checklist de Validação Final

Antes de considerar QUALQUER componente ou página como finalizado, verificar:

- [ ] Usa EXCLUSIVAMENTE design tokens (cores, fonts, spacing, radius, shadows)?
- [ ] Todos os estados de interação estão implementados (hover, focus, active, disabled, loading)?
- [ ] Responsivo em todos os breakpoints (mobile, tablet, desktop, wide)?
- [ ] Contraste de texto atende WCAG AA (4.5:1)?
- [ ] Elementos interativos têm `focus-visible` estilo?
- [ ] Animações usam `cubic-bezier`, não `linear`?
- [ ] Sem `!important` no CSS?
- [ ] Sem valores hardcoded (px, cores hex, etc.)?
- [ ] Layout segue grid/container system definido?
- [ ] Tipografia segue a hierarquia visual obrigatória?
- [ ] Espaçamento segue a escala de 4px?
- [ ] Cards têm border quando sobre fundo de mesma cor?
- [ ] Empty states implementados?
- [ ] Loading states (skeleton) implementados?

---

## 10. PRINCÍPIOS IMUTÁVEIS

1. **Consistência acima de tudo**: Um mesmo tipo de elemento DEVE ter exatamente a mesma aparência em qualquer lugar da aplicação.
2. **Hierarquia visual clara**: O olho do usuário deve ser guiado naturalmente: título → conteúdo principal → ações → informações secundárias.
3. **Whitespace é premium**: Não ter medo de espaço vazio. Mais whitespace = mais profissional. Referência: Stripe.
4. **Densidade informacional controlada**: Dashboards devem ser informativos, mas nunca sobrecarregados. Máximo 4 KPIs no topo. Máximo 1 gráfico + 1 tabela na home.
5. **Progressive disclosure**: Não mostrar tudo de uma vez. Usar collapses, modals, drawers e popovers para informação secundária.
6. **Feedback instantâneo**: Toda ação do usuário DEVE ter feedback visual imediato (hover, click, loading, success, error).
7. **Mobile-first responsive**: Desenhar primeiro para mobile, expandir para desktop. Não o contrário.
8. **Performance perceptual**: Skeletons > spinners. Transições suaves > mudanças abruptas. O app deve parecer rápido mesmo quando não é.

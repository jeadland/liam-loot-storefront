# Liam’s Loot Storefront

Minecraft meets sports trading cards — a tiny storefront for Liam’s 3D-printed fidgets.

## Preview (local)

```bash
cd liam-loot-storefront
npm run dev
```

Then open:
- http://localhost:5173

If you’re running this on another machine (like a Pi), bind explicitly:

```bash
npx http-server -p 5173 -a 0.0.0.0 -c-1
```

## Add / remove products (under 2 minutes)

**Single source of truth:** `data/products.json`

### 1) Add images
Create a folder:

```
assets/products/<product-id>/
```

Add these files:
- `card.svg` (or `card.png`) used in the shop grid
- `hero.svg` (or `hero.png`) used on the product page

Example:
```
assets/products/fidget-ring/card.png
assets/products/fidget-ring/hero.png
```

### 2) Add the product block
Open `data/products.json` and copy an existing product object.

Update:
- `id` (must match the folder name)
- `name`
- `price`
- `badge` (optional)
- `tags` (used for filters)
- `description`
- `images.card` + `images.hero`
- `options` (like color)

Save. Refresh the page. The product appears automatically.

## Checkout behavior (NOT real e-commerce)
- Collects: first name (required), optional class/teacher, optional note, payment method (Venmo/Zelle)
- Generates an order code like `LL-2048`
- Shows payment instructions + exact note format
- Shows a timeline: Requested → Paid → Crafting → Delivered

### Where orders go (simplest option)
Right now orders are stored in **localStorage** in the buyer’s browser (`ll_orders`).

If you want admin email + a shared database, the recommended upgrade is **Google Apps Script + Google Sheet**.

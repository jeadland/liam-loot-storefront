# Liam's Loot Storefront

Minecraft meets sports trading cards — a tiny, delightful storefront for Liam's 3D-printed fidgets.

## Features

### Aesthetic
- **Minecraft vibes**: Pixel fonts for headings, blocky inventory slots, pixel grid backgrounds, enchantment glow on legendary items
- **Sports card elements**: Trading card layouts, stat bars with animated fills, jersey-number badges, trophy icons
- **Enchantment effects**: Legendary items shimmer with animated borders and glows (just like Minecraft enchanted items!)
- **Smooth animations**: Spring-based micro-interactions, satisfying button press feedback, hover states that lift and glow

### Delightful Micro-interactions
- **Add to cart burst**: Colorful particles explode toward the cart counter when adding items
- **Victory confetti**: 30 particle confetti blast on order confirmation
- **Button bounce**: Satisfying press-in feedback with pop animation
- **Card hover**: Trading cards lift, glow, and a holographic shimmer sweeps across
- **Quest tracker pulse**: Active step pulses with golden glow
- **Stat bar shine**: Animated shine effect slides across power-up stat bars

### Pages & Flow
1. **Shop**: Inventory-style grid with tag filters (game button style), enchanted borders on legendary items
2. **Product Detail**: Full trading card view with animated stat bars, color swatches, quantity picker
3. **Cart ("Loot Chest")**: Review items before checkout
4. **Checkout**: Visual quest tracker showing progress through steps
5. **Confirmation**: Victory banner with confetti, achievement badges, XP rewards, quest timeline
6. **About**: Charming story about Liam
7. **Craft Requests**: Custom build request form (stored in localStorage)

### Achievement System
Unlocks achievements based on order count:
- **First Loot** (1 order)
- **Collector** (3 orders)
- **Power Player** (5 orders)
- **Legend** (10 orders)

Each achievement shows with animated badge and XP rewards on confirmation page.

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
- Shows a visual quest tracker timeline: Requested → Paid → Crafting → Delivered
- Victory celebration with confetti and stat rewards

### Where orders go (simplest option)
Right now orders are stored in **localStorage** in the buyer's browser (`ll_orders`).
Craft requests are also stored in localStorage (`ll_crafts`).

**To view all orders/crafts (for admins):**
Open the browser console (F12) and run:
```javascript
// View all orders
console.table(JSON.parse(localStorage.getItem('ll_orders') || '[]'))

// View all craft requests
console.table(JSON.parse(localStorage.getItem('ll_crafts') || '[]'))
```

**Upgrade to email notifications:**
If you want automatic email notifications when orders/crafts come in, the recommended approach is **Google Apps Script + Google Sheet**:
1. Create a Google Sheet with columns: Timestamp, Type (Order/Craft), OrderCode, Name, ClassTeacher, Details, Status
2. Create a Google Apps Script web app that receives POST requests
3. Replace the localStorage calls in `app.js` with fetch() calls to your script URL
4. The script appends rows to the sheet and sends you an email

Example Apps Script endpoint (for reference):
```javascript
function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSheet();
  const data = JSON.parse(e.postData.contents);
  sheet.appendRow([new Date(), data.type, data.orderCode, data.name, data.classTeacher, data.details, data.status]);
  MailApp.sendEmail({
    to: 'your@email.com',
    subject: `New ${data.type}: ${data.orderCode}`,
    body: JSON.stringify(data, null, 2)
  });
  return ContentService.createTextOutput(JSON.stringify({success: true}));
}
```

## Anti-Boring Checklist ✓

- ✓ **Game UI + sports card mashup?** Pixel fonts, inventory slots, stat bars, trading card frames, enchantment glows
- ✓ **Delightful micro-interactions?** Burst particles, confetti blast, button bounce, card lift & shimmer, quest pulse
- ✓ **Visually distinct product grid?** Inventory slots with inner shadows, hover lift, enchanted borders for legendary items
- ✓ **"Quest Complete" themed confirmation?** Victory banner with shimmer animation, confetti explosion, achievement badges, XP rewards
- ✓ **Consistent & playful icons?** SVG icon set: chest, trophy, pickaxe, check, coin
- ✓ **Pixel-vibe headings, readable body?** Press Start 2P for headings/labels, Inter for descriptions/text
- ✓ **Quest tracker with visual progress?** Animated timeline with completed checkmarks, active pulse, connecting lines

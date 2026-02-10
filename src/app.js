import { loadCatalog, indexProducts, loadCart, saveCart, cartCount, cartTotal } from './store.js';
import { parseRoute, setActiveTab } from './router.js';
import { pageShop, pageProduct, pageCart, pageCheckout, pageConfirm, pageCraft, pageAbout } from './render.js';

const app = document.querySelector('#app');
const cartCountEl = document.querySelector('#cartCount');
const toast = document.querySelector('#toast');
const toastK = document.querySelector('#toastK');
const toastM = document.querySelector('#toastM');

const state = {
  catalog: null,
  productIndex: null,
  cart: loadCart(),
  filters: new Set(['all']),
  detail: { selections: {}, qty: 1 },
  checkout: { firstName: '', classTeacher: '', note: '', paymentMethod: '' },
  lastOrder: null
};

function showToast(k, m) {
  toastK.textContent = k;
  toastM.textContent = m;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 1200);
}

function burstAtCart() {
  const el = document.querySelector('#cartLink');
  if (!el) return;
  const rect = el.getBoundingClientRect();
  const x = rect.left + rect.width * 0.75;
  const y = rect.top + rect.height * 0.35;

  const colors = ['var(--diamond)', 'var(--amethyst)', 'var(--gold)', 'var(--grass)'];

  for (let i = 0; i < 12; i++) {
    const b = document.createElement('div');
    b.className = 'burst';
    b.style.left = x + 'px';
    b.style.top = y + 'px';
    b.style.background = colors[i % colors.length];
    document.body.appendChild(b);

    const angle = (Math.PI * 2 * i) / 12;
    const velocity = 50 + Math.random() * 30;
    const dx = Math.cos(angle) * velocity;
    const dy = Math.sin(angle) * velocity - 15;

    b.animate([
      { transform: 'translate(0,0) scale(1) rotate(0deg)', opacity: 1 },
      { transform: `translate(${dx * 0.6}px,${dy * 0.6}px) scale(1.1) rotate(180deg)`, opacity: 1, offset: 0.3 },
      { transform: `translate(${dx}px,${dy + 40}px) scale(0.3) rotate(360deg)`, opacity: 0 }
    ], {
      duration: 650,
      easing: 'cubic-bezier(.2,.8,.3,1)'
    }).onfinish = () => b.remove();
  }
}

function confettiBlast(x, y) {
  const colors = ['var(--diamond)', 'var(--amethyst)', 'var(--gold)', 'var(--grass)', 'var(--redstone)'];
  const shapes = ['square', 'circle'];

  for (let i = 0; i < 30; i++) {
    const c = document.createElement('div');
    c.className = `confetti ${shapes[Math.floor(Math.random() * shapes.length)]}`;
    c.style.left = x + 'px';
    c.style.top = y + 'px';
    c.style.background = colors[Math.floor(Math.random() * colors.length)];
    document.body.appendChild(c);

    const angle = (Math.PI * 2 * Math.random());
    const velocity = 80 + Math.random() * 100;
    const dx = Math.cos(angle) * velocity;
    const dy = Math.sin(angle) * velocity - 50;
    const rotation = Math.random() * 720 - 360;

    c.animate([
      { transform: 'translate(0,0) scale(1) rotate(0deg)', opacity: 1 },
      { transform: `translate(${dx * 0.5}px,${dy * 0.5}px) scale(1.2) rotate(${rotation * 0.5}deg)`, opacity: 1, offset: 0.25 },
      { transform: `translate(${dx}px,${dy + 100}px) scale(0.4) rotate(${rotation}deg)`, opacity: 0 }
    ], {
      duration: 800 + Math.random() * 400,
      easing: 'cubic-bezier(.25,.8,.25,1)'
    }).onfinish = () => c.remove();
  }
}

function updateCartUI() {
  const qty = cartCount(state.cart);
  cartCountEl.textContent = qty;
  cartCountEl.parentElement.animate(
    [{ transform: 'scale(1)' }, { transform: 'scale(1.08)' }, { transform: 'scale(1)' }],
    { duration: 240, easing: 'cubic-bezier(.2,.8,.2,1)' }
  );
}

function getDefaultSelections(product) {
  const sel = {};
  for (const opt of (product.options || [])) {
    const first = opt.values?.[0];
    if (first) sel[opt.id] = first.id;
  }
  return sel;
}

function addLine(productId, { qty = 1, selections = null } = {}) {
  const p = state.productIndex.get(productId);
  if (!p) return;
  const sel = selections || getDefaultSelections(p);

  const line = {
    lineId: crypto.randomUUID(),
    productId,
    qty,
    selections: sel
  };

  state.cart = [...state.cart, line];
  saveCart(state.cart);
  updateCartUI();
  showToast('+1 LOOT', `${p.name} → Loot Chest!`);
  burstAtCart();
}

function dropLine(index) {
  state.cart.splice(index, 1);
  saveCart(state.cart);
  updateCartUI();
  render();
}

function clearCart() {
  state.cart = [];
  saveCart(state.cart);
  updateCartUI();
}

function filteredProducts() {
  const f = state.filters;
  const products = state.catalog.products;
  if (f.has('all') || f.size === 0) return products;

  return products.filter(p => {
    const tags = new Set((p.tags || []).map(t => t.toLowerCase()));
    const badgeKind = (p.badge?.kind || p.badge?.label || '').toLowerCase();

    // any-match
    for (const id of f) {
      if (id === 'new' && badgeKind.includes('new')) return true;
      if (id === 'bestSeller' && badgeKind.includes('best')) return true;
      if (tags.has(id)) return true;
    }
    return false;
  });
}

function buildCartLines() {
  return state.cart.map(line => {
    const p = state.productIndex.get(line.productId);
    const shortNum = p.id.split('-')[0].slice(0, 2).toUpperCase();

    let optionSummary = '';
    const opts = p.options || [];
    for (const opt of opts) {
      const chosenId = line.selections?.[opt.id];
      const chosen = opt.values?.find(v => v.id === chosenId);
      if (chosen) optionSummary = chosen.label;
    }

    const qty = line.qty || 1;
    return {
      name: p.name,
      qty,
      badge: p.badge,
      shortNum,
      optionSummary,
      lineTotal: p.price * qty
    };
  });
}

function validateCheckout() {
  if (!state.checkout.firstName.trim()) return 'First name is required.';
  if (!state.checkout.paymentMethod) return 'Choose Venmo or Zelle.';
  return null;
}

function genOrderCode() {
  const n = Math.floor(1000 + Math.random() * 9000);
  return `LL-${n}`;
}

async function submitOrder() {
  const err = validateCheckout();
  if (err) {
    showToast('NOPE', err);
    return;
  }

  // Simplest reliable option: local log (localStorage)
  // (If you later want email+sheet backend, swap this out for Apps Script.)
  const orderCode = genOrderCode();
  const order = {
    orderCode,
    createdAt: new Date().toISOString(),
    firstName: state.checkout.firstName.trim(),
    classTeacher: state.checkout.classTeacher.trim(),
    note: state.checkout.note.trim(),
    paymentMethod: state.checkout.paymentMethod,
    lines: state.cart,
    status: 'Requested'
  };

  const prev = JSON.parse(localStorage.getItem('ll_orders') || '[]');
  prev.push(order);
  localStorage.setItem('ll_orders', JSON.stringify(prev));

  state.lastOrder = order;
  clearCart();
  location.hash = '#/confirm';
  showToast('QUEST!', `Order ${orderCode} requested.`);
}

function render() {
  const route = parseRoute(location.hash);
  setActiveTab(route.name);

  const catalog = state.catalog;
  const qty = cartCount(state.cart);

  if (route.name === 'shop') {
    const filtered = filteredProducts();
    // clone catalog with filtered products
    const c2 = { ...catalog, products: filtered };
    app.innerHTML = pageShop({ catalog: c2, filters: state.filters, cartQty: qty });

    // chip handlers
    app.querySelectorAll('[data-chip]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.chip;
        if (id === 'all') {
          state.filters = new Set(['all']);
        } else {
          if (state.filters.has('all')) state.filters.delete('all');
          if (state.filters.has(id)) state.filters.delete(id);
          else state.filters.add(id);
          if (state.filters.size === 0) state.filters.add('all');
        }
        render();
      });
    });

    app.querySelectorAll('[data-add]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        addLine(btn.dataset.add);
      });
    });

    updateCartUI();
    return;
  }

  if (route.name === 'product') {
    const p = state.productIndex.get(route.id);
    if (!p) { location.hash = '#/shop'; return; }

    // init detail state when switching product
    if (state.detail.productId !== p.id) {
      state.detail = { productId: p.id, selections: getDefaultSelections(p), qty: 1 };
    }

    app.innerHTML = pageProduct({ product: p, selections: state.detail.selections, qty: state.detail.qty });

    app.querySelectorAll('.slot[data-opt][data-val]').forEach(s => {
      s.addEventListener('click', () => {
        app.querySelectorAll('.slot').forEach(x => x.classList.remove('active'));
        s.classList.add('active');
        const opt = s.dataset.opt;
        const val = s.dataset.val;
        state.detail.selections[opt] = val;

        // update label
        const option = (p.options || []).find(o => o.id === opt);
        const chosen = option?.values?.find(v => v.id === val);
        const name = chosen?.label || '';
        const el = document.querySelector('#selName');
        if (el) el.textContent = name;
      });
    });

    app.querySelectorAll('[data-qty]').forEach(b => {
      b.addEventListener('click', () => {
        const delta = parseInt(b.dataset.qty, 10);
        state.detail.qty = Math.max(1, state.detail.qty + delta);
        const qEl = document.querySelector('#qty');
        if (qEl) qEl.textContent = String(state.detail.qty);
      });
    });

    const addBtn = app.querySelector('[data-add-detail]');
    if (addBtn) addBtn.addEventListener('click', () => {
      addLine(p.id, { qty: state.detail.qty, selections: { ...state.detail.selections } });
    });

    updateCartUI();
    return;
  }

  if (route.name === 'cart') {
    const lines = buildCartLines();
    const total = cartTotal(state.cart, state.productIndex);
    app.innerHTML = pageCart({ lines, total });

    app.querySelectorAll('[data-drop]').forEach(btn => {
      btn.addEventListener('click', () => dropLine(parseInt(btn.dataset.drop, 10)));
    });

    updateCartUI();
    return;
  }

  if (route.name === 'checkout') {
    const total = cartTotal(state.cart, state.productIndex);
    app.innerHTML = pageCheckout({ total, values: state.checkout, payment: state.catalog.payment });

    const $ = (id) => app.querySelector(id);

    const bind = () => {
      state.checkout.firstName = $('#firstName').value;
      state.checkout.classTeacher = $('#classTeacher').value;
      state.checkout.note = $('#note').value;
      state.checkout.paymentMethod = $('#paymentMethod').value;
    };

    ['#firstName', '#classTeacher', '#note', '#paymentMethod'].forEach(sel => {
      $(sel).addEventListener('input', bind);
      $(sel).addEventListener('change', bind);
    });

    app.querySelector('[data-submit-order]').addEventListener('click', submitOrder);

    updateCartUI();
    return;
  }

  if (route.name === 'confirm') {
    const last = state.lastOrder || JSON.parse(localStorage.getItem('ll_orders') || '[]').slice(-1)[0];
    if (!last) { location.hash = '#/shop'; return; }

    app.innerHTML = pageConfirm({
      orderCode: last.orderCode,
      paymentMethod: last.paymentMethod,
      payment: state.catalog.payment,
      values: last
    });

    const clearBtn = app.querySelector('[data-clear-cart]');
    if (clearBtn) clearBtn.addEventListener('click', () => {
      clearCart();
      showToast('GG', 'Loot chest cleared.');
      location.hash = '#/shop';
    });

    // Trigger victory confetti
    const banner = app.querySelector('[data-confetti]');
    if (banner) {
      const rect = banner.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      setTimeout(() => confettiBlast(centerX, centerY), 150);
    }

    updateCartUI();
    return;
  }

  if (route.name === 'craft') {
    app.innerHTML = pageCraft();
    const btn = app.querySelector('[data-craft-submit]');
    if (btn) btn.addEventListener('click', () => {
      const name = document.querySelector('#cName')?.value || '';
      const where = document.querySelector('#cWhere')?.value || '';
      const req = document.querySelector('#cReq')?.value || '';

      if (!name.trim() || !req.trim()) {
        showToast('NOPE', 'Name and request are required.');
        return;
      }

      // Save craft request
      const craftRequest = {
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        name: name.trim(),
        classTeacher: where.trim(),
        request: req.trim(),
        status: 'Requested'
      };

      const prev = JSON.parse(localStorage.getItem('ll_crafts') || '[]');
      prev.push(craftRequest);
      localStorage.setItem('ll_crafts', JSON.stringify(prev));

      showToast('CRAFT!', 'Request saved. Talk to Liam at school.');

      // Clear form
      document.querySelector('#cName').value = '';
      document.querySelector('#cWhere').value = '';
      document.querySelector('#cReq').value = '';
    });
    updateCartUI();
    return;
  }

  if (route.name === 'about') {
    app.innerHTML = pageAbout();
    updateCartUI();
    return;
  }
}

async function boot() {
  state.catalog = await loadCatalog();
  state.productIndex = indexProducts(state.catalog.products);

  window.addEventListener('hashchange', render);
  updateCartUI();
  render();
}

boot();

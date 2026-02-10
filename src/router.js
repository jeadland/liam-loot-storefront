export function parseRoute(hash) {
  const h = (hash || '#/shop').replace(/^#/, '');
  const parts = h.split('/').filter(Boolean);
  const [root, a, b] = parts;

  if (!root) return { name: 'shop' };
  if (root === 'shop') return { name: 'shop' };
  if (root === 'product' && a) return { name: 'product', id: a };
  if (root === 'cart') return { name: 'cart' };
  if (root === 'checkout') return { name: 'checkout' };
  if (root === 'confirm') return { name: 'confirm' };
  if (root === 'craft') return { name: 'craft' };
  if (root === 'about') return { name: 'about' };

  return { name: 'shop' };
}

export function setActiveTab(routeName) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  const map = { shop: 'shop', product: 'shop', cart: 'shop', checkout: 'shop', confirm: 'shop', craft: 'craft', about: 'about' };
  const key = map[routeName] || 'shop';
  const el = document.querySelector(`.tab[data-tab="${key}"]`);
  if (el) el.classList.add('active');
}

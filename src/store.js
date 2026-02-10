export async function loadCatalog() {
  const res = await fetch('/data/products.json', { cache: 'no-store' });
  if (!res.ok) throw new Error(`Failed to load products.json (${res.status})`);
  return await res.json();
}

export function indexProducts(products) {
  return new Map(products.map(p => [p.id, p]));
}

export function loadCart() {
  return JSON.parse(localStorage.getItem('ll_cart') || '[]');
}

export function saveCart(cart) {
  localStorage.setItem('ll_cart', JSON.stringify(cart));
}

export function cartCount(cart) {
  return cart.reduce((s, it) => s + (it.qty || 1), 0);
}

export function cartTotal(cart, productIndex) {
  return cart.reduce((sum, line) => {
    const p = productIndex.get(line.productId);
    if (!p) return sum;
    return sum + p.price * (line.qty || 1);
  }, 0);
}

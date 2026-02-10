const escapeHtml = (s) => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

const badgeClass = (kind) => {
  if (!kind) return 'rare';
  const k = kind.toLowerCase();
  if (k.includes('best')) return 'bestSeller';
  if (k.includes('new')) return 'new';
  if (k.includes('legend')) return 'legend';
  return 'rare';
};

const parseStats = (statsLine) => {
  if (!statsLine) return [];
  // Parse "Spin: FAST • Click: MED • Pocket: YES" format
  const parts = statsLine.split('•').map(s => s.trim());
  const stats = [];
  const valueMap = {
    'FAST': 90, 'HIGH': 85, 'MED': 60, 'MEDIUM': 60, 'LOW': 35,
    'SNAPPY': 85, 'YES': 95, 'NO': 10, '+10': 100
  };

  for (const part of parts) {
    const [label, val] = part.split(':').map(s => s.trim());
    if (label && val) {
      const percent = valueMap[val.toUpperCase()] || 50;
      stats.push({ label, value: percent });
    }
  }
  return stats;
};

const getAchievements = () => {
  const orders = JSON.parse(localStorage.getItem('ll_orders') || '[]');
  const orderCount = orders.length;
  const achievements = [];

  if (orderCount === 1) {
    achievements.push({ label: 'FIRST LOOT', class: 'new', icon: 'trophy' });
  }
  if (orderCount >= 3) {
    achievements.push({ label: 'COLLECTOR', class: 'rare', icon: 'chest' });
  }
  if (orderCount >= 5) {
    achievements.push({ label: 'POWER PLAYER', class: 'bestSeller', icon: 'trophy' });
  }
  if (orderCount >= 10) {
    achievements.push({ label: 'LEGEND', class: 'legend', icon: 'trophy' });
  }

  // Always show the current order badge
  achievements.unshift({ label: `+1 ORDER`, class: 'bestSeller', icon: 'check' });

  return achievements;
};

export function pageShop({ catalog, filters, cartQty }) {
  const { shop } = catalog;
  const chips = [
    { id: 'all', label: 'ALL' },
    { id: 'new', label: 'NEW' },
    { id: 'bestSeller', label: 'BEST' },
    { id: 'common', label: 'COMMON' },
    { id: 'rare', label: 'RARE' },
    { id: 'legend', label: 'LEGEND' },
    { id: 'pocket', label: 'POCKET' },
    { id: 'quiet', label: 'QUIET' },
    { id: 'clicky', label: 'CLICKY' },
    { id: 'focus', label: 'FOCUS' }
  ];

  return `
  <section class="hero">
    <div class="panel pixel-grid"><div class="panel__inner">
      <h1 class="h1">${escapeHtml(shop.tagline)}</h1>
      <p class="sub">Made on my 3D printer. Tested by my hands. Approved by vibes.</p>
      <div class="row">
        <a class="btn gold px" href="#/shop"><svg class="ico" style="color:var(--diamond)"><use href="#i-pickaxe"></use></svg> BROWSE POWER-UPS</a>
        <a class="btn px" href="#/craft"><svg class="ico" style="color:var(--grass)"><use href="#i-check"></use></svg> CRAFT REQUEST</a>
      </div>
      <div class="divider"></div>
      <p class="micro">${escapeHtml(shop.finePrint)}</p>
    </div></div>

    <div class="panel"><div class="panel__inner">
      <div class="px" style="font-size:10px;color:var(--diamond);margin-bottom:8px;">SCOREBOARD</div>
      <p class="micro"><b>Today’s goal:</b> 10 crafted.<br><b>Current:</b> <span style="color:var(--grass);font-weight:800;">${Math.min(cartQty,10)}</span> in loot • <span style="color:var(--gold);font-weight:800;">${Math.max(10 - cartQty,0)}</span> to go.</p>
      <div class="divider"></div>
      <p class="micro"><b>Hot tip:</b> Pick a color that matches your backpack.</p>
    </div></div>
  </section>

  <section style="margin-top:18px;">
    <div class="row" style="justify-content:space-between;align-items:flex-end;">
      <div>
        <div class="px" style="font-size:10px;color:var(--diamond);margin-bottom:8px;">FILTERS</div>
        <div class="micro">Tap tags like game buttons. No boring dropdowns.</div>
      </div>
      <a class="btn px" href="#/cart"><svg class="ico"><use href="#i-chest"></use></svg> OPEN LOOT CHEST</a>
    </div>

    <div class="row" style="margin-top:12px;">
      ${chips.map(ch => `
        <button class="tab px chip ${filters.has(ch.id) ? 'active' : ''}" data-chip="${ch.id}" type="button">${ch.label}</button>
      `).join('')}
    </div>

    <div class="grid inv" style="margin-top:16px;">
      ${catalog.products.map(p => {
        const isLegend = badgeClass(p.badge?.kind || p.badge?.label) === 'legend';
        return `
        <div class="inv-slot">
          <a class="card ${isLegend ? 'enchanted' : ''}" href="#/product/${p.id}" data-open="${p.id}">
            <div class="glow"></div>
            <div class="holo"></div>
            <div class="card__top">
              <span class="badge num">#${escapeHtml(p.shortCode || p.id.slice(0,2).toUpperCase())}</span>
              <span class="badge ${badgeClass(p.badge?.kind || p.badge?.label)}">${escapeHtml(p.badge?.label || 'POWER-UP')}</span>
            </div>
            <img class="card__img" src="${escapeHtml(p.images.card)}" alt="${escapeHtml(p.name)}" />
            <div class="card__mid">
              <div class="card__name">${escapeHtml(p.name)}</div>
              <p class="card__desc">${escapeHtml(p.description)}</p>
              <div class="card__stats">${escapeHtml(p.statsLine || '')}</div>
            </div>
            <div class="card__bot">
              <div class="price">$${p.price}</div>
              <button class="btn px" type="button" data-add="${p.id}"><svg class="ico"><use href="#i-chest"></use></svg> ADD TO LOOT</button>
            </div>
          </a>
        </div>
      `}).join('')}
    </div>
  </section>
  `;
}

export function pageProduct({ product, selections, qty }) {
  const opt = (product.options || [])[0];
  const values = opt?.values || [];
  const selected = values.find(v => v.id === selections[opt?.id]) || values[0];
  const stats = parseStats(product.statsLine);
  const isLegend = badgeClass(product.badge?.kind || product.badge?.label) === 'legend';

  return `
  <section class="split" style="margin-top:18px;">
    <div class="panel pixel-grid"><div class="panel__inner">
      <div class="px" style="font-size:10px;color:var(--diamond);margin-bottom:8px;">TRADING CARD VIEW</div>
      <div class="card ${isLegend ? 'enchanted' : ''}">
        <div class="glow" style="opacity:.9"></div>
        <div class="holo"></div>
        <div class="card__top">
          <span class="badge num">#${escapeHtml(product.shortCode || product.id.slice(0,2).toUpperCase())}</span>
          <span class="badge ${badgeClass(product.badge?.kind || product.badge?.label)}">${escapeHtml(product.badge?.label || 'POWER-UP')}</span>
        </div>
        <img class="card__img" src="${escapeHtml(product.images.hero)}" alt="${escapeHtml(product.name)}" />
        <div class="card__mid">
          <div class="card__name">${escapeHtml(product.name)}</div>
          <p class="card__desc">${escapeHtml(product.description)}</p>
          <div class="divider"></div>
          <div class="px" style="font-size:9px;color:var(--muted);margin-bottom:10px;">POWER-UP STATS</div>
          ${stats.map(st => `
            <div class="stat-bar">
              <div class="stat-bar__label">${escapeHtml(st.label.toUpperCase())}</div>
              <div class="stat-bar__track"><div class="stat-bar__fill" style="width:${st.value}%"></div></div>
              <div class="stat-bar__value">${st.value}</div>
            </div>
          `).join('')}
        </div>
        <div class="card__bot">
          <div class="price">$${product.price}</div>
          <div class="micro">Pickup: school</div>
        </div>
      </div>
      <p class="micro" style="margin-top:14px;">Short version: pocket power-up. Focus goes brrrr.</p>
    </div></div>

    <div class="panel"><div class="panel__inner">
      <div class="px" style="font-size:10px;color:var(--diamond);margin-bottom:8px;">CHOOSE YOUR BUILD</div>
      <h2 class="h2">${escapeHtml(product.name)}</h2>
      <div class="micro"><b>${escapeHtml(product.statsLine || '')}</b></div>

      <div class="field">
        <label>${escapeHtml(opt?.name || 'Options')}</label>
        <div class="slots" id="slots">
          ${values.map((v, i) => {
            const isActive = selected?.id === v.id;
            const bg = v.swatch.startsWith('linear-gradient') ? v.swatch : v.swatch;
            return `
              <div class="slot ${isActive ? 'active' : ''}" data-opt="${escapeHtml(opt.id)}" data-val="${escapeHtml(v.id)}"
                style="background: linear-gradient(180deg, rgba(255,255,255,.08), transparent), radial-gradient(circle at 30% 25%, rgba(255,255,255,.18), transparent 55%), ${bg};">
              </div>
            `;
          }).join('')}
        </div>
        <div class="micro">Selected: <b id="selName">${escapeHtml(selected?.label || '')}</b></div>
      </div>

      <div class="field">
        <label>QUANTITY</label>
        <div class="row">
          <button class="btn px" type="button" data-qty="-1">-</button>
          <div class="badge" style="min-width:58px;text-align:center;"><span id="qty">${qty}</span></div>
          <button class="btn px" type="button" data-qty="1">+</button>
        </div>
      </div>

      <div class="row" style="margin-top:10px;">
        <button class="btn gold px" type="button" data-add-detail="${escapeHtml(product.id)}"><svg class="ico"><use href="#i-chest"></use></svg> ADD TO LOOT CHEST</button>
        <a class="btn px" href="#/craft"><svg class="ico"><use href="#i-pickaxe"></use></svg> CRAFT REQUEST</a>
      </div>

      <div class="divider"></div>
      <div class="micro">
        <b>Mini FAQ</b><br>
        • <b>How long?</b> Usually 1–2 school days.<br>
        • <b>Team colors?</b> Yep. Pick two colors and I’ll try.<br>
        • <b>Refunds?</b> If it breaks in the first week, I’ll fix it once.
      </div>
    </div></div>
  </section>
  `;
}

export function pageCart({ lines, total }) {
  return `
  <section class="split" style="margin-top:18px;">
    <div class="panel"><div class="panel__inner">
      <div class="px" style="font-size:10px;color:var(--diamond);margin-bottom:8px;">LOOT CHEST</div>
      <h1 class="h1">Your cart</h1>
      <p class="sub">Double-check your loot before you spawn.</p>

      ${lines.length === 0 ? `
        <div class="panel pixel-grid" style="box-shadow:none;">
          <div class="panel__inner">
            <div class="micro"><b>Your loot chest is empty.</b><br>Go grab a power-up.</div>
            <div class="divider"></div>
            <a class="btn gold px" href="#/shop"><svg class="ico"><use href="#i-pickaxe"></use></svg> BROWSE SHOP</a>
          </div>
        </div>
      ` : `
        <div style="display:flex;flex-direction:column;gap:10px;">
          ${lines.map((ln, idx) => `
            <div class="card" style="box-shadow:none;">
              <div class="glow" style="opacity:.35"></div>
              <div class="card__top">
                <span class="badge num">#${escapeHtml(ln.shortNum)}</span>
                <span class="badge ${badgeClass(ln.badge?.kind || ln.badge?.label)}">${escapeHtml(ln.badge?.label || 'POWER-UP')}</span>
              </div>
              <div class="card__mid" style="padding-top:10px;">
                <div class="row" style="justify-content:space-between;align-items:flex-start;">
                  <div>
                    <div class="card__name" style="margin:0;">${escapeHtml(ln.name)}</div>
                    <div class="micro">${ln.optionSummary ? `Option: <b>${escapeHtml(ln.optionSummary)}</b> • ` : ''}Qty: <b>${ln.qty}</b></div>
                  </div>
                  <div class="price">$${ln.lineTotal}</div>
                </div>
              </div>
              <div class="card__bot">
                <button class="btn px" type="button" data-drop="${idx}">DROP</button>
                <div class="micro">Keep your loot safe.</div>
              </div>
            </div>
          `).join('')}
        </div>
      `}
    </div></div>

    <div class="panel pixel-grid"><div class="panel__inner">
      <div class="px" style="font-size:10px;color:var(--diamond);margin-bottom:8px;">SCOREBOARD</div>
      <div class="micro"><b>ITEMS:</b> <span style="color:var(--diamond);font-weight:800;">${lines.length}</span></div>
      <div class="micro" style="margin-top:6px;"><b>TOTAL:</b> <span style="color:var(--gold);font-weight:800;">$${total}</span></div>
      <div class="divider"></div>
      <div class="row">
        <a class="btn gold px" href="#/checkout" ${lines.length===0?'style="pointer-events:none;opacity:.5"':''}><svg class="ico"><use href="#i-check"></use></svg> CHECKOUT</a>
        <a class="btn px" href="#/shop"><svg class="ico"><use href="#i-pickaxe"></use></svg> MORE LOOT</a>
      </div>
      <div class="divider"></div>
      <div class="micro">Payment: Venmo or Zelle. Delivery: school hand-off.</div>
    </div></div>
  </section>
  `;
}

export function pageCheckout({ total, values, payment }) {
  return `
  <section class="split" style="margin-top:18px;">
    <div class="panel"><div class="panel__inner">
      <div class="px" style="font-size:10px;color:var(--diamond);margin-bottom:8px;">QUEST TRACKER</div>
      <div class="quest-tracker">
        <div class="quest-step completed">
          <div class="quest-step__circle"><svg class="ico"><use href="#i-check"></use></svg></div>
          <div class="quest-step__label">CART</div>
          <div class="quest-step__line"></div>
        </div>
        <div class="quest-step active">
          <div class="quest-step__circle">2</div>
          <div class="quest-step__label">DETAILS</div>
          <div class="quest-step__line"></div>
        </div>
        <div class="quest-step">
          <div class="quest-step__circle">3</div>
          <div class="quest-step__label">PAY</div>
          <div class="quest-step__line"></div>
        </div>
        <div class="quest-step">
          <div class="quest-step__circle">4</div>
          <div class="quest-step__label">DONE</div>
        </div>
      </div>
      <div class="divider"></div>

      <h1 class="h1">Checkout</h1>
      <p class="sub">No cards. No drama. Just fidgets.</p>

      <div class="field">
        <label>BUYER FIRST NAME (REQUIRED)</label>
        <input id="firstName" value="${escapeHtml(values.firstName || '')}" placeholder="e.g., Maya" />
      </div>
      <div class="field">
        <label>CLASS / TEACHER (OPTIONAL)</label>
        <input id="classTeacher" value="${escapeHtml(values.classTeacher || '')}" placeholder="e.g., Ms. K, 5th period" />
      </div>
      <div class="field">
        <label>NOTE (OPTIONAL)</label>
        <textarea id="note" placeholder="Color request, delivery note…">${escapeHtml(values.note || '')}</textarea>
      </div>
      <div class="field">
        <label>PAYMENT METHOD (REQUIRED)</label>
        <select id="paymentMethod">
          <option value="">Choose…</option>
          <option value="Venmo" ${values.paymentMethod==='Venmo'?'selected':''}>Venmo</option>
          <option value="Zelle" ${values.paymentMethod==='Zelle'?'selected':''}>Zelle</option>
        </select>
      </div>

      <div class="row">
        <button class="btn gold px" type="button" data-submit-order><svg class="ico"><use href="#i-check"></use></svg> SUBMIT ORDER</button>
        <a class="btn px" href="#/cart">BACK</a>
      </div>

      <p class="micro" style="margin-top:10px;">After you submit, you’ll get exact payment instructions + note format.</p>
    </div></div>

    <div class="panel pixel-grid"><div class="panel__inner">
      <div class="px" style="font-size:10px;color:var(--diamond);margin-bottom:8px;">ORDER PREVIEW</div>
      <div class="micro"><b>Total:</b> <span style="color:var(--gold);font-weight:800;">$${total}</span></div>
      <div class="divider"></div>
      <div class="micro"><b>Payment targets</b><br>
        • Venmo: <b>${escapeHtml(payment.venmoHandle)}</b><br>
        • Zelle: <b>${escapeHtml(payment.zelleTarget)}</b>
      </div>
      <div class="divider"></div>
      <div class="micro"><b>Timeline</b><br>Requested → Paid → Crafting → Delivered</div>
    </div></div>
  </section>
  `;
}

export function pageConfirm({ orderCode, paymentMethod, payment, values }) {
  const noteFmt = payment.noteFormat
    .replace('{ORDER_CODE}', orderCode)
    .replace('{FIRST_NAME}', values.firstName || 'NAME');

  const to = paymentMethod === 'Venmo' ? payment.venmoHandle : payment.zelleTarget;
  const methodWord = paymentMethod === 'Venmo' ? 'Venmo' : 'Zelle';
  const achievements = getAchievements();
  const xp = achievements.length * 10;

  return `
  <section class="split" style="margin-top:18px;">
    <div class="panel pixel-grid"><div class="panel__inner">
      <div class="victory-banner" data-confetti>
        <div class="badge legend" style="display:inline-block;margin-bottom:12px;">
          <svg class="ico"><use href="#i-trophy"></use></svg> QUEST COMPLETE
        </div>
        <h1 class="h1" style="margin:12px 0;font-size:28px;text-shadow:0 0 24px rgba(255,210,74,.35);">VICTORY!</h1>
        <p class="sub" style="margin:0;font-size:16px;">Order code: <b style="color:var(--gold);font-size:20px;">${escapeHtml(orderCode)}</b></p>
      </div>

      <div class="divider"></div>
      <div class="px" style="font-size:10px;color:var(--diamond);margin-bottom:8px;">PAYMENT INSTRUCTIONS</div>
      <div class="micro">
        Send <b>${methodWord}</b> to <b>${escapeHtml(to)}</b>.<br>
        Note/Memo must be exactly:
      </div>
      <div class="badge" style="margin-top:10px;display:inline-block;">${escapeHtml(noteFmt)}</div>

      <div class="divider"></div>
      <div class="px" style="font-size:10px;color:var(--diamond);margin-bottom:8px;">QUEST TRACKER</div>
      <div class="quest-tracker">
        <div class="quest-step completed">
          <div class="quest-step__circle"><svg class="ico"><use href="#i-check"></use></svg></div>
          <div class="quest-step__label">REQUEST</div>
          <div class="quest-step__line"></div>
        </div>
        <div class="quest-step active">
          <div class="quest-step__circle">2</div>
          <div class="quest-step__label">PAY</div>
          <div class="quest-step__line"></div>
        </div>
        <div class="quest-step">
          <div class="quest-step__circle">3</div>
          <div class="quest-step__label">CRAFT</div>
          <div class="quest-step__line"></div>
        </div>
        <div class="quest-step">
          <div class="quest-step__circle">4</div>
          <div class="quest-step__label">DELIVER</div>
        </div>
      </div>

      <div class="divider"></div>
      <a class="btn gold px" href="#/shop"><svg class="ico"><use href="#i-pickaxe"></use></svg> BACK TO SHOP</a>
    </div></div>

    <div class="panel"><div class="panel__inner">
      <div class="px" style="font-size:10px;color:var(--diamond);margin-bottom:14px;">REWARDS UNLOCKED</div>
      <div class="row" style="margin-bottom:16px;gap:8px;">
        ${achievements.map(ach => `
          <span class="badge ${ach.class}"><svg class="ico"><use href="#i-${ach.icon}"></use></svg> ${escapeHtml(ach.label)}</span>
        `).join('')}
        <span class="badge rare">+${xp} XP</span>
      </div>
      <div class="px" style="font-size:10px;color:var(--diamond);margin-bottom:8px;">POWER-UP STATS</div>
      <div class="stat-bar">
        <div class="stat-bar__label">FOCUS</div>
        <div class="stat-bar__track"><div class="stat-bar__fill" style="width:85%"></div></div>
        <div class="stat-bar__value">+8</div>
      </div>
      <div class="stat-bar">
        <div class="stat-bar__label">CHILL</div>
        <div class="stat-bar__track"><div class="stat-bar__fill" style="width:70%"></div></div>
        <div class="stat-bar__value">+7</div>
      </div>
      <div class="stat-bar">
        <div class="stat-bar__label">VIBES</div>
        <div class="stat-bar__track"><div class="stat-bar__fill" style="width:95%"></div></div>
        <div class="stat-bar__value">+9</div>
      </div>
      <div class="divider"></div>
      <div class="micro"><b>Delivery</b><br>
        ${values.classTeacher ? `I’ll find you at <b>${escapeHtml(values.classTeacher)}</b>.` : `I’ll find you at school.`}
      </div>
      <div class="divider"></div>
      <button class="btn px" type="button" data-clear-cart>Clear Loot Chest</button>
    </div></div>
  </section>
  `;
}

export function pageCraft() {
  return `
  <section class="split" style="margin-top:18px;">
    <div class="panel pixel-grid"><div class="panel__inner">
      <div class="px" style="font-size:10px;color:var(--diamond);margin-bottom:8px;">CUSTOM BUILD</div>
      <h1 class="h1">Craft request</h1>
      <p class="sub">Want a special color combo? A name tag? A “match my team” build? Drop the request.</p>
      <div class="divider"></div>
      <div class="micro"><b>Craft rules:</b><br>• No weapons. No drama.<br>• School-safe only.<br>• If it’s too hard, I’ll say “not yet”.</div>
    </div></div>
    <div class="panel"><div class="panel__inner">
      <div class="px" style="font-size:10px;color:var(--diamond);margin-bottom:8px;">REQUEST FORM</div>
      <div class="field"><label>YOUR NAME</label><input id="cName" placeholder="e.g., Maya"></div>
      <div class="field"><label>CLASS / TEACHER</label><input id="cWhere" placeholder="e.g., Ms. K, 5th period"></div>
      <div class="field"><label>WHAT DO YOU WANT?</label><textarea id="cReq" placeholder="e.g., Pop Disc in Diamond + Gold. Add my jersey #12."></textarea></div>
      <div class="row">
        <button class="btn gold px" type="button" data-craft-submit><svg class="ico"><use href="#i-check"></use></svg> SEND REQUEST</button>
        <a class="btn px" href="#/shop">BACK</a>
      </div>
      <p class="micro" style="margin-top:10px;">I’ll confirm at school. No spam. Just crafting.</p>
    </div></div>
  </section>
  `;
}

export function pageAbout() {
  return `
  <section class="split" style="margin-top:18px;">
    <div class="panel pixel-grid"><div class="panel__inner">
      <div class="px" style="font-size:10px;color:var(--diamond);margin-bottom:8px;">ABOUT</div>
      <h1 class="h1">Hi, I’m Liam.</h1>
      <p class="sub">I print fidgets because building things is fun. Also: fidgets = focus power.</p>
      <div class="divider"></div>
      <p class="micro"><b>How it works:</b><br>Choose → I print → you pick up at school.</p>
    </div></div>

    <div class="panel"><div class="panel__inner">
      <div class="px" style="font-size:10px;color:var(--diamond);margin-bottom:8px;">RULES (KEEP IT CHILL)</div>
      <p class="micro">• No weapons. No drama.<br>• School-safe only.<br>• If it breaks in the first week, I’ll fix it once.<br>• Custom colors? Yes please.<br>• I’ll tell you when it’s ready at school.</p>
    </div></div>
  </section>
  `;
}

/* ═══════════════════════════════════════════════
   TALE & TEA — SHARED JAVASCRIPT
   Cart system (localStorage) + common utilities
═══════════════════════════════════════════════ */

/* ── Cart System (localStorage) ── */
const TaleCart = {
  KEY: 'tale_tea_cart',

  getAll() {
    try { return JSON.parse(localStorage.getItem(this.KEY)) || []; }
    catch { return []; }
  },

  save(cart) {
    localStorage.setItem(this.KEY, JSON.stringify(cart));
    this.updateBadges();
  },

  add(item) {
    const cart = this.getAll();
    const existing = cart.find(c => c.id === item.id);
    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({
        id: item.id,
        title: item.title,
        author: item.author,
        price: parseFloat(item.price),
        image: item.image || '',
        category: item.category || '',
        qty: 1
      });
    }
    this.save(cart);
    return cart;
  },

  remove(id) {
    let cart = this.getAll().filter(c => c.id !== id);
    this.save(cart);
    return cart;
  },

  updateQty(id, delta) {
    const cart = this.getAll();
    const item = cart.find(c => c.id === id);
    if (!item) return cart;
    item.qty += delta;
    if (item.qty < 1) return this.remove(id);
    this.save(cart);
    return cart;
  },

  clear() {
    localStorage.removeItem(this.KEY);
    this.updateBadges();
  },

  getCount() {
    return this.getAll().reduce((sum, i) => sum + i.qty, 0);
  },

  getTotal() {
    return this.getAll().reduce((sum, i) => sum + i.price * i.qty, 0);
  },

  updateBadges() {
    const count = this.getCount();
    document.querySelectorAll('.badge, .cart-count, #cart-count').forEach(el => {
      el.textContent = count;
    });
  }
};

/* ── Toast Notification ── */
function showSharedToast(message, type = 'success') {
  let container = document.querySelector('.shared-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'shared-toast-container';
    container.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:9999;display:flex;flex-direction:column;gap:8px;pointer-events:none;';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  const colors = {
    success: { bg: 'rgba(52,211,153,0.15)', border: 'rgba(52,211,153,0.3)', dot: '#34d399' },
    error:   { bg: 'rgba(248,113,113,0.15)', border: 'rgba(248,113,113,0.3)', dot: '#f87171' },
    info:    { bg: 'rgba(212,163,115,0.15)', border: 'rgba(212,163,115,0.3)', dot: '#d4a373' }
  };
  const c = colors[type] || colors.info;
  toast.style.cssText = `background:${c.bg};border:1px solid ${c.border};border-radius:10px;padding:12px 18px;font-size:13px;color:#e8e4da;display:flex;align-items:center;gap:10px;transform:translateX(120%);opacity:0;transition:all 0.3s cubic-bezier(0.4,0,0.2,1);pointer-events:auto;font-family:'Inter',system-ui,sans-serif;backdrop-filter:blur(12px);box-shadow:0 8px 32px rgba(0,0,0,0.4);`;
  toast.innerHTML = `<span style="width:8px;height:8px;border-radius:50%;background:${c.dot};flex-shrink:0;"></span>${message}`;
  container.appendChild(toast);
  requestAnimationFrame(() => {
    requestAnimationFrame(() => { toast.style.transform = 'translateX(0)'; toast.style.opacity = '1'; });
  });
  setTimeout(() => {
    toast.style.transform = 'translateX(120%)'; toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

/* ── DOM Ready ── */
document.addEventListener('DOMContentLoaded', () => {

  /* Update cart badges on every page load */
  TaleCart.updateBadges();

  /* ── Wire up "Add to Cart" buttons (main page book cards) ── */
  document.querySelectorAll('[data-cart-add]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const card = btn.closest('[data-book-id]');
      if (!card) return;
      const item = {
        id: card.dataset.bookId,
        title: card.dataset.bookTitle || '',
        author: card.dataset.bookAuthor || '',
        price: card.dataset.bookPrice || 0,
        image: card.dataset.bookImage || '',
        category: card.dataset.bookCategory || ''
      };
      TaleCart.add(item);
      showSharedToast(`"${item.title}" added to cart ✓`, 'success');
      
      // Animate button
      const origText = btn.textContent;
      btn.textContent = '✓ Added!';
      btn.style.pointerEvents = 'none';
      setTimeout(() => { btn.textContent = origText; btn.style.pointerEvents = ''; }, 1200);
    });
  });

  /* ── Wire up Book Details page "Add to Cart" button ── */
  const detailAddBtn = document.getElementById('addToCartBtn');
  if (detailAddBtn && !detailAddBtn.dataset.cartWired) {
    detailAddBtn.dataset.cartWired = 'true';
    detailAddBtn.addEventListener('click', () => {
      const container = document.querySelector('[data-book-id]') || document.querySelector('.product-info');
      const title = document.querySelector('.product-title')?.textContent || 'Book';
      const author = document.querySelector('.product-author')?.textContent?.replace('By ', '') || '';
      const priceText = document.querySelector('.price-new')?.textContent || document.querySelector('.price-old')?.textContent || '0';
      const price = parseFloat(priceText.replace(/[^0-9.]/g, '')) || 0;
      const image = document.querySelector('.product-gallery__main-img')?.src || '';
      
      const item = {
        id: 'book-' + title.toLowerCase().replace(/\s+/g, '-'),
        title, author, price, image,
        category: ''
      };
      TaleCart.add(item);
      showSharedToast(`"${title}" added to cart ✓`, 'success');
      
      // Animate
      const svg = detailAddBtn.querySelector('svg');
      const origHTML = detailAddBtn.innerHTML;
      detailAddBtn.innerHTML = (svg ? svg.outerHTML : '') + ' ✓ Added to Cart!';
      detailAddBtn.style.pointerEvents = 'none';
      setTimeout(() => { detailAddBtn.innerHTML = origHTML; detailAddBtn.style.pointerEvents = ''; }, 1500);
    });
  }

  /* ── Sign-Out Buttons ── */
  document.querySelectorAll('.signout-btn').forEach(btn => {
    if (!btn.onclick) {
      btn.addEventListener('click', () => {
        localStorage.removeItem('token');
        window.location.href = '../login/index.html';
      });
    }
  });

});

/* ============================================================
   BOOK STORE — script.js (Cratepage)
   Handles: cart state from localStorage, quantity updates, promo codes, checkout
   ============================================================ */

(function () {
  'use strict';

  /* ── State ── */
  const SHIPPING = 12.00;
  const INSURANCE = 5.50;
  const PROMOS = { 'NOCTURNE20': 0.20, 'BIBLIOPHILE10': 0.10, 'RARE15': 0.15 };

  let discountPct = 0;

  /* ── Element References ── */
  const cartItemsContainer = document.getElementById('cart-items');
  const emptyState = document.getElementById('empty-state');
  const curatorNote = document.getElementById('curator-note');
  const cartCountNav = document.getElementById('cart-count');
  const subtotalLabel = document.getElementById('subtotal-label');
  const subtotalVal = document.getElementById('subtotal-val');
  const totalVal = document.getElementById('total-val');
  const discountRow = document.getElementById('discount-row');
  const discountVal = document.getElementById('discount-val');

  const promoInput = document.getElementById('promo-input');
  const promoBtn = document.querySelector('.promo-btn');
  const promoFeedback = document.getElementById('promo-feedback');
  const checkoutBtn = document.querySelector('.checkout-btn');

  /* ── Toast Notification ── */
  function showLocalToast(message, type = 'success') {
    if (typeof showSharedToast === 'function') {
      showSharedToast(message, type);
    } else {
      alert(message);
    }
  }

  /* ── Logic Helpers ── */
  function renderCart() {
    const items = TaleCart.getAll();
    if (!cartItemsContainer) return;

    cartItemsContainer.innerHTML = '';

    if (items.length === 0) {
      checkEmpty();
      updateSummary();
      return;
    }

    items.forEach((item, index) => {
      const itemEl = document.createElement('div');
      itemEl.className = 'cart-card';
      itemEl.dataset.id = item.id;
      itemEl.dataset.price = item.price;
      itemEl.style.animationDelay = `${index * 0.1}s`;
      itemEl.innerHTML = `
        <div class="book-cover">
            <div class="book-spine"></div>
            <img src="${item.image || 'https://via.placeholder.com/150x220?text=No+Cover'}" alt="${item.title}" loading="lazy" />
        </div>
        <div class="book-info">
            <div class="book-meta-row">
                <div>
                    <span class="book-tag">${item.category || 'Literary Work'}</span>
                    <h3 class="book-title">${item.title}</h3>
                    <p class="book-author">by ${item.author}</p>
                </div>
                <p class="book-price" data-unit="${item.price}">$${(item.price * item.qty).toFixed(2)}</p>
            </div>
            <div class="book-actions">
                <div class="qty-control">
                    <button class="qty-btn" aria-label="Decrease">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                            <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                    </button>
                    <span class="qty-value" id="qty-${item.id}">${item.qty}</span>
                    <button class="qty-btn" aria-label="Increase">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                    </button>
                </div>
                <button class="remove-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                        <path d="M10 11v6M14 11v6" />
                        <path d="M9 6V4h6v2" />
                    </svg>
                    Remove
                </button>
            </div>
        </div>
      `;
      cartItemsContainer.appendChild(itemEl);
    });

    checkEmpty();
    updateSummary();
  }

  function checkEmpty() {
    const items = TaleCart.getAll();
    const remaining = items.length;
    if (emptyState) emptyState.style.display = remaining === 0 ? 'flex' : 'none';
    if (cartItemsContainer) cartItemsContainer.style.display = remaining === 0 ? 'none' : 'flex';
    if (curatorNote) curatorNote.style.display = remaining === 0 ? 'none' : 'block';
    if (cartCountNav) cartCountNav.textContent = TaleCart.getCount();
  }

  function updateSummary() {
    const subtotal = TaleCart.getTotal();
    const qty = TaleCart.getCount();
    const discount = subtotal * discountPct;
    const total = subtotal > 0 ? (subtotal - discount + SHIPPING + INSURANCE) : 0;

    if (subtotalLabel) subtotalLabel.textContent = `Subtotal (${qty} item${qty !== 1 ? 's' : ''})`;
    if (subtotalVal) subtotalVal.textContent = '$' + subtotal.toFixed(2);
    if (totalVal) totalVal.textContent = '$' + total.toFixed(2);
    if (cartCountNav) cartCountNav.textContent = qty;

    if (discountRow) {
      if (discountPct > 0 && subtotal > 0) {
        discountRow.classList.add('visible');
        if (discountVal) discountVal.textContent = '−$' + discount.toFixed(2);
      } else {
        discountRow.classList.remove('visible');
      }
    }
  }

  function changeQty(id, delta) {
    TaleCart.updateQty(id, delta);
    const item = TaleCart.getAll().find(i => i.id === id);

    if (!item) {
      const card = document.querySelector(`[data-id="${id}"]`);
      if (card) {
        card.classList.add('removing');
        setTimeout(() => {
          card.remove();
          checkEmpty();
          updateSummary();
        }, 420);
      }
    } else {
      const qtySpan = document.getElementById('qty-' + id);
      if (qtySpan) qtySpan.textContent = item.qty;

      const card = document.querySelector(`[data-id="${id}"]`);
      if (card) {
        const priceEl = card.querySelector('.book-price');
        if (priceEl) priceEl.textContent = '$' + (item.price * item.qty).toFixed(2);
      }
      updateSummary();
    }
  }

  function removeItem(id) {
    const card = document.querySelector(`[data-id="${id}"]`);
    if (!card) return;
    card.classList.add('removing');
    TaleCart.remove(id);
    setTimeout(() => {
      card.remove();
      checkEmpty();
      updateSummary();
    }, 420);
  }

  function applyPromo() {
    if (!promoInput || !promoFeedback) return;
    const code = promoInput.value.trim().toUpperCase();

    if (!code) {
      promoFeedback.className = 'promo-feedback error';
      promoFeedback.textContent = 'Please enter a code.';
      return;
    }

    if (PROMOS[code]) {
      discountPct = PROMOS[code];
      updateSummary();
      promoFeedback.className = 'promo-feedback success';
      promoFeedback.textContent = `✓ Code applied — ${(discountPct * 100).toFixed(0)}% off your order!`;
      showLocalToast('Promo code applied successfully ✓', 'success');
    } else {
      promoFeedback.className = 'promo-feedback error';
      promoFeedback.textContent = 'Invalid code. Try NOCTURNE20 or RARE15.';
    }
  }

  /* ── Event Listeners ── */
  if (cartItemsContainer) {
    cartItemsContainer.addEventListener('click', e => {
      const qtyBtn = e.target.closest('.qty-btn');
      if (qtyBtn) {
        const isIncrease = qtyBtn.getAttribute('aria-label') === 'Increase';
        const delta = isIncrease ? 1 : -1;
        const card = qtyBtn.closest('.cart-card');
        if (card && card.dataset.id) {
          changeQty(card.dataset.id, delta);
        }
        return;
      }

      const removeBtn = e.target.closest('.remove-btn');
      if (removeBtn) {
        const card = removeBtn.closest('.cart-card');
        if (card && card.dataset.id) {
          removeItem(card.dataset.id);
        }
        return;
      }
    });
  }

  if (promoBtn) {
    promoBtn.addEventListener('click', applyPromo);
  }

  if (promoInput) {
    promoInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        applyPromo();
      }
    });
  }

  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      if (TaleCart.getCount() === 0) {
        showLocalToast('Your cart is empty!', 'error');
        return;
      }
      showLocalToast('Redirecting to secure checkout…', 'success');
      setTimeout(() => {
        window.location.href = '../checkout/index.html';
      }, 1000);
    });
  }

  /* ── Init ── */
  renderCart();

})();
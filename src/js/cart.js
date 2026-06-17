/**
 * Cart Module
 * Manages cart state via localStorage + API sync, sidebar UI, and toast notifications
 */

let cart = [];
const SESSION_ID = getSessionId();

function getSessionId() {
  let id = localStorage.getItem('buyandbliss_session');
  if (!id) {
    id = 'session_' + Date.now() + '_' + Math.random().toString(36).slice(2);
    localStorage.setItem('buyandbliss_session', id);
  }
  return id;
}

export function initCart() {
  // Load cart from localStorage
  const saved = localStorage.getItem('buyandbliss_cart');
  if (saved) {
    try {
      cart = JSON.parse(saved);
    } catch {
      cart = [];
    }
  }

  // UI elements
  const cartToggle = document.getElementById('cartToggle');
  const cartClose = document.getElementById('cartClose');
  const cartOverlay = document.getElementById('cartOverlay');
  const cartSidebar = document.getElementById('cartSidebar');
  const clearCartBtn = document.getElementById('clearCartBtn');
  const checkoutBtn = document.getElementById('checkoutBtn');
  const cartShopNow = document.getElementById('cartShopNow');

  // Open cart
  cartToggle.addEventListener('click', () => openCart());

  // Close cart
  cartClose.addEventListener('click', () => closeCart());
  cartOverlay.addEventListener('click', () => closeCart());

  // Close cart on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeCart();
  });

  // Clear cart
  clearCartBtn.addEventListener('click', () => {
    cart = [];
    saveCart();
    renderCartItems();
    showToast('Cart cleared', 'success');
  });

  // Checkout
  checkoutBtn.addEventListener('click', () => {
    if (cart.length === 0) return;
    showToast('Thank you! Order placed successfully 🎉', 'success');
    cart = [];
    saveCart();
    renderCartItems();
    setTimeout(() => closeCart(), 1500);
  });

  // Shop now button in empty cart
  cartShopNow.addEventListener('click', () => closeCart());

  // Initial render
  renderCartItems();
}

function openCart() {
  document.getElementById('cartSidebar').classList.add('open');
  document.getElementById('cartOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  document.getElementById('cartSidebar').classList.remove('open');
  document.getElementById('cartOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

export function addToCart(product) {
  const existing = cart.find(item => item.productId === product.id);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1
    });
  }

  saveCart();
  renderCartItems();
  showToast(`${product.name} added to cart`, 'success');

  // Bump animation on badge
  const badge = document.getElementById('cartBadge');
  badge.classList.remove('bump');
  void badge.offsetWidth; // Force reflow
  badge.classList.add('bump');
}

function removeFromCart(productId) {
  const item = cart.find(i => i.productId === productId);
  cart = cart.filter(i => i.productId !== productId);
  saveCart();
  renderCartItems();
  if (item) showToast(`${item.name} removed from cart`, 'error');
}

function updateQuantity(productId, delta) {
  const item = cart.find(i => i.productId === productId);
  if (!item) return;

  item.quantity += delta;
  if (item.quantity <= 0) {
    removeFromCart(productId);
    return;
  }

  saveCart();
  renderCartItems();
}

function saveCart() {
  localStorage.setItem('buyandbliss_cart', JSON.stringify(cart));
  updateBadge();

  // Sync to server (fire-and-forget)
  syncCartToServer();
}

async function syncCartToServer() {
  try {
    // Clear server cart first, then add all items
    await fetch('/api/cart', {
      method: 'DELETE',
      headers: { 'x-session-id': SESSION_ID }
    });

    for (const item of cart) {
      await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-session-id': SESSION_ID
        },
        body: JSON.stringify(item)
      });
    }
  } catch {
    // Silently fail — localStorage is the primary store
  }
}

function updateBadge() {
  const badge = document.getElementById('cartBadge');
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  badge.textContent = totalItems;

  if (totalItems > 0) {
    badge.classList.add('show');
  } else {
    badge.classList.remove('show');
  }
}

function renderCartItems() {
  const itemsContainer = document.getElementById('cartItems');
  const emptyState = document.getElementById('cartEmpty');
  const footer = document.getElementById('cartFooter');
  const totalEl = document.getElementById('cartTotal');

  updateBadge();

  if (cart.length === 0) {
    itemsContainer.innerHTML = '';
    emptyState.classList.add('show');
    footer.classList.add('hidden');
    return;
  }

  emptyState.classList.remove('show');
  footer.classList.remove('hidden');

  // Calculate total
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  totalEl.textContent = `₹${total.toLocaleString('en-IN')}`;

  // Render items
  itemsContainer.innerHTML = cart.map(item => `
    <div class="cart-item" data-id="${item.productId}">
      <div class="cart-item__image">
        <img src="${item.image}" alt="${item.name}">
      </div>
      <div class="cart-item__details">
        <div class="cart-item__name">${item.name}</div>
        <div class="cart-item__price">₹${(item.price * item.quantity).toLocaleString('en-IN')}</div>
        <div class="cart-item__actions">
          <button class="qty-btn qty-minus" data-id="${item.productId}" aria-label="Decrease quantity">
            <i class="fas fa-minus"></i>
          </button>
          <span class="cart-item__qty">${item.quantity}</span>
          <button class="qty-btn qty-plus" data-id="${item.productId}" aria-label="Increase quantity">
            <i class="fas fa-plus"></i>
          </button>
          <button class="cart-item__remove" data-id="${item.productId}" aria-label="Remove item">
            <i class="fas fa-trash-can"></i>
          </button>
        </div>
      </div>
    </div>
  `).join('');

  // Attach event listeners
  itemsContainer.querySelectorAll('.qty-minus').forEach(btn => {
    btn.addEventListener('click', () => updateQuantity(parseInt(btn.dataset.id), -1));
  });
  itemsContainer.querySelectorAll('.qty-plus').forEach(btn => {
    btn.addEventListener('click', () => updateQuantity(parseInt(btn.dataset.id), 1));
  });
  itemsContainer.querySelectorAll('.cart-item__remove').forEach(btn => {
    btn.addEventListener('click', () => removeFromCart(parseInt(btn.dataset.id)));
  });
}

// Toast Notification System
function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.classList.add('toast', `toast--${type}`);

  const icon = type === 'success' ? 'fa-circle-check' : 'fa-circle-xmark';
  toast.innerHTML = `<i class="fas ${icon}"></i> ${message}`;

  container.appendChild(toast);

  // Auto-remove after 3 seconds
  setTimeout(() => {
    toast.classList.add('removing');
    toast.addEventListener('animationend', () => toast.remove());
  }, 3000);
}

/**
 * Forms Module
 * Handles Checkout (multi-step) and Feedback (star rating) slide-in panels
 * Both panels support swipe-to-close gestures
 */

export function initForms() {
  initCheckout();
  initFeedback();
}

// ═══════════════════════════════════════
// CHECKOUT FORM
// ═══════════════════════════════════════
function initCheckout() {
  const panel = document.getElementById('checkoutPanel');
  const overlay = document.getElementById('checkoutOverlay');
  const closeBtn = document.getElementById('checkoutClose');
  const checkoutBtn = document.getElementById('checkoutBtn');

  // Step navigation
  const toStep2 = document.getElementById('toStep2');
  const backToStep1 = document.getElementById('backToStep1');
  const toStep3 = document.getElementById('toStep3');
  const continueShopping = document.getElementById('continueShopping');

  // Payment options
  const paymentOptions = document.querySelectorAll('.payment-option');

  let currentStep = 1;

  // Open checkout from cart's checkout button
  checkoutBtn.addEventListener('click', (e) => {
    e.preventDefault();
    // Check if cart has items
    const cartData = localStorage.getItem('buyandbliss_cart');
    const cart = cartData ? JSON.parse(cartData) : [];
    if (cart.length === 0) return;

    // Close cart sidebar first
    document.getElementById('cartSidebar').classList.remove('open');
    document.getElementById('cartOverlay').classList.remove('open');

    // Open checkout
    setTimeout(() => {
      resetCheckout();
      openPanel(panel, overlay);
    }, 300);
  });

  // Close
  closeBtn.addEventListener('click', () => closePanel(panel, overlay));
  overlay.addEventListener('click', () => closePanel(panel, overlay));

  // Step 1 → 2
  toStep2.addEventListener('click', () => {
    // Validate shipping form
    const name = document.getElementById('ship-name').value.trim();
    const phone = document.getElementById('ship-phone').value.trim();
    const email = document.getElementById('ship-email').value.trim();
    const address = document.getElementById('ship-address').value.trim();
    const city = document.getElementById('ship-city').value.trim();
    const pin = document.getElementById('ship-pin').value.trim();

    if (!name || !phone || !email || !address || !city || !pin) {
      showFormToast('Please fill all required fields', 'error');
      return;
    }

    // Build order summary
    buildOrderSummary();
    goToStep(2);
  });

  // Step 2 → 1
  backToStep1.addEventListener('click', () => goToStep(1));

  // Step 2 → 3 (Place Order)
  toStep3.addEventListener('click', () => {
    // Generate order ID
    const orderId = 'BB-' + Date.now().toString(36).toUpperCase();
    document.getElementById('orderId').textContent = `Order ID: ${orderId}`;

    // Clear cart
    localStorage.setItem('buyandbliss_cart', '[]');
    // Update cart badge
    const badge = document.getElementById('cartBadge');
    badge.textContent = '0';
    badge.classList.remove('show');

    goToStep(3);
  });

  // Continue Shopping
  continueShopping.addEventListener('click', () => {
    closePanel(panel, overlay);
    setTimeout(() => {
      resetCheckout();
      // Reload products to refresh the page
      window.location.hash = '#products';
      window.location.reload();
    }, 400);
  });

  // Payment option toggle
  paymentOptions.forEach(opt => {
    opt.addEventListener('click', () => {
      paymentOptions.forEach(o => o.classList.remove('active'));
      opt.classList.add('active');
    });
  });

  function goToStep(step) {
    currentStep = step;
    // Update step indicators
    document.querySelectorAll('.checkout-step').forEach(el => {
      const s = parseInt(el.dataset.step);
      el.classList.remove('active', 'done');
      if (s === step) el.classList.add('active');
      if (s < step) el.classList.add('done');
    });
    // Show correct slide
    document.querySelectorAll('.checkout-slide').forEach(s => s.classList.remove('active'));
    document.getElementById(`checkoutStep${step}`).classList.add('active');
  }

  function resetCheckout() {
    currentStep = 1;
    goToStep(1);
    // Don't clear form fields so user can go back
  }

  function buildOrderSummary() {
    const cartData = localStorage.getItem('buyandbliss_cart');
    const cart = cartData ? JSON.parse(cartData) : [];
    const summary = document.getElementById('checkoutSummary');

    let total = 0;
    let html = '';
    cart.forEach(item => {
      const itemTotal = item.price * item.quantity;
      total += itemTotal;
      html += `<div class="summary-item"><span>${item.name} × ${item.quantity}</span><span>₹${itemTotal.toLocaleString('en-IN')}</span></div>`;
    });
    html += `<div class="summary-item"><span>Shipping</span><span>${total >= 2000 ? 'FREE' : '₹99'}</span></div>`;
    const shipping = total >= 2000 ? 0 : 99;
    html += `<div class="summary-item"><span>Total</span><span>₹${(total + shipping).toLocaleString('en-IN')}</span></div>`;

    summary.innerHTML = html;
  }

  // Swipe to close (right swipe)
  setupSwipeToClose(panel, overlay, 'right');
}

// ═══════════════════════════════════════
// FEEDBACK FORM
// ═══════════════════════════════════════
function initFeedback() {
  const panel = document.getElementById('feedbackPanel');
  const overlay = document.getElementById('feedbackOverlay');
  const closeBtn = document.getElementById('feedbackClose');
  const fab = document.getElementById('feedbackFab');
  const submitBtn = document.getElementById('submitFeedback');
  const doneBtn = document.getElementById('feedbackDone');
  const feedbackForm = panel.querySelector('.feedback-form');
  const feedbackSuccess = document.getElementById('feedbackSuccess');

  let selectedRating = 0;

  // Open
  fab.addEventListener('click', () => {
    feedbackForm.style.display = '';
    feedbackSuccess.style.display = 'none';
    openPanel(panel, overlay);
  });

  // Close
  closeBtn.addEventListener('click', () => closePanel(panel, overlay));
  overlay.addEventListener('click', () => closePanel(panel, overlay));

  // Star rating
  const stars = document.querySelectorAll('#feedbackStars .star-btn');
  const ratingLabels = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'];

  stars.forEach(star => {
    star.addEventListener('click', () => {
      selectedRating = parseInt(star.dataset.rating);
      stars.forEach(s => {
        const r = parseInt(s.dataset.rating);
        s.classList.toggle('active', r <= selectedRating);
        s.querySelector('i').className = r <= selectedRating ? 'fas fa-star' : 'far fa-star';
      });
      document.getElementById('ratingText').textContent = ratingLabels[selectedRating];
    });

    star.addEventListener('mouseenter', () => {
      const hoverRating = parseInt(star.dataset.rating);
      stars.forEach(s => {
        const r = parseInt(s.dataset.rating);
        s.querySelector('i').className = r <= hoverRating ? 'fas fa-star' : 'far fa-star';
      });
    });
  });

  // Reset stars on mouse leave
  document.getElementById('feedbackStars').addEventListener('mouseleave', () => {
    stars.forEach(s => {
      const r = parseInt(s.dataset.rating);
      s.querySelector('i').className = r <= selectedRating ? 'fas fa-star' : 'far fa-star';
    });
  });

  // Submit feedback
  submitBtn.addEventListener('click', () => {
    const review = document.getElementById('feedback-review').value.trim();

    if (!selectedRating) {
      showFormToast('Please select a rating', 'error');
      return;
    }
    if (!review) {
      showFormToast('Please write a review', 'error');
      return;
    }

    // Show success
    feedbackForm.style.display = 'none';
    feedbackSuccess.style.display = '';

    // Reset form
    selectedRating = 0;
    stars.forEach(s => {
      s.classList.remove('active');
      s.querySelector('i').className = 'far fa-star';
    });
    document.getElementById('ratingText').textContent = 'Select a rating';
    document.getElementById('feedback-name').value = '';
    document.getElementById('feedback-email').value = '';
    document.getElementById('feedback-category').value = '';
    document.getElementById('feedback-review').value = '';
    document.getElementById('feedback-suggestions').value = '';
  });

  // Done button
  doneBtn.addEventListener('click', () => closePanel(panel, overlay));

  // Swipe to close (left swipe for left panel)
  setupSwipeToClose(panel, overlay, 'left');
}

// ═══════════════════════════════════════
// SHARED HELPERS
// ═══════════════════════════════════════
function openPanel(panel, overlay) {
  panel.classList.add('open');
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closePanel(panel, overlay) {
  panel.classList.remove('open');
  overlay.classList.remove('open');
  document.body.style.overflow = '';
}

function showFormToast(message, type) {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.classList.add('toast', `toast--${type}`);
  const icon = type === 'success' ? 'fa-circle-check' : 'fa-circle-xmark';
  toast.innerHTML = `<i class="fas ${icon}"></i> ${message}`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('removing');
    toast.addEventListener('animationend', () => toast.remove());
  }, 3000);
}

// Swipe-to-close gesture
function setupSwipeToClose(panel, overlay, direction) {
  let startX = 0;
  let currentX = 0;
  let isDragging = false;

  panel.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    isDragging = true;
  }, { passive: true });

  panel.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    currentX = e.touches[0].clientX;
    const diff = currentX - startX;

    // Only allow swipe in the correct direction
    if (direction === 'right' && diff > 0) {
      panel.style.transform = `translateX(${diff}px)`;
      panel.style.transition = 'none';
    } else if (direction === 'left' && diff < 0) {
      panel.style.transform = `translateX(${diff}px)`;
      panel.style.transition = 'none';
    }
  }, { passive: true });

  panel.addEventListener('touchend', () => {
    if (!isDragging) return;
    isDragging = false;
    const diff = currentX - startX;
    const threshold = 100;

    panel.style.transition = '';
    panel.style.transform = '';

    if ((direction === 'right' && diff > threshold) ||
        (direction === 'left' && diff < -threshold)) {
      closePanel(panel, overlay);
    }
  }, { passive: true });
}

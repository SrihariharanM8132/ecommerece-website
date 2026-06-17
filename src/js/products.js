/**
 * Products Module
 * Fetches products from API, renders product cards, handles filtering and search
 */

import { addToCart } from './cart.js';

let allProducts = [];

export async function initProducts() {
  const grid = document.getElementById('productsGrid');
  const filterBtns = document.querySelectorAll('.filter-btn');
  const searchInput = document.getElementById('searchInput');
  const searchBtn = document.getElementById('searchBtn');

  // Fetch products from API
  try {
    const res = await fetch('/api/products');
    allProducts = await res.json();
    renderProducts(allProducts);
  } catch (error) {
    console.error('Failed to fetch products:', error);
    grid.innerHTML = '<p style="text-align:center;color:var(--clr-text-muted);grid-column:1/-1;padding:60px 0;">Failed to load products. Make sure the server is running.</p>';
    return;
  }

  // Category filtering
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const category = btn.dataset.category;
      const searchTerm = searchInput.value.trim();
      filterProducts(category, searchTerm);
    });
  });

  // Search
  let searchTimeout;
  searchInput.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      const activeFilter = document.querySelector('.filter-btn.active');
      const category = activeFilter ? activeFilter.dataset.category : 'All';
      filterProducts(category, searchInput.value.trim());
    }, 300);
  });

  searchBtn.addEventListener('click', () => {
    const activeFilter = document.querySelector('.filter-btn.active');
    const category = activeFilter ? activeFilter.dataset.category : 'All';
    filterProducts(category, searchInput.value.trim());
  });
}

function filterProducts(category, searchTerm) {
  let filtered = [...allProducts];

  if (category && category !== 'All') {
    filtered = filtered.filter(p => p.category === category);
  }

  if (searchTerm) {
    const q = searchTerm.toLowerCase();
    filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
  }

  renderProducts(filtered);
}

function renderProducts(products) {
  const grid = document.getElementById('productsGrid');

  if (!products.length) {
    grid.innerHTML = `
      <div style="text-align:center;color:var(--clr-text-muted);grid-column:1/-1;padding:60px 0;">
        <i class="fas fa-box-open" style="font-size:3rem;opacity:0.3;margin-bottom:16px;display:block;"></i>
        <p style="font-size:1.1rem;">No products found</p>
      </div>`;
    return;
  }

  grid.innerHTML = products.map(product => createProductCard(product)).join('');

  // Attach add-to-cart event listeners
  grid.querySelectorAll('.add-to-cart-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const productId = parseInt(btn.dataset.id);
      const product = allProducts.find(p => p.id === productId);
      if (product) {
        addToCart(product);

        // Visual feedback
        btn.classList.add('added');
        const originalHTML = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-check"></i> Added!';
        setTimeout(() => {
          btn.classList.remove('added');
          btn.innerHTML = originalHTML;
        }, 1500);
      }
    });
  });

  // Animate cards in with stagger
  const cards = grid.querySelectorAll('.product-card');
  cards.forEach((card, i) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    setTimeout(() => {
      card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    }, i * 60);
  });
}

function createProductCard(product) {
  const stars = generateStars(product.rating);

  return `
    <div class="product-card" data-id="${product.id}">
      <div class="product-card__image">
        <img src="${product.image}" alt="${product.name}" loading="lazy">
        <span class="product-card__category">${product.category}</span>
        <div class="product-card__overlay">
          <button class="add-to-cart-btn" data-id="${product.id}">
            <i class="fas fa-cart-plus"></i> Add to Cart
          </button>
        </div>
      </div>
      <div class="product-card__info">
        <h3 class="product-card__name">${product.name}</h3>
        <p class="product-card__desc">${product.description}</p>
        <div class="product-card__bottom">
          <span class="product-card__price">$${product.price.toFixed(2)}</span>
          <div class="product-card__rating">
            ${stars}
            <span>${product.rating}</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

function generateStars(rating) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;
  let html = '';

  for (let i = 0; i < fullStars; i++) {
    html += '<i class="fas fa-star"></i>';
  }
  if (hasHalf) {
    html += '<i class="fas fa-star-half-stroke"></i>';
  }
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);
  for (let i = 0; i < emptyStars; i++) {
    html += '<i class="far fa-star"></i>';
  }

  return html;
}

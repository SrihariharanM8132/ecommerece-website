/**
 * BuyandBliss — Main Entry Point
 * Initializes all application modules
 */

import { initNavigation } from './js/navigation.js';
import { initSlider } from './js/slider.js';
import { initProducts } from './js/products.js';
import { initCart } from './js/cart.js';
import { initForms } from './js/forms.js';

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initSlider();
  initProducts();
  initCart();
  initForms();
});

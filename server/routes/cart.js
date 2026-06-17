import { Router } from 'express';

const router = Router();

// In-memory cart store (per-session, resets on server restart)
// In production, use a database or Redis
const carts = new Map();

function getCart(sessionId) {
  if (!carts.has(sessionId)) {
    carts.set(sessionId, []);
  }
  return carts.get(sessionId);
}

// GET /api/cart — get cart items
router.get('/', (req, res) => {
  const sessionId = req.headers['x-session-id'] || 'default';
  const cart = getCart(sessionId);
  res.json(cart);
});

// POST /api/cart — add item to cart
router.post('/', (req, res) => {
  const sessionId = req.headers['x-session-id'] || 'default';
  const cart = getCart(sessionId);
  const { productId, name, price, image, quantity = 1 } = req.body;

  if (!productId || !name || !price) {
    return res.status(400).json({ error: 'productId, name, and price are required' });
  }

  const existingItem = cart.find(item => item.productId === productId);
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.push({ productId, name, price, image, quantity });
  }

  res.json(cart);
});

// PUT /api/cart/:productId — update quantity
router.put('/:productId', (req, res) => {
  const sessionId = req.headers['x-session-id'] || 'default';
  const cart = getCart(sessionId);
  const productId = parseInt(req.params.productId);
  const { quantity } = req.body;

  const item = cart.find(item => item.productId === productId);
  if (!item) {
    return res.status(404).json({ error: 'Item not found in cart' });
  }

  if (quantity <= 0) {
    // Remove item
    const index = cart.indexOf(item);
    cart.splice(index, 1);
  } else {
    item.quantity = quantity;
  }

  res.json(cart);
});

// DELETE /api/cart/:productId — remove item from cart
router.delete('/:productId', (req, res) => {
  const sessionId = req.headers['x-session-id'] || 'default';
  const cart = getCart(sessionId);
  const productId = parseInt(req.params.productId);

  const index = cart.findIndex(item => item.productId === productId);
  if (index === -1) {
    return res.status(404).json({ error: 'Item not found in cart' });
  }

  cart.splice(index, 1);
  res.json(cart);
});

// DELETE /api/cart — clear entire cart
router.delete('/', (req, res) => {
  const sessionId = req.headers['x-session-id'] || 'default';
  carts.set(sessionId, []);
  res.json([]);
});

export default router;

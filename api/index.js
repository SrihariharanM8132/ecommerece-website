import express from 'express';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(express.json());

// ── Load Products ──
const productsPath = join(__dirname, '..', 'server', 'data', 'products.json');
const products = JSON.parse(readFileSync(productsPath, 'utf-8'));

// ── In-memory cart (resets on cold start — fine for demo) ──
const carts = new Map();
function getCart(sid) {
  if (!carts.has(sid)) carts.set(sid, []);
  return carts.get(sid);
}

// ── Product Routes ──
app.get('/api/products', (req, res) => {
  const { category, search } = req.query;
  let result = [...products];
  if (category && category !== 'All') {
    result = result.filter(p => p.category.toLowerCase() === category.toLowerCase());
  }
  if (search) {
    const q = search.toLowerCase();
    result = result.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
  }
  res.json(result);
});

app.get('/api/products/:id', (req, res) => {
  const product = products.find(p => p.id === parseInt(req.params.id));
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
});

// ── Cart Routes ──
app.get('/api/cart', (req, res) => {
  res.json(getCart(req.headers['x-session-id'] || 'default'));
});

app.post('/api/cart', (req, res) => {
  const cart = getCart(req.headers['x-session-id'] || 'default');
  const { productId, name, price, image, quantity = 1 } = req.body;
  if (!productId || !name || !price) return res.status(400).json({ error: 'Missing fields' });
  const existing = cart.find(i => i.productId === productId);
  if (existing) existing.quantity += quantity;
  else cart.push({ productId, name, price, image, quantity });
  res.json(cart);
});

app.put('/api/cart/:productId', (req, res) => {
  const cart = getCart(req.headers['x-session-id'] || 'default');
  const item = cart.find(i => i.productId === parseInt(req.params.productId));
  if (!item) return res.status(404).json({ error: 'Not in cart' });
  if (req.body.quantity <= 0) cart.splice(cart.indexOf(item), 1);
  else item.quantity = req.body.quantity;
  res.json(cart);
});

app.delete('/api/cart/:productId', (req, res) => {
  const cart = getCart(req.headers['x-session-id'] || 'default');
  const idx = cart.findIndex(i => i.productId === parseInt(req.params.productId));
  if (idx !== -1) cart.splice(idx, 1);
  res.json(cart);
});

app.delete('/api/cart', (req, res) => {
  carts.set(req.headers['x-session-id'] || 'default', []);
  res.json([]);
});

export default app;

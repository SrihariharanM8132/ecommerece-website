import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import productRoutes from './routes/products.js';
import cartRoutes from './routes/cart.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);

// Serve static production build
const distPath = join(__dirname, '..', 'dist');
app.use(express.static(distPath));

// Fallback to index.html for SPA
app.get('*', (req, res) => {
  res.sendFile(join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 BuyandBliss API running at http://localhost:${PORT}`);
});

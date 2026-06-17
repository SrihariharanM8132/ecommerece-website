# BuyandBliss – Full‑Stack E‑Commerce website

## Project Overview
BuyandBliss is a modern, responsive e‑commerce platform built with **Vite** for the frontend and **Node.js + Express** for the backend. It showcases a complete product catalog, shopping‑cart functionality, a multi‑step checkout flow, and a customer‑feedback system.

## Tech Stack
- **Frontend:** HTML5, CSS3 (custom design system, glassmorphism, micro‑animations), JavaScript (ES6 modules), Vite
- **Backend:** Node.js, Express.js, REST API (`/api/products`, `/api/cart`)
- **Deployment:** Vercel (serverless functions via `api/index.js`)
- **Version Control:** Git, GitHub

## Key Features
- **18 products** with realistic Indian‑market prices (₹) and absolute image URLs
- **Dynamic product catalog** with search and category filtering
- **Shopping cart** persisted in `localStorage` and synced to the server
- **Multi‑step checkout** (Shipping → Payment → Confirmation) with Indian number formatting
- **Customer feedback form** with interactive 5‑star rating, category dropdown, and suggestions
- **Responsive design** and dark‑mode ready, micro‑animations for UI polish
- **Swipe‑to‑close gestures** on mobile for both checkout and feedback panels

## Getting Started
```bash
# Install dependencies
npm install

# Run the development server
npm run dev   # Vite (5173) + Express (3000)
```
The app will be available at `http://localhost:5173` (frontend) with API calls proxied to `http://localhost:3000`.

## Deployment
- Deploy on **Vercel** using the provided `vercel.json` configuration.
- The serverless function in `api/index.js` handles all `/api/*` routes.

## License
MIT License – feel free to fork and customize!

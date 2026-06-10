import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

import router from './src/server/routes.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Set up rate limiter: maximum of 100 requests per 15 minutes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes'
});

// Apply rate limiter to all requests
app.use(limiter);

// Apply routes
app.use(router);

// Vite & Static Server Integration
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[RAVEN] Starting Vite Developer Mode server (Port ${PORT})...`);
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    console.log(`[RAVEN] Starting Production compiled server (Port ${PORT})...`);
    const distPath = path.join(process.cwd(), 'dist');

    // Serve static files from the 'dist' directory
    app.use(express.static(distPath));

    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[RAVEN Engine ready on http://0.0.0.0:${PORT}]`);
  });
}

startServer();

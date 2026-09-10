import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Route imports
import authRoutes from './routes/auth.js';
import taskRoutes from './routes/tasks.js';
import budgetRoutes from './routes/budget.js';
import expenseRoutes from './routes/expenses.js';
import foodRoutes from './routes/food.js';
import closetRoutes from './routes/closet.js';
import sleepRoutes from './routes/sleep.js';
import homeRoutes from './routes/homeTasks.js';
import dashboardRoutes from './routes/dashboard.js';
import wrappedRoutes from './routes/wrapped.js';
import settingsRoutes from './routes/settings.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// Core Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), service: 'BackToSchool API' });
});

// API Routes Mounting
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/budget', budgetRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api', foodRoutes); // handles /meals, /shopping-list, /freezer-meals
app.use('/api', closetRoutes); // handles /clothing, /outfits
app.use('/api/sleep', sleepRoutes);
app.use('/api/home-tasks', homeRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/wrapped', wrappedRoutes);
app.use('/api/settings', settingsRoutes);

// Render Deployment / Production Static Serving
const clientDistPath = path.join(__dirname, '../../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));

  // SPA client-side routing fallback (for all non-API paths)
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Global API 404 handler
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: `API route ${req.method} ${req.baseUrl} not found.` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error. Please try again.'
  });
});

export default app;

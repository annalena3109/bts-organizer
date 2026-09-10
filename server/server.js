import dotenv from 'dotenv';
dotenv.config();

import app from './src/app.js';
import { initDb } from './src/db/index.js';

const PORT = process.env.PORT || 5000;

async function startServer() {
  console.log('--- Starting Back to School & Life Organizer Backend ---');
  
  // Initialize and verify database connection
  await initDb();

  app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal error starting server:', err);
});

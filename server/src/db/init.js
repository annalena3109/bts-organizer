import { initDb } from './index.js';

console.log('Running database setup and schema verification...');
initDb()
  .then((success) => {
    if (success) {
      console.log('Database initialization completed successfully.');
      process.exit(0);
    } else {
      console.log('Database initialization completed in fallback mode.');
      process.exit(0);
    }
  })
  .catch((err) => {
    console.error('Database initialization encountered error:', err);
    process.exit(1);
  });

import { createClient } from '@libsql/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configuration: Turso Cloud URL or local file SQLite for offline development
const dbUrl = process.env.TURSO_DATABASE_URL || 'file:backtoschool.db';
const authToken = process.env.TURSO_AUTH_TOKEN || undefined;

let client = null;

export function getClient() {
  if (!client) {
    client = createClient({
      url: dbUrl,
      authToken: authToken,
    });
  }
  return client;
}

export async function initDb() {
  try {
    const db = getClient();
    const isRemote = dbUrl.startsWith('libsql://') || dbUrl.startsWith('https://');
    console.log(`Connecting to database (${isRemote ? 'Turso Cloud Serverless' : 'Local File: ' + dbUrl})...`);

    // Load and execute schema
    const schemaPath = path.join(__dirname, 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      const sqlContent = fs.readFileSync(schemaPath, 'utf-8');
      
      // Split into individual SQL statements
      const statements = sqlContent
        .split(';')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      for (const statement of statements) {
        await db.execute(statement);
      }
      console.log(`Database schema verified and applied successfully (${statements.length} statements).`);
    }

    // Ensure meals table has date column and user-date index for rolling calendar
    try {
      const tableInfo = await db.execute('PRAGMA table_info(meals)');
      const hasDateCol = tableInfo.rows.some(r => r.name === 'date');
      if (!hasDateCol) {
        await db.execute('ALTER TABLE meals ADD COLUMN date TEXT');
        console.log('Added date column to meals table.');
      }
      await db.execute('CREATE UNIQUE INDEX IF NOT EXISTS idx_meals_user_date ON meals(user_id, date)');
      await db.execute('CREATE UNIQUE INDEX IF NOT EXISTS idx_meals_user_day ON meals(user_id, day_of_week)');
    } catch (migErr) {
      console.warn('Meals schema migration notice:', migErr.message);
    }

    // Seed default demo profile if empty
    const checkUser = await db.execute({
      sql: 'SELECT id FROM users WHERE id = ?',
      args: ['demo-user-1']
    });

    if (checkUser.rows.length === 0) {
      await db.execute({
        sql: `INSERT OR IGNORE INTO users (id, name, email, password_hash)
              VALUES (?, ?, ?, ?)`,
        args: [
          'demo-user-1',
          'Annalena',
          'annalena@school.edu',
          '$2a$10$eE0xQ9Yf8y1R8c0kQ9Yf8eE0xQ9Yf8y1R8c0kQ9Yf8eE0xQ9Yf8y1' // password: demo
        ]
      });

      await db.execute({
        sql: `INSERT OR IGNORE INTO budgets (id, user_id, monthly, weekly, daily, snack_weekly)
              VALUES (?, ?, ?, ?, ?, ?)`,
        args: ['b-default', 'demo-user-1', 500.0, 125.0, 20.0, 30.0]
      });

      await db.execute({
        sql: `INSERT OR IGNORE INTO tasks (id, user_id, title, description, category, priority, due_date, completed)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        args: ['1', 'demo-user-1', 'Read Chapter 4 of History textbook', 'Take notes on summary', 'School', 'high', '2026-09-10T16:00:00Z', 0]
      });

      await db.execute({
        sql: `INSERT OR IGNORE INTO tasks (id, user_id, title, description, category, priority, due_date, completed)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        args: ['2', 'demo-user-1', 'Submit Calculus problem set #2', 'Exercises 12 through 24', 'School', 'high', '2026-09-11T23:59:00Z', 0]
      });

      console.log('Default starter data initialized.');
    }

    return true;
  } catch (err) {
    console.error('Database initialization error:', err.message);
    throw err;
  }
}

// Unified query helper matching our existing routes
export async function query(sql, params = []) {
  try {
    const db = getClient();
    
    // Normalize params: convert undefined to null for LibSQL
    const cleanParams = Array.isArray(params)
      ? params.map(p => (p === undefined ? null : p))
      : params;

    // Execute query with args
    const result = await db.execute({
      sql,
      args: cleanParams
    });

    // Normalize rows: convert integer boolean fields (completed, is_completed, checked, is_today) to boolean
    const rows = result.rows.map((row) => {
      const normalized = { ...row };
      if ('completed' in normalized) {
        normalized.completed = normalized.completed === 1 || normalized.completed === true;
      }
      if ('is_completed' in normalized) {
        normalized.is_completed = normalized.is_completed === 1 || normalized.is_completed === true;
      }
      if ('checked' in normalized) {
        normalized.checked = normalized.checked === 1 || normalized.checked === true;
      }
      if ('is_today' in normalized) {
        normalized.is_today = normalized.is_today === 1 || normalized.is_today === true;
      }
      return normalized;
    });

    return {
      rows,
      rowCount: rows.length,
      columns: result.columns,
    };
  } catch (err) {
    console.error(`Database Query Error on [${sql.slice(0, 80)}...]:`, err.message);
    throw err;
  }
}

export default { query, initDb, getClient };

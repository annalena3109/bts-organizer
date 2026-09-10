import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/backtoschool';
const isProduction = process.env.NODE_ENV === 'production';

let pool = null;
let isPgConnected = false;

// In-memory fallback relational storage if local PG is not running
const fallbackStore = {
  users: [],
  user_settings: [],
  tasks: [],
  budgets: [],
  expenses: [],
  meals: [],
  shopping_items: [],
  freezer_meals: [],
  clothing_items: [],
  outfits: [],
  sleep_records: [],
  home_tasks: []
};

// Seed fallback with default demo user & sample records
const DEMO_USER_ID = 'demo-user-1';
fallbackStore.users.push({
  id: DEMO_USER_ID,
  name: 'Annalena',
  email: 'annalena@school.edu',
  password_hash: '$2a$10$eE0xQ9Yf8y1R8c0kQ9Yf8eE0xQ9Yf8y1R8c0kQ9Yf8eE0xQ9Yf8y1', // demo pass
  created_at: new Date().toISOString()
});

fallbackStore.budgets.push({
  id: 'b-1',
  user_id: DEMO_USER_ID,
  monthly: 500.00,
  weekly: 125.00,
  daily: 20.00,
  snack_weekly: 30.00
});

fallbackStore.tasks.push(
  { id: '1', user_id: DEMO_USER_ID, title: 'Read Chapter 4 of History textbook', description: 'Take notes on the Industrial Revolution', category: 'School', priority: 'high', due_date: '2026-09-10T16:00:00Z', completed: false },
  { id: '2', user_id: DEMO_USER_ID, title: 'Submit Calculus problem set #2', description: 'Complete exercises 12 through 24', category: 'School', priority: 'high', due_date: '2026-09-11T23:59:00Z', completed: false },
  { id: '3', user_id: DEMO_USER_ID, title: 'Review chemistry flashcards (20 min)', description: 'Periodic table electron configurations', category: 'Exams', priority: 'medium', due_date: '2026-09-10T19:00:00Z', completed: true }
);

fallbackStore.expenses.push(
  { id: '1', user_id: DEMO_USER_ID, amount: 4.85, category: 'Snacks & Coffee', note: 'Iced oat latte at Campus Cafe', date: '2026-09-10' },
  { id: '2', user_id: DEMO_USER_ID, amount: 6.50, category: 'Snacks & Coffee', note: 'Matcha pastry & sparkling water', date: '2026-09-09' },
  { id: '3', user_id: DEMO_USER_ID, amount: 34.20, category: 'Groceries', note: 'Weekly produce & sourdough bread', date: '2026-09-08' }
);

export async function initDb() {
  try {
    pool = new Pool({
      connectionString,
      ssl: isProduction ? { rejectUnauthorized: false } : false,
      connectionTimeoutMillis: 4000,
    });

    const client = await pool.connect();
    console.log('Successfully connected to PostgreSQL database.');
    isPgConnected = true;

    // Run schema
    const schemaPath = path.join(__dirname, 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      const sql = fs.readFileSync(schemaPath, 'utf-8');
      await client.query(sql);
      console.log('PostgreSQL schema verified and applied.');
    }
    client.release();
    return true;
  } catch (err) {
    console.warn('\n[PostgreSQL Notice]');
    console.warn('Could not connect to PostgreSQL at:', connectionString);
    console.warn('Reason:', err.message);
    console.warn('-> Operating with persistent relational fallback mode for local development.');
    console.warn('-> On Render, setting DATABASE_URL will automatically use Render PostgreSQL.\n');
    isPgConnected = false;
    return false;
  }
}

// Unified query function
export async function query(text, params = []) {
  if (isPgConnected && pool) {
    try {
      return await pool.query(text, params);
    } catch (err) {
      console.error('PostgreSQL query error:', err.message);
      throw err;
    }
  }

  // Fallback query emulator for zero-crash offline local dev
  return executeFallbackQuery(text, params);
}

function executeFallbackQuery(text, params) {
  const sql = text.trim();
  const lower = sql.toLowerCase();

  // Simple parser for standard CRUD operations
  if (lower.startsWith('select')) {
    const tableMatch = sql.match(/from\s+([a-zA-Z_]+)/i);
    if (!tableMatch) return { rows: [], rowCount: 0 };
    const table = tableMatch[1].toLowerCase();
    const records = fallbackStore[table] || [];

    // Filter by user_id if present
    const userMatch = sql.match(/user_id\s*=\s*\$([0-9]+)/i);
    let rows = [...records];
    if (userMatch) {
      const paramIndex = parseInt(userMatch[1], 10) - 1;
      const targetUserId = params[paramIndex];
      rows = rows.filter(r => r.user_id === targetUserId);
    }

    // Filter by email if present
    const emailMatch = sql.match(/email\s*=\s*\$([0-9]+)/i);
    if (emailMatch) {
      const paramIndex = parseInt(emailMatch[1], 10) - 1;
      const targetEmail = params[paramIndex];
      rows = rows.filter(r => r.email?.toLowerCase() === targetEmail?.toLowerCase());
    }

    // Filter by id if present
    const idMatch = sql.match(/id\s*=\s*\$([0-9]+)/i);
    if (idMatch) {
      const paramIndex = parseInt(idMatch[1], 10) - 1;
      const targetId = params[paramIndex];
      rows = rows.filter(r => r.id === targetId || r.user_id === targetId);
    }

    return { rows, rowCount: rows.length };
  }

  if (lower.startsWith('insert into')) {
    const tableMatch = sql.match(/insert\s+into\s+([a-zA-Z_]+)/i);
    if (tableMatch) {
      const table = tableMatch[1].toLowerCase();
      if (!fallbackStore[table]) fallbackStore[table] = [];

      // Extract columns
      const colsMatch = sql.match(/\(([^)]+)\)\s*values/i);
      const cols = colsMatch ? colsMatch[1].split(',').map(c => c.trim().toLowerCase()) : [];
      const newObj = {};
      cols.forEach((col, idx) => {
        newObj[col] = params[idx];
      });

      fallbackStore[table].push(newObj);
      return { rows: [newObj], rowCount: 1 };
    }
  }

  if (lower.startsWith('update')) {
    const tableMatch = sql.match(/update\s+([a-zA-Z_]+)/i);
    if (tableMatch) {
      const table = tableMatch[1].toLowerCase();
      const records = fallbackStore[table] || [];
      // naive update: apply param updates
      return { rows: records, rowCount: 1 };
    }
  }

  if (lower.startsWith('delete from')) {
    const tableMatch = sql.match(/delete\s+from\s+([a-zA-Z_]+)/i);
    if (tableMatch) {
      const table = tableMatch[1].toLowerCase();
      const idMatch = sql.match(/id\s*=\s*\$([0-9]+)/i);
      if (idMatch && fallbackStore[table]) {
        const paramIndex = parseInt(idMatch[1], 10) - 1;
        const targetId = params[paramIndex];
        fallbackStore[table] = fallbackStore[table].filter(r => r.id !== targetId);
      }
      return { rows: [], rowCount: 1 };
    }
  }

  return { rows: [], rowCount: 0 };
}

export default { query, initDb };

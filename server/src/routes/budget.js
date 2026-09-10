import express from 'express';
import crypto from 'crypto';
import db from '../db/index.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();
router.use(requireAuth);

// GET /api/budget
router.get('/', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT monthly, weekly, daily, snack_weekly as "snackWeekly" FROM budgets WHERE user_id = $1',
      [req.user.id]
    );
    if (result.rows.length === 0) {
      // Default limits
      return res.json({ monthly: 500.00, weekly: 125.00, daily: 20.00, snackWeekly: 30.00 });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve budget limits.' });
  }
});

// PUT /api/budget
router.put('/', async (req, res) => {
  try {
    const { monthly, weekly, daily, snackWeekly } = req.body;
    await db.query(
      `INSERT INTO budgets (id, user_id, monthly, weekly, daily, snack_weekly)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (user_id) DO UPDATE
       SET monthly = EXCLUDED.monthly,
           weekly = EXCLUDED.weekly,
           daily = EXCLUDED.daily,
           snack_weekly = EXCLUDED.snack_weekly`,
      [crypto.randomUUID(), req.user.id, monthly || 500, weekly || 125, daily || 20, snackWeekly || 30]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update budget.' });
  }
});

export default router;

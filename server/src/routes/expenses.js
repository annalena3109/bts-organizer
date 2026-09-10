import express from 'express';
import crypto from 'crypto';
import db from '../db/index.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();
router.use(requireAuth);

// GET /api/expenses
router.get('/', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM expenses WHERE user_id = $1 ORDER BY date DESC, created_at DESC',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch expenses.' });
  }
});

// POST /api/expenses
router.post('/', async (req, res) => {
  try {
    const { amount, category, note, date } = req.body;
    if (!amount) {
      return res.status(400).json({ error: 'Amount is required.' });
    }

    const newExpense = {
      id: req.body.id || crypto.randomUUID(),
      user_id: req.user.id,
      amount: parseFloat(amount),
      category: category || 'Other',
      note: note || '',
      date: date || new Date().toISOString().slice(0, 10),
      created_at: new Date().toISOString()
    };

    await db.query(
      'INSERT INTO expenses (id, user_id, amount, category, note, date) VALUES ($1, $2, $3, $4, $5, $6)',
      [newExpense.id, newExpense.user_id, newExpense.amount, newExpense.category, newExpense.note, newExpense.date]
    );

    res.status(201).json(newExpense);
  } catch (err) {
    res.status(500).json({ error: 'Failed to record expense.' });
  }
});

// DELETE /api/expenses/:id
router.delete('/:id', async (req, res) => {
  try {
    await db.query(
      'DELETE FROM expenses WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete expense.' });
  }
});

export default router;

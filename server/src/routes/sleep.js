import express from 'express';
import crypto from 'crypto';
import db from '../db/index.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();
router.use(requireAuth);

// GET /api/sleep
router.get('/', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM sleep_records WHERE user_id = $1 ORDER BY date DESC',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve sleep logs.' });
  }
});

// POST /api/sleep
router.post('/', async (req, res) => {
  try {
    const { date, bedtime, wake_time, duration_minutes, quality, notes } = req.body;
    const newRecord = {
      id: req.body.id || crypto.randomUUID(),
      user_id: req.user.id,
      date: date || new Date().toISOString().slice(0, 10),
      bedtime: bedtime || '23:00',
      wake_time: wake_time || '07:00',
      duration_minutes: duration_minutes || 480,
      quality: quality || 4,
      notes: notes || ''
    };
    await db.query(
      'INSERT INTO sleep_records (id, user_id, date, bedtime, wake_time, duration_minutes, quality, notes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
      [newRecord.id, newRecord.user_id, newRecord.date, newRecord.bedtime, newRecord.wake_time, newRecord.duration_minutes, newRecord.quality, newRecord.notes]
    );
    res.status(201).json(newRecord);
  } catch (err) {
    res.status(500).json({ error: 'Failed to record sleep entry.' });
  }
});

// DELETE /api/sleep/:id
router.delete('/:id', async (req, res) => {
  try {
    await db.query(
      'DELETE FROM sleep_records WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete sleep entry.' });
  }
});

export default router;

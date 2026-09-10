import express from 'express';
import crypto from 'crypto';
import db from '../db/index.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();
router.use(requireAuth);

// GET /api/home-tasks
router.get('/', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM home_tasks WHERE user_id = $1 ORDER BY is_completed ASC, title ASC',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch room tasks.' });
  }
});

// POST /api/home-tasks
router.post('/', async (req, res) => {
  try {
    const { title, area, frequency } = req.body;
    const newTask = {
      id: req.body.id || crypto.randomUUID(),
      user_id: req.user.id,
      title: title || 'Chore',
      area: area || 'Bedroom',
      frequency: frequency || 'Weekly',
      is_completed: false,
      last_cleaned: 'Pending'
    };
    await db.query(
      'INSERT INTO home_tasks (id, user_id, title, area, frequency, is_completed, last_cleaned) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [newTask.id, newTask.user_id, newTask.title, newTask.area, newTask.frequency, newTask.is_completed, newTask.last_cleaned]
    );
    res.status(201).json(newTask);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add chore.' });
  }
});

// PATCH /api/home-tasks/:id/toggle
router.patch('/:id/toggle', async (req, res) => {
  try {
    const { is_completed } = req.body;
    const lastCleaned = is_completed ? 'Today' : 'Pending';
    await db.query(
      'UPDATE home_tasks SET is_completed = $1, last_cleaned = $2 WHERE id = $3 AND user_id = $4',
      [is_completed, lastCleaned, req.params.id, req.user.id]
    );
    res.json({ success: true, last_cleaned: lastCleaned });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update chore.' });
  }
});

// DELETE /api/home-tasks/:id
router.delete('/:id', async (req, res) => {
  try {
    await db.query(
      'DELETE FROM home_tasks WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete chore.' });
  }
});

export default router;

import express from 'express';
import crypto from 'crypto';
import db from '../db/index.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();
router.use(requireAuth);

// GET /api/tasks
router.get('/', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM tasks WHERE user_id = $1 ORDER BY completed ASC, due_date ASC',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tasks.' });
  }
});

// POST /api/tasks
router.post('/', async (req, res) => {
  try {
    const { title, description, category, priority, due_date } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Task title is required.' });
    }

    const taskId = req.body.id || crypto.randomUUID();
    const newTask = {
      id: taskId,
      user_id: req.user.id,
      title: title.trim(),
      description: description || '',
      category: category || 'School',
      priority: priority || 'medium',
      due_date: due_date || null,
      completed: false,
      created_at: new Date().toISOString()
    };

    const completedVal = newTask.completed ? 1 : 0;
    await db.query(
      'INSERT INTO tasks (id, user_id, title, description, category, priority, due_date, completed) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
      [newTask.id, newTask.user_id, newTask.title, newTask.description, newTask.category, newTask.priority, newTask.due_date, completedVal]
    );

    res.status(201).json(newTask);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create task.' });
  }
});

// PUT /api/tasks/:id
router.put('/:id', async (req, res) => {
  try {
    const { title, description, category, priority, due_date, completed } = req.body;
    const completedVal = completed ? 1 : 0;
    await db.query(
      'UPDATE tasks SET title = $1, description = $2, category = $3, priority = $4, due_date = $5, completed = $6 WHERE id = $7 AND user_id = $8',
      [title, description, category, priority, due_date, completedVal, req.params.id, req.user.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update task.' });
  }
});

// PATCH /api/tasks/:id/toggle
router.patch('/:id/toggle', async (req, res) => {
  try {
    const { completed } = req.body;
    const completedVal = completed ? 1 : 0;
    await db.query(
      'UPDATE tasks SET completed = $1 WHERE id = $2 AND user_id = $3',
      [completedVal, req.params.id, req.user.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to toggle task.' });
  }
});

// DELETE /api/tasks/:id
router.delete('/:id', async (req, res) => {
  try {
    await db.query(
      'DELETE FROM tasks WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete task.' });
  }
});

export default router;

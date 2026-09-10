import express from 'express';
import crypto from 'crypto';
import db from '../db/index.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();
router.use(requireAuth);

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// GET /api/meals
router.get('/meals', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT day_of_week, breakfast, lunch, dinner, snack FROM meals WHERE user_id = $1',
      [req.user.id]
    );
    const mealMap = {};
    DAYS.forEach(day => {
      mealMap[day] = { breakfast: '', lunch: '', dinner: '', snack: '' };
    });
    result.rows.forEach(row => {
      mealMap[row.day_of_week] = {
        breakfast: row.breakfast || '',
        lunch: row.lunch || '',
        dinner: row.dinner || '',
        snack: row.snack || ''
      };
    });
    res.json(mealMap);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch meal plan.' });
  }
});

// PUT /api/meals
router.put('/meals', async (req, res) => {
  try {
    const mealPlan = req.body;
    for (const day of Object.keys(mealPlan)) {
      const item = mealPlan[day];
      await db.query(
        `INSERT INTO meals (id, user_id, day_of_week, breakfast, lunch, dinner, snack)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (user_id, day_of_week) DO UPDATE
         SET breakfast = EXCLUDED.breakfast,
             lunch = EXCLUDED.lunch,
             dinner = EXCLUDED.dinner,
             snack = EXCLUDED.snack`,
        [crypto.randomUUID(), req.user.id, day, item.breakfast, item.lunch, item.dinner, item.snack]
      );
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save meal plan.' });
  }
});

// GET /api/shopping-list
router.get('/shopping-list', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM shopping_items WHERE user_id = $1 ORDER BY checked ASC, created_at ASC',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch shopping list.' });
  }
});

// POST /api/shopping-list
router.post('/shopping-list', async (req, res) => {
  try {
    const { item, category } = req.body;
    const newItem = {
      id: req.body.id || crypto.randomUUID(),
      user_id: req.user.id,
      item: item || 'Grocery item',
      category: category || 'Produce',
      checked: false,
      created_at: new Date().toISOString()
    };
    await db.query(
      'INSERT INTO shopping_items (id, user_id, item, category, checked) VALUES ($1, $2, $3, $4, $5)',
      [newItem.id, newItem.user_id, newItem.item, newItem.category, newItem.checked]
    );
    res.status(201).json(newItem);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add shopping item.' });
  }
});

// PATCH /api/shopping-list/:id/toggle
router.patch('/shopping-list/:id/toggle', async (req, res) => {
  try {
    const { checked } = req.body;
    await db.query(
      'UPDATE shopping_items SET checked = $1 WHERE id = $2 AND user_id = $3',
      [checked, req.params.id, req.user.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to toggle shopping item.' });
  }
});

// DELETE /api/shopping-list/:id
router.delete('/shopping-list/:id', async (req, res) => {
  try {
    await db.query(
      'DELETE FROM shopping_items WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete shopping item.' });
  }
});

// GET /api/freezer-meals
router.get('/freezer-meals', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM freezer_meals WHERE user_id = $1 ORDER BY date_frozen DESC',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch freezer meals.' });
  }
});

// POST /api/freezer-meals
router.post('/freezer-meals', async (req, res) => {
  try {
    const { name, portions, date_frozen, notes } = req.body;
    const newFreezer = {
      id: req.body.id || crypto.randomUUID(),
      user_id: req.user.id,
      name: name || 'Batch Meal',
      portions: portions || 1,
      date_frozen: date_frozen || new Date().toISOString().slice(0, 10),
      notes: notes || ''
    };
    await db.query(
      'INSERT INTO freezer_meals (id, user_id, name, portions, date_frozen, notes) VALUES ($1, $2, $3, $4, $5, $6)',
      [newFreezer.id, newFreezer.user_id, newFreezer.name, newFreezer.portions, newFreezer.date_frozen, newFreezer.notes]
    );
    res.status(201).json(newFreezer);
  } catch (err) {
    res.status(500).json({ error: 'Failed to record freezer meal.' });
  }
});

export default router;

import express from 'express';
import crypto from 'crypto';
import db from '../db/index.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();
router.use(requireAuth);

// GET /api/clothing
router.get('/clothing', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM clothing_items WHERE user_id = $1 ORDER BY name ASC',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch closet garments.' });
  }
});

// POST /api/clothing
router.post('/clothing', async (req, res) => {
  try {
    const { name, category, color, laundry_status, worn_count, image_url } = req.body;
    const newItem = {
      id: req.body.id || crypto.randomUUID(),
      user_id: req.user.id,
      name: name || 'Garment',
      category: category || 'Tops',
      color: color || 'Neutral',
      laundry_status: laundry_status || 'clean',
      worn_count: worn_count || 0,
      image_url: image_url || ''
    };
    await db.query(
      'INSERT INTO clothing_items (id, user_id, name, category, color, laundry_status, worn_count, image_url) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
      [newItem.id, newItem.user_id, newItem.name, newItem.category, newItem.color, newItem.laundry_status, newItem.worn_count, newItem.image_url]
    );
    res.status(201).json(newItem);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add garment.' });
  }
});

// PUT /api/clothing/:id
router.put('/clothing/:id', async (req, res) => {
  try {
    const { laundry_status, worn_count } = req.body;
    if (laundry_status !== undefined) {
      await db.query(
        'UPDATE clothing_items SET laundry_status = $1 WHERE id = $2 AND user_id = $3',
        [laundry_status, req.params.id, req.user.id]
      );
    }
    if (worn_count !== undefined) {
      await db.query(
        'UPDATE clothing_items SET worn_count = $1 WHERE id = $2 AND user_id = $3',
        [worn_count, req.params.id, req.user.id]
      );
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update garment.' });
  }
});

// DELETE /api/clothing/:id
router.delete('/clothing/:id', async (req, res) => {
  try {
    await db.query(
      'DELETE FROM clothing_items WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete garment.' });
  }
});

// GET /api/outfits
router.get('/outfits', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM outfits WHERE user_id = $1 ORDER BY is_today DESC, name ASC',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch outfits.' });
  }
});

// POST /api/outfits
router.post('/outfits', async (req, res) => {
  try {
    const { name, occasion, items, last_worn, is_today } = req.body;
    const newOutfit = {
      id: req.body.id || crypto.randomUUID(),
      user_id: req.user.id,
      name: name || 'Outfit',
      occasion: occasion || 'Campus',
      items: JSON.stringify(items || []),
      last_worn: last_worn || new Date().toISOString().slice(0, 10),
      is_today: is_today || false
    };
    const isTodayVal = newOutfit.is_today ? 1 : 0;
    await db.query(
      'INSERT INTO outfits (id, user_id, name, occasion, items, last_worn, is_today) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [newOutfit.id, newOutfit.user_id, newOutfit.name, newOutfit.occasion, newOutfit.items, newOutfit.last_worn, isTodayVal]
    );
    res.status(201).json(newOutfit);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save outfit.' });
  }
});

export default router;

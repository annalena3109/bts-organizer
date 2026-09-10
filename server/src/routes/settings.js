import express from 'express';
import db from '../db/index.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();
router.use(requireAuth);

// GET /api/settings
router.get('/', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT grade_level, currency, week_start as "weekStart", time_format as "timeFormat",
              theme_accent as "themeAccent", target_sleep as "targetSleep", bedtime_goal as "bedtimeGoal",
              morning_reminder as "morningReminder", sunday_reminder as "sundayReminder"
       FROM user_settings WHERE user_id = $1`,
      [req.user.id]
    );
    if (result.rows.length === 0) {
      return res.json({
        currency: '$',
        weekStart: 'Monday',
        timeFormat: '12h',
        themeAccent: 'sage',
        targetSleep: 8,
        bedtimeGoal: '23:00'
      });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch settings.' });
  }
});

// PUT /api/settings/profile
router.put('/profile', async (req, res) => {
  try {
    const { name, email, gradeLevel } = req.body;
    if (name || email) {
      await db.query(
        'UPDATE users SET name = COALESCE($1, name), email = COALESCE($2, email) WHERE id = $3',
        [name, email, req.user.id]
      );
    }
    if (gradeLevel) {
      await db.query(
        `INSERT INTO user_settings (user_id, grade_level) VALUES ($1, $2)
         ON CONFLICT (user_id) DO UPDATE SET grade_level = EXCLUDED.grade_level`,
        [req.user.id, gradeLevel]
      );
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile.' });
  }
});

// PUT /api/settings/preferences
router.put('/preferences', async (req, res) => {
  try {
    const { currency, weekStart, timeFormat, themeAccent, targetSleep, bedtimeGoal, morningReminder, sundayReminder } = req.body;
    await db.query(
      `INSERT INTO user_settings (user_id, currency, week_start, time_format, theme_accent, target_sleep, bedtime_goal, morning_reminder, sunday_reminder)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (user_id) DO UPDATE
       SET currency = COALESCE(EXCLUDED.currency, user_settings.currency),
           week_start = COALESCE(EXCLUDED.week_start, user_settings.week_start),
           time_format = COALESCE(EXCLUDED.time_format, user_settings.time_format),
           theme_accent = COALESCE(EXCLUDED.theme_accent, user_settings.theme_accent),
           target_sleep = COALESCE(EXCLUDED.target_sleep, user_settings.target_sleep),
           bedtime_goal = COALESCE(EXCLUDED.bedtime_goal, user_settings.bedtime_goal),
           morning_reminder = COALESCE(EXCLUDED.morning_reminder, user_settings.morning_reminder),
           sunday_reminder = COALESCE(EXCLUDED.sunday_reminder, user_settings.sunday_reminder)`,
      [req.user.id, currency, weekStart, timeFormat, themeAccent, targetSleep, bedtimeGoal, morningReminder, sundayReminder]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update preferences.' });
  }
});

export default router;

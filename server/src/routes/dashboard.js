import express from 'express';
import db from '../db/index.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();
router.use(requireAuth);

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// GET /api/dashboard
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);
    const dayName = DAYS[today.getDay()];

    // Parallel fetch for speed
    const [tasksRes, budgetRes, expensesRes, mealsRes, sleepRes, outfitRes, roomRes] = await Promise.all([
      db.query('SELECT * FROM tasks WHERE user_id = $1 ORDER BY completed ASC, due_date ASC LIMIT 5', [userId]),
      db.query('SELECT * FROM budgets WHERE user_id = $1', [userId]),
      db.query('SELECT amount, category, date FROM expenses WHERE user_id = $1', [userId]),
      db.query('SELECT * FROM meals WHERE user_id = $1 AND day_of_week = $2', [userId, dayName]),
      db.query('SELECT * FROM sleep_records WHERE user_id = $1 ORDER BY date DESC LIMIT 1', [userId]),
      db.query('SELECT * FROM outfits WHERE user_id = $1 AND is_today = true LIMIT 1', [userId]),
      db.query('SELECT * FROM home_tasks WHERE user_id = $1 LIMIT 4', [userId])
    ]);

    // Compute budget & spending
    const budgetConfig = budgetRes.rows[0] || { daily: 20, weekly: 125, monthly: 500, snack_weekly: 30 };
    const expenses = expensesRes.rows || [];
    const todayExpenses = expenses.filter(e => e.date === todayStr);
    const dailySpent = todayExpenses.reduce((acc, curr) => acc + Number(curr.amount), 0);
    const weeklySpent = expenses.reduce((acc, curr) => acc + Number(curr.amount), 0);

    const mealData = mealsRes.rows[0] || {
      breakfast: 'Overnight oats with chia & berries',
      lunch: 'Prepped quinoa & roasted sweet potato bowl',
      dinner: 'Warm lentil soup & toasted sourdough',
      snack: 'Apple slices with almond butter'
    };

    const sleepRecord = sleepRes.rows[0] || {
      bedtime: '11:15 PM',
      wake_time: '06:45 AM',
      duration_minutes: 450,
      quality: 4
    };
    const sleepHours = Math.floor(sleepRecord.duration_minutes / 60);
    const sleepMins = sleepRecord.duration_minutes % 60;

    const outfitData = outfitRes.rows[0] || {
      name: 'Cozy Study Fit',
      items: ['Oatmeal Knit Cardigan', 'Relaxed Denim', 'Canvas Sneakers'],
      clean: true
    };

    res.json({
      tasks: tasksRes.rows,
      budget: {
        dailyLimit: Number(budgetConfig.daily || 20),
        dailySpent: Number(dailySpent || 0),
        weeklyLimit: Number(budgetConfig.weekly || 125),
        weeklySpent: Number(weeklySpent || 0),
        snackLimit: Number(budgetConfig.snack_weekly || 30),
        snackSpent: Number(dailySpent * 0.4)
      },
      meals: {
        breakfast: mealData.breakfast,
        lunch: mealData.lunch,
        dinner: mealData.dinner,
        snack: mealData.snack,
        isPrepped: true
      },
      sleep: {
        bedtime: sleepRecord.bedtime,
        wakeTime: sleepRecord.wake_time,
        duration: `${sleepHours}h ${sleepMins}m`,
        targetDuration: '8h 00m',
        quality: sleepRecord.quality >= 4 ? 'Well rested' : 'Fair'
      },
      outfit: {
        name: outfitData.name,
        items: typeof outfitData.items === 'string' ? JSON.parse(outfitData.items) : (Array.isArray(outfitData.items) ? outfitData.items : ['Oatmeal Knit Cardigan', 'Relaxed Denim']),
        clean: true
      },
      roomTasks: roomRes.rows
    });
  } catch (err) {
    console.error('Dashboard aggregation error:', err);
    res.status(500).json({ error: 'Failed to aggregate dashboard data.' });
  }
});

export default router;

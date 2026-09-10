import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckSquare,
  Wallet,
  Utensils,
  Moon,
  Shirt,
  Home,
  Plus,
  ArrowRight,
  Clock,
  Sparkles,
  Calendar,
  AlertCircle
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../services/api';

export default function Dashboard() {
  const { user } = useAuth();

  // State with realistic defaults
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Read Chapter 4 of History textbook', category: 'School', priority: 'high', due: 'Today, 4:00 PM', completed: false },
    { id: 2, title: 'Submit Calculus problem set #2', category: 'School', priority: 'high', due: 'Tomorrow, 11:59 PM', completed: false },
    { id: 3, title: 'Review chemistry flashcards (20 min)', category: 'School', priority: 'medium', due: 'Today, 7:00 PM', completed: true },
    { id: 4, title: 'Pick up index cards & binder clips', category: 'Personal', priority: 'low', due: 'Friday', completed: false },
  ]);

  const [budget, setBudget] = useState({
    dailyLimit: 25.00,
    dailySpent: 11.50,
    weeklyLimit: 140.00,
    weeklySpent: 68.20,
    snackLimit: 30.00,
    snackSpent: 14.50
  });

  const [todayMeals, setTodayMeals] = useState({
    breakfast: 'Overnight oats with chia & berries',
    lunch: 'Prepped quinoa & roasted sweet potato bowl',
    dinner: 'Warm lentil soup & toasted sourdough',
    snack: 'Apple slices with almond butter',
    isPrepped: true
  });

  const [sleepInfo, setSleepInfo] = useState({
    bedtime: '11:15 PM',
    wakeTime: '6:45 AM',
    duration: '7h 30m',
    targetDuration: '8h 00m',
    quality: 'Well rested'
  });

  const [outfit, setOutfit] = useState({
    name: 'Cozy Study Fit',
    items: ['Oatmeal Knit Cardigan', 'Relaxed Denim', 'Canvas Sneakers'],
    clean: true
  });

  const [roomTasks, setRoomTasks] = useState([
    { id: 1, title: 'Clear desk of loose papers', completed: true },
    { id: 2, title: 'Quick 5-minute evening room reset', completed: false },
    { id: 3, title: 'Fill water carafe for study desk', completed: false },
  ]);

  // Load real API dashboard data if backend is available
  useEffect(() => {
    async function loadDashboard() {
      try {
        const data = await apiRequest('/dashboard');
        if (data) {
          if (data.tasks) setTasks(data.tasks);
          if (data.budget) setBudget(data.budget);
          if (data.meals) setTodayMeals(data.meals);
          if (data.sleep) setSleepInfo(data.sleep);
          if (data.outfit) setOutfit(data.outfit);
          if (data.roomTasks) setRoomTasks(data.roomTasks);
        }
      } catch (err) {
        // Fallback to default realistic presentation data
      }
    }
    loadDashboard();
  }, []);

  const toggleTask = (taskId) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t));
  };

  const toggleRoomTask = (id) => {
    setRoomTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const todayFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  }).format(new Date());

  const dailyRemaining = (budget.dailyLimit - budget.dailySpent).toFixed(2);
  const dailyPercent = Math.min(100, Math.round((budget.dailySpent / budget.dailyLimit) * 100));

  return (
    <div className="dashboard-page">
      {/* Top Welcome & Date Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1>Good day, {user?.name?.split(' ')[0] || 'Annalena'}</h1>
          <p style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Calendar size={14} />
            <span>{todayFormatted}</span>
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Link to="/tasks">
            <Button variant="primary" icon={Plus} size="sm">New Task</Button>
          </Link>
          <Link to="/budget">
            <Button variant="secondary" icon={Wallet} size="sm">Log Expense</Button>
          </Link>
        </div>
      </div>

      {/* 4 Key Snapshot Glance Cards */}
      <div className="grid-cards" style={{ marginBottom: '1.5rem' }}>
        {/* Tasks Glance */}
        <Card subtle>
          <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>TODAY'S TASKS</span>
            <CheckSquare size={16} color="var(--accent-sage)" />
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            {tasks.filter(t => !t.completed).length} <span style={{ fontSize: '0.85rem', fontWeight: 400, color: 'var(--text-secondary)' }}>remaining</span>
          </div>
          <p style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>
            {tasks.filter(t => t.completed).length} of {tasks.length} tasks completed today
          </p>
        </Card>

        {/* Budget Glance */}
        <Card subtle>
          <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>DAILY BUDGET</span>
            <Wallet size={16} color="var(--accent-amber)" />
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            ${dailyRemaining} <span style={{ fontSize: '0.85rem', fontWeight: 400, color: 'var(--text-secondary)' }}>left today</span>
          </div>
          <div className="progress-bar-container" style={{ marginTop: '0.4rem' }}>
            <div className="progress-bar-fill" style={{ width: `${dailyPercent}%`, background: 'var(--accent-amber)' }} />
          </div>
        </Card>

        {/* Meal Prep Glance */}
        <Card subtle>
          <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>PLANNED DINNER</span>
            <Utensils size={16} color="var(--accent-terracotta)" />
          </div>
          <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>
            {todayMeals.dinner}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.3rem' }}>
            <Badge variant="sage">Prepped & Ready</Badge>
          </div>
        </Card>

        {/* Sleep Glance */}
        <Card subtle>
          <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>LAST NIGHT SLEEP</span>
            <Moon size={16} color="var(--accent-slate)" />
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            {sleepInfo.duration}
          </div>
          <p style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>
            {sleepInfo.bedtime} → {sleepInfo.wakeTime} ({sleepInfo.quality})
          </p>
        </Card>
      </div>

      {/* Main 2-Column Responsive Section */}
      <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
        {/* Left Column: Priority School & Tasks */}
        <Card
          title="School & Study Priorities"
          subtitle="Top upcoming assignments and academic tasks"
          action={
            <Link to="/tasks" style={{ fontSize: '0.8125rem', color: 'var(--accent-sage)', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
              All Tasks <ArrowRight size={14} />
            </Link>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {tasks.map((task) => (
              <div
                key={task.id}
                onClick={() => toggleTask(task.id)}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.75rem',
                  padding: '0.625rem 0.75rem',
                  background: task.completed ? 'var(--bg-card-subtle)' : 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  opacity: task.completed ? 0.65 : 1,
                  transition: 'all var(--transition-fast)'
                }}
              >
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => {}} // handled by parent click
                  style={{ marginTop: '3px', accentColor: 'var(--accent-sage)', cursor: 'pointer' }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    textDecoration: task.completed ? 'line-through' : 'none',
                    color: 'var(--text-primary)'
                  }}>
                    {task.title}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                    <Badge variant={task.priority === 'high' ? 'terracotta' : task.priority === 'medium' ? 'amber' : 'sage'}>
                      {task.priority}
                    </Badge>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <Clock size={11} /> {task.due}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Right Column: Today's Routine & Lifestyle Focus */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Meals Plan Card */}
          <Card
            title="Today's Meal Routine"
            subtitle="Whole foods, prepped to save weekday study time"
            action={
              <Link to="/food" style={{ fontSize: '0.8125rem', color: 'var(--accent-sage)', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                Meal Plan <ArrowRight size={14} />
              </Link>
            }
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
              <div className="flex-between" style={{ padding: '0.35rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Breakfast</span>
                <span style={{ fontWeight: 500 }}>{todayMeals.breakfast}</span>
              </div>
              <div className="flex-between" style={{ padding: '0.35rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Lunch</span>
                <span style={{ fontWeight: 500 }}>{todayMeals.lunch}</span>
              </div>
              <div className="flex-between" style={{ padding: '0.35rem 0' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Dinner</span>
                <span style={{ fontWeight: 500 }}>{todayMeals.dinner}</span>
              </div>
            </div>
          </Card>

          {/* Outfit & Room Quick Sync */}
          <div className="grid-2">
            <Card
              title="Today's Outfit"
              action={
                <Link to="/closet" style={{ fontSize: '0.75rem', color: 'var(--accent-sage)' }}>
                  Closet
                </Link>
              }
            >
              <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {outfit?.name || 'Cozy Study Fit'}
              </p>
              <ul style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', paddingLeft: '1rem', marginTop: '0.35rem' }}>
                {(Array.isArray(outfit?.items) ? outfit.items : []).map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </Card>

            <Card
              title="Room Reset"
              action={
                <Link to="/home-room" style={{ fontSize: '0.75rem', color: 'var(--accent-sage)' }}>
                  Room
                </Link>
              }
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {roomTasks.map((t) => (
                  <label
                    key={t.id}
                    onClick={() => toggleRoomTask(t.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      fontSize: '0.75rem',
                      color: t.completed ? 'var(--text-muted)' : 'var(--text-primary)',
                      textDecoration: t.completed ? 'line-through' : 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={t.completed}
                      onChange={() => {}}
                      style={{ accentColor: 'var(--accent-sage)' }}
                    />
                    <span>{t.title}</span>
                  </label>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Weekly Wrapped Teaser Banner */}
      <Card
        subtle
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          border: '1px solid var(--border-color)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 'var(--radius-sm)',
              background: 'var(--accent-amber-light)',
              color: 'var(--accent-amber)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Sparkles size={20} />
          </div>
          <div>
            <h4 style={{ fontSize: '0.95rem' }}>Sunday Weekly Wrapped Ready</h4>
            <p style={{ fontSize: '0.8rem' }}>
              Review your completed academic tasks, snack budget, and sleep trends for the week.
            </p>
          </div>
        </div>
        <Link to="/weekly-wrapped">
          <Button variant="secondary" size="sm">
            View This Week's Wrapped
          </Button>
        </Link>
      </Card>
    </div>
  );
}

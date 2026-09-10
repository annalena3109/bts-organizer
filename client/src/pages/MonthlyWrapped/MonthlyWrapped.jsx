import React, { useState, useEffect } from 'react';
import {
  CalendarDays,
  Sparkles,
  TrendingUp,
  Award,
  BookOpen,
  Wallet,
  Utensils,
  Moon,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { apiRequest } from '../../services/api';

export default function MonthlyWrapped() {
  const [monthOffset, setMonthOffset] = useState(0); // 0 = current month
  const [monthData, setMonthData] = useState({
    monthLabel: 'September 2026',
    totalSpent: 312.40,
    monthlyBudget: 500.00,
    savedAmount: 187.60,
    tasksFinished: 56,
    schoolAssignments: 34,
    examsPrepped: 4,
    avgSleepHours: '7h 40m',
    sleepConsistency: '91%',
    batchPrepSundays: 4,
    monthlyHighlight: 'Aced both introductory Calculus problem sets and established a steady Saturday morning planning habit.'
  });

  useEffect(() => {
    async function loadMonthly() {
      try {
        const data = await apiRequest(`/wrapped/monthly?offset=${monthOffset}`);
        if (data && data.monthLabel) {
          setMonthData(data);
        }
      } catch (e) {
        // fallback
      }
    }
    loadMonthly();
  }, [monthOffset]);

  const spendPercent = Math.min(100, Math.round((monthData.totalSpent / monthData.monthlyBudget) * 100));

  return (
    <div className="monthly-wrapped-page">
      {/* Header */}
      <div className="page-header">
        <div className="page-title-group">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-sage)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>
            <CalendarDays size={16} />
            <span>MONTHLY RETROSPECTIVE</span>
          </div>
          <h1>Monthly Wrapped</h1>
          <p>Holistic perspective on your semester habits, expenses, and energy over the month.</p>
        </div>

        {/* Month Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-card)', padding: '4px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMonthOffset(prev => prev + 1)}
            title="Previous month"
          >
            <ChevronLeft size={16} />
          </Button>
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, padding: '0 0.5rem' }}>
            {monthOffset === 0 ? 'Current Month' : `${monthOffset} Months Ago`}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMonthOffset(prev => Math.max(0, prev - 1))}
            disabled={monthOffset === 0}
            title="Next month"
          >
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>

      <div style={{ textAlign: 'center', margin: '0 auto 2rem auto', maxWidth: '600px' }}>
        <Badge variant="sage" style={{ fontSize: '0.85rem', padding: '0.4rem 1rem' }}>
          {monthData.monthLabel} Review
        </Badge>
      </div>

      {/* Hero Overview */}
      <div className="grid-cards" style={{ marginBottom: '1.5rem' }}>
        <Card subtle>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>TOTAL SPENDING</span>
          <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
            ${monthData.totalSpent.toFixed(2)}
          </p>
          <div className="progress-bar-container" style={{ margin: '8px 0 4px 0' }}>
            <div className="progress-bar-fill" style={{ width: `${spendPercent}%`, background: 'var(--accent-sage)' }} />
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--accent-sage)', fontWeight: 500 }}>
            ${monthData.savedAmount.toFixed(2)} remaining under budget
          </span>
        </Card>

        <Card subtle>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>COURSEWORK & TASKS</span>
          <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-sage)', marginTop: '4px' }}>
            {monthData.tasksFinished}
          </p>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            {monthData.schoolAssignments} academic assignments finished
          </span>
        </Card>

        <Card subtle>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>REST & CONSISTENCY</span>
          <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-slate)', marginTop: '4px' }}>
            {monthData.avgSleepHours}
          </p>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            {monthData.sleepConsistency} routine consistency score
          </span>
        </Card>
      </div>

      {/* Breakdown Details */}
      <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
        <Card title="Academic & Study Cadence" subtitle="Key milestone summaries across courses">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div className="flex-between" style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Major Exams / Quizzes Prepped</span>
              <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{monthData.examsPrepped}</span>
            </div>
            <div className="flex-between" style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Weekly Meal Prep Sessions</span>
              <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{monthData.batchPrepSundays} Sundays</span>
            </div>
            <div className="flex-between" style={{ padding: '0.5rem 0' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Average Bedtime</span>
              <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>11:20 PM</span>
            </div>
          </div>
        </Card>

        <Card title="Monthly Reflection & Growth" subtitle="Key takeaway for the next calendar month">
          <div style={{ padding: '1rem', background: 'var(--bg-card-subtle)', borderRadius: 'var(--radius-sm)', lineHeight: 1.6, fontStyle: 'italic', color: 'var(--text-primary)' }}>
            "{monthData.monthlyHighlight}"
          </div>
        </Card>
      </div>
    </div>
  );
}

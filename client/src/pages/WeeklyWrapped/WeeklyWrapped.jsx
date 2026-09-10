import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  CheckSquare,
  Wallet,
  Utensils,
  Moon,
  Award,
  ChevronLeft,
  ChevronRight,
  HeartHandshake,
  Calendar
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { apiRequest } from '../../services/api';

export default function WeeklyWrapped() {
  const [weekOffset, setWeekOffset] = useState(0); // 0 = current week
  const [wrapped, setWrapped] = useState({
    weekLabel: 'Week of September 4 - 10, 2026',
    tasksCompleted: 14,
    tasksSchool: 9,
    completionRate: 88,
    totalSpent: 68.20,
    snackSpent: 14.50,
    snackBudgetMet: true,
    mealsPrepped: 12,
    homeCookedRate: 85,
    avgSleepHours: '7h 35m',
    sleepScore: 4.4,
    bestNight: 'Sunday (8h 30m)',
    topAcademicWin: 'Submitted Calculus problem set & completed History chapter readings ahead of schedule.',
    reflectionNote: 'Maintained a balanced study rhythm without burning out. Sunday meal prep saved approximately 4 hours of weekday cooking.'
  });

  useEffect(() => {
    async function loadWrapped() {
      try {
        const data = await apiRequest(`/wrapped/weekly?offset=${weekOffset}`);
        if (data && data.tasksCompleted !== undefined) {
          setWrapped(data);
        }
      } catch (e) {
        // use fallback
      }
    }
    loadWrapped();
  }, [weekOffset]);

  return (
    <div className="weekly-wrapped-page">
      {/* Header */}
      <div className="page-header">
        <div className="page-title-group">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-amber)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>
            <Sparkles size={16} />
            <span>SUNDAY REFLECTION RITUAL</span>
          </div>
          <h1>Weekly Wrapped</h1>
          <p>Celebrate your steady progress across academics, wellness, and mindful living.</p>
        </div>

        {/* Week Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-card)', padding: '4px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setWeekOffset(prev => prev + 1)}
            title="Previous week"
          >
            <ChevronLeft size={16} />
          </Button>
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, padding: '0 0.5rem' }}>
            {weekOffset === 0 ? 'This Week' : `${weekOffset} Weeks Ago`}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setWeekOffset(prev => Math.max(0, prev - 1))}
            disabled={weekOffset === 0}
            title="Next week"
          >
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>

      {/* Week Title Ribbon */}
      <div style={{ textAlign: 'center', margin: '0 auto 2rem auto', maxWidth: '600px' }}>
        <Badge variant="amber" style={{ fontSize: '0.8125rem', padding: '0.35rem 0.85rem' }}>
          <Calendar size={13} /> {wrapped.weekLabel}
        </Badge>
      </div>

      {/* Main Wrapped Cards Grid */}
      <div className="grid-2" style={{ gap: '1.25rem', marginBottom: '1.5rem' }}>
        {/* Card 1: School & Tasks Accomplished */}
        <Card
          style={{
            background: 'linear-gradient(180deg, #FFFFFF 0%, #FAF6F0 100%)',
            border: '1px solid #E6DEC8'
          }}
        >
          <div className="flex-between">
            <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', color: 'var(--accent-sage)', textTransform: 'uppercase' }}>
              Academic & Daily Flow
            </span>
            <CheckSquare size={18} color="var(--accent-sage)" />
          </div>

          <div style={{ margin: '1.25rem 0 0.75rem 0' }}>
            <span style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>
              {wrapped.tasksCompleted}
            </span>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Total tasks brought across the finish line ({wrapped.completionRate}% completion rate).
            </p>
          </div>

          <div style={{ padding: '0.75rem', background: '#FFFFFF', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', marginTop: '1rem' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Week's Academic Highlight:
            </span>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', marginTop: '2px' }}>
              {wrapped.topAcademicWin}
            </p>
          </div>
        </Card>

        {/* Card 2: Mindful Spending & Budget */}
        <Card
          style={{
            background: 'linear-gradient(180deg, #FFFFFF 0%, #FAF4F2 100%)',
            border: '1px solid #E8DDD8'
          }}
        >
          <div className="flex-between">
            <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', color: 'var(--accent-terracotta)', textTransform: 'uppercase' }}>
              Financial Mindfulness
            </span>
            <Wallet size={18} color="var(--accent-terracotta)" />
          </div>

          <div style={{ margin: '1.25rem 0 0.75rem 0' }}>
            <span style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>
              ${wrapped.totalSpent.toFixed(2)}
            </span>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Total weekly student expenses logged.
            </p>
          </div>

          <div style={{ padding: '0.75rem', background: '#FFFFFF', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', marginTop: '1rem' }}>
            <div className="flex-between">
              <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Snack & Coffee Allowance</span>
              <Badge variant="sage">Under Budget</Badge>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              ${wrapped.snackSpent.toFixed(2)} spent of $30.00 allowance. You stayed grounded without unnecessary impulse spending.
            </p>
          </div>
        </Card>

        {/* Card 3: Nourishment & Meal Prep */}
        <Card
          style={{
            background: 'linear-gradient(180deg, #FFFFFF 0%, #F4F7F5 100%)',
            border: '1px solid #D8E5DC'
          }}
        >
          <div className="flex-between">
            <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', color: 'var(--accent-sage)', textTransform: 'uppercase' }}>
              Kitchen & Meal Prep
            </span>
            <Utensils size={18} color="var(--accent-sage)" />
          </div>

          <div style={{ margin: '1.25rem 0 0.75rem 0' }}>
            <span style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>
              {wrapped.mealsPrepped}
            </span>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Home-cooked or prepped meals enjoyed ({wrapped.homeCookedRate}% of weekday dining).
            </p>
          </div>

          <div style={{ padding: '0.75rem', background: '#FFFFFF', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', marginTop: '1rem' }}>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-primary)' }}>
              Sunday batch cooking eliminated late-night study takeout decisions.
            </p>
          </div>
        </Card>

        {/* Card 4: Rest & Recovery */}
        <Card
          style={{
            background: 'linear-gradient(180deg, #FFFFFF 0%, #F1F4F7 100%)',
            border: '1px solid #D2DCE4'
          }}
        >
          <div className="flex-between">
            <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', color: 'var(--accent-slate)', textTransform: 'uppercase' }}>
              Rest & Regeneration
            </span>
            <Moon size={18} color="var(--accent-slate)" />
          </div>

          <div style={{ margin: '1.25rem 0 0.75rem 0' }}>
            <span style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>
              {wrapped.avgSleepHours}
            </span>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Nightly sleep average ({wrapped.sleepScore}/5.0 sleep quality rating).
            </p>
          </div>

          <div style={{ padding: '0.75rem', background: '#FFFFFF', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', marginTop: '1rem' }}>
            <div className="flex-between">
              <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Deepest Night:</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--accent-slate)', fontWeight: 500 }}>{wrapped.bestNight}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Weekly Reflection Prompt */}
      <Card
        title="Weekly Reflection"
        subtitle="A moment to acknowledge what felt effortless and what to nurture next week"
      >
        <div style={{ padding: '1rem', background: 'var(--bg-card-subtle)', borderRadius: 'var(--radius-sm)', fontStyle: 'italic', color: 'var(--text-primary)', lineHeight: 1.6 }}>
          "{wrapped.reflectionNote}"
        </div>
      </Card>
    </div>
  );
}

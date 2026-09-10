import React from 'react';
import { BookOpen, Menu, Sparkles } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const PAGE_TITLES = {
  '/': 'Today',
  '/tasks': 'Tasks & School',
  '/budget': 'Budget & Spending',
  '/food': 'Food & Meal Prep',
  '/closet': 'Outfits & Closet',
  '/sleep': 'Sleep Tracker',
  '/home-room': 'Home & Room',
  '/weekly-wrapped': 'Weekly Wrapped',
  '/monthly-wrapped': 'Monthly Wrapped',
  '/settings': 'Settings',
};

export default function MobileHeader({ onOpenMore }) {
  const location = useLocation();
  const currentTitle = PAGE_TITLES[location.pathname] || 'Back to School';

  return (
    <header className="mobile-top-header">
      <div className="mobile-top-bar-inner">
        <div className="mobile-brand-title">
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 'var(--radius-sm)',
              background: 'var(--accent-sage-light)',
              color: 'var(--accent-sage)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <BookOpen size={16} strokeWidth={2} />
          </div>
          <span style={{ fontSize: '1rem', fontWeight: 600 }}>{currentTitle}</span>
        </div>

        <button
          onClick={onOpenMore}
          className="btn-icon"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-primary)'
          }}
          aria-label="Open menu"
        >
          <Menu size={18} />
        </button>
      </div>
    </header>
  );
}

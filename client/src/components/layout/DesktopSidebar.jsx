import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  CheckSquare,
  Wallet,
  Utensils,
  Shirt,
  Moon,
  Home,
  Sparkles,
  CalendarDays,
  Settings,
  LogOut,
  BookOpen
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function DesktopSidebar() {
  const { user, logout } = useAuth();

  const primaryNav = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/tasks', label: 'Tasks & School', icon: CheckSquare },
    { to: '/budget', label: 'Budget & Expenses', icon: Wallet },
    { to: '/food', label: 'Food & Meal Prep', icon: Utensils },
  ];

  const lifestyleNav = [
    { to: '/closet', label: 'Outfits & Closet', icon: Shirt },
    { to: '/sleep', label: 'Sleep Tracker', icon: Moon },
    { to: '/home-room', label: 'Home & Room', icon: Home },
  ];

  const wrapNav = [
    { to: '/weekly-wrapped', label: 'Weekly Wrapped', icon: Sparkles },
    { to: '/monthly-wrapped', label: 'Monthly Wrapped', icon: CalendarDays },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="desktop-sidebar">
      {/* App Branding */}
      <div className="sidebar-brand">
        <div className="sidebar-logo-icon">
          <BookOpen size={18} strokeWidth={2} />
        </div>
        <div className="sidebar-brand-text">
          <h1>Back to School</h1>
          <span>Personal Organizer</span>
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="sidebar-nav-section">
        <div className="sidebar-section-title">Core</div>
        {primaryNav.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <Icon size={17} strokeWidth={1.8} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      <div className="sidebar-nav-section">
        <div className="sidebar-section-title">Lifestyle & Care</div>
        {lifestyleNav.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <Icon size={17} strokeWidth={1.8} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      <div className="sidebar-nav-section">
        <div className="sidebar-section-title">Reflect & Settings</div>
        {wrapNav.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <Icon size={17} strokeWidth={1.8} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      {/* Sidebar Footer / User Profile */}
      <div className="sidebar-footer">
        <div className="user-mini-badge">
          <div style={{ overflow: 'hidden' }}>
            <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.name || 'Student Account'}
            </p>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.email || 'Logged In'}
            </p>
          </div>
          <button
            onClick={logout}
            title="Log out"
            style={{
              padding: '6px',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}

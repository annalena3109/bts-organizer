import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shirt,
  Moon,
  Home,
  Sparkles,
  CalendarDays,
  Settings,
  LogOut,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function MoreMenuSheet({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  if (!isOpen) return null;

  const moreItems = [
    { to: '/closet', label: 'Outfits & Closet', icon: Shirt },
    { to: '/sleep', label: 'Sleep Tracker', icon: Moon },
    { to: '/home-room', label: 'Home & Room', icon: Home },
    { to: '/weekly-wrapped', label: 'Weekly Wrapped', icon: Sparkles },
    { to: '/monthly-wrapped', label: 'Monthly Wrapped', icon: CalendarDays },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  const handleSelect = (to) => {
    onClose();
    navigate(to);
  };

  const handleLogout = () => {
    onClose();
    logout();
  };

  return (
    <>
      <div className="more-sheet-backdrop" onClick={onClose} />
      <div className="more-sheet">
        <div className="sheet-handle" />
        <div className="flex-between" style={{ marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem' }}>All Sections</h3>
            <p style={{ fontSize: '0.8rem' }}>{user?.email || 'Student Account'}</p>
          </div>
          <button
            onClick={onClose}
            className="btn-icon"
            style={{ color: 'var(--text-muted)' }}
          >
            <X size={20} />
          </button>
        </div>

        <div className="more-menu-grid">
          {moreItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.to}
                type="button"
                className="more-menu-item"
                onClick={() => handleSelect(item.to)}
              >
                <Icon size={24} strokeWidth={1.75} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        <div style={{ paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)' }}>
          <button
            type="button"
            className="btn btn-secondary"
            style={{ width: '100%', color: 'var(--accent-terracotta)', borderColor: 'var(--border-color)' }}
            onClick={handleLogout}
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </>
  );
}

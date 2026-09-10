import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  CheckSquare,
  Wallet,
  Utensils,
  MoreHorizontal
} from 'lucide-react';

export default function MobileNavBar({ onOpenMore }) {
  return (
    <nav className="mobile-bottom-nav">
      <div className="mobile-bottom-nav-inner">
        <NavLink
          to="/"
          end
          className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
        >
          <LayoutDashboard size={20} strokeWidth={1.8} />
          <span>Today</span>
        </NavLink>

        <NavLink
          to="/tasks"
          className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
        >
          <CheckSquare size={20} strokeWidth={1.8} />
          <span>Tasks</span>
        </NavLink>

        <NavLink
          to="/budget"
          className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
        >
          <Wallet size={20} strokeWidth={1.8} />
          <span>Budget</span>
        </NavLink>

        <NavLink
          to="/food"
          className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
        >
          <Utensils size={20} strokeWidth={1.8} />
          <span>Meals</span>
        </NavLink>

        <button
          type="button"
          onClick={onOpenMore}
          className="mobile-nav-item"
        >
          <MoreHorizontal size={20} strokeWidth={1.8} />
          <span>More</span>
        </button>
      </div>
    </nav>
  );
}

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard/Dashboard';
import Tasks from './pages/Tasks/Tasks';
import Budget from './pages/Budget/Budget';
import Food from './pages/Food/Food';
import Outfits from './pages/Outfits/Outfits';
import Sleep from './pages/Sleep/Sleep';
import HomeRoom from './pages/HomeRoom/HomeRoom';
import WeeklyWrapped from './pages/WeeklyWrapped/WeeklyWrapped';
import MonthlyWrapped from './pages/MonthlyWrapped/MonthlyWrapped';
import Settings from './pages/Settings/Settings';
import Auth from './pages/Auth/Auth';
import { useAuth } from './context/AuthContext';
import LoadingState from './components/ui/LoadingState';

// Route guard component
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingState message="Loading your workspace..." />;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />
      <Route path="/login" element={<Navigate to="/auth" replace />} />

      {/* Protected Main Application Layout */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="tasks" element={<Tasks />} />
        <Route path="budget" element={<Budget />} />
        <Route path="food" element={<Food />} />
        <Route path="closet" element={<Outfits />} />
        <Route path="sleep" element={<Sleep />} />
        <Route path="home-room" element={<HomeRoom />} />
        <Route path="weekly-wrapped" element={<WeeklyWrapped />} />
        <Route path="monthly-wrapped" element={<MonthlyWrapped />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

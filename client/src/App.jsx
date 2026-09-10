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

// Error Boundary for mobile & desktop resiliency
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App Error Boundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', textAlign: 'center', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>Something went wrong</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', maxWidth: '360px' }}>
            The app encountered an unexpected error while loading.
          </p>
          <button
            onClick={() => {
              try {
                if ('serviceWorker' in navigator) {
                  navigator.serviceWorker.getRegistrations().then(regs => {
                    for (let reg of regs) reg.unregister();
                  });
                }
              } catch (e) {}
              window.location.reload();
            }}
            className="btn btn-primary"
            style={{ padding: '0.6rem 1.25rem' }}
          >
            Reload App
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

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
    <ErrorBoundary>
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
    </ErrorBoundary>
  );
}

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Lock, Mail, User, ArrowRight, Check } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useAuth } from '../../context/AuthContext';

export default function Auth() {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        if (!name.trim()) throw new Error('Please provide your name.');
        await register(name, email, password);
      } else {
        await login(email, password);
      }
      navigate('/');
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--bg-app)',
        padding: '1.5rem max(1.5rem, env(safe-area-inset-right)) 1.5rem max(1.5rem, env(safe-area-inset-left))'
      }}
    >
      <div style={{ width: '100%', maxWidth: '420px' }}>
        {/* Brand Icon & Heading */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 'var(--radius-md)',
              background: 'var(--accent-sage-light)',
              color: 'var(--accent-sage)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '0.75rem'
            }}
          >
            <BookOpen size={22} strokeWidth={2} />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            Back to School
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            A calm, grounded workspace for your semester and life.
          </p>
        </div>

        <Card style={{ padding: '2rem 1.75rem' }}>
          {/* Mode Switcher */}
          <div
            style={{
              display: 'flex',
              background: 'var(--bg-card-subtle)',
              padding: '3px',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '1.5rem',
              border: '1px solid var(--border-subtle)'
            }}
          >
            <button
              type="button"
              onClick={() => { setIsRegister(false); setError(''); }}
              style={{
                flex: 1,
                padding: '0.45rem',
                fontSize: '0.8125rem',
                fontWeight: !isRegister ? 600 : 500,
                color: !isRegister ? 'var(--text-primary)' : 'var(--text-secondary)',
                background: !isRegister ? 'var(--bg-card)' : 'transparent',
                borderRadius: '4px',
                boxShadow: !isRegister ? 'var(--shadow-sm)' : 'none',
                transition: 'all var(--transition-fast)'
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setIsRegister(true); setError(''); }}
              style={{
                flex: 1,
                padding: '0.45rem',
                fontSize: '0.8125rem',
                fontWeight: isRegister ? 600 : 500,
                color: isRegister ? 'var(--text-primary)' : 'var(--text-secondary)',
                background: isRegister ? 'var(--bg-card)' : 'transparent',
                borderRadius: '4px',
                boxShadow: isRegister ? 'var(--shadow-sm)' : 'none',
                transition: 'all var(--transition-fast)'
              }}
            >
              Create Account
            </button>
          </div>

          {error && (
            <div
              style={{
                padding: '0.75rem',
                marginBottom: '1rem',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--accent-terracotta-light)',
                color: 'var(--accent-terracotta)',
                fontSize: '0.8125rem'
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {isRegister && (
              <Input
                label="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Annalena"
                required
              />
            )}

            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. annalena@school.edu"
              required
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />

            <Button
              variant="primary"
              type="submit"
              loading={loading}
              style={{ width: '100%', marginTop: '0.5rem', padding: '0.65rem' }}
            >
              {isRegister ? 'Create Account' : 'Sign In to Workspace'}
            </Button>
          </form>
        </Card>

        {/* Quiet footer assurance */}
        <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '1.25rem' }}>
          Personal, private, and encrypted. Your data belongs exclusively to you.
        </p>
      </div>
    </div>
  );
}

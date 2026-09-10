import React from 'react';

export default function LoadingState({ message = 'Loading...' }) {
  return (
    <div
      style={{
        padding: '3rem 1rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
        color: 'var(--text-secondary)'
      }}
    >
      <div
        style={{
          width: '28px',
          height: '28px',
          border: '3px solid var(--border-color)',
          borderTopColor: 'var(--accent-sage)',
          borderRadius: '50%',
          animation: 'spin 0.7s linear infinite'
        }}
      />
      <span style={{ fontSize: '0.875rem' }}>{message}</span>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

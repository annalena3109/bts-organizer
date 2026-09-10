import React from 'react';

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action
}) {
  return (
    <div
      style={{
        padding: '3rem 1.5rem',
        textAlign: 'center',
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-md)',
        border: '1px dashed var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.75rem'
      }}
    >
      {Icon && (
        <div
          style={{
            width: '44px',
            height: '44px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--bg-card-subtle)',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Icon size={22} strokeWidth={1.5} />
        </div>
      )}
      <div>
        <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
          {title}
        </h4>
        {description && (
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', maxWidth: '340px', margin: '0.25rem auto 0 auto' }}>
            {description}
          </p>
        )}
      </div>
      {action && <div style={{ marginTop: '0.5rem' }}>{action}</div>}
    </div>
  );
}

import React from 'react';

export default function Tabs({
  tabs, // array of { id, label, icon: Icon, badge }
  activeTab,
  onChange,
  className = ''
}) {
  return (
    <div
      className={`tabs-container ${className}`}
      style={{
        display: 'flex',
        gap: '0.375rem',
        borderBottom: '1px solid var(--border-color)',
        paddingBottom: '2px',
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch'
      }}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.5rem 0.85rem',
              fontSize: '0.875rem',
              fontWeight: isActive ? 600 : 500,
              color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
              borderBottom: isActive ? '2px solid var(--accent-sage)' : '2px solid transparent',
              background: 'transparent',
              marginBottom: '-2px',
              whiteSpace: 'nowrap',
              transition: 'all var(--transition-fast)'
            }}
          >
            {Icon && <Icon size={15} />}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                style={{
                  fontSize: '0.7rem',
                  padding: '1px 6px',
                  borderRadius: 'var(--radius-full)',
                  background: isActive ? 'var(--accent-sage-light)' : 'var(--bg-card-subtle)',
                  color: isActive ? 'var(--accent-sage)' : 'var(--text-secondary)'
                }}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

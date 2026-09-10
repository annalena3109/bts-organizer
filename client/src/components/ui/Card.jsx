import React from 'react';

export default function Card({
  children,
  className = '',
  subtle = false,
  title,
  subtitle,
  action,
  onClick,
  ...props
}) {
  const baseClass = subtle ? 'card-subtle' : 'card';
  return (
    <div className={`${baseClass} ${className}`} onClick={onClick} {...props}>
      {(title || subtitle || action) && (
        <div className="flex-between" style={{ marginBottom: '1rem' }}>
          <div>
            {title && <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>{title}</h3>}
            {subtitle && <p style={{ fontSize: '0.8125rem', marginTop: '2px' }}>{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

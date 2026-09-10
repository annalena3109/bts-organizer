import React from 'react';

export default function Input({
  label,
  id,
  type = 'text',
  error,
  helperText,
  className = '',
  ...props
}) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`form-group ${className}`}>
      {label && (
        <label htmlFor={inputId} className="form-label">
          {label}
        </label>
      )}
      <input
        id={inputId}
        type={type}
        className="form-input"
        style={error ? { borderColor: 'var(--accent-terracotta)' } : {}}
        {...props}
      />
      {error && (
        <span style={{ fontSize: '0.75rem', color: 'var(--accent-terracotta)', marginTop: '2px' }}>
          {error}
        </span>
      )}
      {helperText && !error && (
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
          {helperText}
        </span>
      )}
    </div>
  );
}

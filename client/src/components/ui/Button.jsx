import React from 'react';

export default function Button({
  children,
  variant = 'secondary', // 'primary', 'secondary', 'terracotta', 'ghost'
  size = 'md', // 'sm', 'md', 'icon'
  icon: Icon,
  disabled = false,
  loading = false,
  className = '',
  onClick,
  type = 'button',
  ...props
}) {
  const variantClass = `btn-${variant}`;
  const sizeClass = size === 'sm' ? 'btn-sm' : size === 'icon' ? 'btn-icon' : '';

  return (
    <button
      type={type}
      className={`btn ${variantClass} ${sizeClass} ${className}`}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading ? (
        <span className="btn-spinner" style={{ width: 14, height: 14, border: '2px solid currentColor', borderRightColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.6s linear infinite' }} />
      ) : Icon ? (
        <Icon size={size === 'sm' ? 14 : 16} strokeWidth={1.8} />
      ) : null}
      {children}
    </button>
  );
}

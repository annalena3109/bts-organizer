import React from 'react';

export default function Badge({
  children,
  variant = 'subtle', // 'sage', 'terracotta', 'amber', 'slate', 'subtle'
  className = '',
  icon: Icon
}) {
  return (
    <span className={`badge badge-${variant} ${className}`}>
      {Icon && <Icon size={12} strokeWidth={2} />}
      {children}
    </span>
  );
}

import React from 'react';

interface BadgeProps {
  label: string;
  variant?: 'default' | 'outline' | 'orange' | 'success';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ label, variant = 'default', className = '' }) => {
  const styles = {
    default: 'bg-slate-100 text-slate-700',
    outline: 'border border-slate-200 text-slate-500',
    orange: 'bg-orange-50 text-orange-700 border border-orange-100',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-100'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[variant]} ${className}`}>
      {label}
    </span>
  );
};
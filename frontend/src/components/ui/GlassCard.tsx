import React from 'react';
import clsx from 'clsx';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const GlassCard: React.FC<GlassCardProps> = ({ children, className, ...props }) => {
  return (
    <div
      className={clsx("glass-card", className)}
      style={{
        background: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(0, 245, 255, 0.15)',
        borderRadius: '12px',
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
        padding: '1.5rem',
        transition: 'all 0.3s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'rgba(0, 245, 255, 0.5)';
        e.currentTarget.style.boxShadow = '0 0 15px rgba(0, 245, 255, 0.2)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'rgba(0, 245, 255, 0.15)';
        e.currentTarget.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.1)';
      }}
      {...props}
    >
      {children}
    </div>
  );
};

export default GlassCard;

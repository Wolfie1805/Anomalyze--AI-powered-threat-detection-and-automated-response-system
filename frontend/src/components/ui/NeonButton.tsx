import React from 'react';
import clsx from 'clsx';
import { motion } from 'framer-motion';

interface NeonButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'danger' | 'ghost';
  isLoading?: boolean;
}

const NeonButton: React.FC<NeonButtonProps> = ({
  children,
  variant = 'primary',
  isLoading = false,
  className,
  disabled,
  ...props
}) => {
  const getStyle = () => {
    switch (variant) {
      case 'danger':
        return { borderColor: 'var(--color-red)', color: 'var(--color-red)', boxShadowColor: 'rgba(255, 23, 68, 0.5)' };
      case 'ghost':
        return { borderColor: 'transparent', color: 'white', boxShadowColor: 'transparent' };
      default:
        return { borderColor: 'var(--color-cyan)', color: 'var(--color-cyan)', boxShadowColor: 'rgba(0, 245, 255, 0.5)' };
    }
  };

  const style = getStyle();

  return (
    <motion.button
      whileHover={disabled ? {} : { 
        boxShadow: `0 0 15px ${style.boxShadowColor}, inset 0 0 10px ${style.boxShadowColor}`,
        backgroundColor: variant === 'ghost' ? 'rgba(255,255,255,0.05)' : 'transparent'
      }}
      whileTap={disabled ? {} : { scale: 0.95 }}
      disabled={disabled || isLoading}
      className={clsx("orbitron", className)}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
        padding: '0.75rem 1.5rem', backgroundColor: 'transparent', border: `1px solid ${style.borderColor}`,
        borderRadius: '4px', color: style.color, fontWeight: 'bold', cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1, transition: 'background-color 0.3s ease', textTransform: 'uppercase', letterSpacing: '1px'
      }}
      {...props}
    >
      {isLoading ? (
        <span className="spinner" style={{ width: 16, height: 16, border: `2px solid ${style.color}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      ) : null}
      {children}
      <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
    </motion.button>
  );
};

export default NeonButton;

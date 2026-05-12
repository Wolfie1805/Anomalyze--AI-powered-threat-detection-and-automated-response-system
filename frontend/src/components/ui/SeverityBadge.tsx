import React from 'react';
import clsx from 'clsx';

interface SeverityBadgeProps {
  severity: string;
}

const SeverityBadge: React.FC<SeverityBadgeProps> = ({ severity }) => {
  const getStyle = () => {
    const s = severity?.toLowerCase() || 'low';
    if (s === 'critical') return { color: 'var(--color-red)', bg: 'rgba(255, 23, 68, 0.1)', border: 'rgba(255, 23, 68, 0.3)', pulse: true };
    if (s === 'high') return { color: 'var(--color-red)', bg: 'rgba(255, 23, 68, 0.1)', border: 'rgba(255, 23, 68, 0.2)', pulse: false };
    if (s === 'medium') return { color: 'var(--color-amber)', bg: 'rgba(255, 171, 64, 0.1)', border: 'rgba(255, 171, 64, 0.2)', pulse: false };
    return { color: 'var(--color-green)', bg: 'rgba(57, 255, 20, 0.1)', border: 'rgba(57, 255, 20, 0.2)', pulse: false };
  };

  const style = getStyle();

  return (
    <span
      className={clsx("orbitron", { "pulse-critical": style.pulse })}
      style={{
        display: 'inline-flex', alignItems: 'center', padding: '0.25rem 0.5rem',
        borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase',
        color: style.color, backgroundColor: style.bg, border: `1px solid ${style.border}`,
      }}
    >
      {severity}
    </span>
  );
};

export default SeverityBadge;

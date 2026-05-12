import React from 'react';

interface AlertBadgeProps {
  method: string;
}

const AlertBadge: React.FC<AlertBadgeProps> = ({ method }) => {
  let style = { background: 'rgba(0, 245, 255, 0.1)', color: 'var(--color-cyan)', border: '1px solid rgba(0, 245, 255, 0.3)' };
  
  if (method === 'ML') {
    style = { background: 'rgba(179, 136, 255, 0.1)', color: 'var(--color-purple)', border: '1px solid rgba(179, 136, 255, 0.3)' };
  } else if (method === 'BOTH') {
    style = { background: 'linear-gradient(45deg, rgba(0, 245, 255, 0.1), rgba(179, 136, 255, 0.1))', color: 'white', border: '1px solid rgba(255, 255, 255, 0.3)' };
  }

  return (
    <span className="mono" style={{ padding: '0.15rem 0.4rem', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 'bold', ...style }}>
      {method}
    </span>
  );
};

export default AlertBadge;

import React, { useEffect, useState } from 'react';
import GlassCard from '../ui/GlassCard';

interface ThreatGaugeProps {
  value: number;
}

const ThreatGauge: React.FC<ThreatGaugeProps> = ({ value }) => {
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    setAnimatedValue(value);
  }, [value]);

  const getColor = (v: number) => {
    if (v < 30) return 'var(--color-green)';
    if (v < 60) return 'var(--color-amber)';
    return 'var(--color-red)';
  };

  const color = getColor(animatedValue);
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const arcLength = circumference * 0.75;
  const strokeDashoffset = arcLength - (animatedValue / 100) * arcLength;

  return (
    <GlassCard style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
      <h3 className="orbitron" style={{ fontSize: '1rem', marginBottom: '1rem', color: 'rgba(255,255,255,0.7)' }}>THREAT LEVEL</h3>
      
      <div style={{ position: 'relative', width: '160px', height: '160px' }}>
        <svg width="160" height="160" viewBox="0 0 160 160" style={{ transform: 'rotate(135deg)' }}>
          <circle
            cx="80" cy="80" r={radius}
            fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="12"
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeLinecap="round"
          />
          <circle
            cx="80" cy="80" r={radius}
            fill="none" stroke={color} strokeWidth="12"
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s ease-out, stroke 1s ease' }}
            filter={animatedValue > 70 ? "drop-shadow(0 0 8px var(--color-red))" : "none"}
          />
        </svg>
        
        <div style={{
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          color: color, textShadow: `0 0 10px ${color}`
        }}>
          <span className="orbitron" style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{Math.round(animatedValue)}<span style={{fontSize: '1rem'}}>%</span></span>
        </div>
      </div>
    </GlassCard>
  );
};

export default ThreatGauge;

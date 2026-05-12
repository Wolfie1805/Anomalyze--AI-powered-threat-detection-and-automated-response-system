import React, { useEffect, useState } from 'react';
import Tilt from 'react-parallax-tilt';
import GlassCard from '../ui/GlassCard';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  trend?: number;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, trend }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) {
      setDisplayValue(end);
      return;
    }
    
    let totalDuration = 1000;
    let incrementTime = Math.abs(Math.floor(totalDuration / end));
    if (incrementTime < 10) incrementTime = 10;
    
    const timer = setInterval(() => {
      start += Math.ceil(end / (totalDuration / incrementTime));
      if (start >= end) {
        setDisplayValue(end);
        clearInterval(timer);
      } else {
        setDisplayValue(start);
      }
    }, incrementTime);
    
    return () => clearInterval(timer);
  }, [value]);

  return (
    <Tilt tiltMaxAngleX={5} tiltMaxAngleY={5} scale={1.02} transitionSpeed={2500}>
      <GlassCard style={{ position: 'relative', overflow: 'hidden', height: '100%' }}>
        <div style={{ position: 'absolute', top: '-20%', right: '-20%', width: '100px', height: '100px', background: color, filter: 'blur(50px)', opacity: 0.2, borderRadius: '50%' }} />
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }} className="orbitron">
              {title}
            </div>
            <div className="mono" style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white', textShadow: `0 0 10px ${color}` }}>
              {displayValue.toLocaleString()}
            </div>
          </div>
          <div style={{ color: color, background: `${color}20`, padding: '0.5rem', borderRadius: '8px' }}>
            {icon}
          </div>
        </div>

        {trend !== undefined && (
          <div style={{ display: 'flex', alignItems: 'center', marginTop: '1rem', fontSize: '0.8rem', color: trend >= 0 ? 'var(--color-green)' : 'var(--color-amber)' }}>
            {trend >= 0 ? <TrendingUp size={14} style={{ marginRight: '0.25rem' }} /> : <TrendingDown size={14} style={{ marginRight: '0.25rem' }} />}
            <span>{Math.abs(trend)}% from yesterday</span>
          </div>
        )}
      </GlassCard>
    </Tilt>
  );
};

export default StatCard;

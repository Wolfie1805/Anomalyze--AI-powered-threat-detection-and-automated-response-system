import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useWsStore } from '../../store/wsStore';
import { useAlertStore } from '../../store/alertStore';

const TopBar: React.FC = () => {
  const [time, setTime] = useState(new Date());
  const { isConnected } = useWsStore();
  const { alerts } = useAlertStore();
  
  const hasHighAlerts = alerts.some(a => (a.severity === 'high' || a.severity === 'critical') && a.status !== 'resolved');
  const unreadCount = alerts.filter(a => a.status === 'new').length;

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{ 
      height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', 
      padding: '0 2rem', background: 'rgba(10, 10, 15, 0.5)', backdropFilter: 'blur(10px)',
      borderBottom: '1px solid var(--color-glass-border)', gap: '2rem'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <div 
          className={hasHighAlerts ? 'pulse-critical' : ''}
          style={{ 
            width: 8, height: 8, borderRadius: '50%', 
            background: hasHighAlerts ? 'var(--color-red)' : 'var(--color-green)',
            boxShadow: hasHighAlerts ? '0 0 8px var(--color-red)' : '0 0 8px var(--color-green)'
          }} 
        />
        <span className="orbitron" style={{ 
          fontSize: '0.8rem', color: hasHighAlerts ? 'var(--color-red)' : 'var(--color-green)',
          fontWeight: 'bold', letterSpacing: '1px'
        }}>
          {hasHighAlerts ? 'THREAT DETECTED' : 'SYSTEM OPERATIONAL'}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <div style={{ 
            width: 8, height: 8, borderRadius: '50%', 
            background: isConnected ? 'var(--color-green)' : 'var(--color-red)'
        }} />
        <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>
          {isConnected ? 'WS CONNECTED' : 'WS DISCONNECTED'}
        </span>
      </div>

      <div className="mono" style={{ fontSize: '1.2rem', color: 'var(--color-cyan)', textShadow: '0 0 5px rgba(0,245,255,0.5)' }}>
        {time.toLocaleTimeString('en-US', { hour12: false })}
      </div>

      <div style={{ position: 'relative', cursor: 'pointer' }}>
        <Bell size={20} color="rgba(255,255,255,0.8)" />
        {unreadCount > 0 && (
          <div style={{
            position: 'absolute', top: -5, right: -5, background: 'var(--color-red)', color: 'white',
            fontSize: '0.6rem', fontWeight: 'bold', width: 16, height: 16, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </div>
        )}
      </div>
    </div>
  );
};

export default TopBar;

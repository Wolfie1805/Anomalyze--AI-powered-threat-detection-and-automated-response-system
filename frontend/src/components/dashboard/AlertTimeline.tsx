import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAlertStore } from '../../store/alertStore';
import GlassCard from '../ui/GlassCard';

const AlertTimeline: React.FC = () => {
  const { alerts } = useAlertStore();
  const recentAlerts = alerts.slice(0, 20);

  const getColor = (sev: string) => {
    if (sev === 'critical' || sev === 'high') return 'var(--color-red)';
    if (sev === 'medium') return 'var(--color-amber)';
    return 'var(--color-green)';
  };

  const getTimeAgo = (ts: string) => {
    const diff = Math.floor((new Date().getTime() - new Date(ts).getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
    return `${Math.floor(diff/3600)}h ago`;
  };

  return (
    <GlassCard style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <h3 className="orbitron" style={{ fontSize: '1rem', marginBottom: '1rem', color: 'rgba(255,255,255,0.7)', borderBottom: '1px solid var(--color-glass-border)', paddingBottom: '0.5rem' }}>
        LIVE ALERT FEED
      </h3>
      <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <AnimatePresence>
          {recentAlerts.map((alert) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              style={{
                display: 'flex', alignItems: 'center', padding: '0.75rem',
                background: 'rgba(255,255,255,0.02)', borderRadius: '6px',
                borderLeft: `3px solid ${getColor(alert.severity)}`,
                cursor: 'pointer'
              }}
              whileHover={{ background: 'rgba(255,255,255,0.05)' }}
            >
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: getColor(alert.severity), boxShadow: `0 0 5px ${getColor(alert.severity)}`, marginRight: '1rem' }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{alert.rule_name}</div>
                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)' }}>IP: {alert.description.match(/\d+\.\d+\.\d+\.\d+/)?.[0] || 'Unknown'} 🌐</div>
              </div>
              <div className="mono" style={{ fontSize: '0.7rem', color: 'var(--color-cyan)', marginLeft: '1rem' }}>
                {getTimeAgo(alert.timestamp)}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {recentAlerts.length === 0 && <div style={{ color: 'rgba(255,255,255,0.5)', textAlign: 'center', marginTop: '2rem' }}>No recent alerts</div>}
      </div>
    </GlassCard>
  );
};

export default AlertTimeline;

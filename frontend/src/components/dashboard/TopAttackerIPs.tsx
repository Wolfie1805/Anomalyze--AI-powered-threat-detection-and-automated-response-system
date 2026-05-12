import React from 'react';
import GlassCard from '../ui/GlassCard';
import SeverityBadge from '../ui/SeverityBadge';

const mockData = [
  { ip: '192.168.1.45', country: 'RU', count: 1245, severity: 'critical', lastSeen: '2m ago' },
  { ip: '10.0.0.8', country: 'CN', count: 890, severity: 'high', lastSeen: '5m ago' },
  { ip: '172.16.0.1', country: 'KP', count: 432, severity: 'medium', lastSeen: '12m ago' },
];

const TopAttackerIPs: React.FC = () => {
  return (
    <GlassCard>
      <h3 className="orbitron" style={{ fontSize: '1rem', marginBottom: '1rem', color: 'rgba(255,255,255,0.7)' }}>TOP ATTACKER IPs</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--color-glass-border)', color: 'rgba(255,255,255,0.5)', textAlign: 'left' }}>
            <th style={{ padding: '0.5rem' }}>IP</th>
            <th style={{ padding: '0.5rem' }}>Location</th>
            <th style={{ padding: '0.5rem' }}>Count</th>
            <th style={{ padding: '0.5rem' }}>Severity</th>
          </tr>
        </thead>
        <tbody>
          {mockData.map((row, i) => (
            <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <td className="mono" style={{ padding: '0.5rem', color: 'var(--color-cyan)' }}>{row.ip}</td>
              <td style={{ padding: '0.5rem' }}>{row.country}</td>
              <td className="mono" style={{ padding: '0.5rem' }}>{row.count}</td>
              <td style={{ padding: '0.5rem' }}><SeverityBadge severity={row.severity} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </GlassCard>
  );
};

export default TopAttackerIPs;

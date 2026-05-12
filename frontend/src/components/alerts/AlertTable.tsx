import React, { useState } from 'react';
import GlassCard from '../ui/GlassCard';
import SeverityBadge from '../ui/SeverityBadge';
import AlertBadge from './AlertBadge';
import { useAlertStore } from '../../store/alertStore';
import AlertDetailModal from './AlertDetailModal';

const AlertTable: React.FC = () => {
  const { alerts, isLoading } = useAlertStore();
  const [selectedAlert, setSelectedAlert] = useState<any>(null);

  if (isLoading) return <div>Loading alerts...</div>;

  return (
    <>
      <GlassCard style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid var(--color-glass-border)' }}>
              <tr>
                <th style={{ padding: '1rem', textAlign: 'left', color: 'rgba(255,255,255,0.7)' }}>ID</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: 'rgba(255,255,255,0.7)' }}>Severity</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: 'rgba(255,255,255,0.7)' }}>Rule / Type</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: 'rgba(255,255,255,0.7)' }}>IP</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: 'rgba(255,255,255,0.7)' }}>Detection</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: 'rgba(255,255,255,0.7)' }}>Status</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: 'rgba(255,255,255,0.7)' }}>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {alerts.map((alert, i) => (
                <tr 
                  key={alert.id} 
                  style={{ 
                    borderBottom: '1px solid rgba(255,255,255,0.02)',
                    background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
                    cursor: 'pointer',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,245,255,0.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)'}
                  onClick={() => setSelectedAlert(alert)}
                >
                  <td className="mono" style={{ padding: '1rem', color: 'rgba(255,255,255,0.5)' }}>#{alert.id}</td>
                  <td style={{ padding: '1rem' }}><SeverityBadge severity={alert.severity} /></td>
                  <td style={{ padding: '1rem', fontWeight: 'bold' }}>{alert.rule_name}</td>
                  <td className="mono" style={{ padding: '1rem', color: 'var(--color-cyan)' }}>{alert.description.match(/\d+\.\d+\.\d+\.\d+/)?.[0] || 'N/A'}</td>
                  <td style={{ padding: '1rem' }}><AlertBadge method={alert.rule_name.includes('ML') ? 'ML' : 'RULE'} /></td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ 
                      padding: '0.2rem 0.5rem', borderRadius: '12px', fontSize: '0.7rem', textTransform: 'uppercase',
                      background: alert.status === 'resolved' ? 'rgba(57,255,20,0.1)' : 'rgba(255,171,64,0.1)',
                      color: alert.status === 'resolved' ? 'var(--color-green)' : 'var(--color-amber)'
                    }}>
                      {alert.status}
                    </span>
                  </td>
                  <td className="mono" style={{ padding: '1rem', color: 'rgba(255,255,255,0.5)' }}>{new Date(alert.timestamp).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
      
      {selectedAlert && <AlertDetailModal alert={selectedAlert} onClose={() => setSelectedAlert(null)} />}
    </>
  );
};

export default AlertTable;

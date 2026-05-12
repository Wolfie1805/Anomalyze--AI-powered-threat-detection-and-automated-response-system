import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Ban, Mail, CheckCircle, AlertTriangle } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import NeonButton from '../components/ui/NeonButton';

const ResponsesPage: React.FC = () => {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="dashboard-grid" style={{ height: '100%', alignContent: 'start' }}>
      <GlassCard style={{ gridColumn: 'span 12', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem' }}>
        <div>
          <h2 className="orbitron" style={{ margin: 0, fontSize: '1.5rem', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldAlert color="var(--color-cyan)" /> AUTOMATED RESPONSES
          </h2>
          <p style={{ margin: 0, marginTop: '0.5rem', color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>Active firewall rules and notification history.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <NeonButton variant="ghost"><Mail size={16} /> Test Email Alert</NeonButton>
          <NeonButton variant="primary"><Ban size={16} /> Manual IP Block</NeonButton>
        </div>
      </GlassCard>

      <GlassCard style={{ gridColumn: 'span 8', height: 'calc(100vh - 200px)', display: 'flex', flexDirection: 'column' }}>
        <h3 className="orbitron" style={{ fontSize: '1rem', marginBottom: '1rem', color: 'rgba(255,255,255,0.7)' }}>IP BLOCKLIST (ACTIVE)</h3>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid var(--color-glass-border)' }}>
              <tr>
                <th style={{ padding: '1rem', textAlign: 'left', color: 'rgba(255,255,255,0.7)' }}>IP Address</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: 'rgba(255,255,255,0.7)' }}>Triggered By</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: 'rgba(255,255,255,0.7)' }}>Time Blocked</th>
                <th style={{ padding: '1rem', textAlign: 'right', color: 'rgba(255,255,255,0.7)' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {[1,2,3,4,5].map(i => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                  <td className="mono" style={{ padding: '1rem', color: 'var(--color-cyan)' }}>192.168.1.{100+i}</td>
                  <td style={{ padding: '1rem' }}>SQL Injection (Rule #4)</td>
                  <td className="mono" style={{ padding: '1rem', color: 'rgba(255,255,255,0.5)' }}>{new Date().toLocaleString()}</td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}><NeonButton variant="ghost" style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem' }}>Unblock</NeonButton></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      <GlassCard style={{ gridColumn: 'span 4', height: 'calc(100vh - 200px)', display: 'flex', flexDirection: 'column' }}>
        <h3 className="orbitron" style={{ fontSize: '1rem', marginBottom: '1rem', color: 'rgba(255,255,255,0.7)' }}>RESPONSE LOG</h3>
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {[1,2,3,4,5,6].map(i => (
            <div key={i} style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', borderLeft: i % 3 === 0 ? '2px solid var(--color-amber)' : '2px solid var(--color-green)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>{i % 2 === 0 ? 'Email Alert Sent' : 'Firewall Rule Added'}</span>
                {i % 3 === 0 ? <AlertTriangle size={14} color="var(--color-amber)" /> : <CheckCircle size={14} color="var(--color-green)" />}
              </div>
              <div className="mono" style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)' }}>Target: admin@soc.local</div>
            </div>
          ))}
        </div>
      </GlassCard>
    </motion.div>
  );
};

export default ResponsesPage;

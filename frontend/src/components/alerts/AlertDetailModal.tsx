import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, ShieldAlert, Activity } from 'lucide-react';
import GlassCard from '../ui/GlassCard';
import SeverityBadge from '../ui/SeverityBadge';
import NeonButton from '../ui/NeonButton';

interface AlertDetailModalProps {
  alert: any;
  onClose: () => void;
}

const AlertDetailModal: React.FC<AlertDetailModalProps> = ({ alert, onClose }) => {
  const [note, setNote] = useState('');

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ width: '100%', maxWidth: '900px', maxHeight: '90vh', overflowY: 'auto' }}>
        <GlassCard style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '2rem' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--color-glass-border)', paddingBottom: '1rem' }}>
            <div>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                <SeverityBadge severity={alert.severity} />
                <span style={{ padding: '0.2rem 0.5rem', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', fontSize: '0.7rem', textTransform: 'uppercase' }}>{alert.status}</span>
              </div>
              <h2 className="orbitron" style={{ fontSize: '1.5rem', color: 'white', margin: 0 }}>{alert.rule_name}</h2>
            </div>
            <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}><X /></button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '8px' }}>
              <h4 style={{ color: 'var(--color-cyan)', marginBottom: '0.5rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Activity size={14}/> Metadata</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '0.5rem', fontSize: '0.85rem' }}>
                <span style={{ color: 'rgba(255,255,255,0.5)' }}>Timestamp:</span> <span className="mono">{new Date(alert.timestamp).toLocaleString()}</span>
                <span style={{ color: 'rgba(255,255,255,0.5)' }}>Source IP:</span> <span className="mono">{alert.description.match(/\d+\.\d+\.\d+\.\d+/)?.[0] || 'Unknown'}</span>
                <span style={{ color: 'rgba(255,255,255,0.5)' }}>Alert ID:</span> <span className="mono">#{alert.id}</span>
              </div>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '8px' }}>
              <h4 style={{ color: 'var(--color-purple)', marginBottom: '0.5rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><ShieldAlert size={14}/> Context</h4>
              <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.5 }}>
                {alert.description}
              </p>
            </div>
          </div>

          <div>
            <h4 style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '0.5rem', fontSize: '0.8rem' }}>Update Status</h4>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <NeonButton variant="ghost">Acknowledge</NeonButton>
              <NeonButton variant="ghost">Investigate</NeonButton>
              <NeonButton variant="primary">Resolve</NeonButton>
              <NeonButton variant="danger">False Positive</NeonButton>
            </div>
          </div>

          <div>
            <h4 style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '0.5rem', fontSize: '0.8rem' }}>Analyst Notes</h4>
            <textarea 
              value={note} onChange={(e) => setNote(e.target.value)}
              placeholder="Add investigation notes here..."
              style={{ width: '100%', minHeight: '100px', marginBottom: '0.5rem' }}
            />
            <NeonButton variant="primary">Save Note</NeonButton>
          </div>

        </GlassCard>
      </motion.div>
    </div>
  );
};

export default AlertDetailModal;

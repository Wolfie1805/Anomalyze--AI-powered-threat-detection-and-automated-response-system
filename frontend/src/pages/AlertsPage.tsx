import React from 'react';
import { motion } from 'framer-motion';
import { Download } from 'lucide-react';
import AlertFilters from '../components/alerts/AlertFilters';
import AlertTable from '../components/alerts/AlertTable';
import NeonButton from '../components/ui/NeonButton';
import { useAlerts } from '../hooks/useAlerts';

const AlertsPage: React.FC = () => {
  useAlerts();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 className="orbitron" style={{ margin: 0, color: 'white', fontSize: '1.5rem' }}>ALERT CENTER</h2>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', background: 'rgba(255, 23, 68, 0.1)', color: 'var(--color-red)', padding: '0.2rem 0.5rem', borderRadius: '12px' }}>12 Critical</span>
            <span style={{ fontSize: '0.75rem', background: 'rgba(255, 23, 68, 0.1)', color: 'var(--color-red)', padding: '0.2rem 0.5rem', borderRadius: '12px' }}>45 High</span>
            <span style={{ fontSize: '0.75rem', background: 'rgba(255, 171, 64, 0.1)', color: 'var(--color-amber)', padding: '0.2rem 0.5rem', borderRadius: '12px' }}>128 Medium</span>
          </div>
        </div>
        <NeonButton variant="ghost"><Download size={16} /> Export CSV</NeonButton>
      </div>

      <AlertFilters />
      
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <AlertTable />
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem', gap: '0.5rem' }}>
        <NeonButton variant="ghost" disabled>Prev</NeonButton>
        <div style={{ padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}>Page 1 of 10</div>
        <NeonButton variant="ghost">Next</NeonButton>
      </div>
    </motion.div>
  );
};

export default AlertsPage;

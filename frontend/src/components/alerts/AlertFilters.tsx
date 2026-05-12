import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, X } from 'lucide-react';
import GlassCard from '../ui/GlassCard';
import NeonButton from '../ui/NeonButton';

const AlertFilters: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{ marginBottom: '1rem' }}>
      <NeonButton variant="ghost" onClick={() => setIsOpen(!isOpen)} style={{ marginBottom: '0.5rem' }}>
        <Filter size={16} /> Filters
      </NeonButton>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: 'hidden' }}
          >
            <GlassCard style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '1rem', alignItems: 'end' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', marginBottom: '0.25rem' }}>Severity</label>
                <select style={{ width: '100%' }}>
                  <option value="">All</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', marginBottom: '0.25rem' }}>Status</label>
                <select style={{ width: '100%' }}>
                  <option value="">All</option>
                  <option value="new">New</option>
                  <option value="investigated">Investigated</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', marginBottom: '0.25rem' }}>Search</label>
                <input type="text" placeholder="IP, Rule, etc..." style={{ width: '100%' }} />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <NeonButton variant="primary">Apply</NeonButton>
                <NeonButton variant="ghost"><X size={16} /></NeonButton>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AlertFilters;

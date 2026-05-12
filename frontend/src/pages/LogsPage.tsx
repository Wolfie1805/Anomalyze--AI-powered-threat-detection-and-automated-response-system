import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Download, Terminal, Settings } from 'lucide-react';
import LiveTerminal from '../components/dashboard/LiveTerminal';
import GlassCard from '../components/ui/GlassCard';
import NeonButton from '../components/ui/NeonButton';

const LogsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('syslog');

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', height: '100%', gap: '1rem' }}>
      <GlassCard style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Terminal size={24} color="var(--color-cyan)" />
          <h2 className="orbitron" style={{ margin: 0, fontSize: '1.2rem' }}>LOG EXPLORER</h2>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', background: 'rgba(0,0,0,0.5)', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--color-glass-border)' }}>
            {['syslog', 'auth.log', 'nginx/access', 'apache2'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '0.5rem 1rem', background: activeTab === tab ? 'var(--color-cyan)' : 'transparent',
                  color: activeTab === tab ? 'black' : 'white', border: 'none', cursor: 'pointer',
                  fontWeight: activeTab === tab ? 'bold' : 'normal', transition: 'all 0.2s'
                }}
              >
                {tab}
              </button>
            ))}
          </div>
          <div style={{ width: '1px', height: '24px', background: 'var(--color-glass-border)' }} />
          <input type="text" placeholder="Regex search..." style={{ width: '200px' }} />
          <NeonButton variant="ghost"><Upload size={16} /> Upload</NeonButton>
          <NeonButton variant="ghost"><Download size={16} /></NeonButton>
          <NeonButton variant="ghost"><Settings size={16} /></NeonButton>
        </div>
      </GlassCard>

      <div style={{ flex: 1, overflow: 'hidden' }}>
        <LiveTerminal />
      </div>
    </motion.div>
  );
};

export default LogsPage;

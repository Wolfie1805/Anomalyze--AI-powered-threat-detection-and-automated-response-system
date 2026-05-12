import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '../components/ui/GlassCard';
import NeonButton from '../components/ui/NeonButton';

const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('rules');
  const tabs = [
    { id: 'rules', label: 'Detection Rules' },
    { id: 'ml', label: 'ML Settings' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'sources', label: 'Log Sources' },
    { id: 'account', label: 'Account' },
    { id: 'system', label: 'System Info' },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: '1.5rem', height: '100%', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <h2 className="orbitron" style={{ margin: 0, fontSize: '1.5rem' }}>SYSTEM CONFIGURATION</h2>
      
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--color-glass-border)', paddingBottom: '0.5rem' }}>
        {tabs.map(tab => (
          <button
            key={tab.id} onClick={() => setActiveTab(tab.id)} className="orbitron"
            style={{
              background: 'transparent', border: 'none', padding: '0.5rem 1rem', cursor: 'pointer',
              color: activeTab === tab.id ? 'var(--color-cyan)' : 'rgba(255,255,255,0.5)',
              borderBottom: activeTab === tab.id ? '2px solid var(--color-cyan)' : '2px solid transparent',
              transition: 'all 0.3s'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <GlassCard style={{ flex: 1, overflowY: 'auto' }}>
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
            {activeTab === 'rules' && (
              <div>
                <h3 className="orbitron" style={{ marginBottom: '1rem', color: 'var(--color-cyan)' }}>Rule Configuration</h3>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', marginBottom: '2rem' }}>Toggle heuristic detection rules on or off.</p>
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {['SQL Injection', 'Cross-Site Scripting (XSS)', 'Path Traversal', 'Brute Force Detection'].map((rule, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                      <div>
                        <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>{rule}</div>
                        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>Detects common patterns associated with {rule.toLowerCase()}.</div>
                      </div>
                      <div style={{ width: 40, height: 20, background: 'var(--color-cyan)', borderRadius: '10px', position: 'relative', cursor: 'pointer' }}>
                        <div style={{ width: 16, height: 16, background: 'white', borderRadius: '50%', position: 'absolute', top: 2, right: 2 }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {activeTab === 'ml' && (
              <div>
                <h3 className="orbitron" style={{ marginBottom: '1rem', color: 'var(--color-purple)' }}>Machine Learning</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '500px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem' }}>Contamination Threshold</label>
                    <input type="range" min="0.01" max="0.2" step="0.01" defaultValue="0.05" style={{ width: '100%' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.25rem' }}>
                      <span>Strict (0.01)</span><span>Current: 0.05</span><span>Relaxed (0.20)</span>
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem' }}>Retraining Schedule</label>
                    <select style={{ width: '100%' }}>
                      <option>Daily</option><option selected>Weekly (Sunday 00:00)</option><option>Monthly</option><option>Manual Only</option>
                    </select>
                  </div>
                  <NeonButton variant="primary" style={{ alignSelf: 'flex-start' }}>Save ML Settings</NeonButton>
                </div>
              </div>
            )}

            {activeTab === 'system' && (
              <div>
                <h3 className="orbitron" style={{ marginBottom: '1rem', color: 'var(--color-cyan)' }}>System Information</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '1rem', fontSize: '0.85rem' }}>
                  <div style={{ color: 'rgba(255,255,255,0.5)' }}>Backend Version</div><div className="mono">v1.2.0-stable</div>
                  <div style={{ color: 'rgba(255,255,255,0.5)' }}>Uptime</div><div className="mono">14d 2h 45m</div>
                  <div style={{ color: 'rgba(255,255,255,0.5)' }}>Database Size</div><div className="mono">45.2 MB (SQLite)</div>
                  <div style={{ color: 'rgba(255,255,255,0.5)' }}>ML Model</div><div className="mono">IsolationForest (scikit-learn)</div>
                </div>
              </div>
            )}
            
            {['notifications', 'sources', 'account'].includes(activeTab) && (
              <div style={{ color: 'rgba(255,255,255,0.5)', fontStyle: 'italic' }}>Configuration options for {activeTab} will appear here.</div>
            )}
          </motion.div>
        </AnimatePresence>
      </GlassCard>
    </motion.div>
  );
};

export default SettingsPage;

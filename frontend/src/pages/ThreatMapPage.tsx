import React from 'react';
import { motion } from 'framer-motion';
import WorldThreatMap from '../components/map/WorldThreatMap';
import TopAttackerIPs from '../components/dashboard/TopAttackerIPs';
import GlassCard from '../components/ui/GlassCard';

const ThreatMapPage: React.FC = () => {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="dashboard-grid" style={{ height: '100%' }}>
      
      <div style={{ gridColumn: 'span 12', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', height: '100px' }}>
        <GlassCard style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }} className="orbitron">UNIQUE ATTACKER IPs</div>
          <div style={{ fontSize: '1.8rem', color: 'var(--color-cyan)' }} className="mono">8,492</div>
        </GlassCard>
        <GlassCard style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }} className="orbitron">TARGETED COUNTRIES</div>
          <div style={{ fontSize: '1.8rem', color: 'var(--color-amber)' }} className="mono">142</div>
        </GlassCard>
        <GlassCard style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }} className="orbitron">MOST TARGETED PORT</div>
          <div style={{ fontSize: '1.8rem', color: 'var(--color-red)' }} className="mono">22 (SSH)</div>
        </GlassCard>
      </div>

      <div style={{ gridColumn: 'span 8', height: 'calc(100vh - 250px)' }}>
        <WorldThreatMap />
      </div>

      <div style={{ gridColumn: 'span 4', height: 'calc(100vh - 250px)' }}>
        <TopAttackerIPs />
      </div>

    </motion.div>
  );
};

export default ThreatMapPage;

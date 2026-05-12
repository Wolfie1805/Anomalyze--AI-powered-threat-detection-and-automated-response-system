import React from 'react';
import { motion } from 'framer-motion';
import MatrixBackground from '../ui/MatrixBackground';

const LoadingScreen: React.FC = () => {
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'var(--color-bg)', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', zIndex: 9999
    }}>
      <MatrixBackground />
      <h1 className="orbitron glitch-anim" style={{ fontSize: '4rem', color: 'var(--color-cyan)', textShadow: '0 0 20px var(--color-cyan)', margin: 0 }}>
        ANOMALYZE
      </h1>
      <div className="mono" style={{ marginTop: '1rem', color: 'rgba(255,255,255,0.7)', overflow: 'hidden', whiteSpace: 'nowrap', animation: 'typing 2s steps(40, end)' }}>
        INITIALIZING SYSTEMS...
      </div>
      <div style={{ marginTop: '2rem', width: '300px', height: '2px', background: 'rgba(0,245,255,0.2)', overflow: 'hidden' }}>
        <motion.div
          initial={{ x: '-100%' }}
          animate={{ x: '100%' }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
          style={{ width: '50%', height: '100%', background: 'var(--color-cyan)', boxShadow: '0 0 10px var(--color-cyan)' }}
        />
      </div>
    </div>
  );
};

export default LoadingScreen;

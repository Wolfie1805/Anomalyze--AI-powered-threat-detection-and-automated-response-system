import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import MatrixBackground from '../components/ui/MatrixBackground';
import GlassCard from '../components/ui/GlassCard';
import NeonButton from '../components/ui/NeonButton';
import { motion, AnimatePresence } from 'framer-motion';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { loginUser, isLoading, error } = useAuthStore();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await loginUser({ username, password });
      navigate('/dashboard');
    } catch (err) {
      // Error handled by store
    }
  };

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <MatrixBackground />
      <AnimatePresence>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1 }} transition={{ duration: 0.5 }}>
          <GlassCard className={error ? 'shake' : ''} style={{ width: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem 2rem' }}>
            <h1 className="orbitron glitch-anim" style={{ fontSize: '2.5rem', color: 'var(--color-cyan)', margin: 0, textShadow: '0 0 15px var(--color-cyan)' }}>ANOMALYZE</h1>
            <p className="mono" style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginBottom: '2rem', letterSpacing: '2px' }}>CYBER THREAT DETECTION SYSTEM</p>
            <form onSubmit={handleLogin} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div><input type="text" placeholder="USERNAME" value={username} onChange={(e) => setUsername(e.target.value)} style={{ width: '100%', textTransform: 'uppercase', letterSpacing: '1px' }} required /></div>
              <div><input type="password" placeholder="PASSWORD" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', letterSpacing: '2px' }} required /></div>
              {error && <div style={{ color: 'var(--color-red)', fontSize: '0.8rem', textAlign: 'center', marginTop: '0.5rem' }}>{error}</div>}
              <NeonButton type="submit" variant="primary" isLoading={isLoading} style={{ marginTop: '1rem', width: '100%' }}>INITIALIZE SECURE LINK</NeonButton>
            </form>
          </GlassCard>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default LoginPage;

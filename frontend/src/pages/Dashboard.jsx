import React, { useEffect, useState, useRef } from 'react';
import api from '../api';
import Navbar from '../components/Navbar';
import StatCards from '../components/StatCards';
import ThreatChart from '../components/ThreatChart';
import AlertTable from '../components/AlertTable';
import LiveFeed from '../components/LiveFeed';

const MatrixRain = () => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const chars = 'アイウエオカキクケコ0123456789ABCDEF</>{}[]';
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    const drops = Array(columns).fill(1);
    const draw = () => {
      ctx.fillStyle = 'rgba(10,10,15,0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgba(0,245,255,0.15)';
      ctx.font = `${fontSize}px JetBrains Mono, monospace`;
      drops.forEach((y, i) => {
        const char = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(char, i * fontSize, y * fontSize);
        if (y * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      });
    };
    const interval = setInterval(draw, 50);
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);
    return () => { clearInterval(interval); window.removeEventListener('resize', handleResize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0, zIndex: 0, opacity: 0.4, pointerEvents: 'none' }} />;
};

const FloatingOrbs = () => (
  <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
    {[
      { size: 300, top: '10%', left: '5%', color: 'rgba(0,245,255,0.03)', delay: '0s', duration: '8s' },
      { size: 200, top: '60%', right: '8%', color: 'rgba(124,77,255,0.04)', delay: '2s', duration: '10s' },
      { size: 150, top: '30%', right: '25%', color: 'rgba(255,23,68,0.03)', delay: '4s', duration: '7s' },
    ].map((orb, i) => (
      <div key={i} style={{
        position: 'absolute', width: orb.size, height: orb.size,
        top: orb.top, left: orb.left, right: orb.right,
        background: `radial-gradient(circle, ${orb.color}, transparent 70%)`,
        borderRadius: '50%',
        animation: `float ${orb.duration} ease-in-out infinite`,
        animationDelay: orb.delay,
      }} />
    ))}
    <style>{`
      @keyframes float {
        0%, 100% { transform: translateY(0px) scale(1); }
        50% { transform: translateY(-30px) scale(1.05); }
      }
    `}</style>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      const [statsRes, alertsRes] = await Promise.all([
        api.get('/alerts/stats'),
        api.get('/alerts?limit=5')
      ]);
      setStats(statsRes.data);
      setAlerts(Array.isArray(alertsRes.data) ? alertsRes.data : alertsRes.data?.alerts || []);
      setLoaded(true);
    } catch (error) {
      console.error('Dashboard fetch error:', error.response?.status, error.response?.data);
      setError(error.response?.data?.detail || 'Failed to load data');
      setLoaded(true);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleStatsUpdate = (newStats) => setStats(newStats);
  const handleNewAlert = (alert) => setAlerts(prev => [alert, ...prev].slice(0, 5));

  // shared panel style
  const panel = {
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(0,245,255,0.12)',
    borderRadius: 12,
    backdropFilter: 'blur(10px)',
    overflow: 'hidden',        // ← clips children that try to grow
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', position: 'relative' }}>
      <MatrixRain />
      <FloatingOrbs />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <Navbar />

        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '24px' }}>

          {/* Page header */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <div style={{
                width: 8, height: 8, borderRadius: '50%',
                background: '#39ff14', boxShadow: '0 0 10px #39ff14',
                animation: 'pulse 2s infinite',
              }} />
              <span style={{ color: '#39ff14', fontSize: 11, fontFamily: 'JetBrains Mono', letterSpacing: '0.15em' }}>
                SYSTEM OPERATIONAL
              </span>
            </div>
            <h1 style={{
              fontFamily: 'Orbitron, monospace', fontSize: '1.5rem', fontWeight: 700,
              color: '#00f5ff', textShadow: '0 0 20px rgba(0,245,255,0.5)',
              letterSpacing: '0.05em', margin: 0,
            }}>
              THREAT INTELLIGENCE DASHBOARD
            </h1>
            <p style={{ color: '#64748b', fontSize: 12, marginTop: 4 }}>
              Real-time AI-powered cyber threat monitoring
            </p>
          </div>

          {/* Error banner */}
          {error && (
            <div style={{
              background: 'rgba(255,23,68,0.1)', border: '1px solid rgba(255,23,68,0.3)',
              borderRadius: 8, padding: '10px 16px', marginBottom: 16,
              color: '#ff1744', fontSize: 12, fontFamily: 'JetBrains Mono',
            }}>
              ⚠ {error}
            </div>
          )}

          {/* Stat cards — fixed height enforced inside StatCards.jsx */}
          <StatCards stats={stats} />

          {/* Chart + Feed row — FIXED HEIGHT */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 20,
            marginBottom: 20,
            height: 400,          // ← fixed row height
            minHeight: 400,
            maxHeight: 400,
          }}>
            {/* Chart panel */}
            <div style={{ ...panel, padding: 20, height: '100%' }}>
              <ThreatChart alerts={alerts} />
            </div>

            {/* Live feed panel */}
            <div style={{
              ...panel,
              padding: 20,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}>
              <LiveFeed onStatsUpdate={handleStatsUpdate} onNewAlert={handleNewAlert} />
            </div>
          </div>

          {/* Alert table — FIXED HEIGHT */}
          <div style={{
            ...panel,
            padding: 20,
            height: 360,          // ← fixed height
            minHeight: 360,
            maxHeight: 360,
            display: 'flex',
            flexDirection: 'column',
          }}>
            {/* Table header */}
            <h2 style={{
              fontFamily: 'Orbitron, monospace', fontSize: 13,
              color: '#00f5ff', marginBottom: 16, flexShrink: 0,
            }}>
              RECENT ALERTS
            </h2>

            {/* Scrollable table area */}
            <div style={{ flex: 1, overflowY: 'auto', overflowX: 'auto' }}>
              <AlertTable alerts={alerts} refreshData={fetchData} />
            </div>
          </div>

        </div>
      </div>

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 8px #39ff14; }
          50% { opacity: 0.5; box-shadow: 0 0 20px #39ff14; }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
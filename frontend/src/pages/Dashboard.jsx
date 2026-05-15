import React, { useEffect, useState, useRef, useContext } from 'react';
import api from '../api';
import Navbar from '../components/Navbar';
import StatCards from '../components/StatCards';
import ThreatChart from '../components/ThreatChart';
import AlertTable from '../components/AlertTable';
import LiveFeed from '../components/LiveFeed';
import DataModeSwitch from '../components/DataModeSwitch';
import { AuthContext } from '../context/AuthContext';

// ─── Matrix Rain ─────────────────────────────────────────────────────────────
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
    const handleResize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    window.addEventListener('resize', handleResize);
    return () => { clearInterval(interval); window.removeEventListener('resize', handleResize); };
  }, []);
  return (
    <canvas ref={canvasRef} style={{
      position: 'fixed', top: 0, left: 0, zIndex: 0,
      opacity: 0.35, pointerEvents: 'none',
    }} />
  );
};

// ─── Ambient Orbs ─────────────────────────────────────────────────────────────
const FloatingOrbs = () => (
  <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
    {[
      { size: 320, top: '8%',  left: '3%',   color: 'rgba(0,245,255,0.025)', delay: '0s',  dur: '8s'  },
      { size: 220, top: '55%', right: '6%',  color: 'rgba(124,77,255,0.035)', delay: '2s', dur: '10s' },
      { size: 160, top: '28%', right: '22%', color: 'rgba(255,23,68,0.025)', delay: '4s',  dur: '7s'  },
    ].map((o, i) => (
      <div key={i} style={{
        position: 'absolute', width: o.size, height: o.size,
        top: o.top, left: o.left, right: o.right,
        background: `radial-gradient(circle, ${o.color}, transparent 70%)`,
        borderRadius: '50%',
        animation: `float ${o.dur} ease-in-out infinite`,
        animationDelay: o.delay,
      }} />
    ))}
    <style>{`@keyframes float { 0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(-28px) scale(1.04)} }`}</style>
  </div>
);

// ─── Inline compact DataMode indicator for non-admin ──────────────────────────
const DataModePill = ({ mode }) => {
  const isReal = mode === 'REAL';
  const color = isReal ? '#39ff14' : '#7c4dff';
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6,
      padding: '4px 10px', borderRadius: 20,
      background: `${color}10`,
      border: `1px solid ${color}30`,
    }}>
      <div style={{
        width: 6, height: 6, borderRadius: '50%',
        background: color, boxShadow: `0 0 6px ${color}`,
        animation: 'pulse 2s infinite',
      }} />
      <span style={{
        fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
        color, letterSpacing: '0.1em', fontWeight: 600,
      }}>
        {isReal ? 'LIVE DATA' : 'SYNTHETIC'}
      </span>
    </div>
  );
};

// ─── Panel wrapper ────────────────────────────────────────────────────────────
const Panel = ({ children, style = {} }) => (
  <div style={{
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(0,245,255,0.1)',
    borderRadius: 14,
    backdropFilter: 'blur(12px)',
    overflow: 'hidden',
    ...style,
  }}>
    {children}
  </div>
);

// ─── Section label ────────────────────────────────────────────────────────────
const SectionLabel = ({ children }) => (
  <div style={{
    fontFamily: 'JetBrains Mono, monospace', fontSize: 9,
    letterSpacing: '0.18em', color: '#4a5568',
    textTransform: 'uppercase', marginBottom: 10,
    display: 'flex', alignItems: 'center', gap: 8,
  }}>
    <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.04)' }} />
    {children}
    <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.04)' }} />
  </div>
);

// ─── Main Dashboard ───────────────────────────────────────────────────────────
const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === 'ADMIN';

  const [stats, setStats]   = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError]   = useState(null);
  const [dataMode, setDataMode] = useState(null);

  const fetchData = async () => {
    try {
      const [statsRes, alertsRes, modeRes] = await Promise.all([
        api.get('/alerts/stats'),
        api.get('/alerts?limit=5'),
        api.get('/data-mode').catch(() => ({ data: { mode: 'SYNTHETIC' } })),
      ]);
      setStats(statsRes.data);
      setAlerts(Array.isArray(alertsRes.data) ? alertsRes.data : alertsRes.data?.alerts || []);
      setDataMode(modeRes.data.mode);
      setLoaded(true);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load dashboard data');
      setLoaded(true);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleStatsUpdate = (s) => setStats(s);
  const handleNewAlert    = (a) => setAlerts(prev => [a, ...prev].slice(0, 5));
  const handleModeChange  = (m) => setDataMode(m);

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', position: 'relative' }}>
      <MatrixRain />
      <FloatingOrbs />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <Navbar />

        <div style={{ maxWidth: 1440, margin: '0 auto', padding: '20px 24px 40px' }}>

          {/* ── PAGE HEADER ─────────────────────────────────────────────── */}
          <div style={{
            display: 'flex', alignItems: 'flex-start',
            justifyContent: 'space-between',
            marginBottom: 28, gap: 20, flexWrap: 'wrap',
          }}>
            {/* Left: title block */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: '#39ff14', boxShadow: '0 0 10px #39ff14',
                  animation: 'pulse 2s infinite', flexShrink: 0,
                }} />
                <span style={{
                  color: '#39ff14', fontSize: 10,
                  fontFamily: 'JetBrains Mono', letterSpacing: '0.18em',
                }}>
                  SYSTEM OPERATIONAL
                </span>
                {dataMode && <DataModePill mode={dataMode} />}
              </div>
              <h1 style={{
                fontFamily: 'Orbitron, monospace', fontSize: '1.55rem', fontWeight: 700,
                color: '#00f5ff', textShadow: '0 0 24px rgba(0,245,255,0.45)',
                letterSpacing: '0.06em', margin: 0,
              }}>
                THREAT INTELLIGENCE DASHBOARD
              </h1>
              <p style={{
                color: '#4a5568', fontSize: 11,
                fontFamily: 'JetBrains Mono', marginTop: 6,
                letterSpacing: '0.04em',
              }}>
                Real-time AI-powered cyber threat monitoring
                {isAdmin && (
                  <span style={{ color: '#ff1744', marginLeft: 10 }}>· ADMIN MODE</span>
                )}
              </p>
            </div>

            {/* Right: DataModeSwitch — ADMIN ONLY, lives in the header */}
            {isAdmin && (
              <div style={{ flexShrink: 0, minWidth: 280 }}>
                <DataModeSwitch onModeChange={handleModeChange} />
              </div>
            )}
          </div>

          {/* ── ERROR BANNER ────────────────────────────────────────────── */}
          {error && (
            <div style={{
              background: 'rgba(255,23,68,0.08)',
              border: '1px solid rgba(255,23,68,0.25)',
              borderRadius: 8, padding: '10px 16px', marginBottom: 20,
              color: '#ff1744', fontSize: 11, fontFamily: 'JetBrains Mono',
            }}>
              ⚠ {error}
            </div>
          )}

          {/* ── STAT CARDS ──────────────────────────────────────────────── */}
          <div style={{ marginBottom: 20 }}>
            <StatCards stats={stats} />
          </div>

          {/* ── CHART + LIVE FEED ROW ────────────────────────────────────── */}
          <div style={{ marginBottom: 20 }}>
            <SectionLabel>Live Intelligence</SectionLabel>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '3fr 2fr',
              gap: 16,
              height: 380,
            }}>
              <Panel style={{ padding: 20, height: '100%' }}>
                <ThreatChart alerts={alerts} />
              </Panel>

              <Panel style={{
                padding: 20, height: '100%',
                display: 'flex', flexDirection: 'column',
              }}>
                <LiveFeed onStatsUpdate={handleStatsUpdate} onNewAlert={handleNewAlert} />
              </Panel>
            </div>
          </div>

          {/* ── RECENT ALERTS TABLE ──────────────────────────────────────── */}
          <div>
            <SectionLabel>Recent Alerts</SectionLabel>
            <Panel style={{
              padding: 20,
              height: 380,
              display: 'flex', flexDirection: 'column',
            }}>
              {/* Table header */}
              <div style={{
                display: 'flex', alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 14, flexShrink: 0,
              }}>
                <h2 style={{
                  fontFamily: 'Orbitron, monospace', fontSize: 12,
                  color: '#00f5ff', margin: 0, letterSpacing: '0.08em',
                }}>
                  RECENT ALERTS
                </h2>
                <span style={{
                  fontFamily: 'JetBrains Mono', fontSize: 9,
                  color: '#4a5568', letterSpacing: '0.1em',
                }}>
                  {alerts.length} ENTRIES · LAST 5 SHOWN
                </span>
              </div>

              {/* Scrollable table */}
              <div style={{ flex: 1, overflowY: 'auto', overflowX: 'auto' }}>
                <AlertTable alerts={alerts} refreshData={fetchData} />
              </div>
            </Panel>
          </div>

        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%,100% { opacity:1; box-shadow:0 0 8px #39ff14; }
          50%      { opacity:0.5; box-shadow:0 0 18px #39ff14; }
        }
        @keyframes fadeSlideIn {
          from { opacity:0; transform:translateY(14px); }
          to   { opacity:1; transform:translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;

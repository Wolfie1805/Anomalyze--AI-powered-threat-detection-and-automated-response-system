import React, { useEffect, useState, useRef, useContext } from 'react';
import api from '../api';
import Navbar from '../components/Navbar';
import AlertTable from '../components/AlertTable';
import DataModeSwitch from '../components/DataModeSwitch';
import { AuthContext } from '../context/AuthContext';
import { FiAlertTriangle, FiDownload, FiRefreshCw, FiTrash2 } from 'react-icons/fi';

// ── Style helpers (outside component) ────────────────────────────────────────
const btnStyle = (color) => ({
  display: 'flex', alignItems: 'center', gap: 6,
  background: `${color}10`,
  border: `1px solid ${color}30`,
  borderRadius: 6, padding: '8px 14px',
  color: color, fontSize: 11,
  fontFamily: 'JetBrains Mono', cursor: 'pointer',
  letterSpacing: '0.08em', transition: 'all 0.2s',
});

const filterPill = (active, color) => ({
  padding: '5px 12px', borderRadius: 4,
  fontFamily: 'JetBrains Mono', fontSize: 9,
  letterSpacing: '0.08em', cursor: 'pointer',
  background: active ? `${color}15` : 'transparent',
  border: active ? `1px solid ${color}50` : '1px solid rgba(255,255,255,0.06)',
  color: active ? color : '#4a5568',
  transition: 'all 0.2s',
});

// ── MatrixRain ────────────────────────────────────────────────────────────────
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
  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'fixed', top: 0, left: 0, zIndex: 0, opacity: 0.4, pointerEvents: 'none' }}
    />
  );
};

// ── FloatingOrbs ──────────────────────────────────────────────────────────────
const FloatingOrbs = () => (
  <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
    {[
      { size: 300, top: '10%', left: '5%', color: 'rgba(255,23,68,0.03)', delay: '0s', duration: '8s' },
      { size: 200, top: '60%', right: '8%', color: 'rgba(124,77,255,0.04)', delay: '2s', duration: '10s' },
      { size: 150, top: '30%', right: '25%', color: 'rgba(0,245,255,0.03)', delay: '4s', duration: '7s' },
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

// ── Alerts Page ───────────────────────────────────────────────────────────────
const Alerts = () => {
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === 'ADMIN';

  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState({ severity: '', status: '' });
  const [toast, setToast] = useState(null);

  const showToast = (msg, color = '#39ff14') => {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchAlerts = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    try {
      const params = new URLSearchParams({ limit: 200 });
      if (filter.severity) params.append('severity', filter.severity);
      if (filter.status) params.append('status', filter.status);
      const res = await api.get(`/alerts?${params.toString()}`);
      const data = res.data;
      setAlerts(Array.isArray(data) ? data : data?.alerts || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchAlerts(); }, [filter]);

  const exportCSV = () => {
    const headers = ['ID', 'Rule', 'Severity', 'Source IP', 'Status', 'Timestamp'];
    const rows = alerts.map(a => [
      a.id, a.rule_name || '', a.severity || '',
      a.source_ip || '', a.status || '',
      a.timestamp ? new Date(a.timestamp).toLocaleString() : '',
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'anomalyze_alerts.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const clearAllAlerts = async () => {
    if (!window.confirm('Clear ALL alerts? This cannot be undone.')) return;
    try {
      await api.delete('/alerts');
      setAlerts([]);
      showToast('All alerts cleared');
    } catch (err) {
      showToast(err.response?.data?.detail || 'Failed to clear alerts', '#ff1744');
    }
  };

  const markFalsePositive = async (alertId) => {
    try {
      const res = await api.post(`/alerts/${alertId}/false-positive`);
      showToast(`Marked as false positive${res.data.unblock_result?.ip ? ` · IP ${res.data.unblock_result.ip} unblocked` : ''}`);
      fetchAlerts();
    } catch (err) {
      showToast(err.response?.data?.detail || 'Failed', '#ff1744');
    }
  };

  const unblockIP = async (alertId, ip) => {
    try {
      await api.post(`/alerts/${alertId}/unblock-ip`);
      showToast(`IP ${ip} unblocked`);
      fetchAlerts();
    } catch (err) {
      showToast(err.response?.data?.detail || 'Failed to unblock', '#ff1744');
    }
  };

  const newCount     = alerts.filter(a => a.status === 'NEW').length;
  const highCount    = alerts.filter(a => a.severity === 'HIGH' || a.severity === 'CRITICAL').length;
  const resolvedCount = alerts.filter(a => a.status === 'RESOLVED').length;
  const fpCount      = alerts.filter(a => a.status === 'FALSE_POSITIVE').length;

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', position: 'relative' }}>
      <MatrixRain />
      <FloatingOrbs />

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 80, right: 24, zIndex: 9999,
          background: 'rgba(10,10,15,0.95)',
          border: `1px solid ${toast.color}40`,
          borderRadius: 8, padding: '10px 18px',
          fontFamily: 'JetBrains Mono', fontSize: 12,
          color: toast.color,
          boxShadow: `0 0 20px ${toast.color}20`,
          animation: 'fadeIn 0.2s ease',
        }}>
          {toast.msg}
        </div>
      )}

      <div style={{ position: 'relative', zIndex: 1 }}>
        <Navbar />

        <div style={{ maxWidth: 1400, margin: '0 auto', padding: 24 }}>

          {/* ── Page header ── */}
          <div style={{
            display: 'flex', alignItems: 'flex-start',
            justifyContent: 'space-between', marginBottom: 24,
            flexWrap: 'wrap', gap: 16,
          }}>
            {/* Left: title */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <FiAlertTriangle size={16} color="#ff1744"
                  style={{ filter: 'drop-shadow(0 0 6px #ff1744)' }} />
                <h1 style={{
                  fontFamily: 'Orbitron, monospace', fontSize: '1.5rem',
                  color: '#00f5ff', textShadow: '0 0 20px rgba(0,245,255,0.5)',
                  letterSpacing: '0.05em', margin: 0,
                }}>
                  ALERTS & THREATS
                </h1>
              </div>
              <p style={{ color: '#64748b', fontSize: 12, fontFamily: 'JetBrains Mono', margin: 0 }}>
                {alerts.length} total alerts · real-time threat log
                {isAdmin && <span style={{ color: '#ff1744', marginLeft: 8 }}>· ADMIN MODE</span>}
              </p>
            </div>

            {/* Right: actions + toggle */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 12 }}>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                <button onClick={() => fetchAlerts(true)} style={btnStyle('#00f5ff')}>
                  <FiRefreshCw size={12} style={{ animation: refreshing ? 'spin 0.8s linear infinite' : 'none' }} />
                  REFRESH
                </button>
                <button onClick={exportCSV} style={btnStyle('#39ff14')}>
                  <FiDownload size={12} /> EXPORT CSV
                </button>
                {isAdmin && (
                  <button onClick={clearAllAlerts} style={btnStyle('#ff1744')}>
                    <FiTrash2 size={12} /> CLEAR ALL
                  </button>
                )}
              </div>
              {isAdmin && <DataModeSwitch />}
            </div>
          </div>

          {/* ── Stat cards ── */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 12, marginBottom: 20,
          }}>
            {[
              { label: 'TOTAL ALERTS',   value: alerts.length, color: '#00f5ff' },
              { label: 'HIGH SEVERITY',  value: highCount,     color: '#ff1744' },
              { label: 'UNRESOLVED',     value: newCount,      color: '#ffab40' },
              { label: 'FALSE POSITIVES', value: fpCount,      color: '#7c4dff' },
            ].map((s, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.02)',
                border: `1px solid ${s.color}20`,
                borderRadius: 10, padding: '14px 18px',
                backdropFilter: 'blur(10px)',
              }}>
                <div style={{
                  fontSize: 9, color: '#4a5568',
                  fontFamily: 'JetBrains Mono', letterSpacing: '0.12em',
                  marginBottom: 6,
                }}>
                  {s.label}
                </div>
                <div style={{
                  fontSize: '1.6rem', fontWeight: 700,
                  fontFamily: 'Orbitron, monospace',
                  color: s.color, textShadow: `0 0 12px ${s.color}60`, lineHeight: 1,
                }}>
                  {s.value}
                </div>
              </div>
            ))}
          </div>

          {/* ── Filters ── */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: '#4a5568', letterSpacing: '0.1em' }}>
              FILTER:
            </span>
            <div style={{ display: 'flex', gap: 6 }}>
              {[
                { value: '', label: 'ALL SEV', color: '#00f5ff' },
                { value: 'HIGH',   label: 'HIGH',   color: '#ff1744' },
                { value: 'MEDIUM', label: 'MEDIUM', color: '#ffab40' },
                { value: 'LOW',    label: 'LOW',    color: '#39ff14' },
              ].map(opt => (
                <button key={opt.value}
                  onClick={() => setFilter(f => ({ ...f, severity: opt.value }))}
                  style={filterPill(filter.severity === opt.value, opt.color)}>
                  {opt.label}
                </button>
              ))}
            </div>
            <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.06)' }} />
            <div style={{ display: 'flex', gap: 6 }}>
              {[
                { value: '',               label: 'ALL STATUS', color: '#00f5ff' },
                { value: 'NEW',            label: 'NEW',        color: '#ffab40' },
                { value: 'RESOLVED',       label: 'RESOLVED',   color: '#39ff14' },
                { value: 'FALSE_POSITIVE', label: 'FALSE POS',  color: '#7c4dff' },
              ].map(opt => (
                <button key={opt.value}
                  onClick={() => setFilter(f => ({ ...f, status: opt.value }))}
                  style={filterPill(filter.status === opt.value, opt.color)}>
                  {opt.label}
                </button>
              ))}
            </div>
            {(filter.severity || filter.status) && (
              <button onClick={() => setFilter({ severity: '', status: '' })} style={{
                background: 'rgba(255,23,68,0.08)', border: '1px solid rgba(255,23,68,0.2)',
                color: '#ff1744', padding: '5px 12px', borderRadius: 4,
                fontSize: 9, cursor: 'pointer', fontFamily: 'JetBrains Mono',
              }}>
                ✕ CLEAR
              </button>
            )}
          </div>

          {/* ── Role legend ── */}
          <div style={{
            display: 'flex', gap: 16, marginBottom: 12,
            fontFamily: 'JetBrains Mono', fontSize: 9, color: '#4a5568',
          }}>
            {isAdmin
              ? <span>👑 ADMIN — you can clear all alerts and delete individual alerts</span>
              : <span>🔍 ANALYST — click <span style={{ color: '#7c4dff' }}>FALSE POS</span> to unblock an IP · <span style={{ color: '#39ff14' }}>UNBLOCK IP</span> to manually release a blocked IP</span>
            }
          </div>

          {/* ── Table panel ── */}
          <div style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(0,245,255,0.12)',
            borderRadius: 12, padding: 20,
            backdropFilter: 'blur(10px)', minHeight: 400,
          }}>
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 300, gap: 12 }}>
                <div style={{
                  width: 32, height: 32,
                  border: '2px solid rgba(0,245,255,0.2)',
                  borderTop: '2px solid #00f5ff',
                  borderRadius: '50%', animation: 'spin 0.8s linear infinite',
                }} />
                <span style={{ fontFamily: 'Orbitron, monospace', fontSize: 12, color: '#00f5ff', letterSpacing: '0.1em' }}>
                  LOADING ALERTS...
                </span>
              </div>
            ) : (
              <AlertTable
                alerts={alerts}
                refreshData={fetchAlerts}
                isAdmin={isAdmin}
                onFalsePositive={markFalsePositive}
                onUnblockIP={unblockIP}
              />
            )}
          </div>

        </div>
      </div>

      <style>{`
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes fadeIn  { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default Alerts;
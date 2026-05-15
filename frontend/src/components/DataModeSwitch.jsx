import React, { useEffect, useState, useContext } from 'react';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import { FiWifi, FiCpu, FiAlertCircle } from 'react-icons/fi';

/**
 * DataModeSwitch
 *
 * Admin-only toggle between SYNTHETIC and REAL data collection.
 * Now placed in the Dashboard header (top-right).
 *
 * Props:
 *   onModeChange(mode) — optional callback fired after a successful switch,
 *                        so parent components (Dashboard, etc.) can react.
 */
const DataModeSwitch = ({ onModeChange }) => {
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === 'ADMIN';

  const [mode, setMode]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [switching, setSwitching] = useState(false);
  const [error, setError]       = useState(null);
  const [toast, setToast]       = useState(null);
  const [collectors, setCollectors] = useState({});

  const showToast = (msg, color = '#39ff14') => {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchMode = async () => {
    try {
      const res = await api.get('/data-mode');
      setMode(res.data.mode);
      setCollectors(res.data.collectors || {});
      setError(null);
    } catch {
      setError('Could not reach data-mode API');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) fetchMode();
  }, [isAdmin]);

  const handleToggle = async () => {
    const newMode = mode === 'SYNTHETIC' ? 'REAL' : 'SYNTHETIC';
    setSwitching(true);
    setError(null);
    try {
      const res = await api.post('/data-mode/set', { mode: newMode });
      setMode(res.data.mode);
      onModeChange && onModeChange(res.data.mode);
      showToast(
        newMode === 'REAL'
          ? '🌐 Switched to REAL — live collectors active'
          : '🧪 Switched to SYNTHETIC — demo mode active'
      );
      await fetchMode();
    } catch (err) {
      const detail = err.response?.data?.detail || 'Failed to switch mode';
      setError(detail);
      showToast(detail, '#ff1744');
    } finally {
      setSwitching(false);
    }
  };

  if (!isAdmin || loading) return null;

  const isReal       = mode === 'REAL';
  const activeColor  = isReal ? '#39ff14' : '#7c4dff';

  const collectorLabels = {
    windows_event_logs:  'Win Event Logs',
    nginx_apache_logs:   'Nginx / Apache',
    firewall_logs:       'Firewall Log',
    packet_capture:      'Packet Capture',
    synthetic_generator: 'Synthetic Gen',
  };

  return (
    <div style={{
      background: 'rgba(255,255,255,0.02)',
      border: `1px solid ${activeColor}25`,
      borderRadius: 12,
      padding: '14px 18px',
      fontFamily: 'JetBrains Mono, monospace',
      position: 'relative',
      transition: 'border-color 0.4s ease',
    }}>

      {/* Toast — floats above the card */}
      {toast && (
        <div style={{
          position: 'absolute', top: -38, left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(8,8,14,0.97)',
          border: `1px solid ${toast.color}40`,
          borderRadius: 6, padding: '5px 14px',
          fontSize: 10, color: toast.color,
          whiteSpace: 'nowrap', zIndex: 999,
          animation: 'fadeIn 0.2s ease',
        }}>
          {toast.msg}
        </div>
      )}

      {/* ── TOP ROW: label + toggle ── */}
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', marginBottom: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          {isReal
            ? <FiWifi size={13} color={activeColor} style={{ filter: `drop-shadow(0 0 4px ${activeColor})` }} />
            : <FiCpu  size={13} color={activeColor} style={{ filter: `drop-shadow(0 0 4px ${activeColor})` }} />
          }
          <span style={{ fontSize: 10, fontWeight: 700, color: activeColor, letterSpacing: '0.12em' }}>
            DATA SOURCE
          </span>
          <span style={{
            fontSize: 8, padding: '1px 6px', borderRadius: 3,
            background: `${activeColor}12`,
            border: `1px solid ${activeColor}28`,
            color: activeColor, letterSpacing: '0.08em',
          }}>
            ADMIN
          </span>
        </div>

        {/* Pill toggle button */}
        <button
          onClick={handleToggle}
          disabled={switching}
          title={`Switch to ${isReal ? 'SYNTHETIC' : 'REAL'} mode`}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'transparent', border: 'none',
            cursor: switching ? 'wait' : 'pointer',
            opacity: switching ? 0.55 : 1,
            transition: 'opacity 0.2s',
            padding: 0,
          }}
        >
          {/* Pill */}
          <div style={{
            width: 42, height: 22, borderRadius: 11,
            background: isReal ? 'rgba(57,255,20,0.12)' : 'rgba(124,77,255,0.12)',
            border: `1px solid ${activeColor}40`,
            position: 'relative', transition: 'all 0.35s ease', flexShrink: 0,
          }}>
            <div style={{
              position: 'absolute', top: 3,
              left: isReal ? 21 : 3,
              width: 14, height: 14, borderRadius: '50%',
              background: activeColor,
              boxShadow: `0 0 8px ${activeColor}`,
              transition: 'left 0.35s ease',
            }} />
          </div>
          <span style={{
            fontSize: 10, color: activeColor,
            letterSpacing: '0.1em', minWidth: 76,
          }}>
            {switching ? 'SWITCHING...' : isReal ? 'REAL' : 'SYNTHETIC'}
          </span>
        </button>
      </div>

      {/* ── Description ── */}
      <p style={{
        fontSize: 9, color: '#4a5568', lineHeight: 1.65,
        margin: '0 0 10px', letterSpacing: '0.02em',
      }}>
        {isReal
          ? 'Live: Windows events, web logs, firewall + packet capture'
          : 'Simulated attack traffic — safe for demos and testing'}
      </p>

      {/* ── Collector status grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3px 10px' }}>
        {Object.entries(collectorLabels).map(([key, label]) => {
          const active = collectors[key] === 'active';
          const dot    = active ? activeColor : '#2d3748';
          return (
            <div key={key} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '4px 6px', borderRadius: 4,
              background: active ? `${activeColor}05` : 'transparent',
            }}>
              <span style={{ fontSize: 9, color: active ? '#64748b' : '#2d3748' }}>
                {label}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{
                  width: 5, height: 5, borderRadius: '50%',
                  background: dot,
                  boxShadow: active ? `0 0 5px ${dot}` : 'none',
                  animation: active ? 'dmPulse 2s infinite' : 'none',
                }} />
                <span style={{ fontSize: 8, color: dot, letterSpacing: '0.05em' }}>
                  {active ? 'ON' : 'OFF'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Error ── */}
      {error && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          marginTop: 10, padding: '5px 8px',
          background: 'rgba(255,23,68,0.07)',
          border: '1px solid rgba(255,23,68,0.18)',
          borderRadius: 5, fontSize: 9, color: '#ff1744',
        }}>
          <FiAlertCircle size={10} />
          {error}
        </div>
      )}

      {/* ── Real mode warning ── */}
      {isReal && (
        <div style={{
          marginTop: 10, padding: '6px 8px',
          background: 'rgba(255,171,64,0.05)',
          border: '1px solid rgba(255,171,64,0.15)',
          borderRadius: 5, fontSize: 8, color: '#ffab40', lineHeight: 1.6,
        }}>
          ⚠ Needs: pywin32 · Npcap · scapy · Run as Admin
        </div>
      )}

      <style>{`
        @keyframes dmPulse { 0%,100%{opacity:1} 50%{opacity:0.35} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
      `}</style>
    </div>
  );
};

export default DataModeSwitch;

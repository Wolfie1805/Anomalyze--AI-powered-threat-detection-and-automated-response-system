import React, { useEffect, useState, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { FiActivity, FiWifi, FiWifiOff, FiAlertTriangle, FiShield, FiInfo } from 'react-icons/fi';

const SEVERITY_CONFIG = {
  HIGH:     { color: '#ff1744', bg: 'rgba(255,23,68,0.08)',   border: 'rgba(255,23,68,0.2)',   label: 'HIGH',  icon: '🔥' },
  CRITICAL: { color: '#ff1744', bg: 'rgba(255,23,68,0.12)',   border: 'rgba(255,23,68,0.3)',   label: 'CRIT',  icon: '💀' },
  MEDIUM:   { color: '#ffab40', bg: 'rgba(255,171,64,0.08)',  border: 'rgba(255,171,64,0.2)',  label: 'MED',   icon: '⚠️' },
  LOW:      { color: '#39ff14', bg: 'rgba(57,255,20,0.05)',   border: 'rgba(57,255,20,0.15)',  label: 'LOW',   icon: '🔵' },
  ML:       { color: '#7c4dff', bg: 'rgba(124,77,255,0.08)', border: 'rgba(124,77,255,0.2)',  label: 'ML',    icon: '🧠' },
  LOG:      { color: '#4a5568', bg: 'transparent',            border: 'transparent',           label: 'LOG',   icon: null },
};

function getSeverityConfig(ev) {
  if (!ev.is_alert) return SEVERITY_CONFIG.LOG;
  if (ev.rule_name === 'ML_ANOMALY_DETECTED') return SEVERITY_CONFIG.ML;
  return SEVERITY_CONFIG[ev.severity] || SEVERITY_CONFIG.LOW;
}

function formatTime(ts) {
  try {
    return new Date(ts).toLocaleTimeString('en', {
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
    });
  } catch { return '--:--:--'; }
}

function formatIP(ip) {
  return ip || 'unknown';
}

const EventRow = ({ ev, index }) => {
  const cfg = getSeverityConfig(ev);
  const isAlert = ev.is_alert;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: 8,
      padding: '6px 10px',
      borderRadius: 6,
      background: cfg.bg,
      border: `1px solid ${cfg.border}`,
      marginBottom: 4,
      flexShrink: 0,
      animation: 'slideIn 0.25s ease forwards',
      position: 'relative',
      overflow: 'hidden',
    }}>

      {isAlert && (
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0, width: 2,
          background: cfg.color,
          boxShadow: `0 0 6px ${cfg.color}`,
        }} />
      )}

      <span style={{
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 9,
        color: '#4a5568',
        flexShrink: 0,
        paddingTop: 1,
        minWidth: 56,
      }}>
        {formatTime(ev.timestamp)}
      </span>

      {isAlert && (
        <span style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 8,
          fontWeight: 700,
          color: cfg.color,
          background: `${cfg.color}15`,
          border: `1px solid ${cfg.color}30`,
          borderRadius: 3,
          padding: '1px 5px',
          flexShrink: 0,
          letterSpacing: '0.06em',
          alignSelf: 'center',
        }}>
          {cfg.label}
        </span>
      )}

      <div style={{ flex: 1, minWidth: 0 }}>
        {isAlert ? (
          <div>
            <div style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 10,
              color: cfg.color,
              fontWeight: 600,
              marginBottom: 2,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              {cfg.icon} {ev.attack_type || ev.rule_name || 'THREAT'}
            </div>
            <div style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 9,
              color: '#64748b',
            }}>
              src: <span style={{ color: '#94a3b8' }}>{formatIP(ev.ip_address)}</span>
            </div>
          </div>
        ) : (
          <div style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 9,
            color: '#374151',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            <span style={{ color: '#4a5568' }}>{formatIP(ev.ip_address)}</span>
            <span style={{ color: '#1f2937', margin: '0 4px' }}>→</span>
            <span style={{ color: '#374151' }}>{ev.event_type || ev.log_type || 'nginx'}</span>
          </div>
        )}
      </div>
    </div>
  );
};

const LiveFeed = ({ onStatsUpdate, onNewAlert }) => {
  const { token } = useContext(AuthContext);
  const [status, setStatus] = useState('disconnected');
  const [events, setEvents] = useState([]);
  const [alertCount, setAlertCount] = useState(0);
  const [logCount, setLogCount] = useState(0);
  const wsRef = useRef(null);
  const feedRef = useRef(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const queueRef = useRef([]);               // ← incoming event buffer
  const lastFlushRef = useRef(Date.now());   // ← tracks last UI update

  // Auto scroll to top when new events arrive
  useEffect(() => {
    if (autoScroll && feedRef.current) {
      feedRef.current.scrollTop = 0;
    }
  }, [events, autoScroll]);

  // Flush queue into UI every 1500ms instead of instantly
  useEffect(() => {
    const interval = setInterval(() => {
      if (queueRef.current.length === 0) return;

      // Take only the newest 3 events from the queue per tick
      const toAdd = queueRef.current.splice(0, 3);
      queueRef.current = [];

      toAdd.forEach(item => {
        if (item.type === 'log_entry') {
          setLogCount(c => c + 1);
          setEvents(prev => [item.data, ...prev].slice(0, 80));
        } else if (item.type === 'new_alert') {
          setAlertCount(c => c + 1);
          onNewAlert && onNewAlert(item.data);
          setEvents(prev => [{ ...item.data, is_alert: true }, ...prev].slice(0, 80));
        } else if (item.type === 'stats_update') {
          onStatsUpdate && onStatsUpdate(item.data);
        }
      });
    }, 1500); // ← change this number to slow down/speed up (ms between UI updates)

    return () => clearInterval(interval);
  }, [onStatsUpdate, onNewAlert]);

  useEffect(() => {
    let reconnectTimeout = null;

    const connect = () => {
      if (!token) return;
      const wsUrl = `ws://localhost:8000/ws?token=${token}`;
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => setStatus('connected');

      wsRef.current.onmessage = (message) => {
        try {
          const payload = JSON.parse(message.data);
          // Push to queue instead of updating state directly
          queueRef.current.push(payload);
        } catch (e) {
          console.error('WS Parse Error', e);
        }
      };

      wsRef.current.onclose = () => {
        setStatus('disconnected');
        reconnectTimeout = setTimeout(connect, 3000);
      };

      wsRef.current.onerror = () => wsRef.current.close();
    };

    connect();
    return () => {
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (wsRef.current) wsRef.current.close();
    };
  }, [token, onStatsUpdate, onNewAlert]);

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      minHeight: 0,
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <FiActivity size={14} color="#00f5ff" style={{ filter: 'drop-shadow(0 0 4px #00f5ff)' }} />
          <h3 style={{
            fontFamily: 'Orbitron, monospace',
            fontSize: '0.8rem',
            color: '#00f5ff',
            letterSpacing: '0.08em',
            margin: 0,
            textShadow: '0 0 10px rgba(0,245,255,0.4)',
          }}>
            LIVE ENGINE FEED
          </h3>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{
            width: 6, height: 6, borderRadius: '50%',
            background: status === 'connected' ? '#39ff14' : '#ffab40',
            boxShadow: status === 'connected' ? '0 0 6px #39ff14' : '0 0 6px #ffab40',
            animation: status === 'connected' ? 'blink 2s infinite' : 'none',
          }} />
          <span style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 9,
            color: status === 'connected' ? '#39ff14' : '#ffab40',
            letterSpacing: '0.1em',
          }}>
            {status === 'connected' ? 'LIVE' : 'RECONNECTING'}
          </span>
        </div>
      </div>

      {/* Stats row */}
      <div style={{
        display: 'flex',
        gap: 8,
        marginBottom: 10,
        flexShrink: 0,
      }}>
        {[
          { label: 'ALERTS', value: alertCount, color: '#ff1744' },
          { label: 'LOGS', value: logCount, color: '#00f5ff' },
          { label: 'EVENTS', value: events.length, color: '#7c4dff' },
        ].map((s, i) => (
          <div key={i} style={{
            flex: 1,
            background: 'rgba(255,255,255,0.02)',
            border: `1px solid ${s.color}15`,
            borderRadius: 6,
            padding: '5px 8px',
            textAlign: 'center',
          }}>
            <div style={{
              fontFamily: 'Orbitron, monospace',
              fontSize: 13,
              fontWeight: 700,
              color: s.color,
              textShadow: `0 0 8px ${s.color}60`,
              lineHeight: 1,
            }}>
              {s.value}
            </div>
            <div style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 8,
              color: '#4a5568',
              letterSpacing: '0.1em',
              marginTop: 2,
            }}>
              {s.label}
            </div>
          </div>
        ))}

        <button
          onClick={() => setAutoScroll(v => !v)}
          style={{
            background: autoScroll ? 'rgba(0,245,255,0.08)' : 'rgba(255,255,255,0.02)',
            border: `1px solid ${autoScroll ? 'rgba(0,245,255,0.25)' : 'rgba(255,255,255,0.06)'}`,
            borderRadius: 6,
            padding: '4px 8px',
            color: autoScroll ? '#00f5ff' : '#4a5568',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 8,
            letterSpacing: '0.08em',
            cursor: 'pointer',
            flexShrink: 0,
            transition: 'all 0.2s',
          }}
        >
          {autoScroll ? '⏬ AUTO' : '⏸ PAUSED'}
        </button>
      </div>

      <div style={{
        height: 1,
        background: 'linear-gradient(90deg, transparent, rgba(0,245,255,0.2), transparent)',
        marginBottom: 8,
        flexShrink: 0,
      }} />

      <div
        ref={feedRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          minHeight: 0,
          paddingRight: 2,
        }}
      >
        {events.length === 0 ? (
          <div style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            color: '#4a5568',
          }}>
            <FiActivity size={24} style={{ opacity: 0.3, animation: 'blink 2s infinite' }} />
            <span style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 11,
              letterSpacing: '0.1em',
            }}>
              AWAITING EVENTS...
            </span>
          </div>
        ) : (
          events.map((ev, i) => (
            <EventRow key={`${ev.timestamp}-${i}`} ev={ev} index={i} />
          ))
        )}
      </div>

      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
};

export default LiveFeed;
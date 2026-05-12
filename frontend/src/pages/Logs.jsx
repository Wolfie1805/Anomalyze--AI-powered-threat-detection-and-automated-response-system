import React, { useEffect, useState, useRef } from 'react';
import api from '../api';
import Navbar from '../components/Navbar';
import { FiDownload, FiTerminal, FiSearch, FiRefreshCw } from 'react-icons/fi';

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
      { size: 150, top: '30%', right: '25%', color: 'rgba(57,255,20,0.03)', delay: '4s', duration: '7s' },
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

const PREFIX_CONFIG = {
  '[AUTH]': { color: '#00f5ff', bg: 'rgba(0,245,255,0.08)' },
  '[HTTP]': { color: '#39ff14', bg: 'rgba(57,255,20,0.08)' },
  '[ML]':   { color: '#7c4dff', bg: 'rgba(124,77,255,0.08)' },
  '[RULE]': { color: '#ff1744', bg: 'rgba(255,23,68,0.08)' },
  '[SYS]':  { color: '#64748b', bg: 'rgba(100,116,139,0.08)' },
};

const getPrefix = (log) => {
  const raw = (log.raw_data || log.raw_line || log.event_type || '').toLowerCase();
  const type = (log.log_type || '').toLowerCase();
  if (type === 'auth' || raw.includes('ssh') || raw.includes('password') || raw.includes('login')) return '[AUTH]';
  if (type === 'nginx' || raw.includes('http') || raw.includes('get') || raw.includes('post')) return '[HTTP]';
  if (raw.includes('ml') || raw.includes('anomaly')) return '[ML]';
  if (raw.includes('rule') || raw.includes('triggered')) return '[RULE]';
  return '[SYS]';
};

const getLineColor = (log) => {
  const raw = (log.raw_data || log.raw_line || log.event_type || '').toLowerCase();
  if (raw.includes('fail') || raw.includes('error') || raw.includes('invalid') || raw.includes('union select') || raw.includes('passwd')) return '#ff6b81';
  if (raw.includes('accept') || raw.includes('success')) return '#39ff14';
  if (raw.includes('warn')) return '#ffab40';
  if (raw.includes('anomaly') || raw.includes('ml')) return '#a78bfa';
  return '#4a5568';
};

const TYPE_FILTERS = ['ALL', 'AUTH', 'HTTP', 'ML', 'RULE'];

const Logs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const terminalRef = useRef(null);

  const fetchLogs = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    try {
      const res = await api.get('/logs?limit=200');
      const data = res.data;
      setLogs(Array.isArray(data) ? data : data?.logs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchLogs(); }, []);

  const filtered = logs.filter(log => {
    const raw = (log.raw_data || log.raw_line || log.event_type || '').toLowerCase();
    const ip = (log.source_ip || '').toLowerCase();
    const matchesSearch = !search || raw.includes(search.toLowerCase()) || ip.includes(search.toLowerCase());
    const prefix = getPrefix(log).replace('[', '').replace(']', '');
    const matchesType = typeFilter === 'ALL' || prefix === typeFilter;
    return matchesSearch && matchesType;
  });

  // Counts
  const authCount = logs.filter(l => getPrefix(l) === '[AUTH]').length;
  const httpCount = logs.filter(l => getPrefix(l) === '[HTTP]').length;
  const mlCount = logs.filter(l => getPrefix(l) === '[ML]').length;
  const errorCount = logs.filter(l => {
    const raw = (l.raw_data || '').toLowerCase();
    return raw.includes('fail') || raw.includes('error') || raw.includes('union select');
  }).length;

  const exportLogs = () => {
    const content = filtered.map(l =>
      `${l.timestamp || ''} | ${l.source_ip || ''} | ${getPrefix(l)} | ${l.raw_data || l.event_type || ''}`
    ).join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'anomalyze_logs.txt'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', position: 'relative' }}>
      <MatrixRain />
      <FloatingOrbs />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <Navbar />

        <div style={{ maxWidth: 1400, margin: '0 auto', padding: 24 }}>

          {/* Header */}
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'flex-start', marginBottom: 24,
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <FiTerminal size={16} color="#39ff14"
                  style={{ filter: 'drop-shadow(0 0 6px #39ff14)' }} />
                <h1 style={{
                  fontFamily: 'Orbitron, monospace', fontSize: '1.5rem',
                  color: '#00f5ff', textShadow: '0 0 20px rgba(0,245,255,0.5)',
                  letterSpacing: '0.05em', margin: 0,
                }}>
                  SYSTEM AUDIT LOGS
                </h1>
              </div>
              <p style={{ color: '#64748b', fontSize: 12, fontFamily: 'JetBrains Mono' }}>
                {filtered.length} entries · real-time log stream
              </p>
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => fetchLogs(true)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: 'rgba(0,245,255,0.06)',
                  border: '1px solid rgba(0,245,255,0.2)',
                  borderRadius: 6, padding: '8px 14px',
                  color: '#00f5ff', fontSize: 11,
                  fontFamily: 'JetBrains Mono', cursor: 'pointer',
                  letterSpacing: '0.08em', transition: 'all 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,245,255,0.12)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,245,255,0.06)'}
              >
                <FiRefreshCw size={12} style={{ animation: refreshing ? 'spin 0.8s linear infinite' : 'none' }} />
                REFRESH
              </button>
              <button
                onClick={exportLogs}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: 'rgba(57,255,20,0.06)',
                  border: '1px solid rgba(57,255,20,0.2)',
                  borderRadius: 6, padding: '8px 14px',
                  color: '#39ff14', fontSize: 11,
                  fontFamily: 'JetBrains Mono', cursor: 'pointer',
                  letterSpacing: '0.08em', transition: 'all 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(57,255,20,0.12)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(57,255,20,0.06)'}
              >
                <FiDownload size={12} /> EXPORT
              </button>
            </div>
          </div>

          {/* Stat cards */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 12, marginBottom: 20,
          }}>
            {[
              { label: 'TOTAL LOGS', value: logs.length, color: '#00f5ff' },
              { label: 'AUTH EVENTS', value: authCount, color: '#00f5ff' },
              { label: 'HTTP EVENTS', value: httpCount, color: '#39ff14' },
              { label: 'THREATS IN LOGS', value: errorCount, color: '#ff1744' },
            ].map((s, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.02)',
                border: `1px solid ${s.color}20`,
                borderRadius: 10, padding: '14px 18px',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.border = `1px solid ${s.color}50`;
                e.currentTarget.style.boxShadow = `0 0 16px ${s.color}10`;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.border = `1px solid ${s.color}20`;
                e.currentTarget.style.boxShadow = 'none';
              }}
              >
                <div style={{
                  fontSize: 9, color: '#4a5568',
                  fontFamily: 'JetBrains Mono', letterSpacing: '0.12em',
                  marginBottom: 6, textTransform: 'uppercase',
                }}>
                  {s.label}
                </div>
                <div style={{
                  fontSize: '1.6rem', fontWeight: 700,
                  fontFamily: 'Orbitron, monospace', color: s.color,
                  textShadow: `0 0 12px ${s.color}60`, lineHeight: 1,
                }}>
                  {s.value}
                </div>
              </div>
            ))}
          </div>

          {/* Search + type filters */}
          <div style={{
            display: 'flex', gap: 10, marginBottom: 16,
            alignItems: 'center', flexWrap: 'wrap',
          }}>
            {/* Search */}
            <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
              <FiSearch size={13} style={{
                position: 'absolute', left: 12, top: '50%',
                transform: 'translateY(-50%)', color: '#4a5568',
                pointerEvents: 'none',
              }} />
              <input
                type="text"
                placeholder="Search by IP, event, content..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(13,13,24,0.8)',
                  border: '1px solid rgba(0,245,255,0.15)',
                  color: '#e2e8f0', padding: '9px 14px 9px 36px',
                  borderRadius: 6, fontFamily: 'JetBrains Mono',
                  fontSize: 12, outline: 'none', transition: 'border-color 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = 'rgba(0,245,255,0.4)'}
                onBlur={e => e.target.style.borderColor = 'rgba(0,245,255,0.15)'}
              />
            </div>

            {/* Type filter pills */}
            <div style={{ display: 'flex', gap: 6 }}>
              {TYPE_FILTERS.map(f => {
                const cfg = PREFIX_CONFIG[`[${f}]`] || { color: '#00f5ff', bg: 'rgba(0,245,255,0.08)' };
                const active = typeFilter === f;
                return (
                  <button
                    key={f}
                    onClick={() => setTypeFilter(f)}
                    style={{
                      padding: '6px 12px', borderRadius: 4,
                      fontFamily: 'JetBrains Mono', fontSize: 9,
                      letterSpacing: '0.1em', cursor: 'pointer',
                      transition: 'all 0.2s',
                      background: active ? cfg.bg : 'transparent',
                      border: active
                        ? `1px solid ${cfg.color}50`
                        : '1px solid rgba(255,255,255,0.06)',
                      color: active ? cfg.color : '#4a5568',
                      boxShadow: active ? `0 0 10px ${cfg.color}15` : 'none',
                    }}
                  >
                    {f}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Terminal */}
          <div style={{
            background: 'rgba(4,4,10,0.97)',
            border: '1px solid rgba(0,245,255,0.1)',
            borderRadius: 12, overflow: 'hidden',
            boxShadow: '0 0 40px rgba(0,0,0,0.8)',
          }}>
            {/* Terminal title bar */}
            <div style={{
              background: 'rgba(255,255,255,0.02)',
              borderBottom: '1px solid rgba(255,255,255,0.05)',
              padding: '10px 16px',
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <div style={{ display: 'flex', gap: 6 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f57' }} />
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#febc2e' }} />
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#28c840' }} />
              </div>
              <FiTerminal size={12} color="#00f5ff" />
              <span style={{
                color: '#00f5ff', fontFamily: 'JetBrains Mono',
                fontSize: 11, letterSpacing: '0.12em',
                textShadow: '0 0 8px rgba(0,245,255,0.5)',
              }}>
                ANOMALYZE — SYSTEM LOG MONITOR
              </span>
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: '#39ff14', boxShadow: '0 0 6px #39ff14',
                  animation: 'blink 2s infinite',
                }} />
                <span style={{
                  fontFamily: 'JetBrains Mono', fontSize: 9,
                  color: '#39ff14', letterSpacing: '0.1em',
                }}>
                  LIVE
                </span>
              </div>
            </div>

            {/* Log lines */}
            <div
              ref={terminalRef}
              style={{
                height: '58vh', overflowY: 'auto',
                padding: '10px 0',
                fontFamily: 'JetBrains Mono', fontSize: 11,
                lineHeight: 1.8,
              }}
            >
              {loading ? (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '20px 16px', color: '#00f5ff',
                }}>
                  <div style={{
                    width: 14, height: 14,
                    border: '2px solid rgba(0,245,255,0.2)',
                    borderTop: '2px solid #00f5ff',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                  }} />
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: 12, letterSpacing: '0.1em' }}>
                    Initializing log stream...
                  </span>
                </div>
              ) : filtered.length === 0 ? (
                <div style={{ padding: '20px 16px', color: '#4a5568', fontSize: 12 }}>
                  {search ? 'No logs matching search.' : 'No log entries found.'}
                </div>
              ) : (
                filtered.map((log, i) => {
                  const prefix = getPrefix(log);
                  const cfg = PREFIX_CONFIG[prefix] || PREFIX_CONFIG['[SYS]'];
                  const lineColor = getLineColor(log);
                  const time = log.timestamp
                    ? new Date(log.timestamp).toLocaleTimeString('en', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
                    : '--:--:--';
                  const content = log.raw_data || log.raw_line || log.event_type || 'Log entry';
                  const ip = log.source_ip || '';

                  return (
                    <div
                      key={log.id || i}
                      style={{
                        display: 'flex', gap: 10,
                        padding: '2px 16px',
                        borderLeft: '2px solid transparent',
                        transition: 'all 0.15s',
                        animation: `logIn 0.2s ease ${Math.min(i * 0.008, 0.4)}s both`,
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                        e.currentTarget.style.borderLeftColor = cfg.color;
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.borderLeftColor = 'transparent';
                      }}
                    >
                      {/* Time */}
                      <span style={{ color: '#2d3748', minWidth: 64, flexShrink: 0, fontSize: 10 }}>
                        {time}
                      </span>

                      {/* Prefix badge */}
                      <span style={{
                        color: cfg.color, background: cfg.bg,
                        border: `1px solid ${cfg.color}20`,
                        borderRadius: 3, padding: '0 5px',
                        minWidth: 50, flexShrink: 0,
                        fontSize: 9, fontWeight: 700,
                        letterSpacing: '0.06em', alignSelf: 'center',
                        textAlign: 'center',
                      }}>
                        {prefix.replace('[', '').replace(']', '')}
                      </span>

                      {/* IP */}
                      {ip && (
                        <span style={{
                          color: '#334155', minWidth: 100,
                          flexShrink: 0, fontSize: 10,
                        }}>
                          {ip}
                        </span>
                      )}

                      {/* Content */}
                      <span style={{
                        color: lineColor, wordBreak: 'break-all',
                        fontSize: 10, opacity: 0.85,
                      }}>
                        {content}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>
      </div>

      <style>{`
        @keyframes logIn {
          from { opacity: 0; transform: translateX(-6px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
};

export default Logs;
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import api from '../api';
import { FiX, FiAlertTriangle, FiCheck, FiTrash2 } from 'react-icons/fi';

const SEVERITY = {
  HIGH:     { color: '#ff1744', bg: 'rgba(255,23,68,0.1)',   border: 'rgba(255,23,68,0.3)'   },
  CRITICAL: { color: '#ff1744', bg: 'rgba(255,23,68,0.15)',  border: 'rgba(255,23,68,0.4)'   },
  MEDIUM:   { color: '#ffab40', bg: 'rgba(255,171,64,0.1)',  border: 'rgba(255,171,64,0.3)'  },
  LOW:      { color: '#39ff14', bg: 'rgba(57,255,20,0.08)',  border: 'rgba(57,255,20,0.25)'  },
};

const MITRE = {
  ROOT_LOGIN_ATTEMPT:        { id: 'T1078', name: 'Valid Accounts',                  tactic: 'Initial Access'       },
  SSH_BRUTE_FORCE:           { id: 'T1110', name: 'Brute Force',                     tactic: 'Credential Access'    },
  BRUTE_FORCE_DETECTED:      { id: 'T1110', name: 'Brute Force',                     tactic: 'Credential Access'    },
  SQL_INJECTION_OR_CMD_EXEC: { id: 'T1190', name: 'Exploit Public-Facing App',       tactic: 'Initial Access'       },
  XSS_ATTACK:                { id: 'T1059', name: 'Command & Scripting Interpreter', tactic: 'Execution'            },
  PATH_TRAVERSAL:            { id: 'T1083', name: 'File & Directory Discovery',      tactic: 'Discovery'            },
  SCANNER_DETECTED:          { id: 'T1595', name: 'Active Scanning',                 tactic: 'Reconnaissance'       },
  DOS_ATTACK_DETECTED:       { id: 'T1498', name: 'Network DoS',                     tactic: 'Impact'               },
  SUSPICIOUS_USER_AGENT:     { id: 'T1589', name: 'Gather Victim Identity Info',     tactic: 'Reconnaissance'       },
  ML_ANOMALY_DETECTED:       { id: 'T1071', name: 'App Layer Protocol Anomaly',      tactic: 'Command & Control'    },
  ADMIN_PANEL_ACCESS:        { id: 'T1078', name: 'Valid Accounts',                  tactic: 'Privilege Escalation' },
  UNAUTHORIZED_ACCESS_ATTEMPT:{ id: 'T1110', name: 'Brute Force',                   tactic: 'Credential Access'    },
};

const InfoRow = ({ label, value, valueColor }) => (
  <div style={{
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'flex-start', padding: '8px 0',
    borderBottom: '1px solid rgba(255,255,255,0.04)',
  }}>
    <span style={{
      fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
      color: '#4a5568', letterSpacing: '0.08em',
      textTransform: 'uppercase', flexShrink: 0, marginRight: 16,
    }}>
      {label}
    </span>
    <span style={{
      fontFamily: 'JetBrains Mono, monospace', fontSize: 11,
      color: valueColor || '#94a3b8', textAlign: 'right',
      wordBreak: 'break-all',
    }}>
      {value || '—'}
    </span>
  </div>
);

const AlertDetailModal = ({ alertId, onClose, onResolve, onDelete }) => {
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchAlert = async () => {
      try {
        const res = await api.get(`/alerts/${alertId}`);
        setAlert(res.data);
      } catch (err) {
        console.error('Failed to fetch alert detail', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAlert();
  }, [alertId]);

  useEffect(() => {
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handler);
    };
  }, [onClose]);

  const handleResolve = async () => {
    setResolving(true);
    try {
      await api.patch(`/alerts/${alertId}/status?status=RESOLVED`);
      onResolve && onResolve(alertId);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setResolving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/alerts/${alertId}`);
      onDelete && onDelete(alertId);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  const sev = alert ? (SEVERITY[alert.severity] || SEVERITY.LOW) : SEVERITY.LOW;
  const mitre = alert ? (MITRE[alert.rule_name] || null) : null;

  // Use portal to render outside of any stacking context
  return ReactDOM.createPortal(
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.88)',
          backdropFilter: 'blur(6px)',
          zIndex: 99998,
          animation: 'fadeIn 0.2s ease',
        }}
      />

      {/* Modal */}
      <div style={{
        position: 'fixed',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '90%', maxWidth: 680,
        maxHeight: '88vh',
        background: '#08080f',
        border: `1px solid ${sev.border}`,
        borderRadius: 16,
        zIndex: 99999,
        overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        animation: 'modalIn 0.25s cubic-bezier(0.16,1,0.3,1)',
        boxShadow: `0 0 60px ${sev.color}20, 0 0 120px rgba(0,0,0,0.95)`,
      }}>

        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          background: sev.bg,
          flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 40, height: 40,
              background: `${sev.color}15`,
              border: `1px solid ${sev.color}40`,
              borderRadius: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <FiAlertTriangle size={18} color={sev.color}
                style={{ filter: `drop-shadow(0 0 4px ${sev.color})` }} />
            </div>
            <div>
              <div style={{
                fontFamily: 'Orbitron, monospace', fontSize: '0.95rem',
                fontWeight: 700, color: sev.color,
                textShadow: `0 0 12px ${sev.color}60`,
                letterSpacing: '0.06em',
              }}>
                {loading ? 'LOADING...' : (alert?.rule_name || 'UNKNOWN')}
              </div>
              <div style={{
                fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
                color: '#4a5568', letterSpacing: '0.1em', marginTop: 2,
              }}>
                ALERT DETAIL INVESTIGATION
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {alert && (
              <span style={{
                fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
                fontWeight: 700, color: sev.color,
                background: `${sev.color}15`,
                border: `1px solid ${sev.color}40`,
                padding: '3px 10px', borderRadius: 4,
                letterSpacing: '0.08em',
              }}>
                {alert.severity}
              </span>
            )}
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 6, padding: 6,
                color: '#64748b', cursor: 'pointer',
                display: 'flex', alignItems: 'center',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = '#ff1744'; }}
              onMouseLeave={e => { e.currentTarget.style.color = '#64748b'; }}
            >
              <FiX size={14} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
          {loading ? (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              height: 200, gap: 12,
            }}>
              <div style={{
                width: 24, height: 24,
                border: `2px solid ${sev.color}30`,
                borderTop: `2px solid ${sev.color}`,
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
              }} />
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: 12, color: sev.color }}>
                FETCHING ALERT DATA...
              </span>
            </div>
          ) : (
            <>
              {/* Alert metadata */}
              <div style={{ marginBottom: 20 }}>
                <div style={{
                  fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
                  color: '#00f5ff', letterSpacing: '0.12em',
                  marginBottom: 10, textTransform: 'uppercase',
                }}>
                  ▸ Alert Information
                </div>
                <div style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  borderRadius: 8, padding: '4px 14px',
                }}>
                  <InfoRow label="Alert ID" value={`#${alert.id}`} valueColor="#00f5ff" />
                  <InfoRow label="Detection Method" value={alert.detection_method || 'RULE'} valueColor={alert.detection_method === 'ML' ? '#7c4dff' : '#00f5ff'} />
                  <InfoRow label="Source IP" value={alert.source_ip} valueColor="#ff6b81" />
                  <InfoRow label="Status" value={alert.status} valueColor={alert.status === 'RESOLVED' ? '#39ff14' : '#ffab40'} />
                  <InfoRow label="Timestamp" value={alert.timestamp ? new Date(alert.timestamp).toLocaleString() : '—'} />
                  {alert.anomaly_score > 0 && (
                    <InfoRow
                      label="ML Anomaly Score"
                      value={`${Number(alert.anomaly_score).toFixed(1)}%`}
                      valueColor={alert.anomaly_score > 80 ? '#ff1744' : alert.anomaly_score > 60 ? '#ffab40' : '#39ff14'}
                    />
                  )}
                </div>
              </div>

              {/* Description */}
              <div style={{ marginBottom: 20 }}>
                <div style={{
                  fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
                  color: '#00f5ff', letterSpacing: '0.12em',
                  marginBottom: 10, textTransform: 'uppercase',
                }}>
                  ▸ Description
                </div>
                <div style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  borderRadius: 8, padding: '12px 14px',
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 12, color: '#94a3b8', lineHeight: 1.7,
                }}>
                  {alert.description || 'No description available.'}
                </div>
              </div>

              {/* Raw log */}
              {alert.raw_log && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{
                    fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
                    color: '#00f5ff', letterSpacing: '0.12em',
                    marginBottom: 10, textTransform: 'uppercase',
                  }}>
                    ▸ Raw Log Line
                  </div>
                  <div style={{
                    background: '#020407',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: 8, padding: '12px 14px',
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: 11, color: '#6ee7b7',
                    lineHeight: 1.7, wordBreak: 'break-all',
                  }}>
                    {alert.raw_log}
                  </div>
                </div>
              )}

              {/* ML Score bar */}
              {alert.anomaly_score > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{
                    fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
                    color: '#00f5ff', letterSpacing: '0.12em',
                    marginBottom: 10, textTransform: 'uppercase',
                  }}>
                    ▸ ML Risk Score
                  </div>
                  <div style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.05)',
                    borderRadius: 8, padding: '14px',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: '#4a5568' }}>
                        ANOMALY PROBABILITY
                      </span>
                      <span style={{
                        fontFamily: 'Orbitron, monospace', fontSize: 13, fontWeight: 700,
                        color: alert.anomaly_score > 80 ? '#ff1744' : alert.anomaly_score > 60 ? '#ffab40' : '#39ff14',
                      }}>
                        {Number(alert.anomaly_score).toFixed(1)}%
                      </span>
                    </div>
                    <div style={{ height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        width: `${Math.min(alert.anomaly_score, 100)}%`,
                        background: alert.anomaly_score > 80 ? '#ff1744' : alert.anomaly_score > 60 ? '#ffab40' : '#39ff14',
                        borderRadius: 3,
                        transition: 'width 0.8s ease',
                      }} />
                    </div>
                    <div style={{
                      display: 'flex', justifyContent: 'space-between',
                      marginTop: 6, fontFamily: 'JetBrains Mono', fontSize: 9, color: '#2d3748',
                    }}>
                      <span>NORMAL</span><span>SUSPICIOUS</span><span>CRITICAL</span>
                    </div>
                  </div>
                </div>
              )}

              {/* MITRE ATT&CK */}
              {mitre && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{
                    fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
                    color: '#00f5ff', letterSpacing: '0.12em',
                    marginBottom: 10, textTransform: 'uppercase',
                  }}>
                    ▸ MITRE ATT&CK Framework
                  </div>
                  <div style={{
                    background: 'rgba(124,77,255,0.06)',
                    border: '1px solid rgba(124,77,255,0.2)',
                    borderRadius: 8, padding: '14px',
                    display: 'flex', gap: 16, alignItems: 'center',
                  }}>
                    <div style={{
                      fontFamily: 'Orbitron, monospace', fontSize: '1.1rem',
                      fontWeight: 900, color: '#7c4dff',
                      textShadow: '0 0 10px rgba(124,77,255,0.5)', flexShrink: 0,
                    }}>
                      {mitre.id}
                    </div>
                    <div>
                      <div style={{ fontFamily: 'JetBrains Mono', fontSize: 12, color: '#a78bfa', fontWeight: 600, marginBottom: 4 }}>
                        {mitre.name}
                      </div>
                      <div style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: '#4a5568', letterSpacing: '0.06em' }}>
                        Tactic: {mitre.tactic}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Investigation Guide */}
              <div style={{ marginBottom: 8 }}>
                <div style={{
                  fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
                  color: '#00f5ff', letterSpacing: '0.12em',
                  marginBottom: 10, textTransform: 'uppercase',
                }}>
                  ▸ Investigation Guide
                </div>
                <div style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  borderRadius: 8, padding: '12px 14px',
                }}>
                  {[
                    alert.source_ip
                      ? `Check if ${alert.source_ip} is a known internal IP — if not, it is an external attacker`
                      : 'Source IP unknown — check raw log for origin',
                    alert.detection_method === 'ML'
                      ? `ML flagged this as ${Number(alert.anomaly_score).toFixed(1)}% anomalous — compare against normal baseline`
                      : `Rule "${alert.rule_name}" fired — this matches a known attack pattern`,
                    alert.severity === 'HIGH' || alert.severity === 'CRITICAL'
                      ? 'HIGH severity — IP should be blocked immediately if not already done'
                      : 'MEDIUM/LOW severity — monitor for repeated occurrences before blocking',
                    'If this is a false positive (e.g. internal scanner) — click Delete',
                    'If the threat was real and handled — click Resolve to mark it closed',
                  ].map((tip, i) => (
                    <div key={i} style={{
                      display: 'flex', gap: 8, marginBottom: 6,
                      fontFamily: 'JetBrains Mono', fontSize: 10,
                      color: '#64748b', lineHeight: 1.6,
                    }}>
                      <span style={{ color: '#00f5ff', flexShrink: 0 }}>→</span>
                      {tip}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {!loading && alert?.status !== 'RESOLVED' && (
          <div style={{
            padding: '16px 24px',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            display: 'flex', gap: 10, justifyContent: 'flex-end',
            flexShrink: 0, background: 'rgba(255,255,255,0.01)',
          }}>
            <button onClick={handleDelete} disabled={deleting} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'rgba(255,23,68,0.08)', border: '1px solid rgba(255,23,68,0.25)',
              color: '#ff1744', padding: '8px 16px', borderRadius: 6,
              fontSize: 11, cursor: 'pointer', fontFamily: 'JetBrains Mono',
              letterSpacing: '0.08em',
            }}>
              <FiTrash2 size={12} />
              {deleting ? 'DELETING...' : 'DELETE — FALSE POSITIVE'}
            </button>
            <button onClick={handleResolve} disabled={resolving} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'rgba(57,255,20,0.08)', border: '1px solid rgba(57,255,20,0.25)',
              color: '#39ff14', padding: '8px 16px', borderRadius: 6,
              fontSize: 11, cursor: 'pointer', fontFamily: 'JetBrains Mono',
              letterSpacing: '0.08em',
            }}>
              <FiCheck size={12} />
              {resolving ? 'RESOLVING...' : 'RESOLVE — THREAT HANDLED'}
            </button>
          </div>
        )}

        {!loading && alert?.status === 'RESOLVED' && (
          <div style={{
            padding: '14px 24px',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0,
          }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#39ff14', boxShadow: '0 0 6px #39ff14' }} />
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: '#39ff14', letterSpacing: '0.08em' }}>
              RESOLVED — This alert has been marked as handled
            </span>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes modalIn {
          from { opacity: 0; transform: translate(-50%, -48%) scale(0.96); }
          to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </>,
    document.body
  );
};

export default AlertDetailModal;
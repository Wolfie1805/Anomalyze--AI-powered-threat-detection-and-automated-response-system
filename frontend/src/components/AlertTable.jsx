import React, { useContext, useState } from 'react';
import AlertDetailModal from './AlertDetailModal';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import { FiCheck, FiTrash2, FiFilter, FiShield, FiClock, FiEye, FiXCircle, FiUnlock } from 'react-icons/fi';

const SEVERITY = {
  HIGH:     { color: '#ff1744', bg: 'rgba(255,23,68,0.1)',   border: 'rgba(255,23,68,0.25)',   glow: 'rgba(255,23,68,0.15)'   },
  CRITICAL: { color: '#ff1744', bg: 'rgba(255,23,68,0.15)',  border: 'rgba(255,23,68,0.4)',    glow: 'rgba(255,23,68,0.2)'    },
  MEDIUM:   { color: '#ffab40', bg: 'rgba(255,171,64,0.1)',  border: 'rgba(255,171,64,0.25)',  glow: 'rgba(255,171,64,0.1)'   },
  LOW:      { color: '#39ff14', bg: 'rgba(57,255,20,0.08)',  border: 'rgba(57,255,20,0.2)',    glow: 'rgba(57,255,20,0.08)'   },
};

const STATUS = {
  NEW:            { color: '#ffab40', bg: 'rgba(255,171,64,0.1)',  border: 'rgba(255,171,64,0.25)', pulse: true  },
  RESOLVED:       { color: '#39ff14', bg: 'rgba(57,255,20,0.08)', border: 'rgba(57,255,20,0.2)',   pulse: false },
  FALSE_POSITIVE: { color: '#7c4dff', bg: 'rgba(124,77,255,0.1)', border: 'rgba(124,77,255,0.25)', pulse: false },
};

const SeverityBadge = ({ severity }) => {
  const s = SEVERITY[severity] || SEVERITY.LOW;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      color: s.color, background: s.bg,
      border: `1px solid ${s.border}`,
      padding: '3px 8px', borderRadius: 4,
      fontSize: 10, fontFamily: 'JetBrains Mono, monospace',
      fontWeight: 700, letterSpacing: '0.08em',
      boxShadow: `0 0 8px ${s.glow}`,
    }}>
      {severity === 'HIGH' || severity === 'CRITICAL' ? '▲' : severity === 'MEDIUM' ? '◆' : '●'}
      {severity}
    </span>
  );
};

const StatusBadge = ({ status }) => {
  const s = STATUS[status] || STATUS.NEW;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      color: s.color, background: s.bg,
      border: `1px solid ${s.border}`,
      padding: '3px 10px', borderRadius: 4,
      fontSize: 10, fontFamily: 'JetBrains Mono, monospace',
      fontWeight: 600, letterSpacing: '0.08em',
    }}>
      <span style={{
        width: 5, height: 5, borderRadius: '50%',
        background: s.color, boxShadow: `0 0 6px ${s.color}`,
        display: 'inline-block',
        animation: s.pulse ? 'statusPulse 1.5s infinite' : 'none',
        flexShrink: 0,
      }} />
      {status === 'FALSE_POSITIVE' ? 'FALSE POS' : status}
    </span>
  );
};

const FILTERS = ['ALL', 'NEW', 'RESOLVED', 'FALSE_POSITIVE'];

const AlertTable = ({ alerts, refreshData, isAdmin, onFalsePositive, onUnblockIP }) => {
  const { user } = useContext(AuthContext);
  const role = user?.role;
  const [filter, setFilter] = useState('ALL');
  const [deletingId, setDeletingId] = useState(null);
  const [resolvingId, setResolvingId] = useState(null);
  const [fpId, setFpId] = useState(null);
  const [unblockingId, setUnblockingId] = useState(null);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [selectedAlertId, setSelectedAlertId] = useState(null);

  const filtered = (alerts || []).filter(a =>
    filter === 'ALL' ? true : a.status === filter
  );

  const newCount = (alerts || []).filter(a => a.status === 'NEW').length;
  const resolvedCount = (alerts || []).filter(a => a.status === 'RESOLVED').length;
  const fpCount = (alerts || []).filter(a => a.status === 'FALSE_POSITIVE').length;

  const handleResolve = async (id) => {
    setResolvingId(id);
    try {
      await api.patch(`/alerts/${id}/status?status=RESOLVED`);
      refreshData && refreshData();
    } catch (err) {
      console.error('Failed to resolve alert.', err);
    } finally {
      setResolvingId(null);
    }
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await api.delete(`/alerts/${id}`);
      refreshData && refreshData();
    } catch (err) {
      console.error('Failed to delete alert.', err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleFalsePositive = async (id) => {
    setFpId(id);
    try {
      await onFalsePositive(id);
    } finally {
      setFpId(null);
    }
  };

  const handleUnblock = async (id, ip) => {
    setUnblockingId(id);
    try {
      await onUnblockIP(id, ip);
    } finally {
      setUnblockingId(null);
    }
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', minHeight: 0 }}>

      {/* Header row */}
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12, flexShrink: 0,
      }}>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <span style={{
            fontFamily: 'JetBrains Mono, monospace', fontSize: 9,
            color: '#ffab40', background: 'rgba(255,171,64,0.08)',
            border: '1px solid rgba(255,171,64,0.2)',
            padding: '2px 8px', borderRadius: 4, letterSpacing: '0.06em',
          }}>
            {newCount} NEW
          </span>
          <span style={{
            fontFamily: 'JetBrains Mono, monospace', fontSize: 9,
            color: '#39ff14', background: 'rgba(57,255,20,0.06)',
            border: '1px solid rgba(57,255,20,0.15)',
            padding: '2px 8px', borderRadius: 4, letterSpacing: '0.06em',
          }}>
            {resolvedCount} RESOLVED
          </span>
          {fpCount > 0 && (
            <span style={{
              fontFamily: 'JetBrains Mono, monospace', fontSize: 9,
              color: '#7c4dff', background: 'rgba(124,77,255,0.08)',
              border: '1px solid rgba(124,77,255,0.2)',
              padding: '2px 8px', borderRadius: 4, letterSpacing: '0.06em',
            }}>
              {fpCount} FALSE POS
            </span>
          )}
        </div>
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: '#4a5568', letterSpacing: '0.08em' }}>
          CLICK ROW TO INVESTIGATE →
        </span>
      </div>

      {/* Banner */}
      {newCount > 0 && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: 'rgba(255,171,64,0.06)', border: '1px solid rgba(255,171,64,0.2)',
          borderRadius: 6, padding: '8px 14px', marginBottom: 10, flexShrink: 0,
        }}>
          <div style={{
            width: 7, height: 7, borderRadius: '50%',
            background: '#ffab40', boxShadow: '0 0 8px #ffab40',
            animation: 'statusPulse 1.5s infinite', flexShrink: 0,
          }} />
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#ffab40', letterSpacing: '0.08em' }}>
            {newCount} alert{newCount > 1 ? 's' : ''} require action —
            {role === 'ADMIN'
              ? <> click <strong style={{ color: '#39ff14' }}>Resolve</strong> when handled or <strong style={{ color: '#ff1744' }}>Delete</strong> to remove</>
              : <> click <strong style={{ color: '#7c4dff' }}>False Pos</strong> to unblock IP or <strong style={{ color: '#39ff14' }}>Resolve</strong> to close</>
            }
          </span>
        </div>
      )}

      {newCount === 0 && resolvedCount > 0 && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: 'rgba(57,255,20,0.04)', border: '1px solid rgba(57,255,20,0.15)',
          borderRadius: 6, padding: '8px 14px', marginBottom: 10, flexShrink: 0,
        }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#39ff14', boxShadow: '0 0 8px #39ff14', flexShrink: 0 }} />
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#39ff14', letterSpacing: '0.08em' }}>
            All alerts resolved — system clear
          </span>
        </div>
      )}

      {/* Filter tabs */}
      <div style={{
        display: 'flex', gap: 4, marginBottom: 10, flexShrink: 0,
        borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: 10,
      }}>
        <FiFilter size={10} color="#4a5568" style={{ alignSelf: 'center', marginRight: 4 }} />
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: '0.1em',
            padding: '4px 12px', borderRadius: 4, cursor: 'pointer', transition: 'all 0.2s',
            background: filter === f ? 'rgba(0,245,255,0.1)' : 'transparent',
            border: filter === f ? '1px solid rgba(0,245,255,0.3)' : '1px solid rgba(255,255,255,0.05)',
            color: filter === f ? '#00f5ff' : '#4a5568',
          }}>
            {f === 'FALSE_POSITIVE' ? 'FALSE POS' : f}
            {f === 'NEW' && newCount > 0 && (
              <span style={{ marginLeft: 5, background: '#ff1744', color: '#fff', borderRadius: 3, padding: '0 4px', fontSize: 8, fontWeight: 700 }}>
                {newCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'auto', minHeight: 0 }}>
        {filtered.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 10, color: '#4a5568', padding: '30px 0' }}>
            <FiShield size={28} style={{ opacity: 0.2 }} />
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, letterSpacing: '0.1em' }}>NO ALERTS FOUND</span>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Severity', 'Threat', 'Source IP', 'Time', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{
                    color: '#4a5568', fontFamily: 'JetBrains Mono, monospace',
                    fontSize: 9, letterSpacing: '0.12em', padding: '8px 12px',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    textAlign: 'left', whiteSpace: 'nowrap', textTransform: 'uppercase',
                    position: 'sticky', top: 0,
                    background: 'rgba(4,4,10,0.98)', backdropFilter: 'blur(10px)', zIndex: 1,
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((a, i) => {
                const sev = SEVERITY[a.severity] || SEVERITY.LOW;
                const isHovered = hoveredRow === a.id;
                const isDeleting = deletingId === a.id;
                const isResolving = resolvingId === a.id;
                const isResolved = a.status === 'RESOLVED';
                const isFP = a.status === 'FALSE_POSITIVE';
                const hasIP = !!(a.source_ip || a.ip_address);

                return (
                  <tr
                    key={a.id}
                    onClick={() => setSelectedAlertId(a.id)}
                    onMouseEnter={() => setHoveredRow(a.id)}
                    onMouseLeave={() => setHoveredRow(null)}
                    style={{
                      opacity: isDeleting ? 0 : (isResolved || isFP) ? 0.6 : 1,
                      transform: isDeleting ? 'translateX(20px)' : 'none',
                      transition: 'all 0.3s ease',
                      background: isHovered ? `linear-gradient(90deg, ${sev.glow}, transparent)` : 'transparent',
                      animation: `rowIn 0.3s ease ${i * 0.04}s both`,
                      borderLeft: isHovered ? `2px solid ${sev.color}` : '2px solid transparent',
                      cursor: 'pointer',
                    }}
                  >
                    <td style={{ padding: '9px 12px', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                      <SeverityBadge severity={a.severity} />
                    </td>

                    <td style={{ padding: '9px 12px', borderBottom: '1px solid rgba(255,255,255,0.03)', maxWidth: 180 }}>
                      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#e2e8f0', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 180 }}>
                        {a.rule_name || 'Unknown'}
                      </div>
                      {a.description && (
                        <div style={{ color: '#4a5568', fontSize: 9, fontFamily: 'JetBrains Mono, monospace', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 180 }}>
                          {a.description}
                        </div>
                      )}
                    </td>

                    <td style={{ padding: '9px 12px', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: isHovered ? sev.color : '#64748b', transition: 'color 0.2s' }}>
                        {a.source_ip || a.ip_address || '—'}
                      </span>
                    </td>

                    <td style={{ padding: '9px 12px', borderBottom: '1px solid rgba(255,255,255,0.03)', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <FiClock size={9} color="#4a5568" />
                        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#4a5568' }}>
                          {a.timestamp ? new Date(a.timestamp).toLocaleTimeString() : 'N/A'}
                        </span>
                      </div>
                      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: '#2d3748', marginTop: 1 }}>
                        {a.timestamp ? new Date(a.timestamp).toLocaleDateString() : ''}
                      </div>
                    </td>

                    <td style={{ padding: '9px 12px', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                      <StatusBadge status={a.status} />
                    </td>

                    {/* Actions — role based */}
                    <td style={{ padding: '9px 12px', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }} onClick={e => e.stopPropagation()}>

                        {/* View — everyone */}
                        <button onClick={(e) => { e.stopPropagation(); setSelectedAlertId(a.id); }} style={actionBtn('#00f5ff')}>
                          <FiEye size={10} /> View
                        </button>

                        {/* ANALYST buttons */}
                        {role === 'ANALYST' && (
                          <>
                            {/* Resolve — for new alerts */}
                            {!isResolved && !isFP && (
                              <button
                                onClick={(e) => { e.stopPropagation(); handleResolve(a.id); }}
                                disabled={isResolving}
                                style={{ ...actionBtn('#39ff14'), opacity: isResolving ? 0.5 : 1 }}
                              >
                                <FiCheck size={10} /> {isResolving ? '...' : 'Resolve'}
                              </button>
                            )}

                            {/* False Positive — marks alert + auto-unblocks IP */}
                            {!isFP && hasIP && (
                              <button
                                onClick={(e) => { e.stopPropagation(); handleFalsePositive(a.id); }}
                                disabled={fpId === a.id}
                                title="Mark as false positive and unblock IP"
                                style={{ ...actionBtn('#7c4dff'), opacity: fpId === a.id ? 0.5 : 1 }}
                              >
                                <FiXCircle size={10} /> {fpId === a.id ? '...' : 'False Pos'}
                              </button>
                            )}

                            {/* Unblock IP — manual unblock without marking false positive */}
                            {hasIP && !isFP && (
                              <button
                                onClick={(e) => { e.stopPropagation(); handleUnblock(a.id, a.source_ip || a.ip_address); }}
                                disabled={unblockingId === a.id}
                                title="Unblock this IP address"
                                style={{ ...actionBtn('#00e5ff'), opacity: unblockingId === a.id ? 0.5 : 1 }}
                              >
                                <FiUnlock size={10} /> {unblockingId === a.id ? '...' : 'Unblock IP'}
                              </button>
                            )}
                          </>
                        )}

                        {/* ADMIN buttons */}
                        {role === 'ADMIN' && (
                          <>
                            {!isResolved && !isFP && (
                              <button
                                onClick={(e) => { e.stopPropagation(); handleResolve(a.id); }}
                                disabled={isResolving}
                                style={{ ...actionBtn('#39ff14'), opacity: isResolving ? 0.5 : 1 }}
                              >
                                <FiCheck size={10} /> {isResolving ? '...' : 'Resolve'}
                              </button>
                            )}

                            <button
                              onClick={(e) => { e.stopPropagation(); handleDelete(a.id); }}
                              disabled={isDeleting}
                              style={{ ...actionBtn('#ff1744'), opacity: isDeleting ? 0 : 1 }}
                            >
                              <FiTrash2 size={10} /> {isDeleting ? '...' : 'Delete'}
                            </button>
                          </>
                        )}

                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {selectedAlertId && (
        <AlertDetailModal
          alertId={selectedAlertId}
          onClose={() => setSelectedAlertId(null)}
          onResolve={() => refreshData && refreshData()}
          onDelete={() => refreshData && refreshData()}
        />
      )}

      <style>{`
        @keyframes rowIn { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes statusPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
      `}</style>
    </div>
  );
};

const actionBtn = (color) => ({
  background: `${color}10`,
  border: `1px solid ${color}30`,
  color: color,
  padding: '4px 8px', borderRadius: 4,
  fontSize: 10, cursor: 'pointer',
  display: 'flex', alignItems: 'center', gap: 4,
  fontFamily: 'JetBrains Mono, monospace',
  transition: 'all 0.2s', whiteSpace: 'nowrap',
});

export default AlertTable;
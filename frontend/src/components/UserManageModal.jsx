import React, { useState, useEffect, useContext } from 'react';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import { FiX, FiUserPlus, FiTrash2, FiToggleLeft, FiToggleRight, FiShield, FiUser } from 'react-icons/fi';

const UserManageModal = ({ onClose }) => {
  const { user: currentUser } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ username: '', email: '', password: '', role: 'ANALYST' });

  const fetchUsers = async () => {
    try {
      const res = await api.get('/auth/users');
      setUsers(res.data);
    } catch (err) {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const showMsg = (msg, isError = false) => {
    if (isError) setError(msg);
    else setSuccess(msg);
    setTimeout(() => { setError(''); setSuccess(''); }, 3000);
  };

  const handleCreate = async () => {
    if (!form.username || !form.email || !form.password) {
      showMsg('All fields are required', true);
      return;
    }
    setCreating(true);
    try {
      await api.post('/auth/users', form);
      showMsg(`User "${form.username}" created successfully`);
      setForm({ username: '', email: '', password: '', role: 'ANALYST' });
      setShowForm(false);
      fetchUsers();
    } catch (err) {
      showMsg(err.response?.data?.detail || 'Failed to create user', true);
    } finally {
      setCreating(false);
    }
  };

  const handleToggle = async (userId) => {
    try {
      const res = await api.patch(`/auth/users/${userId}/toggle`);
      showMsg(`User ${res.data.is_active ? 'activated' : 'deactivated'}`);
      fetchUsers();
    } catch (err) {
      showMsg(err.response?.data?.detail || 'Failed', true);
    }
  };

  const handleDelete = async (userId, username) => {
    if (!window.confirm(`Delete user "${username}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/auth/users/${userId}`);
      showMsg(`User "${username}" deleted`);
      fetchUsers();
    } catch (err) {
      showMsg(err.response?.data?.detail || 'Failed to delete', true);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24,
    }} onClick={onClose}>

      <div style={{
        background: 'linear-gradient(180deg, rgba(8,8,20,0.99), rgba(4,4,14,0.99))',
        border: '1px solid rgba(0,245,255,0.15)',
        borderRadius: 16, width: '100%', maxWidth: 680,
        maxHeight: '85vh', display: 'flex', flexDirection: 'column',
        boxShadow: '0 0 60px rgba(0,245,255,0.08), 0 30px 80px rgba(0,0,0,0.8)',
        overflow: 'hidden',
      }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 24px',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          background: 'linear-gradient(90deg, rgba(0,245,255,0.04), rgba(124,77,255,0.04))',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <FiShield size={16} color="#00f5ff" style={{ filter: 'drop-shadow(0 0 6px #00f5ff)' }} />
            <span style={{ fontFamily: 'Orbitron, monospace', fontSize: 14, color: '#00f5ff', letterSpacing: '0.1em' }}>
              USER MANAGEMENT
            </span>
            <span style={{
              fontFamily: 'JetBrains Mono', fontSize: 9,
              color: '#ff1744', background: 'rgba(255,23,68,0.1)',
              border: '1px solid rgba(255,23,68,0.2)',
              padding: '2px 8px', borderRadius: 4, letterSpacing: '0.08em',
            }}>
              ADMIN ONLY
            </span>
          </div>
          <button onClick={onClose} style={{
            background: 'transparent', border: 'none',
            color: '#4a5568', cursor: 'pointer', padding: 4,
            display: 'flex', alignItems: 'center',
          }}
            onMouseEnter={e => e.currentTarget.style.color = '#ff1744'}
            onMouseLeave={e => e.currentTarget.style.color = '#4a5568'}
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Toast */}
        {(error || success) && (
          <div style={{
            margin: '12px 24px 0',
            padding: '10px 16px', borderRadius: 8,
            fontFamily: 'JetBrains Mono', fontSize: 11,
            background: error ? 'rgba(255,23,68,0.08)' : 'rgba(57,255,20,0.06)',
            border: `1px solid ${error ? 'rgba(255,23,68,0.25)' : 'rgba(57,255,20,0.2)'}`,
            color: error ? '#ff1744' : '#39ff14',
            flexShrink: 0,
          }}>
            {error || success}
          </div>
        )}

        {/* Create form */}
        <div style={{ padding: '16px 24px 0', flexShrink: 0 }}>
          <button
            onClick={() => setShowForm(v => !v)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: showForm ? 'rgba(0,245,255,0.1)' : 'rgba(0,245,255,0.05)',
              border: '1px solid rgba(0,245,255,0.2)',
              borderRadius: 8, padding: '8px 16px',
              color: '#00f5ff', fontFamily: 'JetBrains Mono',
              fontSize: 11, cursor: 'pointer', letterSpacing: '0.08em',
              transition: 'all 0.2s', width: '100%',
              justifyContent: 'center',
            }}
          >
            <FiUserPlus size={13} />
            {showForm ? 'CANCEL' : 'CREATE NEW USER'}
          </button>

          {showForm && (
            <div style={{
              marginTop: 12, padding: 16,
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(0,245,255,0.1)',
              borderRadius: 10,
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                {[
                  { label: 'USERNAME', key: 'username', type: 'text', placeholder: 'analyst01' },
                  { label: 'EMAIL', key: 'email', type: 'email', placeholder: 'analyst@anomalyze.local' },
                  { label: 'PASSWORD', key: 'password', type: 'password', placeholder: '••••••••' },
                ].map(f => (
                  <div key={f.key}>
                    <div style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: '#4a5568', letterSpacing: '0.1em', marginBottom: 5 }}>
                      {f.label}
                    </div>
                    <input
                      type={f.type}
                      placeholder={f.placeholder}
                      value={form[f.key]}
                      onChange={e => setForm(v => ({ ...v, [f.key]: e.target.value }))}
                      style={{
                        width: '100%', background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(0,245,255,0.1)',
                        borderRadius: 6, padding: '8px 12px',
                        color: '#e2e8f0', fontFamily: 'JetBrains Mono',
                        fontSize: 12, outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                ))}

                {/* Role selector */}
                <div>
                  <div style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: '#4a5568', letterSpacing: '0.1em', marginBottom: 5 }}>
                    ROLE
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {['ANALYST', 'ADMIN'].map(r => (
                      <button
                        key={r}
                        onClick={() => setForm(v => ({ ...v, role: r }))}
                        style={{
                          flex: 1, padding: '8px 0', borderRadius: 6,
                          fontFamily: 'JetBrains Mono', fontSize: 11,
                          cursor: 'pointer', transition: 'all 0.2s',
                          background: form.role === r
                            ? r === 'ADMIN' ? 'rgba(255,23,68,0.15)' : 'rgba(0,245,255,0.12)'
                            : 'rgba(255,255,255,0.02)',
                          border: form.role === r
                            ? r === 'ADMIN' ? '1px solid rgba(255,23,68,0.4)' : '1px solid rgba(0,245,255,0.3)'
                            : '1px solid rgba(255,255,255,0.06)',
                          color: form.role === r
                            ? r === 'ADMIN' ? '#ff1744' : '#00f5ff'
                            : '#4a5568',
                        }}
                      >
                        {r === 'ADMIN' ? '👑' : '🔍'} {r}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={handleCreate}
                disabled={creating}
                style={{
                  width: '100%', padding: '10px 0',
                  background: creating ? 'rgba(57,255,20,0.05)' : 'rgba(57,255,20,0.1)',
                  border: '1px solid rgba(57,255,20,0.3)',
                  borderRadius: 8, color: '#39ff14',
                  fontFamily: 'JetBrains Mono', fontSize: 12,
                  letterSpacing: '0.1em', cursor: creating ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {creating ? 'CREATING...' : '✓ CREATE USER'}
              </button>
            </div>
          )}
        </div>

        {/* Users list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px 24px', minHeight: 0 }}>
          <div style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: '#4a5568', letterSpacing: '0.1em', marginBottom: 12 }}>
            ALL USERS — {users.length} TOTAL
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
              <div style={{ width: 28, height: 28, border: '2px solid rgba(0,245,255,0.2)', borderTop: '2px solid #00f5ff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {users.map(u => (
                <div key={u.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 16px', borderRadius: 10,
                  background: u.is_active ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.01)',
                  border: `1px solid ${u.is_active ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.03)'}`,
                  opacity: u.is_active ? 1 : 0.5,
                  transition: 'all 0.2s',
                }}>

                  {/* Avatar */}
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: u.role === 'ADMIN'
                      ? 'rgba(255,23,68,0.12)' : 'rgba(0,245,255,0.08)',
                    border: `1px solid ${u.role === 'ADMIN' ? 'rgba(255,23,68,0.3)' : 'rgba(0,245,255,0.2)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    {u.role === 'ADMIN'
                      ? <FiShield size={14} color="#ff1744" />
                      : <FiUser size={14} color="#00f5ff" />
                    }
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                      <span style={{ fontFamily: 'JetBrains Mono', fontSize: 12, color: '#e2e8f0', fontWeight: 600 }}>
                        {u.username}
                      </span>
                      <span style={{
                        fontFamily: 'JetBrains Mono', fontSize: 8,
                        padding: '1px 7px', borderRadius: 4,
                        background: u.role === 'ADMIN' ? 'rgba(255,23,68,0.1)' : 'rgba(0,245,255,0.08)',
                        border: `1px solid ${u.role === 'ADMIN' ? 'rgba(255,23,68,0.25)' : 'rgba(0,245,255,0.2)'}`,
                        color: u.role === 'ADMIN' ? '#ff1744' : '#00f5ff',
                        letterSpacing: '0.08em',
                      }}>
                        {u.role}
                      </span>
                      {u.id === currentUser?.id && (
                        <span style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: '#4a5568' }}>
                          (you)
                        </span>
                      )}
                      {!u.is_active && (
                        <span style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: '#ff1744' }}>
                          INACTIVE
                        </span>
                      )}
                    </div>
                    <div style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: '#4a5568' }}>
                      {u.email} · joined {u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A'}
                    </div>
                  </div>

                  {/* Actions — can't act on yourself */}
                  {u.id !== currentUser?.id && (
                    <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                      <button
                        onClick={() => handleToggle(u.id)}
                        title={u.is_active ? 'Deactivate user' : 'Activate user'}
                        style={{
                          background: u.is_active ? 'rgba(255,171,64,0.08)' : 'rgba(57,255,20,0.08)',
                          border: `1px solid ${u.is_active ? 'rgba(255,171,64,0.25)' : 'rgba(57,255,20,0.25)'}`,
                          color: u.is_active ? '#ffab40' : '#39ff14',
                          padding: '5px 10px', borderRadius: 6,
                          fontSize: 10, cursor: 'pointer',
                          display: 'flex', alignItems: 'center', gap: 4,
                          fontFamily: 'JetBrains Mono', transition: 'all 0.2s',
                        }}
                      >
                        {u.is_active ? <FiToggleRight size={12} /> : <FiToggleLeft size={12} />}
                        {u.is_active ? 'Deactivate' : 'Activate'}
                      </button>

                      <button
                        onClick={() => handleDelete(u.id, u.username)}
                        title="Delete user"
                        style={{
                          background: 'rgba(255,23,68,0.08)',
                          border: '1px solid rgba(255,23,68,0.25)',
                          color: '#ff1744',
                          padding: '5px 10px', borderRadius: 6,
                          fontSize: 10, cursor: 'pointer',
                          display: 'flex', alignItems: 'center', gap: 4,
                          fontFamily: 'JetBrains Mono', transition: 'all 0.2s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,23,68,0.15)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,23,68,0.08)'}
                      >
                        <FiTrash2 size={10} /> Delete
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default UserManageModal;
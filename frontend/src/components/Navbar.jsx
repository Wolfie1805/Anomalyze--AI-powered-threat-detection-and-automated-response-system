import React, { useContext, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import UserManageModal from './UserManageModal';
import { FiShield, FiLogOut, FiUser, FiGrid, FiBell, FiFileText, FiUsers } from 'react-icons/fi';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const [time, setTime] = useState(new Date());
  const [showUserModal, setShowUserModal] = useState(false);
  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const handleLogout = () => {
    logout();
    window.location.href = '/landing.html';
  };

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: <FiGrid size={14} /> },
    { to: '/alerts', label: 'Alerts', icon: <FiBell size={14} /> },
    { to: '/logs', label: 'Logs', icon: <FiFileText size={14} /> },
  ];

  return (
    <>
      <nav style={{
        background: 'rgba(10,10,15,0.92)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(0,245,255,0.12)',
        padding: '0 24px', height: 60,
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 100,
      }}>

        {/* Logo */}
        <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <FiShield size={20} color="#00f5ff" style={{ filter: 'drop-shadow(0 0 6px #00f5ff)' }} />
          <span style={{
            fontFamily: 'Orbitron, monospace', fontSize: '1rem', fontWeight: 700,
            color: '#00f5ff', textShadow: '0 0 10px rgba(0,245,255,0.6)', letterSpacing: '0.1em',
          }}>
            ANOMALYZE
          </span>
        </Link>

        {/* Nav links */}
        <ul style={{ display: 'flex', listStyle: 'none', gap: 4, margin: 0, padding: 0 }}>
          {navLinks.map(link => {
            const active = location.pathname === link.to;
            return (
              <li key={link.to}>
                <Link to={link.to} style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '6px 14px', borderRadius: 6,
                  fontSize: 13, fontWeight: 500, textDecoration: 'none',
                  color: active ? '#00f5ff' : '#64748b',
                  background: active ? 'rgba(0,245,255,0.08)' : 'transparent',
                  border: active ? '1px solid rgba(0,245,255,0.2)' : '1px solid transparent',
                  transition: 'all 0.2s ease',
                }}>
                  {link.icon} {link.label}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>

          {/* Clock */}
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#00f5ff', opacity: 0.7 }}>
            {time.toLocaleTimeString()}
          </span>

          {/* User info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#94a3b8', fontSize: 13 }}>
            <FiUser size={14} color="#00f5ff" />
            <span>{user?.username}</span>
            <span style={{
              background: user?.role === 'ADMIN' ? 'rgba(255,23,68,0.1)' : 'rgba(0,245,255,0.1)',
              border: `1px solid ${user?.role === 'ADMIN' ? 'rgba(255,23,68,0.2)' : 'rgba(0,245,255,0.2)'}`,
              color: user?.role === 'ADMIN' ? '#ff1744' : '#00f5ff',
              fontSize: 10, padding: '1px 6px', borderRadius: 4,
              fontFamily: 'JetBrains Mono', letterSpacing: '0.05em',
            }}>
              {user?.role}
            </span>
          </div>

          {/* Manage Users — ADMIN only */}
          {isAdmin && (
            <button
              onClick={() => setShowUserModal(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: 'rgba(124,77,255,0.08)',
                border: '1px solid rgba(124,77,255,0.25)',
                color: '#7c4dff', padding: '6px 12px',
                borderRadius: 6, fontSize: 13, cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(124,77,255,0.18)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(124,77,255,0.08)'}
            >
              <FiUsers size={14} /> Users
            </button>
          )}

          {/* Logout */}
          <button onClick={handleLogout} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'rgba(255,23,68,0.08)',
            border: '1px solid rgba(255,23,68,0.25)',
            color: '#ff1744', padding: '6px 12px',
            borderRadius: 6, fontSize: 13, cursor: 'pointer', transition: 'all 0.2s',
          }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,23,68,0.18)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,23,68,0.08)'}
          >
            <FiLogOut size={14} /> Logout
          </button>
        </div>
      </nav>

      {/* User management modal */}
      {showUserModal && <UserManageModal onClose={() => setShowUserModal(false)} />}
    </>
  );
};

export default Navbar;
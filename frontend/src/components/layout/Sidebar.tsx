import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, AlertTriangle, Map as MapIcon, FileText, Brain, ShieldAlert, Settings, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import clsx from 'clsx';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/alerts', label: 'Alerts', icon: AlertTriangle },
  { path: '/threat-map', label: 'Threat Map', icon: MapIcon },
  { path: '/logs', label: 'Logs', icon: FileText },
  { path: '/ml-insights', label: 'ML Insights', icon: Brain },
  { path: '/responses', label: 'Responses', icon: ShieldAlert },
  { path: '/settings', label: 'Settings', icon: Settings },
];

const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logoutUser } = useAuthStore();

  return (
    <div
      style={{
        width: collapsed ? '80px' : '260px',
        backgroundColor: 'rgba(10, 10, 15, 0.8)',
        backdropFilter: 'blur(20px)',
        borderRight: '1px solid var(--color-glass-border)',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.3s ease',
        position: 'relative',
        zIndex: 10,
      }}
    >
      <div style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between', borderBottom: '1px solid var(--color-glass-border)' }}>
        {!collapsed && (
          <h2 className="orbitron glitch-anim" style={{ color: 'var(--color-cyan)', fontSize: '1.25rem', margin: 0, textShadow: '0 0 10px rgba(0,245,255,0.5)' }}>
            ANOMALYZE
          </h2>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{ background: 'transparent', border: 'none', color: 'var(--color-cyan)', cursor: 'pointer', padding: '0.25rem' }}
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      <div style={{ flex: 1, padding: '1.5rem 0', display: 'flex', flexDirection: 'column', gap: '0.5rem', overflowY: 'auto' }}>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              padding: '0.75rem 1.5rem',
              color: isActive ? 'var(--color-cyan)' : 'rgba(255,255,255,0.6)',
              textDecoration: 'none',
              transition: 'all 0.3s ease',
              borderLeft: isActive ? '3px solid var(--color-cyan)' : '3px solid transparent',
              background: isActive ? 'linear-gradient(90deg, rgba(0,245,255,0.1) 0%, rgba(0,0,0,0) 100%)' : 'transparent',
              textShadow: isActive ? '0 0 8px rgba(0,245,255,0.5)' : 'none',
              justifyContent: collapsed ? 'center' : 'flex-start'
            })}
          >
            <item.icon size={20} style={{ minWidth: 20 }} />
            {!collapsed && <span style={{ marginLeft: '1rem', fontWeight: 500 }}>{item.label}</span>}
          </NavLink>
        ))}
      </div>

      <div style={{ padding: '1.5rem', borderTop: '1px solid var(--color-glass-border)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-start' }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--color-purple)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
            {user?.username?.[0]?.toUpperCase() || 'U'}
          </div>
          {!collapsed && (
            <div style={{ marginLeft: '1rem', overflow: 'hidden' }}>
              <div style={{ fontWeight: 'bold', fontSize: '0.9rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{user?.username}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--color-purple)', textTransform: 'uppercase' }}>{user?.role}</div>
            </div>
          )}
        </div>
        <button
          onClick={logoutUser}
          style={{ display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'center', gap: '0.5rem', padding: '0.5rem', background: 'rgba(255,23,68,0.1)', color: 'var(--color-red)', border: '1px solid rgba(255,23,68,0.3)', borderRadius: '4px', cursor: 'pointer', transition: 'all 0.3s ease' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,23,68,0.2)' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,23,68,0.1)' }}
        >
          <LogOut size={16} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;

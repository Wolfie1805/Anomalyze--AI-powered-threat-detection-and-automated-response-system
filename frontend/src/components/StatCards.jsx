import React, { useEffect, useState } from 'react';
import { FiBell, FiCheckCircle, FiAlertTriangle, FiActivity } from 'react-icons/fi';

const StatCard = ({ title, value, icon, color, delay }) => {
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    if (!value) return;
    let start = 0;
    const end = parseInt(value) || 0;
    if (end === 0) { setDisplayed(0); return; }
    const step = Math.ceil(end / 33);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setDisplayed(end); clearInterval(timer); }
      else setDisplayed(start);
    }, 30);
    return () => clearInterval(timer);
  }, [value]);

  return (
    <div style={{
      background: 'rgba(255,255,255,0.02)',
      border: `1px solid ${color}25`,
      borderRadius: 12,
      padding: '16px 20px',
      backdropFilter: 'blur(10px)',
      position: 'relative',
      overflow: 'hidden',
      animation: `fadeSlideIn 0.6s ease ${delay} both`,
      transition: 'all 0.3s ease',
      cursor: 'default',
      // ── FIXED HEIGHT — this is the key fix ──
      height: '100px',
      minHeight: '100px',
      maxHeight: '100px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
    }}
    onMouseEnter={e => {
      e.currentTarget.style.border = `1px solid ${color}60`;
      e.currentTarget.style.boxShadow = `0 0 20px ${color}15`;
      e.currentTarget.style.transform = 'translateY(-2px)';
    }}
    onMouseLeave={e => {
      e.currentTarget.style.border = `1px solid ${color}25`;
      e.currentTarget.style.boxShadow = 'none';
      e.currentTarget.style.transform = 'translateY(0)';
    }}
    >
      {/* Background glow */}
      <div style={{
        position: 'absolute', top: -20, right: -20,
        width: 80, height: 80,
        background: `radial-gradient(circle, ${color}15, transparent 70%)`,
        borderRadius: '50%',
        pointerEvents: 'none',
      }} />

      {/* Top label */}
      <p style={{
        color: '#64748b',
        fontSize: 10,
        fontFamily: 'JetBrains Mono, monospace',
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        margin: 0,
        flexShrink: 0,
      }}>
        {title}
      </p>

      {/* Bottom row: value + icon */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        flexShrink: 0,
      }}>
        <p style={{
          fontSize: '1.8rem',
          fontWeight: 700,
          fontFamily: 'Orbitron, monospace',
          color: color,
          textShadow: `0 0 15px ${color}60`,
          lineHeight: 1,
          margin: 0,
        }}>
          {displayed}
        </p>
        <div style={{
          width: 36,
          height: 36,
          background: `${color}15`,
          border: `1px solid ${color}30`,
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: color,
          flexShrink: 0,
        }}>
          {icon}
        </div>
      </div>

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

const StatCards = ({ stats }) => {
  const cards = [
    {
      title: 'Total Alerts',
      value: stats ? (stats.by_status?.NEW ?? 0) + (stats.by_status?.RESOLVED ?? 0) : 0,
      icon: <FiBell size={16} />,
      color: '#00f5ff',
      delay: '0s',
    },
    {
      title: 'High Severity',
      value: stats?.by_severity?.HIGH ?? 0,
      icon: <FiAlertTriangle size={16} />,
      color: '#ff1744',
      delay: '0.1s',
    },
    {
      title: 'Open Alerts',
      value: stats?.by_status?.NEW ?? 0,
      icon: <FiActivity size={16} />,
      color: '#ffab40',
      delay: '0.2s',
    },
    {
      title: 'Resolved',
      value: stats?.by_status?.RESOLVED ?? 0,
      icon: <FiCheckCircle size={16} />,
      color: '#39ff14',
      delay: '0.3s',
    },
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: 16,
      marginBottom: 20,
    }}>
      {cards.map((card, i) => (
        <StatCard key={i} {...card} />
      ))}
    </div>
  );
};

export default StatCards;
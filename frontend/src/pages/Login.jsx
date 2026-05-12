import React, { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FiShield, FiUser, FiLock, FiAlertTriangle } from 'react-icons/fi';

// Same MatrixRain as Dashboard
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

// Same FloatingOrbs as Dashboard
const FloatingOrbs = () => (
  <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
    {[
      { size: 350, top: '5%', left: '-5%', color: 'rgba(0,245,255,0.04)', delay: '0s', duration: '9s' },
      { size: 250, bottom: '10%', right: '-5%', color: 'rgba(124,77,255,0.05)', delay: '3s', duration: '11s' },
      { size: 180, top: '50%', right: '20%', color: 'rgba(255,23,68,0.03)', delay: '1.5s', duration: '7s' },
    ].map((orb, i) => (
      <div key={i} style={{
        position: 'absolute',
        width: orb.size,
        height: orb.size,
        top: orb.top,
        left: orb.left,
        right: orb.right,
        bottom: orb.bottom,
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

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const success = await login(username, password);
    if (success) {
      navigate('/');
    } else {
      setError('Invalid username or password');
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0f',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      fontFamily: 'Inter, sans-serif',
    }}>
      <MatrixRain />
      <FloatingOrbs />

      {/* Glowing center line */}
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 600,
        height: 1,
        background: 'linear-gradient(90deg, transparent, rgba(0,245,255,0.15), transparent)',
        zIndex: 0,
        pointerEvents: 'none',
      }} />

      {/* Login card */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        width: '100%',
        maxWidth: 420,
        padding: '0 20px',
        animation: 'cardIn 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      }}>
        <div style={{
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(0,245,255,0.15)',
          borderRadius: 16,
          padding: '40px 36px',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 0 60px rgba(0,245,255,0.05), 0 0 120px rgba(0,0,0,0.5)',
        }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            {/* Shield icon with glow */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 64,
              height: 64,
              background: 'rgba(0,245,255,0.08)',
              border: '1px solid rgba(0,245,255,0.25)',
              borderRadius: 16,
              marginBottom: 20,
              animation: 'iconPulse 3s ease-in-out infinite',
            }}>
              <FiShield size={28} color="#00f5ff" style={{ filter: 'drop-shadow(0 0 8px #00f5ff)' }} />
            </div>

            {/* Title with glitch effect */}
            <h1 style={{
              fontFamily: 'Orbitron, monospace',
              fontSize: '1.8rem',
              fontWeight: 900,
              color: '#00f5ff',
              textShadow: '0 0 20px rgba(0,245,255,0.6), 0 0 40px rgba(0,245,255,0.2)',
              letterSpacing: '0.12em',
              marginBottom: 8,
              animation: 'glitch 5s infinite',
            }}>
              ANOMALYZE
            </h1>

            <p style={{
              color: '#64748b',
              fontSize: 12,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              fontFamily: 'JetBrains Mono, monospace',
            }}>
              Cyber Threat Detection System
            </p>

            {/* Divider */}
            <div style={{
              margin: '20px auto 0',
              width: 60,
              height: 1,
              background: 'linear-gradient(90deg, transparent, rgba(0,245,255,0.4), transparent)',
            }} />
          </div>

          {/* Error message */}
          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(255,23,68,0.08)',
              border: '1px solid rgba(255,23,68,0.25)',
              borderRadius: 8,
              padding: '10px 14px',
              marginBottom: 20,
              color: '#ff1744',
              fontSize: 13,
              fontFamily: 'JetBrains Mono, monospace',
              animation: 'shake 0.4s ease',
            }}>
              <FiAlertTriangle size={14} />
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* Username field */}
            <div style={{ marginBottom: 16 }}>
              <label style={{
                display: 'block',
                color: '#64748b',
                fontSize: 11,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                fontFamily: 'JetBrains Mono, monospace',
                marginBottom: 8,
              }}>
                Username
              </label>
              <div style={{ position: 'relative' }}>
                <FiUser size={14} style={{
                  position: 'absolute', left: 14, top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#64748b',
                  pointerEvents: 'none',
                }} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  required
                  style={{
                    width: '100%',
                    background: 'rgba(13,13,24,0.8)',
                    border: '1px solid rgba(0,245,255,0.12)',
                    borderRadius: 8,
                    padding: '12px 14px 12px 38px',
                    color: '#e2e8f0',
                    fontSize: 14,
                    fontFamily: 'Inter, sans-serif',
                    outline: 'none',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                    boxSizing: 'border-box',
                  }}
                  onFocus={e => {
                    e.target.style.borderColor = 'rgba(0,245,255,0.5)';
                    e.target.style.boxShadow = '0 0 12px rgba(0,245,255,0.15)';
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = 'rgba(0,245,255,0.12)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>

            {/* Password field */}
            <div style={{ marginBottom: 28 }}>
              <label style={{
                display: 'block',
                color: '#64748b',
                fontSize: 11,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                fontFamily: 'JetBrains Mono, monospace',
                marginBottom: 8,
              }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <FiLock size={14} style={{
                  position: 'absolute', left: 14, top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#64748b',
                  pointerEvents: 'none',
                }} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                  style={{
                    width: '100%',
                    background: 'rgba(13,13,24,0.8)',
                    border: '1px solid rgba(0,245,255,0.12)',
                    borderRadius: 8,
                    padding: '12px 14px 12px 38px',
                    color: '#e2e8f0',
                    fontSize: 14,
                    fontFamily: 'Inter, sans-serif',
                    outline: 'none',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                    boxSizing: 'border-box',
                  }}
                  onFocus={e => {
                    e.target.style.borderColor = 'rgba(0,245,255,0.5)';
                    e.target.style.boxShadow = '0 0 12px rgba(0,245,255,0.15)';
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = 'rgba(0,245,255,0.12)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>

            {/* Login button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '13px',
                background: loading ? 'rgba(0,245,255,0.05)' : 'rgba(0,245,255,0.08)',
                border: '1px solid rgba(0,245,255,0.3)',
                borderRadius: 8,
                color: loading ? '#64748b' : '#00f5ff',
                fontSize: 13,
                fontWeight: 600,
                fontFamily: 'Orbitron, monospace',
                letterSpacing: '0.15em',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
              onMouseEnter={e => {
                if (!loading) {
                  e.currentTarget.style.background = 'rgba(0,245,255,0.15)';
                  e.currentTarget.style.boxShadow = '0 0 20px rgba(0,245,255,0.2)';
                }
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = loading ? 'rgba(0,245,255,0.05)' : 'rgba(0,245,255,0.08)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {loading ? (
                <>
                  <div style={{
                    width: 14, height: 14,
                    border: '2px solid rgba(0,245,255,0.2)',
                    borderTop: '2px solid #00f5ff',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                  }} />
                  AUTHENTICATING...
                </>
              ) : (
                <>
                  <FiShield size={14} />
                  INITIALIZE SESSION
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div style={{
            marginTop: 24,
            textAlign: 'center',
            color: '#334155',
            fontSize: 11,
            fontFamily: 'JetBrains Mono, monospace',
            letterSpacing: '0.1em',
          }}>
            ANOMALYZE v1.0 · SDGI GLOBAL UNIVERSITY · BCA FINAL YEAR
          </div>
        </div>
      </div>

      <style>{`
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(24px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes glitch {
          0%, 90%, 100% { text-shadow: 0 0 20px rgba(0,245,255,0.6), 0 0 40px rgba(0,245,255,0.2); }
          92% { text-shadow: -2px 0 rgba(255,23,68,0.8), 2px 0 rgba(0,245,255,0.8); transform: translateX(-1px); }
          94% { text-shadow: 2px 0 rgba(255,23,68,0.8), -2px 0 rgba(0,245,255,0.8); transform: translateX(1px); }
          96% { text-shadow: 0 0 20px rgba(0,245,255,0.6); transform: translateX(0); }
        }
        @keyframes iconPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(0,245,255,0.1); }
          50% { box-shadow: 0 0 0 8px rgba(0,245,255,0); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        input::placeholder { color: #334155; }
      `}</style>
    </div>
  );
};

export default Login;
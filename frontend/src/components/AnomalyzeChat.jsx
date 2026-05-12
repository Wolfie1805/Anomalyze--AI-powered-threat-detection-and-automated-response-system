import React, { useState, useRef, useEffect, useContext } from 'react';
import { FiMessageSquare, FiX, FiSend, FiShield, FiMinimize2, FiChevronDown, FiZap, FiSearch } from 'react-icons/fi';
import { AuthContext } from '../context/AuthContext';
import api from '../api';

const QUICK_ACTIONS = [
  { icon: '🔴', label: 'Critical Threats', question: 'Show me all critical and high severity threats right now' },
  { icon: '🌐', label: 'Attacking IPs', question: 'Which IPs are attacking us and what are they doing?' },
  { icon: '📊', label: 'Threat Summary', question: 'Give me a full threat summary and current system status' },
  { icon: '🛡️', label: 'Should I Block?', question: 'Which IPs should I block right now based on current alerts?' },
  { icon: '🔍', label: 'Latest Alert', question: 'Explain the latest alert in detail and what I should do' },
  { icon: '📈', label: 'Attack Patterns', question: 'What attack patterns are we seeing today?' },
  { icon: '⚡', label: 'Auto-Blocked', question: 'Which IPs were automatically blocked and why?' },
  { icon: '🎯', label: 'MITRE Mapping', question: 'Map our current alerts to MITRE ATT&CK techniques' },
];

const SUGGESTED_PUBLIC = [
  "What is a brute force attack?",
  "How does SQL injection work?",
  "What is anomaly detection?",
  "Explain MITRE ATT&CK",
  "What is a port scan?",
  "How does ML detect threats?",
];

function TypingDots() {
  return (
    <div style={{ display: 'flex', gap: 5, padding: '6px 2px', alignItems: 'center' }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: 7, height: 7, borderRadius: '50%',
          background: 'linear-gradient(135deg, #00f5ff, #7c3aed)',
          animation: 'typingDot 1.4s ease-in-out infinite',
          animationDelay: `${i * 0.18}s`,
        }} />
      ))}
    </div>
  );
}

function formatMarkdown(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong style="color:#00f5ff;font-weight:700">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em style="color:#a78bfa">$1</em>')
    .replace(/`(.*?)`/g, '<code style="background:rgba(0,245,255,0.08);padding:2px 6px;border-radius:4px;font-family:\'JetBrains Mono\',monospace;font-size:10px;color:#00f5ff;border:1px solid rgba(0,245,255,0.15)">$1</code>')
    .replace(/^- (.*)/gm, '<div style="display:flex;gap:10px;margin:5px 0;align-items:flex-start"><span style="color:#00f5ff;flex-shrink:0;margin-top:2px;font-size:10px">▸</span><span>$1</span></div>')
    .replace(/^• (.*)/gm, '<div style="display:flex;gap:10px;margin:5px 0;align-items:flex-start"><span style="color:#7c3aed;flex-shrink:0;margin-top:2px">•</span><span>$1</span></div>')
    .replace(/\n/g, '<br/>');
}

function MessageBubble({ msg }) {
  const isUser = msg.role === 'user';

  if (msg.role === 'system') {
    return (
      <div style={{
        textAlign: 'center', padding: '4px 12px',
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 9, color: '#374151', letterSpacing: '.1em',
      }}>
        {msg.content}
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: isUser ? 'row-reverse' : 'row',
      gap: 10, marginBottom: 16,
      animation: 'msgIn .3s cubic-bezier(.16,1,.3,1)',
    }}>
      {!isUser && (
        <div style={{
          width: 30, height: 30, borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(0,245,255,0.15), rgba(124,58,237,0.15))',
          border: '1px solid rgba(0,245,255,0.25)',
          display: 'flex', alignItems: 'center',
          justifyContent: 'center', flexShrink: 0, marginTop: 2,
          boxShadow: '0 0 12px rgba(0,245,255,0.1)',
        }}>
          <FiShield size={13} color="#00f5ff" />
        </div>
      )}
      <div style={{
        maxWidth: '82%',
        background: isUser
          ? 'linear-gradient(135deg, rgba(0,245,255,0.12), rgba(124,58,237,0.08))'
          : 'rgba(255,255,255,0.03)',
        border: isUser
          ? '1px solid rgba(0,245,255,0.2)'
          : '1px solid rgba(255,255,255,0.06)',
        borderRadius: isUser ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
        padding: '11px 15px',
        boxShadow: isUser
          ? '0 4px 20px rgba(0,245,255,0.06)'
          : '0 4px 20px rgba(0,0,0,0.2)',
      }}>
        {msg.typing ? (
          <TypingDots />
        ) : (
          <div
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 12.5,
              color: isUser ? '#e0f7ff' : '#cbd5e1',
              lineHeight: 1.7,
            }}
            dangerouslySetInnerHTML={{ __html: formatMarkdown(msg.content) }}
          />
        )}
        {!msg.typing && (
          <div style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 8, color: '#374151',
            marginTop: 6,
            textAlign: isUser ? 'right' : 'left',
            letterSpacing: '.06em',
          }}>
            {msg.time}
          </div>
        )}
      </div>
    </div>
  );
}

function QuickActionsMenu({ onSelect, onClose }) {
  return (
    <div style={{
      position: 'absolute',
      bottom: '100%',
      left: 0, right: 0,
      marginBottom: 8,
      background: 'rgba(4,4,16,0.98)',
      border: '1px solid rgba(0,245,255,0.15)',
      borderRadius: 14,
      overflow: 'hidden',
      boxShadow: '0 -20px 60px rgba(0,0,0,0.6), 0 0 30px rgba(0,245,255,0.05)',
      animation: 'menuIn .2s cubic-bezier(.16,1,.3,1)',
      zIndex: 10,
    }}>
      <div style={{
        padding: '10px 14px 8px',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 9, color: '#00f5ff',
          letterSpacing: '.12em', display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <FiZap size={10} /> QUICK ANALYSIS
        </div>
        <button onClick={onClose} style={{
          background: 'none', border: 'none', color: '#4b5563',
          cursor: 'pointer', padding: 2,
        }}>
          <FiX size={12} />
        </button>
      </div>
      <div style={{ maxHeight: 260, overflowY: 'auto', padding: '6px 8px 8px' }} className="chat-scroll">
        {QUICK_ACTIONS.map((action, i) => (
          <button
            key={i}
            onClick={() => { onSelect(action.question); onClose(); }}
            className="quick-action-btn"
            style={{
              width: '100%',
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 10px',
              background: 'transparent',
              border: '1px solid transparent',
              borderRadius: 9,
              cursor: 'pointer',
              transition: 'all .15s',
              marginBottom: 3,
              textAlign: 'left',
            }}
          >
            <span style={{ fontSize: 15, flexShrink: 0 }}>{action.icon}</span>
            <div>
              <div style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 10, color: '#e2e8f0',
                fontWeight: 600, letterSpacing: '.04em',
              }}>
                {action.label}
              </div>
              <div style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 10, color: '#4b5563',
                marginTop: 2, lineHeight: 1.4,
              }}>
                {action.question.length > 52 ? action.question.slice(0, 52) + '...' : action.question}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

const AnomalyzeChat = () => {
  const { token, user } = useContext(AuthContext);
  const isAuthenticated = !!token;

  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(0);
  const [showSuggested, setShowSuggested] = useState(true);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: isAuthenticated
        ? `Hi **${user?.username || 'Analyst'}**! I'm **ARIA**, your AI security assistant.\n\nI have live access to your system data. Ask me anything about threats, alerts, or use the **⚡ Quick Analysis** menu for instant insights.`
        : `Hi! I'm **ARIA**, your AI security assistant.\n\nI can help you understand cybersecurity concepts, attack types, and threat detection. What would you like to learn?`,
      time: new Date().toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' }),
    }
  ]);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const quickActionsRef = useRef(null);

  useEffect(() => {
    if (open) {
      setUnread(0);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [open]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const handler = (e) => {
      if (quickActionsRef.current && !quickActionsRef.current.contains(e.target)) {
        setShowQuickActions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const fetchLiveStats = async () => {
    try {
      const [statsRes, alertsRes] = await Promise.all([
        api.get('/alerts/stats'),
        api.get('/alerts?limit=5'),
      ]);
      const stats = statsRes.data;
      const alerts = alertsRes.data?.alerts || alertsRes.data || [];
      return `
LIVE SYSTEM DATA (as of ${new Date().toLocaleTimeString()}):
- Alerts by severity: HIGH=${stats.by_severity?.HIGH || 0}, MEDIUM=${stats.by_severity?.MEDIUM || 0}, LOW=${stats.by_severity?.LOW || 0}, CRITICAL=${stats.by_severity?.CRITICAL || 0}
- Alerts by status: NEW=${stats.by_status?.NEW || 0}, RESOLVED=${stats.by_status?.RESOLVED || 0}
- Logged in user: ${user?.username || 'unknown'} (${user?.role || 'unknown'})
- Recent alerts: ${alerts.slice(0, 5).map(a => `${a.rule_name} from ${a.source_ip || 'unknown'} (${a.severity}, ${a.status})`).join(' | ')}
      `.trim();
    } catch {
      return 'Live system data unavailable — backend may not be running.';
    }
  };

  const sendMessage = async (text) => {
    const userText = text || input.trim();
    if (!userText || loading) return;

    setInput('');
    setShowSuggested(false);
    setShowQuickActions(false);
    setLoading(true);

    const time = new Date().toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' });
    const userMsg = { role: 'user', content: userText, time };
    const typingMsg = { role: 'assistant', typing: true, content: '', time: '' };

    setMessages(prev => [...prev, userMsg, typingMsg]);

    try {
      const history = messages
        .filter(m => !m.typing && m.role !== 'system')
        .map(m => ({ role: m.role, content: m.content }));

      let res;

      if (isAuthenticated) {
        let liveContext = '';
        const dataKeywords = [
          'how many', 'total', 'alert', 'threat', 'high', 'today',
          'status', 'resolved', 'current', 'live', 'now', 'count',
          'stats', 'data', 'blocked', 'ip', 'attack', 'severity',
          'open', 'new', 'critical', 'medium', 'low', 'show', 'which',
          'pattern', 'mitre', 'auto', 'map', 'summary',
        ];
        const needsLiveData = dataKeywords.some(kw => userText.toLowerCase().includes(kw));
        if (needsLiveData) liveContext = await fetchLiveStats();

        const userContent = liveContext
          ? `${userText}\n\n[LIVE CONTEXT — authenticated user]\n${liveContext}`
          : userText;

        res = await api.post('/chat', {
          messages: [...history, { role: 'user', content: userContent }],
        });
      } else {
        res = await api.post('/chat/public', {
          messages: [...history, { role: 'user', content: userText }],
        });
      }

      const reply = res.data?.reply || 'Sorry, I could not get a response. Please try again.';
      setMessages(prev => [
        ...prev.filter(m => !m.typing),
        { role: 'assistant', content: reply, time },
      ]);
      if (!open) setUnread(u => u + 1);

    } catch (err) {
      console.error('ARIA error:', err);
      const detail = err.response?.data?.detail || err.message || 'Make sure the backend is running and try again.';
      setMessages(prev => [
        ...prev.filter(m => !m.typing),
        { role: 'assistant', content: `Connection error: ${detail}`, time },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=JetBrains+Mono:wght@400;600&family=Inter:wght@400;500;600&display=swap');

        @keyframes msgIn {
          from { opacity: 0; transform: translateY(10px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes typingDot {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        @keyframes chatOpen {
          from { opacity: 0; transform: translateY(20px) scale(0.94); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes badgePulse {
          0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255,23,68,0.4); }
          50% { transform: scale(1.15); box-shadow: 0 0 0 4px rgba(255,23,68,0); }
        }
        @keyframes floatBtn {
          0%, 100% { transform: translateY(0); box-shadow: 0 8px 30px rgba(0,245,255,0.2); }
          50% { transform: translateY(-3px); box-shadow: 0 12px 40px rgba(0,245,255,0.35); }
        }
        @keyframes menuIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-ring {
          0% { box-shadow: 0 0 0 0 rgba(0,245,255,0.3); }
          70% { box-shadow: 0 0 0 8px rgba(0,245,255,0); }
          100% { box-shadow: 0 0 0 0 rgba(0,245,255,0); }
        }

        .chat-input { outline: none; }
        .chat-input::placeholder { color: #374151; font-family: 'Inter', sans-serif; }
        .chat-scroll::-webkit-scrollbar { width: 3px; }
        .chat-scroll::-webkit-scrollbar-track { background: transparent; }
        .chat-scroll::-webkit-scrollbar-thumb { background: rgba(0,245,255,0.15); border-radius: 2px; }
        .suggest-chip:hover {
          background: rgba(0,245,255,0.08) !important;
          border-color: rgba(0,245,255,0.3) !important;
          color: #00f5ff !important;
          transform: translateY(-1px);
        }
        .quick-action-btn:hover {
          background: rgba(0,245,255,0.05) !important;
          border-color: rgba(0,245,255,0.15) !important;
        }
        .send-btn:hover:not(:disabled) {
          background: rgba(0,245,255,0.25) !important;
          transform: scale(1.05);
        }
        .aria-fab:hover { transform: scale(1.08); }
      `}</style>

      {/* Floating Button */}
      <div
        className="aria-fab"
        onClick={() => { setOpen(o => !o); setUnread(0); }}
        style={{
          position: 'fixed', bottom: 28, right: 28,
          width: 58, height: 58, borderRadius: '50%',
          background: open
            ? 'rgba(255,23,68,0.12)'
            : 'linear-gradient(135deg, rgba(0,245,255,0.15), rgba(124,58,237,0.15))',
          border: open ? '1px solid rgba(255,23,68,0.3)' : '1px solid rgba(0,245,255,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', zIndex: 1000, transition: 'all .25s cubic-bezier(.16,1,.3,1)',
          animation: open ? 'none' : 'floatBtn 3s ease-in-out infinite',
        }}
      >
        {open
          ? <FiX size={20} color="#ff1744" style={{ filter: 'drop-shadow(0 0 6px #ff1744)' }} />
          : <FiShield size={21} color="#00f5ff" style={{ filter: 'drop-shadow(0 0 8px #00f5ff)' }} />
        }

        {unread > 0 && !open && (
          <div style={{
            position: 'absolute', top: -4, right: -4,
            width: 20, height: 20, background: '#ff1744',
            borderRadius: '50%', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 9, color: '#fff', fontWeight: 700,
            animation: 'badgePulse 1.5s infinite',
          }}>
            {unread}
          </div>
        )}

        {isAuthenticated && !open && (
          <div style={{
            position: 'absolute', top: -8, left: -8,
            background: 'linear-gradient(135deg, rgba(57,255,20,0.2), rgba(0,245,255,0.1))',
            border: '1px solid rgba(57,255,20,0.35)',
            borderRadius: 5, padding: '1px 5px',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 7, color: '#39ff14', letterSpacing: '.06em', fontWeight: 600,
          }}>
            {user?.role || 'AUTH'}
          </div>
        )}
      </div>

      {/* Chat Window */}
      {open && (
        <div style={{
          position: 'fixed', bottom: 100, right: 28,
          width: 400,
          height: minimized ? 60 : 560,
          background: 'linear-gradient(180deg, rgba(2,2,14,0.98) 0%, rgba(4,4,18,0.99) 100%)',
          border: '1px solid rgba(0,245,255,0.1)',
          borderRadius: 20, zIndex: 999,
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden', backdropFilter: 'blur(24px)',
          boxShadow: '0 0 0 1px rgba(255,255,255,0.03), 0 30px 80px rgba(0,0,0,0.8), 0 0 40px rgba(0,245,255,0.04)',
          animation: 'chatOpen .3s cubic-bezier(.16,1,.3,1)',
          transition: 'height .35s cubic-bezier(.16,1,.3,1)',
        }}>

          {/* Scanline overlay */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,245,255,0.008) 2px, rgba(0,245,255,0.008) 4px)',
            pointerEvents: 'none', zIndex: 0, borderRadius: 20,
          }} />

          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '14px 16px',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
            background: 'linear-gradient(90deg, rgba(0,245,255,0.04), rgba(124,58,237,0.04))',
            flexShrink: 0, position: 'relative', zIndex: 1,
          }}>
            <div style={{
              width: 38, height: 38, borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(0,245,255,0.15), rgba(124,58,237,0.2))',
              border: '1px solid rgba(0,245,255,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 0 20px rgba(0,245,255,0.15)',
              animation: 'pulse-ring 3s infinite',
            }}>
              <FiShield size={16} color="#00f5ff" style={{ filter: 'drop-shadow(0 0 6px #00f5ff)' }} />
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  fontFamily: 'Orbitron, monospace',
                  fontSize: 13, fontWeight: 900,
                  color: '#00f5ff', letterSpacing: '.12em',
                  filter: 'drop-shadow(0 0 8px rgba(0,245,255,0.4))',
                }}>
                  ARIA
                </div>
                <div style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 8, color: '#374151', letterSpacing: '.08em',
                }}>
                  v2.0
                </div>
              </div>
              <div style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 9, color: '#4b5563', letterSpacing: '.07em',
                display: 'flex', alignItems: 'center', gap: 6, marginTop: 2,
              }}>
                <div style={{
                  width: 5, height: 5, borderRadius: '50%',
                  background: loading ? '#f59e0b' : '#10b981',
                  boxShadow: loading ? '0 0 6px #f59e0b' : '0 0 6px #10b981',
                  flexShrink: 0,
                }} />
                {loading ? 'ANALYZING...' : isAuthenticated ? `${user?.role} · FULL ACCESS` : 'PUBLIC MODE'}
              </div>
            </div>

            <div style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 8, letterSpacing: '.1em',
              padding: '3px 9px', borderRadius: 20,
              background: isAuthenticated
                ? 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(0,245,255,0.05))'
                : 'rgba(245,158,11,0.08)',
              border: isAuthenticated
                ? '1px solid rgba(16,185,129,0.25)'
                : '1px solid rgba(245,158,11,0.2)',
              color: isAuthenticated ? '#10b981' : '#f59e0b',
              flexShrink: 0,
            }}>
              {isAuthenticated ? '⬤ LIVE' : '◯ PUBLIC'}
            </div>

            <button
              onClick={() => setMinimized(m => !m)}
              style={{
                background: 'transparent', border: 'none',
                color: '#374151', cursor: 'pointer',
                padding: 4, display: 'flex', alignItems: 'center',
                transition: 'color .2s', flexShrink: 0,
              }}
              onMouseEnter={e => e.currentTarget.style.color = '#9ca3af'}
              onMouseLeave={e => e.currentTarget.style.color = '#374151'}
            >
              <FiMinimize2 size={13} />
            </button>
          </div>

          {!minimized && (
            <>
              {/* Messages */}
              <div
                className="chat-scroll"
                style={{
                  flex: 1, overflowY: 'auto',
                  padding: '16px 14px 8px',
                  minHeight: 0, position: 'relative', zIndex: 1,
                }}
              >
                {messages.map((msg, i) => (
                  <MessageBubble key={i} msg={msg} />
                ))}

                {showSuggested && messages.length <= 1 && !isAuthenticated && (
                  <div style={{ marginBottom: 12 }}>
                    <div style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: 9, color: '#374151',
                      letterSpacing: '.1em', marginBottom: 10,
                      display: 'flex', alignItems: 'center', gap: 6,
                    }}>
                      <FiSearch size={9} /> LEARN ABOUT
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {SUGGESTED_PUBLIC.map((s, i) => (
                        <button
                          key={i}
                          className="suggest-chip"
                          onClick={() => sendMessage(s)}
                          style={{
                            background: 'rgba(255,255,255,0.02)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: 100, padding: '5px 11px',
                            fontFamily: 'JetBrains Mono, monospace',
                            fontSize: 9, color: '#6b7280',
                            cursor: 'pointer', transition: 'all .2s',
                            letterSpacing: '.04em',
                          }}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input area */}
              <div style={{
                padding: '10px 12px 12px',
                borderTop: '1px solid rgba(255,255,255,0.05)',
                flexShrink: 0, position: 'relative', zIndex: 2,
              }}>

                {/* Quick Actions Menu */}
                {isAuthenticated && showQuickActions && (
                  <div ref={quickActionsRef}>
                    <QuickActionsMenu
                      onSelect={sendMessage}
                      onClose={() => setShowQuickActions(false)}
                    />
                  </div>
                )}

                {/* Quick Actions trigger — authenticated only */}
                {isAuthenticated && (
                  <button
                    onClick={() => setShowQuickActions(q => !q)}
                    style={{
                      width: '100%',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '7px 12px',
                      background: showQuickActions ? 'rgba(0,245,255,0.08)' : 'rgba(255,255,255,0.02)',
                      border: showQuickActions ? '1px solid rgba(0,245,255,0.2)' : '1px solid rgba(255,255,255,0.06)',
                      borderRadius: 10, cursor: 'pointer', transition: 'all .2s', marginBottom: 8,
                    }}
                    onMouseEnter={e => {
                      if (!showQuickActions) {
                        e.currentTarget.style.background = 'rgba(0,245,255,0.05)';
                        e.currentTarget.style.borderColor = 'rgba(0,245,255,0.15)';
                      }
                    }}
                    onMouseLeave={e => {
                      if (!showQuickActions) {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                      }
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <FiZap size={11} color={showQuickActions ? '#00f5ff' : '#4b5563'} />
                      <span style={{
                        fontFamily: 'JetBrains Mono, monospace',
                        fontSize: 9, color: showQuickActions ? '#00f5ff' : '#4b5563',
                        letterSpacing: '.08em',
                      }}>
                        QUICK ANALYSIS
                      </span>
                    </div>
                    <FiChevronDown
                      size={11}
                      color={showQuickActions ? '#00f5ff' : '#374151'}
                      style={{ transform: showQuickActions ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}
                    />
                  </button>
                )}

                {/* Text input */}
                <div style={{
                  display: 'flex', gap: 8,
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(0,245,255,0.08)',
                  borderRadius: 12, padding: '9px 12px',
                }}>
                  <textarea
                    ref={inputRef}
                    className="chat-input"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKey}
                    placeholder={isAuthenticated ? "Ask about alerts, threats, IPs..." : "Ask about cybersecurity..."}
                    disabled={loading}
                    rows={1}
                    style={{
                      flex: 1, background: 'transparent',
                      border: 'none', color: '#e2e8f0',
                      fontFamily: 'Inter, sans-serif',
                      fontSize: 12.5, resize: 'none',
                      lineHeight: 1.5, maxHeight: 80, overflowY: 'auto',
                    }}
                  />
                  <button
                    className="send-btn"
                    onClick={() => sendMessage()}
                    disabled={!input.trim() || loading}
                    style={{
                      background: input.trim() && !loading
                        ? 'linear-gradient(135deg, rgba(0,245,255,0.2), rgba(124,58,237,0.15))'
                        : 'transparent',
                      border: '1px solid',
                      borderColor: input.trim() && !loading ? 'rgba(0,245,255,0.3)' : 'rgba(255,255,255,0.05)',
                      borderRadius: 9, width: 34, height: 34,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
                      flexShrink: 0, transition: 'all .2s', alignSelf: 'flex-end',
                    }}
                  >
                    <FiSend
                      size={13}
                      color={input.trim() && !loading ? '#00f5ff' : '#374151'}
                      style={{ filter: input.trim() && !loading ? 'drop-shadow(0 0 4px #00f5ff)' : 'none' }}
                    />
                  </button>
                </div>

                {/* Footer */}
                <div style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 8, color: '#1f2937',
                  textAlign: 'center', marginTop: 7, letterSpacing: '.08em',
                }}>
                  {isAuthenticated
                    ? `${user?.username} · ${user?.role} · Powered by Groq`
                    : 'Public mode · Log in for live data · Powered by Groq'
                  }
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default AnomalyzeChat;
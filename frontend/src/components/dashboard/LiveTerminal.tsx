import React, { useEffect, useRef, useState } from 'react';
import GlassCard from '../ui/GlassCard';
import { Play, Pause } from 'lucide-react';

const LiveTerminal: React.FC = () => {
  const [logs, setLogs] = useState<{ id: number, text: string, type: string }[]>([]);
  const [autoScroll, setAutoScroll] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let id = 0;
    const interval = setInterval(() => {
      const types = ['SYSTEM', 'NGINX', 'AUTH', 'ML', 'RULE'];
      const type = types[Math.floor(Math.random() * types.length)];
      const isErr = Math.random() > 0.8;
      const text = `[${new Date().toISOString()}] [${type}] ${isErr ? 'Connection failed from' : 'Accepted request from'} 192.168.1.${Math.floor(Math.random()*255)}`;
      setLogs(prev => [...prev.slice(-100), { id: id++, text, type: isErr ? 'error' : 'info' }]);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (autoScroll && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  return (
    <GlassCard style={{ height: '100%', padding: '0', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--color-glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 className="orbitron" style={{ fontSize: '0.9rem', margin: 0, color: 'var(--color-cyan)' }}>LIVE TERMINAL</h3>
        <button onClick={() => setAutoScroll(!autoScroll)} style={{ background: 'transparent', border: 'none', color: autoScroll ? 'var(--color-green)' : 'rgba(255,255,255,0.5)', cursor: 'pointer' }}>
          {autoScroll ? <Pause size={14} /> : <Play size={14} />}
        </button>
      </div>
      <div ref={containerRef} className="mono" style={{ flex: 1, overflowY: 'auto', padding: '1rem', fontSize: '0.75rem', background: '#050508' }}>
        {logs.map((log) => (
          <div key={log.id} style={{ 
            color: log.type === 'error' ? 'var(--color-red)' : 'var(--color-green)',
            marginBottom: '0.25rem' 
          }}>
            {log.text}
          </div>
        ))}
      </div>
    </GlassCard>
  );
};

export default LiveTerminal;

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import GlassCard from '../ui/GlassCard';

const data = [
  { feature: 'request_size', score: 85 },
  { feature: 'auth_failures', score: 65 },
  { feature: 'path_depth', score: 45 },
  { feature: 'suspicious_chars', score: 90 },
  { feature: 'request_rate', score: 75 },
];

const FeatureImportanceBar: React.FC = () => {
  return (
    <GlassCard style={{ height: '100%' }}>
      <h3 className="orbitron" style={{ fontSize: '1rem', marginBottom: '1rem', color: 'rgba(255,255,255,0.7)' }}>FEATURE IMPORTANCE</h3>
      <div style={{ height: 'calc(100% - 2rem)' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 0, left: 40, bottom: 0 }}>
            <XAxis type="number" hide />
            <YAxis dataKey="feature" type="category" stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 10, fontFamily: 'JetBrains Mono' }} />
            <Tooltip 
              cursor={{ fill: 'rgba(255,255,255,0.05)' }}
              contentStyle={{ background: 'rgba(10,10,15,0.9)', border: '1px solid var(--color-cyan)', borderRadius: '4px', fontFamily: 'JetBrains Mono' }}
            />
            <Bar dataKey="score" fill="var(--color-cyan)" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
};

export default FeatureImportanceBar;

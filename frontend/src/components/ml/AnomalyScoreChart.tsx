import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts';
import GlassCard from '../ui/GlassCard';

interface AnomalyScoreChartProps {
  data: any[];
}

const AnomalyScoreChart: React.FC<AnomalyScoreChartProps> = ({ data }) => {
  return (
    <GlassCard style={{ height: '100%' }}>
      <h3 className="orbitron" style={{ fontSize: '1rem', marginBottom: '1rem', color: 'rgba(255,255,255,0.7)' }}>ANOMALY SCORE (LAST 100 REQUESTS)</h3>
      <div style={{ height: 'calc(100% - 2rem)' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <XAxis dataKey="id" stroke="rgba(255,255,255,0.2)" tick={false} />
            <YAxis domain={[-1, 1]} stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10, fontFamily: 'JetBrains Mono' }} />
            <Tooltip 
              contentStyle={{ background: 'rgba(10,10,15,0.9)', border: '1px solid var(--color-cyan)', borderRadius: '4px', fontFamily: 'JetBrains Mono' }}
              itemStyle={{ color: 'white' }}
            />
            <ReferenceLine y={-0.2} stroke="#ff1744" strokeDasharray="3 3" label={{ position: 'top', value: 'Threshold', fill: '#ff1744', fontSize: 10 }} />
            <Line type="monotone" dataKey="score" stroke="var(--color-cyan)" strokeWidth={2} dot={{ r: 2, fill: 'var(--color-cyan)' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
};

export default AnomalyScoreChart;

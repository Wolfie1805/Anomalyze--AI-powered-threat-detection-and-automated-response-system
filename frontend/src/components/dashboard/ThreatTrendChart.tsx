import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import GlassCard from '../ui/GlassCard';

interface ThreatTrendChartProps {
  data: any[];
}

const ThreatTrendChart: React.FC<ThreatTrendChartProps> = ({ data }) => {
  return (
    <GlassCard style={{ height: '100%' }}>
      <h3 className="orbitron" style={{ fontSize: '1rem', marginBottom: '1rem', color: 'rgba(255,255,255,0.7)' }}>THREAT TREND (24H)</h3>
      <div style={{ height: 'calc(100% - 2rem)' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorHigh" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ff1744" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#ff1744" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorMedium" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ffab40" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#ffab40" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="time" stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10, fontFamily: 'JetBrains Mono' }} />
            <YAxis stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10, fontFamily: 'JetBrains Mono' }} />
            <Tooltip 
              contentStyle={{ background: 'rgba(10,10,15,0.9)', border: '1px solid var(--color-cyan)', borderRadius: '4px', fontFamily: 'JetBrains Mono' }}
              itemStyle={{ color: 'white' }}
            />
            <Area type="monotone" dataKey="high" stroke="#ff1744" strokeWidth={2} fillOpacity={1} fill="url(#colorHigh)" />
            <Area type="monotone" dataKey="medium" stroke="#ffab40" strokeWidth={2} fillOpacity={1} fill="url(#colorMedium)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
};

export default ThreatTrendChart;

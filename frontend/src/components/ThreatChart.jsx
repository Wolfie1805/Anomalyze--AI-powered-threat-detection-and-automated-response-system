import React, { useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, BarChart, Bar, Cell
} from 'recharts';

const SEVERITY_COLORS = {
  HIGH: '#ff1744',
  CRITICAL: '#ff1744',
  MEDIUM: '#ffab40',
  LOW: '#39ff14',
  ML_ANOMALY_DETECTED: '#7c4dff',
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const d = payload[0].payload;
    return (
      <div style={{
        background: 'rgba(4,4,10,0.97)',
        border: '1px solid rgba(0,245,255,0.25)',
        borderRadius: 8,
        padding: '10px 14px',
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 11,
        boxShadow: '0 0 20px rgba(0,0,0,0.8)',
      }}>
        <p style={{ color: '#00f5ff', marginBottom: 4, fontSize: 10, letterSpacing: '0.08em' }}>
          {d.fullName}
        </p>
        <p style={{ color: d.color, fontWeight: 700, fontSize: 13 }}>
          {d.count} {d.count === 1 ? 'alert' : 'alerts'}
        </p>
      </div>
    );
  }
  return null;
};

const ThreatChart = ({ alerts }) => {
  const chartData = useMemo(() => {
    const counts = {};
    const severityMap = {};
    (Array.isArray(alerts) ? alerts : []).forEach(a => {
      const key = a.rule_name || a.attack_type || 'Unknown';
      counts[key] = (counts[key] || 0) + 1;
      if (!severityMap[key]) severityMap[key] = a.severity || 'LOW';
    });
    return Object.keys(counts).map(key => ({
      name: key.length > 14 ? key.substring(0, 14) + '…' : key,
      fullName: key,
      count: counts[key],
      color: SEVERITY_COLORS[severityMap[key]] || SEVERITY_COLORS[key] || '#00f5ff',
    })).sort((a, b) => b.count - a.count).slice(0, 6);
  }, [alerts]);

  const isEmpty = chartData.length === 0;

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      minHeight: 0,       // ← critical: prevents flex children from overflowing
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
        flexShrink: 0,
      }}>
        <h3 style={{
          fontFamily: 'Orbitron, monospace',
          fontSize: '0.85rem',
          color: '#00f5ff',
          letterSpacing: '0.08em',
          textShadow: '0 0 10px rgba(0,245,255,0.4)',
          margin: 0,
        }}>
          THREAT LANDSCAPE
        </h3>
        <div style={{
          display: 'flex', gap: 8, alignItems: 'center',
        }}>
          {[['HIGH', '#ff1744'], ['MED', '#ffab40'], ['LOW', '#39ff14']].map(([label, color]) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 6, height: 6, borderRadius: 2, background: color, boxShadow: `0 0 4px ${color}` }} />
              <span style={{ fontSize: 9, color: '#64748b', fontFamily: 'JetBrains Mono', letterSpacing: '0.06em' }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Chart area */}
      <div style={{
        flex: 1,
        minHeight: 0,       // ← critical
        width: '100%',
        overflow: 'hidden', // ← prevents width blowout
      }}>
        {isEmpty ? (
          <div style={{
            height: '100%', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            color: '#64748b', fontFamily: 'JetBrains Mono', fontSize: 12, gap: 8,
          }}>
            <div style={{ fontSize: 24, opacity: 0.3 }}>📊</div>
            <span>Waiting for threat data...</span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 4, right: 4, left: -24, bottom: 40 }}
              barCategoryGap="28%"
            >
              <defs>
                {chartData.map((d, i) => (
                  <linearGradient key={i} id={`grad${i}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={d.color} stopOpacity={0.9} />
                    <stop offset="100%" stopColor={d.color} stopOpacity={0.3} />
                  </linearGradient>
                ))}
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.04)"
                vertical={false}
              />

              <XAxis
                dataKey="name"
                stroke="rgba(255,255,255,0.06)"
                tick={{
                  fill: '#4a5568',
                  fontSize: 9,
                  fontFamily: 'JetBrains Mono',
                }}
                angle={-30}
                textAnchor="end"
                interval={0}
                tickLine={false}
                height={44}
              />

              <YAxis
                stroke="rgba(255,255,255,0.06)"
                tick={{
                  fill: '#4a5568',
                  fontSize: 9,
                  fontFamily: 'JetBrains Mono',
                }}
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
              />

              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: 'rgba(255,255,255,0.03)' }}
              />

              <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={48}>
                {chartData.map((d, i) => (
                  <Cell
                    key={i}
                    fill={`url(#grad${i})`}
                    style={{ filter: `drop-shadow(0 0 6px ${d.color}60)` }}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Bottom stat row */}
      {!isEmpty && (
        <div style={{
          display: 'flex',
          gap: 12,
          marginTop: 10,
          flexShrink: 0,
          paddingTop: 10,
          borderTop: '1px solid rgba(255,255,255,0.04)',
        }}>
          {[
            { label: 'Total Types', value: chartData.length, color: '#00f5ff' },
            { label: 'Most Common', value: chartData[0]?.name || '-', color: '#ff1744' },
            { label: 'Peak Count', value: chartData[0]?.count || 0, color: '#ffab40' },
          ].map((s, i) => (
            <div key={i} style={{ flex: 1 }}>
              <div style={{ fontSize: 9, color: '#4a5568', fontFamily: 'JetBrains Mono', letterSpacing: '0.08em', marginBottom: 2 }}>
                {s.label}
              </div>
              <div style={{ fontSize: 12, color: s.color, fontFamily: 'JetBrains Mono', fontWeight: 700 }}>
                {s.value}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ThreatChart;
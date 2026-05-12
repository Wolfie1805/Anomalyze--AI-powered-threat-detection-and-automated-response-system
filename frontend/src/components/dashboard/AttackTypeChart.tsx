import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import GlassCard from '../ui/GlassCard';

ChartJS.register(ArcElement, Tooltip, Legend);

interface AttackTypeChartProps {
  data: Record<string, number>;
}

const AttackTypeChart: React.FC<AttackTypeChartProps> = ({ data }) => {
  const labels = Object.keys(data);
  const values = Object.values(data);
  const total = values.reduce((a, b) => a + b, 0);

  const chartData = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: ['#ff1744', '#ffab40', '#39ff14', '#00f5ff', '#b388ff'],
        borderColor: '#0a0a0f',
        borderWidth: 2,
        hoverOffset: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: { position: 'bottom' as const, labels: { color: 'rgba(255,255,255,0.7)', font: { family: 'JetBrains Mono', size: 10 } } },
      tooltip: { backgroundColor: 'rgba(0,0,0,0.8)', titleFont: { family: 'Orbitron' }, bodyFont: { family: 'JetBrains Mono' } }
    },
  };

  return (
    <GlassCard style={{ height: '100%', position: 'relative' }}>
      <h3 className="orbitron" style={{ fontSize: '1rem', marginBottom: '1rem', color: 'rgba(255,255,255,0.7)' }}>ATTACK VECTORS</h3>
      <div style={{ position: 'relative', height: 'calc(100% - 2rem)' }}>
        <Doughnut data={chartData} options={options} />
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -60%)', textAlign: 'center' }}>
          <div className="orbitron" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{total}</div>
          <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>Total</div>
        </div>
      </div>
    </GlassCard>
  );
};

export default AttackTypeChart;

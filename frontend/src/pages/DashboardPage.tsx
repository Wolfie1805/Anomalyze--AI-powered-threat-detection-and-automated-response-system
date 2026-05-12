import React from 'react';
import { motion } from 'framer-motion';
import { Activity, ShieldAlert, Ban, Brain } from 'lucide-react';
import { useDashboardStats } from '../hooks/useDashboardStats';
import { useWebSocket } from '../hooks/useWebSocket';
import StatCard from '../components/dashboard/StatCard';
import ThreatTrendChart from '../components/dashboard/ThreatTrendChart';
import ThreatGauge from '../components/dashboard/ThreatGauge';
import AlertTimeline from '../components/dashboard/AlertTimeline';
import AttackTypeChart from '../components/dashboard/AttackTypeChart';
import LiveTerminal from '../components/dashboard/LiveTerminal';

const mockTrendData = Array.from({ length: 24 }).map((_, i) => ({
  time: `${i}:00`, high: Math.floor(Math.random() * 50), medium: Math.floor(Math.random() * 100) + 20,
}));
const mockAttackTypes = { 'SQL Injection': 345, 'XSS': 120, 'Brute Force': 890, 'DDoS': 50, 'Path Traversal': 45 };

const DashboardPage: React.FC = () => {
  const { stats, threatLevel, isLoading } = useDashboardStats();
  useWebSocket();

  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="dashboard-grid">
      <motion.div variants={itemVariants} style={{ gridColumn: 'span 3' }}>
        <StatCard title="Total Alerts Today" value={stats?.total_alerts_24h || 1205} icon={<ShieldAlert size={24} />} color="var(--color-amber)" trend={15} />
      </motion.div>
      <motion.div variants={itemVariants} style={{ gridColumn: 'span 3' }}>
        <StatCard title="Active Threats" value={stats?.active_threats || 45} icon={<Activity size={24} />} color="var(--color-red)" trend={-5} />
      </motion.div>
      <motion.div variants={itemVariants} style={{ gridColumn: 'span 3' }}>
        <StatCard title="IPs Blocked" value={128} icon={<Ban size={24} />} color="var(--color-cyan)" trend={2} />
      </motion.div>
      <motion.div variants={itemVariants} style={{ gridColumn: 'span 3' }}>
        <StatCard title="ML Anomalies" value={340} icon={<Brain size={24} />} color="var(--color-purple)" trend={45} />
      </motion.div>

      <motion.div variants={itemVariants} style={{ gridColumn: 'span 8', height: '350px' }}>
        <ThreatTrendChart data={mockTrendData} />
      </motion.div>
      <motion.div variants={itemVariants} style={{ gridColumn: 'span 4', height: '350px' }}>
        <ThreatGauge value={threatLevel || 42} />
      </motion.div>

      <motion.div variants={itemVariants} style={{ gridColumn: 'span 4', height: '400px' }}>
        <AlertTimeline />
      </motion.div>
      <motion.div variants={itemVariants} style={{ gridColumn: 'span 4', height: '400px' }}>
        <AttackTypeChart data={mockAttackTypes} />
      </motion.div>
      <motion.div variants={itemVariants} style={{ gridColumn: 'span 4', height: '400px' }}>
        <LiveTerminal />
      </motion.div>
    </motion.div>
  );
};

export default DashboardPage;

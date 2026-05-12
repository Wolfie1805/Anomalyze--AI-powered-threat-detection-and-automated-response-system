import React from 'react';
import { motion } from 'framer-motion';
import { Brain, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import NeonButton from '../components/ui/NeonButton';
import AnomalyScoreChart from '../components/ml/AnomalyScoreChart';
import FeatureImportanceBar from '../components/ml/FeatureImportanceBar';

const mockScores = Array.from({ length: 100 }).map((_, i) => ({
  id: i, score: Math.sin(i / 5) * 0.3 - 0.5 + Math.random() * 0.2 + (Math.random() > 0.95 ? 0.8 : 0)
}));

const MLInsightsPage: React.FC = () => {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="dashboard-grid" style={{ height: '100%' }}>
      
      <GlassCard style={{ gridColumn: 'span 12', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <div style={{ padding: '1rem', background: 'rgba(179, 136, 255, 0.1)', borderRadius: '50%', color: 'var(--color-purple)' }}>
            <Brain size={32} />
          </div>
          <div>
            <h2 className="orbitron" style={{ margin: 0, fontSize: '1.2rem', color: 'var(--color-purple)' }}>ISOLATION FOREST (Ensemble)</h2>
            <div style={{ display: 'flex', gap: '2rem', marginTop: '0.5rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)' }}>
              <span><strong style={{color:'white'}}>Status:</strong> Online</span>
              <span><strong style={{color:'white'}}>Last Trained:</strong> 2 hrs ago</span>
              <span><strong style={{color:'white'}}>Samples:</strong> 1,204,592</span>
              <span><strong style={{color:'white'}}>Contamination:</strong> 0.05</span>
            </div>
          </div>
        </div>
        <NeonButton variant="ghost" style={{ color: 'var(--color-purple)', borderColor: 'var(--color-purple)' }}>
          <RefreshCw size={16} /> Retrain Model
        </NeonButton>
      </GlassCard>

      <div style={{ gridColumn: 'span 12', height: '300px' }}>
        <AnomalyScoreChart data={mockScores} />
      </div>

      <div style={{ gridColumn: 'span 6', height: '350px' }}>
        <FeatureImportanceBar />
      </div>

      <GlassCard style={{ gridColumn: 'span 6', height: '350px', display: 'flex', flexDirection: 'column' }}>
        <h3 className="orbitron" style={{ fontSize: '1rem', marginBottom: '1rem', color: 'rgba(255,255,255,0.7)' }}>HUMAN FEEDBACK LOOP</h3>
        <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginBottom: '1rem' }}>Review borderline anomalies to improve future model accuracy.</p>
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {[1,2,3].map(i => (
            <div key={i} style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', borderLeft: '2px solid var(--color-purple)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span className="mono" style={{ fontSize: '0.8rem', color: 'var(--color-cyan)' }}>Req ID: 894{i}2A</span>
                <span className="mono" style={{ fontSize: '0.8rem', color: 'var(--color-red)' }}>Score: 0.12</span>
              </div>
              <div className="mono" style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)', marginBottom: '1rem', background: 'rgba(0,0,0,0.5)', padding: '0.5rem' }}>
                GET /admin/backup.sql?token=... HTTP/1.1
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <NeonButton variant="ghost" style={{ flex: 1, fontSize: '0.7rem', padding: '0.5rem', color: 'var(--color-green)' }}><CheckCircle size={12}/> Confirm Threat</NeonButton>
                <NeonButton variant="ghost" style={{ flex: 1, fontSize: '0.7rem', padding: '0.5rem', color: 'var(--color-red)' }}><XCircle size={12}/> False Positive</NeonButton>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </motion.div>
  );
};

export default MLInsightsPage;

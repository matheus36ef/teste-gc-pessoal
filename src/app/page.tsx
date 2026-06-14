'use client';

import { Server, Cpu, Database, Activity, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

type SystemMetrics = {
  cpu: string;
  ram: { used: string; total: string; rawPercentage: number };
  activeContainers: number;
};

type DockerService = {
  name: string;
  type: string;
  status: string;
  uptime: string;
};

export default function Dashboard() {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [services, setServices] = useState<DockerService[]>([]);
  const [loading, setLoading] = useState(true);
  const [dockerAvailable, setDockerAvailable] = useState(true);
  const [error, setError] = useState('');

  const fetchMetrics = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/system');
      if (!res.ok) throw new Error('Falha ao carregar dados do servidor');
      const data = await res.json();
      
      if (data.status === 'success') {
        setMetrics(data.metrics);
        setServices(data.services || []);
        setDockerAvailable(data.dockerAvailable);
      } else {
        throw new Error(data.message);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    // Atualiza a cada 10 segundos automaticamente
    const interval = setInterval(fetchMetrics, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <div className="flex-between mb-4">
        <div>
          <h1>Visão Geral da Máquina</h1>
          <p>Métricas de consumo em tempo real do seu servidor Ubuntu.</p>
        </div>
        <button className="btn btn-primary" onClick={fetchMetrics} disabled={loading}>
          <Activity size={16} />
          {loading ? 'Atualizando...' : 'Atualizar Métricas'}
        </button>
      </div>

      {error && (
        <div className="mb-4" style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger-color)', borderRadius: '8px', color: 'var(--danger-color)' }}>
          <AlertCircle size={20} style={{ display: 'inline', marginRight: '0.5rem' }} />
          {error}
        </div>
      )}

      {!dockerAvailable && !error && (
        <div className="mb-4" style={{ padding: '1rem', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid var(--warning-color)', borderRadius: '8px', color: 'var(--warning-color)' }}>
          <AlertCircle size={20} style={{ display: 'inline', marginRight: '0.5rem' }} />
          Não foi possível conectar ao Docker. As métricas de contêineres não estão disponíveis.
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div className="flex-between mb-4">
            <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-muted)' }}>Uso de CPU</h3>
            <Cpu size={24} style={{ color: 'var(--primary-color)' }} />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700 }}>{metrics ? metrics.cpu : '...'}</div>
          <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', marginTop: '1rem' }}>
            <div style={{ width: metrics ? metrics.cpu : '0%', height: '100%', background: 'var(--primary-color)', borderRadius: '3px', transition: 'width 0.5s' }} />
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div className="flex-between mb-4">
            <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-muted)' }}>Memória RAM</h3>
            <Database size={24} style={{ color: 'var(--accent-color)' }} />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700 }}>
            {metrics ? metrics.ram.used : '...'} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/ {metrics ? metrics.ram.total : '...'}</span>
          </div>
          <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', marginTop: '1rem' }}>
            <div style={{ width: metrics ? `${metrics.ram.rawPercentage}%` : '0%', height: '100%', background: 'var(--accent-color)', borderRadius: '3px', transition: 'width 0.5s' }} />
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div className="flex-between mb-4">
            <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-muted)' }}>Contêineres Ativos</h3>
            <Server size={24} style={{ color: 'var(--success-color)' }} />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700 }}>{metrics ? metrics.activeContainers : '...'}</div>
          <p style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>Rodando no Docker Host</p>
        </div>
      </div>

      <h2>Serviços Docker Recentes</h2>
      <div className="glass-panel" style={{ padding: '1rem', marginTop: '1rem', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '500px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
              <th style={{ padding: '1rem' }}>Nome do Contêiner</th>
              <th style={{ padding: '1rem' }}>Status</th>
              <th style={{ padding: '1rem' }}>Uptime</th>
            </tr>
          </thead>
          <tbody>
            {services.length === 0 ? (
              <tr>
                <td colSpan={3} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  Nenhum contêiner ativo encontrado.
                </td>
              </tr>
            ) : (
              services.map((svc, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '1rem', fontWeight: 500 }}>{svc.name}</td>
                  <td style={{ padding: '1rem' }}>
                    <span className={`badge ${svc.status === 'online' ? 'badge-success' : 'badge-warning'}`}>
                      {svc.status.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{svc.uptime}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

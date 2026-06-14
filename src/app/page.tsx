import { Server, Cpu, Database, Activity } from 'lucide-react';

export default function Dashboard() {
  return (
    <div>
      <div className="flex-between mb-4">
        <div>
          <h1>Visão Geral da Máquina</h1>
          <p>Métricas de consumo em tempo real do seu servidor Debian.</p>
        </div>
        <button className="btn btn-primary">
          <Activity size={16} />
          Atualizar Métricas
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div className="flex-between mb-4">
            <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-muted)' }}>Uso de CPU</h3>
            <Cpu size={24} style={{ color: 'var(--primary-color)' }} />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700 }}>24%</div>
          <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', marginTop: '1rem' }}>
            <div style={{ width: '24%', height: '100%', background: 'var(--primary-color)', borderRadius: '3px' }} />
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div className="flex-between mb-4">
            <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-muted)' }}>Memória RAM</h3>
            <Database size={24} style={{ color: 'var(--accent-color)' }} />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700 }}>3.2 GB <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/ 8 GB</span></div>
          <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', marginTop: '1rem' }}>
            <div style={{ width: '40%', height: '100%', background: 'var(--accent-color)', borderRadius: '3px' }} />
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div className="flex-between mb-4">
            <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-muted)' }}>Contêineres Ativos</h3>
            <Server size={24} style={{ color: 'var(--success-color)' }} />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700 }}>7</div>
          <p style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>4 Apps, 2 DBs, 1 Função</p>
        </div>
      </div>

      <h2>Serviços Recentes</h2>
      <div className="glass-panel" style={{ padding: '1rem', marginTop: '1rem' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
              <th style={{ padding: '1rem' }}>Nome do Serviço</th>
              <th style={{ padding: '1rem' }}>Tipo</th>
              <th style={{ padding: '1rem' }}>Status</th>
              <th style={{ padding: '1rem' }}>Uptime</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <td style={{ padding: '1rem', fontWeight: 500 }}>meu-blog-nextjs</td>
              <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>Hospedagem Web</td>
              <td style={{ padding: '1rem' }}><span className="badge badge-success">Online</span></td>
              <td style={{ padding: '1rem' }}>14 dias</td>
            </tr>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <td style={{ padding: '1rem', fontWeight: 500 }}>postgres-main-db</td>
              <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>Banco de Dados</td>
              <td style={{ padding: '1rem' }}><span className="badge badge-success">Online</span></td>
              <td style={{ padding: '1rem' }}>30 dias</td>
            </tr>
            <tr>
              <td style={{ padding: '1rem', fontWeight: 500 }}>processa-imagem-func</td>
              <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>Serverless</td>
              <td style={{ padding: '1rem' }}><span className="badge badge-warning">Ocioso</span></td>
              <td style={{ padding: '1rem' }}>-</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

import { Database, Plus } from 'lucide-react';

export default function DatabasePage() {
  return (
    <div>
      <div className="flex-between mb-4">
        <div>
          <h1>Bancos de Dados</h1>
          <p>Instâncias de bancos de dados gerenciados, provisionados isoladamente.</p>
        </div>
        <button className="btn btn-primary">
          <Plus size={16} />
          Criar Banco de Dados
        </button>
      </div>

      <div className="glass-panel" style={{ padding: '1rem' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
              <th style={{ padding: '1rem' }}>Nome da Instância</th>
              <th style={{ padding: '1rem' }}>Motor (Engine)</th>
              <th style={{ padding: '1rem' }}>Armazenamento</th>
              <th style={{ padding: '1rem' }}>Status</th>
              <th style={{ padding: '1rem', textAlign: 'right' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <td style={{ padding: '1rem', fontWeight: 500 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Database size={16} style={{ color: 'var(--primary-color)' }} />
                  postgres-main-db
                </div>
              </td>
              <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>PostgreSQL 15</td>
              <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>2.4 GB / 10 GB</td>
              <td style={{ padding: '1rem' }}><span className="badge badge-success">Online</span></td>
              <td style={{ padding: '1rem', textAlign: 'right' }}>
                <button className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>Credenciais</button>
              </td>
            </tr>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <td style={{ padding: '1rem', fontWeight: 500 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Database size={16} style={{ color: 'var(--warning-color)' }} />
                  redis-cache
                </div>
              </td>
              <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>Redis 7</td>
              <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>150 MB / 1 GB</td>
              <td style={{ padding: '1rem' }}><span className="badge badge-success">Online</span></td>
              <td style={{ padding: '1rem', textAlign: 'right' }}>
                <button className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>Credenciais</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

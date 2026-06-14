import { Terminal, Plus, Zap } from 'lucide-react';

export default function FunctionsPage() {
  return (
    <div>
      <div className="flex-between mb-4">
        <div>
          <h1>Funções Serverless</h1>
          <p>Execute trechos de código (Node.js, Python) sem gerenciar servidores completos.</p>
        </div>
        <button className="btn btn-primary">
          <Plus size={16} />
          Criar Função
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
        
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div className="flex-between mb-4">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ padding: '0.5rem', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '8px', color: 'var(--accent-color)' }}>
                <Terminal size={20} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.125rem' }}>processa-imagem</h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Runtime: Node.js 18</span>
              </div>
            </div>
            <span className="badge badge-warning">Ocioso</span>
          </div>
          
          <div style={{ display: 'flex', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem', alignItems: 'center' }}>
            <Zap size={14} style={{ color: 'var(--warning-color)' }} />
            <span>Gatilho: HTTP Request (GET/POST)</span>
          </div>

          <div className="flex-between">
            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Última execução: Há 2h</span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>Editar Código</button>
              <button className="btn btn-primary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>Testar</button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

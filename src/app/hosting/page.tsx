import { Server, Plus, Globe, GitBranch } from 'lucide-react';

export default function HostingPage() {
  return (
    <div>
      <div className="flex-between mb-4">
        <div>
          <h1>Hospedagem de Apps</h1>
          <p>Gerencie suas aplicações web, APIs e sites estáticos hospedados no Docker.</p>
        </div>
        <button className="btn btn-primary">
          <Plus size={16} />
          Novo Deploy
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
        
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div className="flex-between mb-4">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ padding: '0.5rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px', color: 'var(--primary-color)' }}>
                <Globe size={20} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.125rem' }}>meu-blog-nextjs</h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>blog.meudominio.com</span>
              </div>
            </div>
            <span className="badge badge-success">Online</span>
          </div>
          
          <div style={{ display: 'flex', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem', alignItems: 'center' }}>
            <GitBranch size={14} />
            <span>usuario/meu-blog (main)</span>
          </div>

          <div className="flex-between">
            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Porta Interna: 3000</span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>Logs</button>
              <button className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', borderColor: 'var(--danger-color)', color: 'var(--danger-color)' }}>Parar</button>
            </div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', borderStyle: 'dashed', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '200px', cursor: 'pointer' }}>
          <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '50%', marginBottom: '1rem' }}>
            <Plus size={32} style={{ color: 'var(--text-muted)' }} />
          </div>
          <h3 style={{ margin: 0, color: 'var(--text-main)' }}>Fazer Deploy de App</h3>
          <p style={{ textAlign: 'center', marginTop: '0.5rem', fontSize: '0.875rem' }}>Conecte um repositório GitHub ou use uma imagem Docker.</p>
        </div>

      </div>
    </div>
  );
}

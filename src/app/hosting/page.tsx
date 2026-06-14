'use client';

import { Globe, Plus, RefreshCw, AlertCircle, GitBranch, Code } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function HostingPage() {
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  const [showModal, setShowModal] = useState(false);
  const [deployType, setDeployType] = useState<'docker' | 'git'>('docker');
  const [creating, setCreating] = useState(false);

  // Form Docker
  const [formName, setFormName] = useState('');
  const [formImage, setFormImage] = useState('nginx:alpine');
  const [formPort, setFormPort] = useState('80');

  // Form Git
  const [gitRepo, setGitRepo] = useState('');
  const [gitEnv, setGitEnv] = useState('node');
  const [gitInstall, setGitInstall] = useState('npm install');
  const [gitBuild, setGitBuild] = useState('npm run build');
  const [gitStart, setGitStart] = useState('npm start');

  const fetchApps = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/hosting');
      const data = await res.json();
      if (data.status === 'success') {
        setApps(data.apps);
      } else {
        setError(data.message);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, []);

  const handleCreateDocker = async (e: any) => {
    e.preventDefault();
    setCreating(true);
    setError('');
    setSuccessMsg('');
    try {
      const res = await fetch('/api/hosting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formName, image: formImage, port: formPort })
      });
      const data = await res.json();
      if (data.status === 'success') {
        setShowModal(false);
        setFormName('');
        setSuccessMsg(`App hospedado com sucesso! Acesse na porta: ${data.allocatedPort}`);
        fetchApps();
      } else {
        setError(data.message);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleCreateGit = async (e: any) => {
    e.preventDefault();
    setCreating(true);
    setError('');
    setSuccessMsg('');
    try {
      const res = await fetch('/api/hosting/git', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: formName, 
          repoUrl: gitRepo, 
          environment: gitEnv,
          installCmd: gitInstall,
          buildCmd: gitBuild,
          startCmd: gitStart,
          port: formPort 
        })
      });
      const data = await res.json();
      if (data.status === 'success') {
        setShowModal(false);
        setFormName('');
        setGitRepo('');
        setSuccessMsg(`App compilado e hospedado com sucesso! Acesse na porta: ${data.allocatedPort}`);
        fetchApps();
      } else {
        setError(data.message);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div>
      <div className="flex-between mb-4">
        <div>
          <h1>Hospedagem de Apps</h1>
          <p>Hospede imagens do Docker Hub ou faça o Deploy direto do GitHub.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-outline" onClick={fetchApps} disabled={loading}>
            <RefreshCw size={16} /> Atualizar
          </button>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={16} /> Novo Deploy
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4" style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger-color)', borderRadius: '8px', color: 'var(--danger-color)' }}>
          <AlertCircle size={20} style={{ display: 'inline', marginRight: '0.5rem' }} />
          {error}
        </div>
      )}

      {successMsg && (
        <div className="mb-4" style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--success-color)', borderRadius: '8px', color: 'var(--success-color)' }}>
          <strong>✓ Sucesso:</strong> {successMsg}
        </div>
      )}

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', overflowY: 'auto' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '600px', padding: '2rem', marginTop: 'auto', marginBottom: 'auto' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Fazer Deploy</h2>
            
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
              <button 
                className={`btn ${deployType === 'docker' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setDeployType('docker')}
              >
                <GitBranch size={16} /> Imagem Docker
              </button>
              <button 
                className={`btn ${deployType === 'git' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setDeployType('git')}
              >
                <Code size={16} /> Código do GitHub
              </button>
            </div>

            {deployType === 'docker' ? (
              <form onSubmit={handleCreateDocker}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Nome do App</label>
                  <input required type="text" placeholder="ex: meu-site" value={formName} onChange={e => setFormName(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', color: 'white' }} />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Imagem Docker (Hub)</label>
                  <input required type="text" placeholder="ex: nginx:alpine" value={formImage} onChange={e => setFormImage(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', color: 'white' }} />
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Porta Interna (que o app usa)</label>
                  <input required type="text" placeholder="80" value={formPort} onChange={e => setFormPort(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', color: 'white' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                  <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancelar</button>
                  <button type="submit" className="btn btn-primary" disabled={creating}>
                    {creating ? 'Fazendo Pull e Deploy...' : 'Hospedar App'}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleCreateGit}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Nome do App</label>
                  <input required type="text" placeholder="ex: meu-backend-node" value={formName} onChange={e => setFormName(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', color: 'white' }} />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>URL do Repositório (Público)</label>
                  <input required type="url" placeholder="https://github.com/usuario/repo.git" value={gitRepo} onChange={e => setGitRepo(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', color: 'white' }} />
                </div>
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Ambiente</label>
                    <select value={gitEnv} onChange={e => setGitEnv(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: '#1e212b', border: '1px solid var(--border-color)', color: 'white' }}>
                      <option value="node">Node.js 18</option>
                      <option value="python">Python 3.10</option>
                      <option value="static">Estático (Nginx)</option>
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Porta Interna</label>
                    <input required type="text" placeholder="3000" value={formPort} onChange={e => setFormPort(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', color: 'white' }} />
                  </div>
                </div>
                {gitEnv !== 'static' && (
                  <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Comando Build</label>
                      <input type="text" placeholder={gitEnv === 'node' ? 'npm run build' : ''} value={gitBuild} onChange={e => setGitBuild(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', color: 'white' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Comando Start</label>
                      <input required type="text" placeholder={gitEnv === 'node' ? 'npm start' : 'python app.py'} value={gitStart} onChange={e => setGitStart(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', color: 'white' }} />
                    </div>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', alignItems: 'center' }}>
                  {creating && <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Pode demorar alguns minutos...</span>}
                  <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)} disabled={creating}>Cancelar</button>
                  <button type="submit" className="btn btn-primary" disabled={creating}>
                    {creating ? 'Compilando e Hospedando...' : 'Iniciar Build do Código'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {loading ? (
          <div style={{ padding: '1rem' }}>Carregando...</div>
        ) : apps.length === 0 ? (
          <div className="glass-panel" style={{ padding: '1.5rem', borderStyle: 'dashed', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '200px' }}>
            <p style={{ color: 'var(--text-muted)' }}>Nenhum app hospedado.</p>
          </div>
        ) : apps.map((app, i) => (
          <div key={i} className="glass-panel" style={{ padding: '1.5rem' }}>
            <div className="flex-between mb-4">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ padding: '0.5rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px', color: 'var(--primary-color)' }}>
                  <Globe size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.125rem' }}>{app.name}</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Mapeamento: {app.ports || 'Nenhuma porta'}</span>
                </div>
              </div>
              <span className={`badge ${app.status === 'online' ? 'badge-success' : 'badge-danger'}`}>{app.status.toUpperCase()}</span>
            </div>
            
            <div style={{ display: 'flex', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem', alignItems: 'center' }}>
              <GitBranch size={14} />
              <span>Imagem: {app.image}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

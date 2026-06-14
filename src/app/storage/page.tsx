'use client';

import { HardDrive, Play, RefreshCw, AlertCircle, ExternalLink } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function StoragePage() {
  const [storage, setStorage] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deploying, setDeploying] = useState(false);

  const fetchStorage = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/storage');
      const data = await res.json();
      if (data.status === 'success') {
        setStorage(data.storage);
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
    fetchStorage();
  }, []);

  const handleDeploy = async () => {
    setDeploying(true);
    setError('');
    try {
      const res = await fetch('/api/storage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'deploy' })
      });
      const data = await res.json();
      if (data.status === 'success') {
        fetchStorage();
      } else {
        setError(data.message);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setDeploying(false);
    }
  };

  return (
    <div>
      <div className="flex-between mb-4">
        <div>
          <h1>Cloud Storage (Object Storage)</h1>
          <p>Armazenamento de arquivos estáticos, backups e imagens usando o motor MinIO (S3 Compatible).</p>
        </div>
        <button className="btn btn-outline" onClick={fetchStorage} disabled={loading}>
          <RefreshCw size={16} /> Atualizar
        </button>
      </div>

      {error && (
        <div className="mb-4" style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger-color)', borderRadius: '8px', color: 'var(--danger-color)' }}>
          <AlertCircle size={20} style={{ display: 'inline', marginRight: '0.5rem' }} />
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center' }}>Carregando status do storage...</div>
      ) : !storage ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <HardDrive size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
          <h2>Servidor de Storage Desativado</h2>
          <p style={{ maxWidth: '500px', margin: '0.5rem auto 2rem', color: 'var(--text-muted)' }}>
            Você ainda não ativou o Cloud Storage na sua VM. Ao ativar, um servidor MinIO será instalado para gerenciar seus "Buckets" como se fosse o Amazon S3.
          </p>
          <button className="btn btn-primary" onClick={handleDeploy} disabled={deploying}>
            <Play size={16} /> {deploying ? 'Instalando MinIO...' : 'Ativar Cloud Storage'}
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div className="flex-between mb-4">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ padding: '0.5rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', color: 'var(--success-color)' }}>
                  <HardDrive size={24} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.125rem' }}>MinIO Server</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>S3 Compatible API</span>
                </div>
              </div>
              <span className={`badge ${storage.status === 'online' ? 'badge-success' : 'badge-danger'}`}>
                {storage.status.toUpperCase()}
              </span>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Credenciais de Acesso:</div>
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: '8px', fontFamily: 'monospace', fontSize: '0.875rem' }}>
                <div>Root User: <span style={{ color: 'white' }}>admin</span></div>
                <div>Password:  <span style={{ color: 'white' }}>minioadmin123</span></div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                className="btn btn-primary" 
                style={{ flex: 1 }}
                onClick={() => window.open(`http://${window.location.hostname}:9001`, '_blank')}
              >
                <ExternalLink size={16} /> Abrir Console S3
              </button>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}

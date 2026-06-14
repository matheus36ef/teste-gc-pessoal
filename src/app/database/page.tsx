'use client';

import { Database, Plus, RefreshCw, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function DatabasePage() {
  const [databases, setDatabases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [showModal, setShowModal] = useState(false);
  const [formName, setFormName] = useState('');
  const [formEngine, setFormEngine] = useState('postgres');
  const [formPassword, setFormPassword] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchDatabases = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/database');
      const data = await res.json();
      if (data.status === 'success') {
        setDatabases(data.databases);
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
    fetchDatabases();
  }, []);

  const handleCreate = async (e: any) => {
    e.preventDefault();
    setCreating(true);
    setError('');
    try {
      const res = await fetch('/api/database', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formName, engine: formEngine, password: formPassword })
      });
      const data = await res.json();
      if (data.status === 'success') {
        setShowModal(false);
        setFormName('');
        setFormPassword('');
        fetchDatabases();
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
          <h1>Bancos de Dados</h1>
          <p>Instâncias de bancos de dados isoladas no Docker.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-outline" onClick={fetchDatabases} disabled={loading}>
            <RefreshCw size={16} /> Atualizar
          </button>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={16} /> Criar Banco de Dados
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4" style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger-color)', borderRadius: '8px', color: 'var(--danger-color)' }}>
          <AlertCircle size={20} style={{ display: 'inline', marginRight: '0.5rem' }} />
          {error}
        </div>
      )}

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-panel" style={{ width: '400px', padding: '2rem' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Novo Banco de Dados</h2>
            <form onSubmit={handleCreate}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Nome da Instância</label>
                <input required type="text" value={formName} onChange={e => setFormName(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', color: 'white' }} />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Engine</label>
                <select value={formEngine} onChange={e => setFormEngine(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: '#1e212b', border: '1px solid var(--border-color)', color: 'white' }}>
                  <option value="postgres">PostgreSQL 15</option>
                  <option value="redis">Redis 7</option>
                </select>
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Senha (Root/Admin)</label>
                <input required type="password" value={formPassword} onChange={e => setFormPassword(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', color: 'white' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={creating}>
                  {creating ? 'Criando...' : 'Criar Instância'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="glass-panel" style={{ padding: '1rem' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
              <th style={{ padding: '1rem' }}>Nome da Instância</th>
              <th style={{ padding: '1rem' }}>Imagem Docker</th>
              <th style={{ padding: '1rem' }}>Portas Abertas</th>
              <th style={{ padding: '1rem' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} style={{ padding: '1rem', textAlign: 'center' }}>Carregando...</td></tr>
            ) : databases.length === 0 ? (
              <tr><td colSpan={4} style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>Nenhum banco de dados criado.</td></tr>
            ) : (
              databases.map((db, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '1rem', fontWeight: 500 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Database size={16} style={{ color: db.image.includes('postgres') ? 'var(--primary-color)' : 'var(--danger-color)' }} />
                      {db.name}
                    </div>
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{db.image}</td>
                  <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{db.ports || 'Nenhuma'}</td>
                  <td style={{ padding: '1rem' }}>
                    <span className={`badge ${db.status === 'online' ? 'badge-success' : 'badge-danger'}`}>
                      {db.status.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

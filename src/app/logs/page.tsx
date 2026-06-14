'use client';

import { ScrollText, RefreshCw, AlertCircle, Terminal } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';

export default function LogsPage() {
  const [containers, setContainers] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [logs, setLogs] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const logsEndRef = useRef<HTMLDivElement>(null);

  const fetchContainers = async () => {
    try {
      const res = await fetch('/api/logs');
      const data = await res.json();
      if (data.status === 'success') {
        setContainers(data.containers);
        if (data.containers.length > 0 && !selectedId) {
          setSelectedId(data.containers[0].id);
        }
      } else {
        setError(data.message);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const fetchLogs = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/logs?id=${id}`);
      const data = await res.json();
      if (data.status === 'success') {
        setLogs(data.logs);
      } else {
        setError(data.message);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      // Rola para o final do log
      setTimeout(() => {
        if (logsEndRef.current) {
          logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  };

  useEffect(() => {
    fetchContainers();
  }, []);

  useEffect(() => {
    if (selectedId) {
      fetchLogs(selectedId);
      const interval = setInterval(() => fetchLogs(selectedId), 5000); // Autorefresh
      return () => clearInterval(interval);
    }
  }, [selectedId]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)' }}>
      <div className="flex-between mb-4">
        <div>
          <h1>Cloud Logging</h1>
          <p>Visualize os logs em tempo real dos seus contêineres e bancos de dados.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <select 
            value={selectedId} 
            onChange={e => setSelectedId(e.target.value)}
            style={{ padding: '0.5rem 1rem', borderRadius: '8px', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--border-color)', color: 'white', outline: 'none' }}
          >
            {containers.map(c => (
              <option key={c.id} value={c.id}>{c.name} ({c.state})</option>
            ))}
          </select>
          <button className="btn btn-outline" onClick={() => fetchLogs(selectedId)} disabled={loading}>
            <RefreshCw size={16} /> Atualizar
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4" style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger-color)', borderRadius: '8px', color: 'var(--danger-color)' }}>
          <AlertCircle size={20} style={{ display: 'inline', marginRight: '0.5rem' }} />
          {error}
        </div>
      )}

      <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#0a0a0a' }}>
        <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Terminal size={16} /> Console Output (Últimas 200 linhas)
        </div>
        <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', fontFamily: 'monospace', color: '#00ff00', whiteSpace: 'pre-wrap', fontSize: '0.875rem' }}>
          {loading && !logs ? 'Carregando logs...' : logs || 'Nenhum log encontrado para este serviço.'}
          <div ref={logsEndRef} />
        </div>
      </div>
    </div>
  );
}

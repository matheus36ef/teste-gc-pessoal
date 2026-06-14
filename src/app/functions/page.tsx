'use client';

import { Terminal, Plus, Play, AlertCircle } from 'lucide-react';
import { useState } from 'react';

export default function FunctionsPage() {
  const [code, setCode] = useState('console.log("Olá Serverless! A data de hoje é:", new Date());');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRun = async () => {
    setLoading(true);
    setError('');
    setOutput('');
    try {
      const res = await fetch('/api/functions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });
      const data = await res.json();
      if (data.status === 'success') {
        setOutput(data.output);
      } else {
        setError(data.message);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex-between mb-4">
        <div>
          <h1>Funções Serverless</h1>
          <p>Execute scripts Javascript Node.js sob demanda em contêineres efêmeros.</p>
        </div>
        <button className="btn btn-primary" onClick={handleRun} disabled={loading}>
          <Play size={16} />
          {loading ? 'Executando no Docker...' : 'Testar Função'}
        </button>
      </div>

      {error && (
        <div className="mb-4" style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger-color)', borderRadius: '8px', color: 'var(--danger-color)' }}>
          <AlertCircle size={20} style={{ display: 'inline', marginRight: '0.5rem' }} />
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', minHeight: '400px' }}>
        
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Terminal size={16} /> <span style={{ fontWeight: 500 }}>index.js</span>
          </div>
          <textarea 
            value={code}
            onChange={(e) => setCode(e.target.value)}
            style={{ flex: 1, background: 'transparent', border: 'none', padding: '1rem', color: 'var(--text-main)', fontFamily: 'monospace', fontSize: '14px', resize: 'none', outline: 'none' }}
          />
        </div>

        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', background: '#000' }}>
          <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
            <span style={{ fontWeight: 500 }}>Console Output</span>
          </div>
          <div style={{ padding: '1rem', fontFamily: 'monospace', color: 'var(--success-color)', whiteSpace: 'pre-wrap' }}>
            {loading ? 'Inicializando contêiner node:18-alpine...\nExecutando...' : output || 'Clique em Testar Função para ver o resultado aqui.'}
          </div>
        </div>

      </div>
    </div>
  );
}

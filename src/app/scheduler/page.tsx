'use client';

import { Clock, Plus, RefreshCw, AlertCircle, Play } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function SchedulerPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [showModal, setShowModal] = useState(false);
  const [formName, setFormName] = useState('');
  const [formSchedule, setFormSchedule] = useState('0 0 * * *');
  const [formCommand, setFormCommand] = useState('echo "Rodando tarefa de backup"');
  const [creating, setCreating] = useState(false);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/scheduler');
      const data = await res.json();
      if (data.status === 'success') {
        setJobs(data.jobs);
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
    fetchJobs();
  }, []);

  const handleCreate = async (e: any) => {
    e.preventDefault();
    setCreating(true);
    setError('');
    try {
      const res = await fetch('/api/scheduler', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formName, schedule: formSchedule, command: formCommand })
      });
      const data = await res.json();
      if (data.status === 'success') {
        setShowModal(false);
        setFormName('');
        fetchJobs();
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
          <h1>Cloud Scheduler</h1>
          <p>Agende rotinas Cron para executar scripts automaticamente em horários marcados.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-outline" onClick={fetchJobs} disabled={loading}>
            <RefreshCw size={16} /> Atualizar
          </button>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={16} /> Nova Tarefa
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
          <div className="glass-panel" style={{ width: '450px', padding: '2rem' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Agendar Nova Tarefa</h2>
            <form onSubmit={handleCreate}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Nome da Tarefa</label>
                <input required type="text" placeholder="ex: Backup do BD" value={formName} onChange={e => setFormName(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', color: 'white' }} />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Frequência (Cron Expression)</label>
                <input required type="text" placeholder="* * * * *" value={formSchedule} onChange={e => setFormSchedule(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', color: 'white' }} />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>Ex: "0 0 * * *" para rodar toda meia noite.</span>
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Comando Shell</label>
                <textarea required placeholder="docker exec meu-banco pg_dump..." value={formCommand} onChange={e => setFormCommand(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', color: 'white', minHeight: '80px', resize: 'none' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={creating}>
                  {creating ? 'Salvando...' : 'Agendar'}
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
              <th style={{ padding: '1rem' }}>Tarefa</th>
              <th style={{ padding: '1rem' }}>Frequência</th>
              <th style={{ padding: '1rem' }}>Última Execução</th>
              <th style={{ padding: '1rem' }}>Status</th>
              <th style={{ padding: '1rem', textAlign: 'right' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ padding: '1rem', textAlign: 'center' }}>Carregando...</td></tr>
            ) : jobs.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>Nenhuma tarefa agendada.</td></tr>
            ) : (
              jobs.map((job, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '1rem', fontWeight: 500 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Clock size={16} style={{ color: 'var(--accent-color)' }} />
                      {job.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{job.command}</div>
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{job.schedule}</td>
                  <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{job.lastRun}</td>
                  <td style={{ padding: '1rem' }}>
                    <span className="badge badge-success">Ativa</span>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <button className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}><Play size={12} /> Forçar Run</button>
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

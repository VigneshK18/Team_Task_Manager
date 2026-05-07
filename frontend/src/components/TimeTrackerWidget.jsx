// src/components/TimeTrackerWidget.jsx – Floating live stopwatch
import React, { useState, useEffect, useRef } from 'react';
import { Clock, Square, Play, ChevronDown } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';

function fmt(secs) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  return h > 0
    ? `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
    : `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

export default function TimeTrackerWidget() {
  const { tasks, currentUser, activeTimer, startTimer, stopTimer, projects } = useApp();
  const [open,    setOpen]    = useState(false);
  const [secs,    setSecs]    = useState(0);
  const [taskId,  setTaskId]  = useState('');
  const interval  = useRef(null);

  // Live counter
  useEffect(() => {
    if (activeTimer) {
      const elapsed = Math.floor((Date.now() - new Date(activeTimer.startTime).getTime()) / 1000);
      setSecs(elapsed);
      interval.current = setInterval(() => setSecs(s => s + 1), 1000);
    } else {
      setSecs(0);
      clearInterval(interval.current);
    }
    return () => clearInterval(interval.current);
  }, [activeTimer]);

  const myTasks = tasks.filter(t => t.assigneeId === currentUser?.id && t.status !== 'Done');

  const handleStart = () => {
    if (!taskId) return;
    const task = tasks.find(t => t.id === taskId);
    startTimer(taskId, task?.projectId || '');
  };

  const handleStop = () => stopTimer();

  const currentTask = tasks.find(t => t.id === activeTimer?.taskId);
  const currentProj = projects.find(p => p.id === currentTask?.projectId);

  return (
    <div style={{ position: 'fixed', bottom: 98, right: 28, zIndex: 490 }}>
      {open && (
        <div style={{
          background: 'var(--white)', border: '1px solid var(--gray-200)',
          borderRadius: 'var(--radius-lg)', width: 280, boxShadow: 'var(--shadow-lg)',
          marginBottom: 8, animation: 'dropIn .2s ease', overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{ background: activeTimer ? 'var(--primary)' : 'var(--gray-800)', padding: '12px 16px', color: '#fff' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, fontWeight: 700, opacity: .8, textTransform: 'uppercase', letterSpacing: '.06em' }}>
                {activeTimer ? '● Recording' : 'Time Tracker'}
              </span>
              <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', opacity: .7 }}>
                <ChevronDown size={16} />
              </button>
            </div>
            <div style={{ fontSize: 36, fontWeight: 900, letterSpacing: -1, marginTop: 4 }}>{fmt(secs)}</div>
            {currentTask && (
              <div style={{ fontSize: 11.5, opacity: .85, marginTop: 2 }}>
                {currentTask.title}
                {currentProj && <span style={{ opacity: .7 }}> · {currentProj.name}</span>}
              </div>
            )}
          </div>

          {/* Body */}
          <div style={{ padding: 14 }}>
            {!activeTimer && (
              <>
                <div style={{ marginBottom: 10 }}>
                  <select
                    className="form-control"
                    style={{ fontSize: 12.5 }}
                    value={taskId}
                    onChange={e => setTaskId(e.target.value)}
                  >
                    <option value="">Select task to track…</option>
                    {myTasks.map(t => {
                      const p = projects.find(pr => pr.id === t.projectId);
                      return <option key={t.id} value={t.id}>{t.title}{p ? ` (${p.name})` : ''}</option>;
                    })}
                  </select>
                </div>
                <button
                  id="start-timer-btn"
                  className="btn btn-primary"
                  style={{ width: '100%', justifyContent: 'center', gap: 8 }}
                  onClick={handleStart}
                  disabled={!taskId}
                >
                  <Play size={14} /> Start Tracking
                </button>
              </>
            )}

            {activeTimer && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--gray-500)', marginBottom: 10 }}>
                  <span>Started</span>
                  <span>{new Date(activeTimer.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <button
                  id="stop-timer-btn"
                  className="btn btn-danger"
                  style={{ width: '100%', justifyContent: 'center', gap: 8 }}
                  onClick={handleStop}
                >
                  <Square size={14} /> Stop & Save
                </button>
              </div>
            )}

            <div style={{ marginTop: 10, fontSize: 11, color: 'var(--gray-400)', textAlign: 'center' }}>
              Time logged today · <strong style={{ color: 'var(--primary)' }}>+5 XP</strong> per session saved
            </div>
          </div>
        </div>
      )}

      {/* FAB */}
      <button
        id="time-tracker-fab"
        onClick={() => setOpen(v => !v)}
        title="Time Tracker"
        style={{
          width: 48, height: 48, borderRadius: '50%',
          background: activeTimer ? 'var(--danger)' : 'var(--gray-800)',
          color: '#fff', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 16px rgba(0,0,0,.25)', transition: 'all .2s',
          animation: activeTimer ? 'pulse-ring 1.5s infinite' : 'none',
          fontSize: 12, fontWeight: 800,
        }}
      >
        {activeTimer ? fmt(secs) : <Clock size={20} />}
      </button>
    </div>
  );
}

// src/components/FocusTimer.jsx  – Floating Pomodoro Timer
import React, { useState, useEffect, useRef } from 'react';
import { Timer, X, Play, Pause, RotateCcw, SkipForward } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';

const MODES = [
  { label: 'Focus',       duration: 25 * 60, color: 'var(--primary)' },
  { label: 'Short Break', duration: 5  * 60, color: 'var(--success)' },
  { label: 'Long Break',  duration: 15 * 60, color: 'var(--purple)'  },
];

export default function FocusTimer() {
  const { tasks, currentUser, recordPomodoro } = useApp();
  const [open,     setOpen]     = useState(false);
  const [modeIdx,  setModeIdx]  = useState(0);
  const [seconds,  setSeconds]  = useState(MODES[0].duration);
  const [running,  setRunning]  = useState(false);
  const [sessions, setSessions] = useState([false, false, false, false]);
  const [taskId,   setTaskId]   = useState('');
  const intervalRef = useRef(null);
  const notifRef    = useRef(null);

  const mode   = MODES[modeIdx];
  const total  = mode.duration;
  const pct    = 1 - seconds / total;
  const r      = 60;
  const circ   = 2 * Math.PI * r;
  const offset = circ * (1 - pct);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds(s => {
          if (s <= 1) {
            clearInterval(intervalRef.current);
            setRunning(false);
            handleComplete();
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [running, modeIdx]);

  const handleComplete = () => {
    if (modeIdx === 0) {
      recordPomodoro();
      setSessions(prev => {
        const next = [...prev];
        const idx  = next.findIndex(v => !v);
        if (idx !== -1) next[idx] = true;
        return next;
      });
      if (window.Notification?.permission === 'granted') {
        new Notification('🎉 Focus session complete!', { body: 'Take a short break – you earned it!' });
      }
      // Auto switch to break
      const doneCount = sessions.filter(Boolean).length + 1;
      setModeIdx(doneCount % 4 === 0 ? 2 : 1);
    } else {
      setModeIdx(0);
    }
    setSeconds(MODES[modeIdx === 0 ? (sessions.filter(Boolean).length + 1) % 4 === 0 ? 2 : 1 : 0].duration);
  };

  const reset = () => {
    clearInterval(intervalRef.current);
    setRunning(false);
    setSeconds(mode.duration);
  };

  const skip = () => {
    clearInterval(intervalRef.current);
    setRunning(false);
    const next = (modeIdx + 1) % 3;
    setModeIdx(next);
    setSeconds(MODES[next].duration);
  };

  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const myTasks = tasks.filter(t => t.assigneeId === currentUser?.id && t.status !== 'Done');

  return (
    <div className="focus-timer-fab">
      {open && (
        <div className="focus-timer-panel">
          <div className="focus-timer-panel-header">
            <div style={{ display: 'flex', gap: 6 }}>
              {MODES.map((m, i) => (
                <button key={i} onClick={() => { setModeIdx(i); setSeconds(m.duration); setRunning(false); }}
                  style={{ padding: '3px 10px', borderRadius: 99, border: 'none', fontSize: 11.5, fontWeight: 600,
                    cursor: 'pointer', background: modeIdx === i ? mode.color : 'var(--gray-100)',
                    color: modeIdx === i ? '#fff' : 'var(--gray-600)' }}>
                  {m.label}
                </button>
              ))}
            </div>
            <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)' }}>
              <X size={16} />
            </button>
          </div>

          <div className="focus-timer-display">
            <div className="focus-timer-ring">
              <svg width="140" height="140" viewBox="0 0 140 140">
                <circle className="focus-timer-ring-track" cx="70" cy="70" r={r} />
                <circle className="focus-timer-ring-fill" cx="70" cy="70" r={r}
                  style={{ strokeDasharray: circ, strokeDashoffset: offset, stroke: mode.color }}
                />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span className="focus-timer-time" style={{ fontSize: 30, color: mode.color }}>{fmt(seconds)}</span>
                <span className="focus-timer-label" style={{ color: mode.color }}>{mode.label}</span>
              </div>
            </div>
          </div>

          <select className="focus-task-select" value={taskId} onChange={e => setTaskId(e.target.value)}>
            <option value="">— Select a task to focus on —</option>
            {myTasks.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
          </select>

          <div className="focus-timer-controls">
            <button onClick={reset} className="btn btn-outline btn-sm"><RotateCcw size={14} /></button>
            <button onClick={() => setRunning(r => !r)} className="btn btn-primary btn-sm" style={{ padding: '0 24px', background: mode.color }}>
              {running ? <Pause size={16} /> : <Play size={16} />}
              {running ? 'Pause' : 'Start'}
            </button>
            <button onClick={skip} className="btn btn-outline btn-sm"><SkipForward size={14} /></button>
          </div>

          <div className="focus-sessions">
            {sessions.map((done, i) => (
              <div key={i} className={`focus-session-dot${done ? ' done' : ''}`} style={done ? { background: mode.color } : {}} />
            ))}
          </div>

          <div style={{ padding: '8px 18px 14px', fontSize: 11.5, color: 'var(--gray-400)', textAlign: 'center' }}>
            4 pomodoros = 1 long break · You earn <strong style={{ color: mode.color }}>+25 XP</strong> per session
          </div>
        </div>
      )}

      <button
        id="focus-timer-btn"
        className={`focus-timer-btn${running ? ' active' : ''}`}
        onClick={() => setOpen(v => !v)}
        title="Focus Timer (Pomodoro)"
      >
        {running ? <span style={{ fontSize: 13, fontWeight: 800 }}>{fmt(seconds)}</span> : <Timer size={24} />}
      </button>
    </div>
  );
}

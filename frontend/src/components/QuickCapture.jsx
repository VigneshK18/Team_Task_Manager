// src/components/QuickCapture.jsx – Global Ctrl+K task capture
import React, { useState, useEffect, useRef } from 'react';
import { Zap, Hash, User, Flag, X } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';

export default function QuickCapture({ onClose }) {
  const { createTask, projects, users, currentUser } = useApp();
  const [text,     setText]     = useState('');
  const [priority, setPriority] = useState('Medium');
  const [projId,   setProjId]   = useState('');
  const [done,     setDone]     = useState(false);
  const inputRef = useRef();

  const close = () => { onClose?.(); };

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 80);
    setText(''); setDone(false);
  }, []);

  const submit = () => {
    if (!text.trim()) return;
    createTask({
      title:      text.trim(),
      description:'',
      projectId:  projId,
      assigneeId: currentUser?.id || '',
      status:     'To Do',
      priority,
      dueDate:    '',
    });
    setDone(true);
    setTimeout(() => close(), 900);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter') submit();
    if (e.key === 'Escape') close();
  };

  const PRIORITIES = [
    { label:'High',   color:'var(--danger)',  flag:'🔴' },
    { label:'Medium', color:'var(--warning)', flag:'🟡' },
    { label:'Low',    color:'var(--success)', flag:'🟢' },
  ];



  return (
    <div className="quick-capture-overlay" onClick={e => { if (e.target === e.currentTarget) close(); }}>
      <div className="quick-capture-box animate-slide-up">
        <div className="quick-capture-input">
          {done
            ? <span style={{ fontSize: 20, flex: 1, color: 'var(--success)', fontWeight: 600 }}>✓ Task created!</span>
            : <>
                <Zap size={20} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                <input
                  ref={inputRef}
                  value={text}
                  onChange={e => setText(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder="What needs to be done? (Press Enter to save)"
                />
                <button onClick={close} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)' }}>
                  <X size={16} />
                </button>
              </>
          }
        </div>

        {!done && (
          <div className="quick-capture-footer">
            {/* Priority */}
            {PRIORITIES.map(p => (
              <button key={p.label} className={`qc-tag${priority === p.label ? ' active' : ''}`} onClick={() => setPriority(p.label)}>
                <Flag size={12} style={{ color: p.color }} /> {p.label}
              </button>
            ))}

            {/* Project */}
            <select
              value={projId}
              onChange={e => setProjId(e.target.value)}
              style={{ border: '1.5px solid var(--gray-200)', borderRadius: 99, padding: '4px 10px', fontSize: 12, color: 'var(--gray-600)', background: 'var(--white)', outline: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              <option value=""># No Project</option>
              {projects.map(p => <option key={p.id} value={p.id}># {p.name}</option>)}
            </select>

            <span className="quick-capture-hint">↵ Enter to save · Esc to close</span>

            <button onClick={submit} className="btn btn-primary btn-sm" style={{ marginLeft: 'auto' }}>
              Add Task
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

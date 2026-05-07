// src/components/Header.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, ChevronDown, User, Settings, HelpCircle, LogOut, Zap, Moon, Sun, Activity } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import Avatar from './Avatar.jsx';

const NOTIFS = [
  { id: 1, title: 'New task assigned',   desc: 'Design homepage was assigned to you', time: '10 min ago', unread: true },
  { id: 2, title: 'Task completed',      desc: 'Fix login bug marked as Done',        time: '2 hours ago', unread: true },
  { id: 3, title: 'Project update',      desc: 'Mobile App progress updated to 46%',  time: '1 day ago', unread: false },
  { id: 4, title: 'Deadline reminder',   desc: 'Setup database due in 2 days',        time: '2 days ago', unread: false },
];

export default function Header({ onQuickCapture }) {
  const { currentUser, doLogout, darkMode, toggleDarkMode, gamification } = useApp();
  const navigate = useNavigate();
  const [showUser,  setShowUser]  = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [search, setSearch]       = useState('');
  const userRef  = useRef();
  const notifRef = useRef();

  useEffect(() => {
    const handler = (e) => {
      if (userRef.current  && !userRef.current.contains(e.target))  setShowUser(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => { doLogout(); navigate('/login'); };

  const xpToNext = 200 - (gamification.xp % 200);
  const xpPct    = ((gamification.xp % 200) / 200) * 100;

  return (
    <header className="header">
      <div className="header-search">
        <Search size={15} />
        <input
          placeholder="Search tasks, projects… (Ctrl+K for quick add)"
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={e => { if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); onQuickCapture?.(); } }}
        />
      </div>

      <div className="header-actions">
        {/* Quick Capture shortcut */}
        <button
          id="quick-capture-btn"
          onClick={onQuickCapture}
          title="Quick Capture (Ctrl+K)"
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 12px', height: 34, borderRadius: 8, border: '1.5px solid var(--gray-200)', background: 'var(--white)', color: 'var(--gray-600)', fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}
        >
          <Zap size={14} style={{ color: 'var(--primary)' }} />
          Quick Add
          <span style={{ padding: '1px 5px', borderRadius: 4, background: 'var(--gray-100)', fontSize: 10, fontFamily: 'monospace' }}>Ctrl+K</span>
        </button>

        {/* Dark mode toggle */}
        <button id="dark-mode-toggle" className="theme-toggle" onClick={toggleDarkMode} title={darkMode ? 'Light Mode' : 'Dark Mode'}>
          {darkMode ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* XP indicator */}
        <div
          title={`Level ${gamification.level} · ${gamification.xp} XP · ${xpToNext} XP to next level`}
          style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer', padding: '4px 10px', borderRadius: 8, background: 'var(--primary-light)', border: '1px solid var(--primary)', minWidth: 110 }}
          onClick={() => navigate('/dashboard')}
        >
          <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--primary)' }}>Lv.{gamification.level}</span>
          <div style={{ flex: 1 }}>
            <div className="xp-bar-wrap" style={{ height: 6, margin: 0 }}>
              <div className="xp-bar-fill" style={{ width: `${xpPct}%` }} />
            </div>
          </div>
          <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--primary)', whiteSpace: 'nowrap' }}>{gamification.xp} XP</span>
        </div>

        {/* Team Pulse shortcut */}
        <button
          id="pulse-btn"
          onClick={() => navigate('/pulse')}
          className="icon-btn"
          title="Team Pulse"
        >
          <Activity size={17} />
        </button>

        {/* Notifications */}
        <div className="dropdown-wrapper" ref={notifRef}>
          <button id="notif-btn" className="icon-btn" onClick={() => { setShowNotif(v => !v); setShowUser(false); }}>
            <Bell size={17} />
            <span className="badge">3</span>
          </button>
          {showNotif && (
            <div className="dropdown-menu notif-panel" style={{ right: 0 }}>
              <div style={{ padding: '12px 14px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--gray-100)' }}>
                <span style={{ fontWeight: 700, fontSize: 14 }}>Notifications</span>
                <span style={{ fontSize: 12, color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}>Mark all read</span>
              </div>
              {NOTIFS.map(n => (
                <div key={n.id} className={`notif-item${n.unread ? ' unread' : ''}`}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: n.unread ? 'var(--primary)' : 'transparent', flexShrink: 0, marginTop: 4 }} />
                  <div>
                    <div className="notif-title">{n.title}</div>
                    <div className="notif-desc">{n.desc}</div>
                    <div className="notif-time">{n.time}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* User menu */}
        <div className="dropdown-wrapper" ref={userRef}>
          <div id="user-menu-btn" className="user-menu" onClick={() => { setShowUser(v => !v); setShowNotif(false); }}>
            <Avatar user={currentUser} size={34} />
            <div className="user-info">
              <div className="user-name">{currentUser?.name}</div>
              <div className="user-role">{currentUser?.role}</div>
            </div>
            <ChevronDown size={14} style={{ color: 'var(--gray-400)' }} />
          </div>
          {showUser && (
            <div className="dropdown-menu">
              <div className="dropdown-item" onClick={() => { navigate('/profile'); setShowUser(false); }}>
                <User size={15} /> My Profile
              </div>
              <div className="dropdown-item" onClick={() => { navigate('/pulse'); setShowUser(false); }}>
                <Activity size={15} /> Team Pulse
              </div>
              <div className="dropdown-item" onClick={() => { navigate('/settings'); setShowUser(false); }}>
                <Settings size={15} /> Settings
              </div>
              <div className="dropdown-divider" />
              <div className="dropdown-item danger" onClick={handleLogout}>
                <LogOut size={15} /> Logout
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

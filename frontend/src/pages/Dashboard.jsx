// src/pages/Dashboard.jsx
import React, { useState } from 'react';
import { FolderOpen, ClipboardList, RefreshCw, Clock, Plus, Flame, Star, Trophy, Zap } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { useApp } from '../context/AppContext.jsx';
import Avatar from '../components/Avatar.jsx';
import StatusBadge, { PriorityBadge } from '../components/StatusBadge.jsx';
import { useNavigate } from 'react-router-dom';

const STATUS_COLORS = { 'To Do': '#94a3b8', 'In Progress': '#3b82f6', 'In Review': '#f59e0b', 'Done': '#22c55e' };

function ConfettiPop() {
  const colors = ['#4f6ef7','#22c55e','#f59e0b','#8b5cf6','#ef4444','#06b6d4'];
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9999 }}>
      {Array.from({ length: 30 }).map((_, i) => (
        <div key={i} className="confetti-piece" style={{
          left: `${Math.random() * 100}%`,
          top: 0,
          background: colors[i % colors.length],
          borderRadius: Math.random() > 0.5 ? '50%' : '2px',
          width: 8 + Math.random() * 8,
          height: 8 + Math.random() * 8,
          animationDelay: `${Math.random() * 1}s`,
          animationDuration: `${2 + Math.random() * 1.5}s`,
        }} />
      ))}
    </div>
  );
}

export default function Dashboard() {
  const { currentUser, tasks, projects, users, activity, getUserById, gamification, ACHIEVEMENTS, getProjectHealth } = useApp();
  const navigate = useNavigate();
  const [showConfetti, setShowConfetti] = useState(false);

  const myTasks    = tasks.filter(t => t.assigneeId === currentUser?.id).slice(0, 5);
  const totalTasks = tasks.length;
  const inProgress = tasks.filter(t => t.status === 'In Progress').length;
  const overdue    = tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'Done').length;

  const statusGroups = ['To Do', 'In Progress', 'In Review', 'Done'].map(s => ({
    name: s, value: tasks.filter(t => t.status === s).length,
  })).filter(s => s.value > 0);

  const upcoming = [...tasks]
    .filter(t => t.dueDate && t.status !== 'Done')
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 4);

  const formatDate = (d) => {
    if (!d) return '';
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };
  const isOverdue = (d) => d && new Date(d) < new Date();

  const xpToNext   = 200 - (gamification.xp % 200);
  const xpPct      = ((gamification.xp % 200) / 200) * 100;

  const unlockedBadges  = ACHIEVEMENTS.filter(a => gamification.badges.includes(a.id));
  const lockedBadges    = ACHIEVEMENTS.filter(a => !gamification.badges.includes(a.id)).slice(0, 3);

  const topProject = projects.reduce((best, p) => {
    const h = getProjectHealth(p.id).score;
    return (!best || h > getProjectHealth(best.id).score) ? p : best;
  }, null);

  return (
    <div className="animate-slide-up">
      {showConfetti && <ConfettiPop />}

      <div className="page-header">
        <div>
          <h1 className="page-title">Welcome back, {currentUser?.name?.split(' ')[0]}! 👋</h1>
          <p className="page-subtitle">Here's what's happening with your projects.</p>
        </div>
        {currentUser?.role === 'Admin' && (
          <button id="new-project-header-btn" className="btn btn-primary" onClick={() => navigate('/projects')}>
            <Plus size={16} /> New Project
          </button>
        )}
      </div>

      {/* Stat cards */}
      <div className="stat-grid">
        <div className="stat-card">
          <div><div className="stat-value">{projects.length}</div><div className="stat-label">Total Projects</div></div>
          <div className="stat-icon blue"><FolderOpen size={22} /></div>
        </div>
        <div className="stat-card">
          <div><div className="stat-value">{totalTasks}</div><div className="stat-label">Total Tasks</div></div>
          <div className="stat-icon green"><ClipboardList size={22} /></div>
        </div>
        <div className="stat-card">
          <div><div className="stat-value">{inProgress}</div><div className="stat-label">In Progress</div></div>
          <div className="stat-icon orange"><RefreshCw size={22} /></div>
        </div>
        <div className="stat-card">
          <div><div className="stat-value" style={{ color: 'var(--danger)' }}>{overdue}</div><div className="stat-label">Overdue</div></div>
          <div className="stat-icon red"><Clock size={22} /></div>
        </div>
      </div>

      {/* Gamification XP card */}
      <div style={{
        background: 'linear-gradient(135deg, #4f6ef7 0%, #7c3aed 100%)',
        borderRadius: 'var(--radius-lg)', padding: '20px 24px', marginBottom: 20, color: '#fff',
        display: 'flex', alignItems: 'center', gap: 24,
      }}>
        <div>
          <div style={{ fontSize: 11, opacity: 0.75, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em' }}>Your Level</div>
          <div style={{ fontSize: 42, fontWeight: 900, lineHeight: 1 }}>Lv.{gamification.level}</div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, opacity: 0.85, marginBottom: 6 }}>
            <span>{gamification.xp} XP total</span>
            <span>{xpToNext} XP to Level {gamification.level + 1}</span>
          </div>
          <div style={{ background: 'rgba(255,255,255,.25)', borderRadius: 99, height: 10 }}>
            <div style={{ height: '100%', borderRadius: 99, background: '#fff', width: `${xpPct}%`, transition: 'width .5s' }} />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="streak-display">
            <span className="streak-flame">🔥</span>
            <div>
              <div style={{ fontSize: 24, fontWeight: 800, lineHeight: 1 }}>{gamification.streak}</div>
              <div style={{ fontSize: 11, opacity: 0.75 }}>Day Streak</div>
            </div>
          </div>
          <div style={{ width: 1, height: 40, background: 'rgba(255,255,255,.3)' }} />
          <div>
            <div style={{ fontSize: 24, fontWeight: 800, lineHeight: 1 }}>{gamification.pomodoros}</div>
            <div style={{ fontSize: 11, opacity: 0.75 }}>🍅 Pomodoros</div>
          </div>
        </div>
        {/* Badges */}
        <div style={{ display: 'flex', gap: 8 }}>
          {unlockedBadges.slice(0, 4).map(b => (
            <div key={b.id} title={`${b.name}: ${b.desc}`}
              style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, border: '2px solid rgba(255,255,255,.4)' }}>
              {b.emoji}
            </div>
          ))}
        </div>
      </div>

      {/* Achievement unlock CTA */}
      {lockedBadges.length > 0 && (
        <div className="card" style={{ marginBottom: 20, padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <Trophy size={22} style={{ color: 'var(--warning)', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <span style={{ fontWeight: 600, fontSize: 14 }}>Next achievement: </span>
            <span style={{ color: 'var(--gray-600)', fontSize: 13.5 }}>
              {lockedBadges[0].emoji} <strong>{lockedBadges[0].name}</strong> — {lockedBadges[0].desc} (+{lockedBadges[0].xp} XP)
            </span>
          </div>
          <button
            className="btn btn-outline btn-sm"
            onClick={() => { setShowConfetti(true); setTimeout(() => setShowConfetti(false), 3000); }}
          >
            🎉 Celebrate
          </button>
        </div>
      )}

      {/* Chart + Deadlines */}
      <div className="dash-grid" style={{ marginBottom: 20 }}>
        <div className="card card-pad">
          <div className="section-header">
            <span className="section-title">Task Overview</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <div style={{ position: 'relative', width: 180, height: 180, flexShrink: 0 }}>
              <ResponsiveContainer width={180} height={180}>
                <PieChart>
                  <Pie data={statusGroups} cx="50%" cy="50%" innerRadius={52} outerRadius={78} dataKey="value" paddingAngle={3}>
                    {statusGroups.map(s => <Cell key={s.name} fill={STATUS_COLORS[s.name] || '#94a3b8'} />)}
                  </Pie>
                  <Tooltip formatter={(v, n) => [v, n]} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                <div style={{ fontSize: 26, fontWeight: 700 }}>{totalTasks}</div>
                <div style={{ fontSize: 11, color: 'var(--gray-500)' }}>Total</div>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              {statusGroups.map(s => (
                <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 3, background: STATUS_COLORS[s.name], flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: 'var(--gray-600)', flex: 1 }}>{s.name}</span>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{s.value} ({Math.round(s.value / totalTasks * 100)}%)</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card card-pad">
          <div className="section-header">
            <span className="section-title">Upcoming Deadlines</span>
            <span className="view-all" onClick={() => navigate('/tasks')}>View all</span>
          </div>
          {upcoming.map((t, i) => {
            const proj = projects.find(p => p.id === t.projectId);
            const colors = ['#4f6ef7', '#22c55e', '#22c55e', '#8b5cf6'];
            return (
              <div key={t.id} className="deadline-item">
                <span className="deadline-dot" style={{ background: colors[i % colors.length] }} />
                <div className="deadline-info">
                  <div className="deadline-task">{t.title}</div>
                  <div className="deadline-project">{proj?.name || ''}</div>
                </div>
                <span className={`deadline-date ${isOverdue(t.dueDate) ? 'red' : 'normal'}`}>
                  {formatDate(t.dueDate)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Project health highlight */}
      {topProject && (
        <div className="card card-pad" style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div>
            <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '.06em' }}>Healthiest Project</div>
            <div style={{ fontSize: 16, fontWeight: 700, marginTop: 2 }}>{topProject.name}</div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', gap: 16 }}>
              {projects.map(p => {
                const h = getProjectHealth(p.id);
                return (
                  <div key={p.id} style={{ textAlign: 'center' }}>
                    <div className={`health-score ${h.label}`}>{h.score}</div>
                    <div style={{ fontSize: 10.5, color: 'var(--gray-500)', marginTop: 4, maxWidth: 70, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                  </div>
                );
              })}
            </div>
          </div>
          <button className="btn btn-outline btn-sm" onClick={() => navigate('/projects')}>View Projects</button>
        </div>
      )}

      {/* My Tasks */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ padding: '18px 20px 0' }}>
          <div className="section-header">
            <span className="section-title">My Tasks</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <select className="toolbar-select" style={{ height: 32, fontSize: 12.5 }}>
                <option>All Tasks</option>
                <option>In Progress</option>
                <option>To Do</option>
                <option>Done</option>
              </select>
              <select className="toolbar-select" style={{ height: 32, fontSize: 12.5 }}>
                <option>Sort by: Due Date</option>
                <option>Sort by: Priority</option>
              </select>
            </div>
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="task-table">
            <thead>
              <tr>
                <th>Task</th>
                <th>Project</th>
                <th>Assignee</th>
                <th>Status</th>
                <th>Due Date</th>
              </tr>
            </thead>
            <tbody>
              {myTasks.length === 0 && (
                <tr><td colSpan={5} className="no-data">No tasks assigned to you</td></tr>
              )}
              {myTasks.map(t => {
                const proj     = projects.find(p => p.id === t.projectId);
                const assignee = getUserById(t.assigneeId);
                return (
                  <tr key={t.id}>
                    <td style={{ fontWeight: 500 }}>{t.title}</td>
                    <td style={{ color: 'var(--gray-500)' }}>{proj?.name || '—'}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Avatar user={assignee} size={26} />
                        <span>{t.assigneeId === currentUser?.id ? 'Me' : assignee?.name?.split(' ')[0]}</span>
                      </div>
                    </td>
                    <td><StatusBadge status={t.status} /></td>
                    <td style={{ color: isOverdue(t.dueDate) ? 'var(--danger)' : 'var(--gray-700)' }}>
                      {formatDate(t.dueDate)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card card-pad">
        <div className="section-header">
          <span className="section-title">Recent Activity</span>
          <span className="view-all">View all</span>
        </div>
        {activity.slice(0, 5).map(a => {
          const u = getUserById(a.userId);
          return (
            <div key={a.id} className="activity-item">
              <Avatar user={u} size={30} />
              <div style={{ flex: 1 }}>
                <span className="activity-text">
                  <strong>{u?.name}</strong> {a.action} {a.target}{a.projectName ? ` in ${a.projectName}` : ''}
                </span>
              </div>
              <span className="activity-time">{a.time}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

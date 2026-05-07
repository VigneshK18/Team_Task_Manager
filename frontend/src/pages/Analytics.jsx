// src/pages/Analytics.jsx – Productivity Analytics & Activity Dashboard
import React, { useState } from 'react';
import { Users, Clock, TrendingUp, AlertTriangle, Download, MapPin, Wifi, WifiOff, Activity } from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { useApp } from '../context/AppContext.jsx';
import Avatar from '../components/Avatar.jsx';

const STATUS_COLOR = { online: '#22c55e', away: '#f59e0b', offline: '#94a3b8' };
const STATUS_ICON  = { online: <Wifi size={12} />, away: <Activity size={12} />, offline: <WifiOff size={12} /> };

function fmtMin(m) {
  if (!m) return '0h 0m';
  return `${Math.floor(m / 60)}h ${m % 60}m`;
}

const CATEGORY_COLORS = {
  Development: '#4f6ef7', Design: '#8b5cf6', Communication: '#06b6d4',
  Content: '#22c55e', Planning: '#f59e0b', Testing: '#ec4899',
  Documentation: '#14b8a6', Browser: '#3b82f6', Distraction: '#ef4444',
  Productivity: '#4f6ef7', Other: '#94a3b8',
};

// 7-day trend data (simulated)
const WEEK_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const weekTrend = WEEK_LABELS.map((day, i) => ({
  day,
  active: [320, 380, 410, 360, 430, 180, 120][i],
  idle:   [160, 100, 70,  120, 50,  300, 360][i],
  tasks:  [4, 6, 7, 5, 8, 2, 1][i],
}));

export default function Analytics() {
  const { users, tasks, timeEntries, appUsage, onlineStatus, projects, getProductivityScore, getUserById } = useApp();
  const [selectedUser, setSelectedUser] = useState('all');
  const [viewTab, setViewTab] = useState('overview'); // overview | activity | remote

  const today = new Date().toDateString();

  // --- Per-user productivity ---
  const userStats = users.map(u => {
    const ps = getProductivityScore(u.id);
    const status = onlineStatus[u.id] || {};
    const todayEntries = timeEntries.filter(e => e.userId === u.id && e.date === today);
    const tasksDone = tasks.filter(t => t.assigneeId === u.id && t.status === 'Done').length;
    return { user: u, ps, status, todayEntries, tasksDone };
  });

  // --- App usage for selected user / all ---
  const filteredUsage = selectedUser === 'all'
    ? appUsage.filter(a => a.date === today)
    : appUsage.filter(a => a.userId === selectedUser && a.date === today);

  // Aggregate by app
  const byApp = Object.values(
    filteredUsage.reduce((acc, a) => {
      if (!acc[a.app]) acc[a.app] = { app: a.app, category: a.category, minutes: 0, color: a.color };
      acc[a.app].minutes += a.minutes;
      return acc;
    }, {})
  ).sort((a, b) => b.minutes - a.minutes);

  // Aggregate by category
  const byCategory = Object.values(
    filteredUsage.reduce((acc, a) => {
      if (!acc[a.category]) acc[a.category] = { category: a.category, minutes: 0 };
      acc[a.category].minutes += a.minutes;
      return acc;
    }, {})
  ).sort((a, b) => b.minutes - a.minutes);

  const totalTracked = filteredUsage.reduce((s, a) => s + a.minutes, 0);
  const distractionMin = filteredUsage.filter(a => a.category === 'Distraction').reduce((s, a) => s + a.minutes, 0);
  const productiveMin = totalTracked - distractionMin;

  // Team avg productivity
  const avgScore = Math.round(userStats.reduce((s, u) => s + u.ps.score, 0) / userStats.length);
  const onlineCount = Object.values(onlineStatus).filter(s => s.status === 'online').length;

  // Bottleneck detection
  const bottlenecks = userStats.filter(u => u.ps.score < 40 || u.ps.distractionMins > 60);

  return (
    <div className="animate-slide-up">
      <div className="page-header">
        <div>
          <h1 className="page-title">Productivity Analytics 📊</h1>
          <p className="page-subtitle">Real-time activity tracking, app usage & remote team visibility.</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <select className="toolbar-select" value={selectedUser} onChange={e => setSelectedUser(e.target.value)}>
            <option value="all">All Members</option>
            {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
          <button className="btn btn-outline btn-sm"><Download size={14} /> Export</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="view-toggle" style={{ marginBottom: 20, display: 'inline-flex' }}>
        {[['overview','Overview'],['activity','App Activity'],['remote','Remote Status']].map(([id, label]) => (
          <button key={id} className={`view-toggle-btn${viewTab === id ? ' active' : ''}`} onClick={() => setViewTab(id)}>{label}</button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ── */}
      {viewTab === 'overview' && (
        <>
          {/* Summary stat cards */}
          <div className="stat-grid" style={{ marginBottom: 20 }}>
            <div className="stat-card">
              <div>
                <div className="stat-value" style={{ color: 'var(--primary)' }}>{avgScore}%</div>
                <div className="stat-label">Avg Team Productivity</div>
              </div>
              <div className="stat-icon blue"><TrendingUp size={22} /></div>
            </div>
            <div className="stat-card">
              <div>
                <div className="stat-value">{onlineCount}/{users.length}</div>
                <div className="stat-label">Online Now</div>
              </div>
              <div className="stat-icon green"><Users size={22} /></div>
            </div>
            <div className="stat-card">
              <div>
                <div className="stat-value">{fmtMin(productiveMin)}</div>
                <div className="stat-label">Productive Time (team)</div>
              </div>
              <div className="stat-icon orange"><Clock size={22} /></div>
            </div>
            <div className="stat-card">
              <div>
                <div className="stat-value" style={{ color: distractionMin > 60 ? 'var(--danger)' : 'var(--gray-800)' }}>{fmtMin(distractionMin)}</div>
                <div className="stat-label">Distraction Time</div>
              </div>
              <div className="stat-icon red"><AlertTriangle size={22} /></div>
            </div>
          </div>

          {/* Bottleneck alerts */}
          {bottlenecks.length > 0 && (
            <div style={{ background: '#fff8ec', border: '1.5px solid #f59e0b', borderRadius: 'var(--radius)', padding: '14px 18px', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <AlertTriangle size={16} style={{ color: '#d97706' }} />
                <span style={{ fontWeight: 700, fontSize: 14, color: '#92400e' }}>Workflow Bottlenecks Detected</span>
              </div>
              {bottlenecks.map(({ user, ps }) => (
                <div key={user.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', borderTop: '1px solid #fde68a' }}>
                  <Avatar user={user} size={28} />
                  <span style={{ fontSize: 13, color: '#92400e', flex: 1 }}>
                    <strong>{user.name}</strong> — productivity score <strong>{ps.score}%</strong>
                    {ps.distractionMins > 60 && ` · ${fmtMin(ps.distractionMins)} on distracting apps`}
                  </span>
                  <span style={{ fontSize: 11, color: '#d97706', fontWeight: 600, padding: '2px 8px', background: '#fef3c7', borderRadius: 99 }}>
                    Needs attention
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Member productivity table */}
          <div className="card" style={{ marginBottom: 20 }}>
            <div style={{ padding: '16px 20px 0' }}>
              <div className="section-title">Team Productivity — Today</div>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="task-table">
                <thead>
                  <tr>
                    <th>Member</th>
                    <th>Status</th>
                    <th>Hours Tracked</th>
                    <th>Active / Idle</th>
                    <th>Distraction</th>
                    <th>Score</th>
                    <th>Benchmark</th>
                  </tr>
                </thead>
                <tbody>
                  {userStats.map(({ user, ps, status }) => {
                    const st = status.status || 'offline';
                    const pct = ps.score;
                    const barColor = pct >= 70 ? 'var(--success)' : pct >= 40 ? 'var(--warning)' : 'var(--danger)';
                    return (
                      <tr key={user.id} style={{ cursor: 'pointer' }} onClick={() => setSelectedUser(user.id)}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ position: 'relative' }}>
                              <Avatar user={user} size={32} />
                              <span style={{ position: 'absolute', bottom: -2, right: -2, width: 10, height: 10, borderRadius: '50%', background: STATUS_COLOR[st], border: '2px solid var(--white)' }} />
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, fontSize: 13.5 }}>{user.name}</div>
                              <div style={{ fontSize: 11, color: 'var(--gray-500)' }}>{user.team}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 9px', borderRadius: 99, fontSize: 11.5, fontWeight: 600, background: STATUS_COLOR[st] + '22', color: STATUS_COLOR[st] }}>
                            {STATUS_ICON[st]} {st.charAt(0).toUpperCase() + st.slice(1)}
                          </span>
                        </td>
                        <td style={{ fontWeight: 600 }}>{fmtMin(ps.totalMinutes)}</td>
                        <td>
                          <div style={{ fontSize: 12.5 }}>
                            <span style={{ color: 'var(--success)', fontWeight: 600 }}>{fmtMin(ps.activeMinutes)}</span>
                            {' / '}
                            <span style={{ color: 'var(--gray-400)' }}>{fmtMin(ps.idleMinutes)}</span>
                          </div>
                        </td>
                        <td style={{ color: ps.distractionMins > 30 ? 'var(--danger)' : 'var(--gray-600)', fontWeight: ps.distractionMins > 30 ? 600 : 400 }}>
                          {fmtMin(ps.distractionMins)}
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ flex: 1, background: 'var(--gray-100)', borderRadius: 99, height: 7, minWidth: 80 }}>
                              <div style={{ height: '100%', borderRadius: 99, background: barColor, width: `${pct}%`, transition: 'width .4s' }} />
                            </div>
                            <span style={{ fontSize: 12.5, fontWeight: 700, color: barColor, width: 36 }}>{pct}%</span>
                          </div>
                        </td>
                        <td>
                          <span style={{ fontSize: 11.5, color: 'var(--gray-500)' }}>Target: 80%</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Weekly trend */}
          <div className="card card-pad">
            <div className="section-title" style={{ marginBottom: 16 }}>7-Day Activity Trend</div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={weekTrend} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--gray-100)" />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: 'var(--gray-500)' }} />
                <YAxis tick={{ fontSize: 12, fill: 'var(--gray-500)' }} />
                <Tooltip formatter={(v) => [fmtMin(v)]} />
                <Bar dataKey="active" fill="#4f6ef7" name="Active" radius={[3,3,0,0]} stackId="a" />
                <Bar dataKey="idle"   fill="#e5e7eb" name="Idle"   radius={[3,3,0,0]} stackId="a" />
                <Legend iconType="circle" iconSize={10} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      {/* ── APP ACTIVITY TAB ── */}
      {viewTab === 'activity' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
            {/* App usage bar */}
            <div className="card card-pad">
              <div className="section-title" style={{ marginBottom: 14 }}>Top Applications</div>
              {byApp.slice(0, 8).map(a => {
                const pct = Math.round((a.minutes / Math.max(totalTracked, 1)) * 100);
                const color = CATEGORY_COLORS[a.category] || '#94a3b8';
                return (
                  <div key={a.app} style={{ marginBottom: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 3 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        <span style={{ width: 10, height: 10, borderRadius: 3, background: a.color, flexShrink: 0 }} />
                        <span style={{ fontWeight: 500 }}>{a.app}</span>
                        <span style={{ fontSize: 11, padding: '1px 7px', borderRadius: 99, background: color + '22', color }}>{a.category}</span>
                      </div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <span style={{ color: 'var(--gray-500)', fontSize: 12 }}>{fmtMin(a.minutes)}</span>
                        <span style={{ fontWeight: 700, fontSize: 12.5, width: 36, textAlign: 'right' }}>{pct}%</span>
                      </div>
                    </div>
                    <div style={{ background: 'var(--gray-100)', borderRadius: 99, height: 7 }}>
                      <div style={{ height: '100%', borderRadius: 99, background: a.category === 'Distraction' ? 'var(--danger)' : color, width: `${pct}%`, transition: 'width .4s' }} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Category pie */}
            <div className="card card-pad">
              <div className="section-title" style={{ marginBottom: 14 }}>Time by Category</div>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={byCategory} dataKey="minutes" nameKey="category" cx="50%" cy="50%" outerRadius={80} paddingAngle={3}>
                    {byCategory.map(c => (
                      <Cell key={c.category} fill={c.category === 'Distraction' ? '#ef4444' : CATEGORY_COLORS[c.category] || '#94a3b8'} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v, n) => [fmtMin(v), n]} />
                  <Legend iconType="circle" iconSize={10} formatter={(value) => <span style={{ fontSize: 12 }}>{value}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Detailed time log */}
          <div className="card">
            <div style={{ padding: '16px 20px 0' }}>
              <div className="section-title">Time Log Entries — Today</div>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="task-table">
                <thead>
                  <tr>
                    <th>Member</th>
                    <th>Task</th>
                    <th>App</th>
                    <th>Category</th>
                    <th>Start</th>
                    <th>End</th>
                    <th>Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {timeEntries
                    .filter(e => e.date === today && (selectedUser === 'all' || e.userId === selectedUser))
                    .map(e => {
                      const u = getUserById(e.userId);
                      const t = tasks.find(tk => tk.id === e.taskId);
                      const cat = e.category;
                      const catColor = CATEGORY_COLORS[cat] || '#94a3b8';
                      return (
                        <tr key={e.id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <Avatar user={u} size={26} />
                              <span style={{ fontSize: 13 }}>{u?.name?.split(' ')[0]}</span>
                            </div>
                          </td>
                          <td style={{ fontWeight: 500, maxWidth: 180 }}>{t?.title || e.description}</td>
                          <td>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                              <span style={{ width: 8, height: 8, borderRadius: 2, background: e.app === 'YouTube' || e.app === 'Instagram' || e.app === 'Facebook' ? '#ef4444' : '#4f6ef7' }} />
                              {e.app}
                            </span>
                          </td>
                          <td>
                            <span style={{ padding: '2px 8px', borderRadius: 99, fontSize: 11.5, fontWeight: 600, background: catColor + '22', color: catColor }}>
                              {cat}
                            </span>
                          </td>
                          <td style={{ color: 'var(--gray-500)', fontSize: 12.5 }}>
                            {new Date(e.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td style={{ color: 'var(--gray-500)', fontSize: 12.5 }}>
                            {new Date(e.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{fmtMin(e.minutes)}</td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ── REMOTE STATUS TAB ── */}
      {viewTab === 'remote' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px,1fr))', gap: 16, marginBottom: 24 }}>
            {userStats.map(({ user, ps, status, todayEntries }) => {
              const st = status.status || 'offline';
              const lastSeen = status.lastSeen ? new Date(status.lastSeen) : null;
              const minsAgo = lastSeen ? Math.floor((Date.now() - lastSeen.getTime()) / 60000) : null;
              return (
                <div key={user.id} className="card" style={{ padding: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 14 }}>
                    <div style={{ position: 'relative' }}>
                      <Avatar user={user} size={44} />
                      <span style={{
                        position: 'absolute', bottom: 0, right: 0,
                        width: 13, height: 13, borderRadius: '50%',
                        background: STATUS_COLOR[st], border: '2px solid var(--white)',
                      }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>{user.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--gray-500)' }}>{user.role} · {user.team}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 3, fontSize: 12, color: 'var(--gray-500)' }}>
                        <MapPin size={11} />
                        {status.location || 'Unknown location'}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 99, fontSize: 12, fontWeight: 700, background: STATUS_COLOR[st] + '22', color: STATUS_COLOR[st] }}>
                        {STATUS_ICON[st]} {st}
                      </span>
                      {minsAgo !== null && st !== 'online' && (
                        <div style={{ fontSize: 10.5, color: 'var(--gray-400)', marginTop: 4 }}>
                          {minsAgo < 60 ? `${minsAgo}m ago` : `${Math.floor(minsAgo / 60)}h ago`}
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
                    {[
                      { label: 'Tracked Today', value: fmtMin(ps.totalMinutes), color: 'var(--primary)' },
                      { label: 'Productivity',  value: `${ps.score}%`,          color: ps.score >= 70 ? 'var(--success)' : ps.score >= 40 ? 'var(--warning)' : 'var(--danger)' },
                      { label: 'Timezone',      value: status.timezone || '—',  color: 'var(--gray-700)' },
                      { label: 'Work Hours',    value: `${status.workHoursStart || '—'} – ${status.workHoursEnd || '—'}`, color: 'var(--gray-700)' },
                    ].map(s => (
                      <div key={s.label} style={{ background: 'var(--gray-50)', borderRadius: 8, padding: '8px 10px' }}>
                        <div style={{ fontSize: 10.5, color: 'var(--gray-500)', marginBottom: 2 }}>{s.label}</div>
                        <div style={{ fontSize: 13.5, fontWeight: 700, color: s.color }}>{s.value}</div>
                      </div>
                    ))}
                  </div>

                  {/* Today's top app */}
                  {appUsage.filter(a => a.userId === user.id && a.date === today).slice(0, 1).map(a => (
                    <div key={a.app} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: 'var(--gray-600)' }}>
                      <span style={{ width: 8, height: 8, borderRadius: 2, background: a.color }} />
                      Currently on: <strong>{a.app}</strong>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>

          {/* World clock / timezone summary */}
          <div className="card card-pad">
            <div className="section-title" style={{ marginBottom: 14 }}>Team Timezone Overview</div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {users.map(u => {
                const status = onlineStatus[u.id] || {};
                const st = status.status || 'offline';
                return (
                  <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderRadius: 10, border: `1.5px solid ${STATUS_COLOR[st]}44`, background: STATUS_COLOR[st] + '11' }}>
                    <Avatar user={u} size={28} />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{u.name.split(' ')[0]}</div>
                      <div style={{ fontSize: 11, color: 'var(--gray-500)' }}>{status.timezone || 'IST'}</div>
                    </div>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: STATUS_COLOR[st] }} />
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// src/pages/Reports.jsx
import React, { useState } from 'react';
import { Download } from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { useApp } from '../context/AppContext.jsx';
import Avatar from '../components/Avatar.jsx';

const STATUS_COLORS = { 'To Do':'#94a3b8','In Progress':'#3b82f6','In Review':'#f59e0b','Done':'#22c55e' };

export default function Reports() {
  const { tasks, projects, users, getUserById } = useApp();
  const [range, setRange] = useState('May 1 – May 31, 2025');

  const totalTasks  = tasks.length;
  const completed   = tasks.filter(t => t.status === 'Done').length;
  const inProgress  = tasks.filter(t => t.status === 'In Progress').length;
  const overdue     = tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'Done').length;
  const inReview    = tasks.filter(t => t.status === 'In Review').length;
  const completionRate = totalTasks ? Math.round(completed / totalTasks * 100) : 0;

  const byStatus = ['To Do','In Progress','In Review','Done'].map(s => ({
    name: s, value: tasks.filter(t => t.status === s).length,
  }));

  const byProject = projects.map(p => ({
    name: p.name.length > 14 ? p.name.slice(0,14)+'…' : p.name,
    tasks: tasks.filter(t => t.projectId === p.id).length,
    done:  tasks.filter(t => t.projectId === p.id && t.status === 'Done').length,
    color: p.color,
  }));

  const overTime = [
    { date:'May 1',  created:3,  completed:1 },
    { date:'May 5',  created:5,  completed:2 },
    { date:'May 10', created:8,  completed:4 },
    { date:'May 15', created:10, completed:6 },
    { date:'May 20', created:12, completed:8 },
    { date:'May 25', created:14, completed:10 },
    { date:'May 30', created:12, completed:8  },
  ];

  // Top performers
  const performers = users.map(u => ({
    user: u,
    done: tasks.filter(t => t.assigneeId === u.id && t.status === 'Done').length,
    total: tasks.filter(t => t.assigneeId === u.id).length,
  })).sort((a,b) => b.done - a.done).slice(0, 5);

  return (
    <div className="animate-slide-up">
      <div className="page-header">
        <div>
          <h1 className="page-title">Reports</h1>
          <p className="page-subtitle">Analyze your team's productivity and project progress.</p>
        </div>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          <select className="toolbar-select">{['May 1 – May 31, 2025'].map(r=><option key={r}>{r}</option>)}</select>
          <button className="btn btn-outline btn-sm"><Download size={14} /> Export</button>
        </div>
      </div>

      {/* Summary stats */}
      <div className="stat-grid" style={{ marginBottom:20 }}>
        <div className="stat-card">
          <div><div className="stat-value">{totalTasks}</div><div className="stat-label">Total Tasks</div></div>
          <div className="stat-icon blue" />
        </div>
        <div className="stat-card">
          <div><div className="stat-value" style={{ color:'var(--success)' }}>{completed}</div><div className="stat-label">Completed</div></div>
          <div className="stat-icon green" />
        </div>
        <div className="stat-card">
          <div><div className="stat-value" style={{ color:'var(--warning)' }}>{inProgress}</div><div className="stat-label">In Progress</div></div>
          <div className="stat-icon orange" />
        </div>
        <div className="stat-card">
          <div><div className="stat-value">{inReview}</div><div className="stat-label">In Review</div></div>
          <div className="stat-icon blue" />
        </div>
      </div>

      {/* Completion rate banner */}
      <div className="card card-pad" style={{ marginBottom:20, display:'flex', alignItems:'center', gap:24 }}>
        <div>
          <div style={{ fontSize:42, fontWeight:800, color:'var(--primary)' }}>{completionRate}%</div>
          <div style={{ fontSize:14, color:'var(--gray-500)' }}>Completion Rate</div>
        </div>
        <div style={{ flex:1 }}>
          <div className="progress-bar-wrap" style={{ height:14 }}>
            <div className="progress-bar-fill" style={{ width:`${completionRate}%`, background:'var(--primary)' }} />
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'var(--gray-500)', marginTop:6 }}>
            <span>{completed} completed</span>
            <span>{totalTasks - completed} remaining</span>
          </div>
        </div>
      </div>

      <div className="reports-grid" style={{ marginBottom:20 }}>
        {/* Tasks by Status (Pie) */}
        <div className="card card-pad">
          <div className="section-header"><span className="section-title">Tasks by Status</span></div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={byStatus} dataKey="value" cx="50%" cy="50%" outerRadius={80} paddingAngle={3}>
                  {byStatus.map(s => <Cell key={s.name} fill={STATUS_COLORS[s.name]} />)}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" iconSize={10} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tasks by Project (Bar) */}
        <div className="card card-pad">
          <div className="section-header"><span className="section-title">Tasks by Project</span></div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byProject} margin={{ top:5, right:5, bottom:20, left:-20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--gray-100)" />
                <XAxis dataKey="name" tick={{ fontSize:11, fill:'var(--gray-500)' }} angle={-20} textAnchor="end" />
                <YAxis tick={{ fontSize:11, fill:'var(--gray-500)' }} />
                <Tooltip />
                <Bar dataKey="tasks" fill="#4f6ef7" radius={[4,4,0,0]} name="Total" />
                <Bar dataKey="done"  fill="#22c55e" radius={[4,4,0,0]} name="Done" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tasks over time (Line) */}
        <div className="card card-pad">
          <div className="section-header"><span className="section-title">Tasks Over Time</span></div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={overTime} margin={{ top:5, right:5, bottom:5, left:-20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--gray-100)" />
                <XAxis dataKey="date" tick={{ fontSize:11, fill:'var(--gray-500)' }} />
                <YAxis tick={{ fontSize:11, fill:'var(--gray-500)' }} />
                <Tooltip />
                <Line type="monotone" dataKey="created"   stroke="#4f6ef7" strokeWidth={2} dot={false} name="Created"   />
                <Line type="monotone" dataKey="completed" stroke="#22c55e" strokeWidth={2} dot={false} name="Completed" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top performers */}
        <div className="card card-pad">
          <div className="section-header"><span className="section-title">Top Performers</span></div>
          {performers.map((p, i) => (
            <div key={p.user.id} className="leaderboard-item">
              <span className="rank">#{i+1}</span>
              <Avatar user={p.user} size={32} />
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13.5, fontWeight:600 }}>{p.user.name}</div>
                <div style={{ fontSize:11.5, color:'var(--gray-500)' }}>{p.done} tasks completed</div>
              </div>
              <div style={{ textAlign:'right' }}>
                <div style={{ fontSize:13, fontWeight:700, color:'var(--primary)' }}>{p.total} tasks</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

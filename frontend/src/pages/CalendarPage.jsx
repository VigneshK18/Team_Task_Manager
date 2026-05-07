// src/pages/CalendarPage.jsx
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, format, isSameMonth, isToday, isSameDay, parseISO
} from 'date-fns';

const EVENT_COLORS = ['','green','orange','purple',''];

export default function CalendarPage() {
  const { tasks, projects } = useApp();
  const [current, setCurrent] = useState(new Date(2025, 4, 1)); // May 2025
  const [view, setView]       = useState('Month');
  const [filterProj, setFilterProj] = useState('All');

  const monthStart = startOfMonth(current);
  const monthEnd   = endOfMonth(current);
  const calStart   = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calEnd     = endOfWeek(monthEnd,     { weekStartsOn: 0 });
  const days       = eachDayOfInterval({ start: calStart, end: calEnd });

  const tasksByDay = (day) => {
    return tasks
      .filter(t => {
        if (!t.dueDate) return false;
        const match = isSameDay(parseISO(t.dueDate), day);
        const matchProj = filterProj === 'All' || t.projectId === filterProj;
        return match && matchProj;
      })
      .slice(0, 3);
  };

  const getColor = (projectId) => {
    const idx = projects.findIndex(p => p.id === projectId);
    return EVENT_COLORS[idx % EVENT_COLORS.length] || '';
  };

  const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  return (
    <div className="animate-slide-up">
      <div className="page-header">
        <div>
          <h1 className="page-title">Calendar</h1>
          <p className="page-subtitle">View tasks and deadlines in calendar.</p>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          {['Month','Week','Day'].map(v => (
            <button key={v} className={`btn btn-sm ${view===v ? 'btn-primary' : 'btn-outline'}`} onClick={() => setView(v)}>{v}</button>
          ))}
        </div>
      </div>

      <div className="card card-pad">
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:18 }}>
          <button className="icon-btn" onClick={() => setCurrent(d => new Date(d.getFullYear(), d.getMonth()-1, 1))}><ChevronLeft size={16} /></button>
          <span style={{ fontWeight:700, fontSize:16 }}>{format(current, 'MMMM yyyy')}</span>
          <button className="icon-btn" onClick={() => setCurrent(d => new Date(d.getFullYear(), d.getMonth()+1, 1))}><ChevronRight size={16} /></button>
          <button className="btn btn-sm btn-outline" style={{ marginLeft:8 }} onClick={() => setCurrent(new Date())}>Today</button>
          <select className="toolbar-select" style={{ marginLeft:'auto' }} value={filterProj} onChange={e => setFilterProj(e.target.value)}>
            <option value="All">All Projects</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>

        <div className="calendar-grid" style={{ border:'1px solid var(--gray-200)', borderRadius: 8, overflow:'hidden' }}>
          {DAYS.map(d => (
            <div key={d} className="cal-header-cell">{d}</div>
          ))}
          {days.map((day, i) => {
            const dayTasks = tasksByDay(day);
            return (
              <div key={i} className="cal-cell" style={{ background: isToday(day) ? '#f0f4ff' : 'transparent' }}>
                <div className={`cal-day-num${isToday(day)?' today':''}${!isSameMonth(day, current)?' other-month':''}`}>
                  {format(day, 'd')}
                </div>
                {dayTasks.map(t => {
                  const colorCls = getColor(t.projectId);
                  return (
                    <div key={t.id} className={`cal-event ${colorCls}`} title={t.title}>
                      {t.title}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

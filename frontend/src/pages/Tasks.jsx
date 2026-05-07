// src/pages/Tasks.jsx – Table + Kanban board with view toggle
import React, { useState } from 'react';
import { Plus, Search, MoreHorizontal, Pencil, Trash2, ChevronLeft, ChevronRight, List, Columns } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import Modal from '../components/Modal.jsx';
import StatusBadge, { PriorityBadge } from '../components/StatusBadge.jsx';
import Avatar from '../components/Avatar.jsx';
import KanbanBoard from '../components/KanbanBoard.jsx';

const STATUSES   = ['To Do', 'In Progress', 'In Review', 'Done'];
const PRIORITIES = ['High', 'Medium', 'Low'];
const PAGE_SIZE  = 8;

function TaskModal({ task, onClose, onSave, defaultStatus }) {
  const { projects, users } = useApp();
  const [form, setForm] = useState({
    title:       task?.title       || '',
    description: task?.description || '',
    projectId:   task?.projectId   || (projects[0]?.id || ''),
    assigneeId:  task?.assigneeId  || '',
    status:      task?.status      || defaultStatus || 'To Do',
    priority:    task?.priority    || 'Medium',
    dueDate:     task?.dueDate     || '',
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const submit = (e) => { e.preventDefault(); if (!form.title.trim()) return; onSave(form); };

  return (
    <Modal title={task ? 'Edit Task' : 'New Task'} onClose={onClose}
      footer={<>
        <button className="btn btn-outline" onClick={onClose}>Cancel</button>
        <button id="save-task-btn" className="btn btn-primary" onClick={submit}>{task ? 'Save Changes' : 'Create Task'}</button>
      </>}>
      <form onSubmit={submit}>
        <div className="form-group">
          <label className="form-label">Task Title *</label>
          <input id="task-title" className="form-control" value={form.title} onChange={e => set('title', e.target.value)} placeholder="What needs to be done?" required />
        </div>
        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea className="form-control" value={form.description} onChange={e => set('description', e.target.value)} placeholder="Add more details..." />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Project</label>
            <select className="form-control" value={form.projectId} onChange={e => set('projectId', e.target.value)}>
              <option value="">No Project</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Assignee</label>
            <select className="form-control" value={form.assigneeId} onChange={e => set('assigneeId', e.target.value)}>
              <option value="">Unassigned</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Status</label>
            <select className="form-control" value={form.status} onChange={e => set('status', e.target.value)}>
              {STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Priority</label>
            <select className="form-control" value={form.priority} onChange={e => set('priority', e.target.value)}>
              {PRIORITIES.map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Due Date</label>
          <input type="date" className="form-control" value={form.dueDate} onChange={e => set('dueDate', e.target.value)} />
        </div>
      </form>
    </Modal>
  );
}

export default function Tasks() {
  const { tasks, projects, users, currentUser, createTask, updateTask, deleteTask, getUserById } = useApp();
  const [view,       setView]       = useState('table'); // 'table' | 'kanban'
  const [showModal,  setShowModal]  = useState(false);
  const [editTask,   setEditTask]   = useState(null);
  const [defStatus,  setDefStatus]  = useState('To Do');
  const [search,     setSearch]     = useState('');
  const [filterProj, setFilterProj] = useState('All');
  const [filterStat, setFilterStat] = useState('All');
  const [openMenu,   setOpenMenu]   = useState(null);
  const [page,       setPage]       = useState(1);

  const filtered = tasks.filter(t => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase());
    const matchProj   = filterProj === 'All' || t.projectId === filterProj;
    const matchStat   = filterStat === 'All' || t.status === filterStat;
    return matchSearch && matchProj && matchStat;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged      = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSave = (form) => {
    if (editTask) updateTask(editTask.id, form);
    else          createTask(form);
    setShowModal(false); setEditTask(null);
  };

  const openNew = (status = 'To Do') => {
    setEditTask(null); setDefStatus(status); setShowModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this task?')) deleteTask(id);
    setOpenMenu(null);
  };

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const isOverdue = (t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'Done';

  return (
    <div className="animate-slide-up">
      <div className="page-header">
        <div>
          <h1 className="page-title">Tasks</h1>
          <p className="page-subtitle">Track and manage all your tasks.</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {/* View toggle */}
          <div className="view-toggle">
            <button id="list-view-btn" className={`view-toggle-btn${view === 'table' ? ' active' : ''}`} onClick={() => setView('table')}>
              <List size={14} /> List
            </button>
            <button id="kanban-view-btn" className={`view-toggle-btn${view === 'kanban' ? ' active' : ''}`} onClick={() => setView('kanban')}>
              <Columns size={14} /> Board
            </button>
          </div>
          <button id="new-task-btn" className="btn btn-primary" onClick={() => openNew()}>
            <Plus size={16} /> New Task
          </button>
        </div>
      </div>

      {/* Filters – only relevant for list view */}
      {view === 'table' && (
        <div className="toolbar" style={{ flexWrap: 'wrap', gap: 8 }}>
          <select className="toolbar-select" value={filterStat} onChange={e => { setFilterStat(e.target.value); setPage(1); }}>
            <option value="All">All Status</option>
            {STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
          <select className="toolbar-select" value={filterProj} onChange={e => { setFilterProj(e.target.value); setPage(1); }}>
            <option value="All">All Projects</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <div className="search-box" style={{ marginLeft: 'auto' }}>
            <Search size={14} style={{ color: 'var(--gray-400)' }} />
            <input placeholder="Search tasks..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} style={{ width: 200 }} />
          </div>
        </div>
      )}

      {/* Kanban view */}
      {view === 'kanban' && (
        <KanbanBoard
          tasks={filtered}
          onEditTask={(t) => { setEditTask(t); setShowModal(true); }}
          onNewTask={(status) => openNew(status)}
        />
      )}

      {/* Table view */}
      {view === 'table' && (
        <div className="card" style={{ overflowX: 'auto' }}>
          <table className="task-table">
            <thead>
              <tr>
                <th>Task</th>
                <th>Project</th>
                <th>Assignee</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Due Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 && (
                <tr><td colSpan={7} className="no-data">No tasks found</td></tr>
              )}
              {paged.map(t => {
                const proj     = projects.find(p => p.id === t.projectId);
                const assignee = getUserById(t.assigneeId);
                return (
                  <tr key={t.id}>
                    <td style={{ fontWeight: 500, maxWidth: 200 }}>{t.title}</td>
                    <td>
                      {proj
                        ? <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: proj.color, flexShrink: 0 }} />
                            {proj.name}
                          </span>
                        : <span style={{ color: 'var(--gray-400)' }}>—</span>}
                    </td>
                    <td>
                      {assignee
                        ? <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Avatar user={assignee} size={26} />
                            <span style={{ fontSize: 13 }}>{assignee.name.split(' ')[0]}</span>
                          </div>
                        : <span style={{ color: 'var(--gray-400)' }}>Unassigned</span>}
                    </td>
                    <td><StatusBadge status={t.status} /></td>
                    <td><PriorityBadge priority={t.priority} /></td>
                    <td style={{ color: isOverdue(t) ? 'var(--danger)' : 'var(--gray-700)', fontWeight: isOverdue(t) ? 600 : 400 }}>
                      {formatDate(t.dueDate)}
                    </td>
                    <td>
                      <div className="dropdown-wrapper" style={{ position: 'relative' }}>
                        <button id={`task-menu-${t.id}`} className="icon-btn" style={{ width: 30, height: 30 }}
                          onClick={() => setOpenMenu(openMenu === t.id ? null : t.id)}>
                          <MoreHorizontal size={15} />
                        </button>
                        {openMenu === t.id && (
                          <div className="dropdown-menu" style={{ right: 0 }}>
                            <div className="dropdown-item" onClick={() => { setEditTask(t); setShowModal(true); setOpenMenu(null); }}>
                              <Pencil size={14} /> Edit
                            </div>
                            <div className="dropdown-item danger" onClick={() => handleDelete(t.id)}>
                              <Trash2 size={14} /> Delete
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div style={{ padding: '10px 14px', display: 'flex', alignItems: 'center' }}>
            <span className="pagination-info">Showing {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} tasks</span>
            <div className="pagination">
              <button className="page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}><ChevronLeft size={14} /></button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, 5).map(n => (
                <button key={n} className={`page-btn${page === n ? ' active' : ''}`} onClick={() => setPage(n)}>{n}</button>
              ))}
              <button className="page-btn" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}><ChevronRight size={14} /></button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <TaskModal task={editTask} defaultStatus={defStatus} onClose={() => { setShowModal(false); setEditTask(null); }} onSave={handleSave} />
      )}
    </div>
  );
}

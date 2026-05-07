// src/pages/Projects.jsx
import React, { useState } from 'react';
import { Plus, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import Modal from '../components/Modal.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { COLORS } from '../data/store.js';

function ProjectModal({ project, onClose, onSave }) {
  const { users } = useApp();
  const [form, setForm] = useState({
    name:        project?.name        || '',
    description: project?.description || '',
    status:      project?.status      || 'Not Started',
    color:       project?.color       || COLORS[0],
    startDate:   project?.startDate   || '',
    endDate:     project?.endDate     || '',
    members:     project?.members     || [],
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const toggleMember = (id) => {
    set('members', form.members.includes(id)
      ? form.members.filter(m => m !== id)
      : [...form.members, id]);
  };
  const submit = (e) => { e.preventDefault(); if (!form.name.trim()) return; onSave(form); };

  return (
    <Modal title={project ? 'Edit Project' : 'New Project'} onClose={onClose}
      footer={<>
        <button className="btn btn-outline" onClick={onClose}>Cancel</button>
        <button id="save-project-btn" className="btn btn-primary" onClick={submit}>
          {project ? 'Save Changes' : 'Create Project'}
        </button>
      </>}>
      <form onSubmit={submit}>
        <div className="form-group">
          <label className="form-label">Project Name *</label>
          <input id="proj-name" className="form-control" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Enter project name" required />
        </div>
        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea className="form-control" value={form.description} onChange={e => set('description', e.target.value)} placeholder="What is this project about?" />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Start Date</label>
            <input type="date" className="form-control" value={form.startDate} onChange={e => set('startDate', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">End Date</label>
            <input type="date" className="form-control" value={form.endDate} onChange={e => set('endDate', e.target.value)} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Status</label>
            <select className="form-control" value={form.status} onChange={e => set('status', e.target.value)}>
              {['Not Started','In Progress','On Hold','Completed'].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Color</label>
            <div style={{ display:'flex', gap:8, marginTop:8 }}>
              {COLORS.map(c => (
                <div key={c} onClick={() => set('color', c)}
                  style={{ width:26, height:26, borderRadius:'50%', background:c, cursor:'pointer',
                    outline: form.color===c ? `3px solid ${c}` : 'none', outlineOffset:2 }} />
              ))}
            </div>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Team Members</label>
          <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginTop:4 }}>
            {users.map(u => (
              <div key={u.id} onClick={() => toggleMember(u.id)}
                style={{ display:'flex', alignItems:'center', gap:6, padding:'5px 10px', borderRadius:99,
                  border:`1.5px solid ${form.members.includes(u.id) ? 'var(--primary)' : 'var(--gray-200)'}`,
                  background: form.members.includes(u.id) ? 'var(--primary-light)' : 'transparent',
                  color: form.members.includes(u.id) ? 'var(--primary)' : 'var(--gray-700)',
                  fontSize:12.5, cursor:'pointer', transition:'all .15s' }}>
                <span style={{ width:8, height:8, borderRadius:'50%', background: form.members.includes(u.id) ? 'var(--primary)' : 'var(--gray-300)' }} />
                {u.name}
              </div>
            ))}
          </div>
        </div>
      </form>
    </Modal>
  );
}

export default function Projects() {
  const { projects, tasks, users, currentUser, createProject, updateProject, deleteProject, getUserById } = useApp();
  const [showModal, setShowModal]       = useState(false);
  const [editProject, setEditProject]   = useState(null);
  const [filterStatus, setFilterStatus] = useState('All');
  const [search, setSearch]             = useState('');
  const [openMenu, setOpenMenu]         = useState(null);

  const filtered = projects.filter(p => {
    const matchStatus = filterStatus === 'All' || p.status === filterStatus;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const handleSave = (form) => {
    if (editProject) updateProject(editProject.id, form);
    else             createProject(form);
    setShowModal(false); setEditProject(null);
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this project and all its tasks?')) deleteProject(id);
    setOpenMenu(null);
  };

  const taskCountFor = (pid) => tasks.filter(t => t.projectId === pid).length;

  return (
    <div className="animate-slide-up">
      <div className="page-header">
        <div>
          <h1 className="page-title">Projects</h1>
          <p className="page-subtitle">Manage all your projects in one place.</p>
        </div>
        {currentUser?.role === 'Admin' && (
          <button id="new-project-btn" className="btn btn-primary" onClick={() => { setEditProject(null); setShowModal(true); }}>
            <Plus size={16} /> New Project
          </button>
        )}
      </div>

      <div className="toolbar">
        <select id="proj-status-filter" className="toolbar-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option>All Projects</option>
          {['Not Started','In Progress','On Hold','Completed'].map(s => <option key={s}>{s}</option>)}
        </select>
        <div className="search-box" style={{ marginLeft:'auto' }}>
          <input placeholder="Search projects..." value={search} onChange={e => setSearch(e.target.value)} style={{ width:200 }} />
        </div>
      </div>

      <div className="card" style={{ overflowX:'auto' }}>
        <table className="projects-table">
          <thead>
            <tr>
              <th>Project Name</th>
              <th>Description</th>
              <th>Members</th>
              <th>Tasks</th>
              <th>Progress</th>
              <th>Status</th>
              {currentUser?.role === 'Admin' && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="no-data">No projects found</td></tr>
            )}
            {filtered.map((p, i) => (
              <tr key={p.id}>
                <td>
                  <div className="project-name-cell">
                    <span className="project-color-dot" style={{ background: p.color || COLORS[i % COLORS.length] }} />
                    <span style={{ fontWeight:600, color:'var(--gray-900)' }}>{p.name}</span>
                  </div>
                </td>
                <td style={{ color:'var(--gray-500)', maxWidth:200, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.description}</td>
                <td>
                  <div className="members-stack">
                    {(p.members||[]).slice(0,4).map(mid => {
                      const u = getUserById(mid);
                      if (!u) return null;
                      const bg = ['#4f6ef7','#22c55e','#f59e0b','#8b5cf6'][p.members.indexOf(mid) % 4];
                      return (
                        <div key={mid} className="avatar-sm" title={u.name} style={{ background: bg }}>
                          {u.name[0]}
                        </div>
                      );
                    })}
                    {(p.members||[]).length > 4 && (
                      <div className="avatar-sm" style={{ background:'var(--gray-400)' }}>+{p.members.length-4}</div>
                    )}
                  </div>
                </td>
                <td>{taskCountFor(p.id)}</td>
                <td style={{ minWidth:120 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <div className="progress-bar-wrap" style={{ flex:1 }}>
                      <div className="progress-bar-fill" style={{ width:`${p.progress||0}%`, background: p.color }} />
                    </div>
                    <span style={{ fontSize:12, fontWeight:600, color:'var(--gray-600)', width:32 }}>{p.progress||0}%</span>
                  </div>
                </td>
                <td><StatusBadge status={p.status} /></td>
                {currentUser?.role === 'Admin' && (
                  <td>
                    <div className="dropdown-wrapper" style={{ position:'relative' }}>
                      <button id={`proj-menu-${p.id}`} className="icon-btn" style={{ width:30, height:30 }}
                        onClick={() => setOpenMenu(openMenu===p.id ? null : p.id)}>
                        <MoreHorizontal size={15} />
                      </button>
                      {openMenu === p.id && (
                        <div className="dropdown-menu" style={{ right:0 }}>
                          <div className="dropdown-item" onClick={() => { setEditProject(p); setShowModal(true); setOpenMenu(null); }}>
                            <Pencil size={14} /> Edit
                          </div>
                          <div className="dropdown-item danger" onClick={() => handleDelete(p.id)}>
                            <Trash2 size={14} /> Delete
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ padding:'10px 14px', fontSize:12.5, color:'var(--gray-500)' }}>
          Showing {filtered.length} of {projects.length} projects
        </div>
      </div>

      {showModal && (
        <ProjectModal project={editProject} onClose={() => { setShowModal(false); setEditProject(null); }} onSave={handleSave} />
      )}
    </div>
  );
}

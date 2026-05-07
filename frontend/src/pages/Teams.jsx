// src/pages/Teams.jsx
import React, { useState } from 'react';
import { Plus, MoreHorizontal, Trash2, Mail } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import Modal from '../components/Modal.jsx';
import Avatar from '../components/Avatar.jsx';

function InviteModal({ onClose, onSave }) {
  const [form, setForm] = useState({ name:'', email:'', role:'Member', team:'' });
  const set = (k,v) => setForm(f => ({...f,[k]:v}));
  const submit = (e) => { e.preventDefault(); if (!form.name.trim() || !form.email.trim()) return; onSave(form); };
  return (
    <Modal title="Invite Member" onClose={onClose}
      footer={<>
        <button className="btn btn-outline" onClick={onClose}>Cancel</button>
        <button id="invite-member-btn" className="btn btn-primary" onClick={submit}>Send Invite</button>
      </>}>
      <form onSubmit={submit}>
        <div className="form-group">
          <label className="form-label">Full Name *</label>
          <input id="member-name" className="form-control" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Enter full name" required />
        </div>
        <div className="form-group">
          <label className="form-label">Email Address *</label>
          <input type="email" id="member-email" className="form-control" value={form.email} onChange={e => set('email', e.target.value)} placeholder="name@company.com" required />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Role</label>
            <select className="form-control" value={form.role} onChange={e => set('role', e.target.value)}>
              <option>Admin</option>
              <option>Member</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Team</label>
            <input className="form-control" value={form.team} onChange={e => set('team', e.target.value)} placeholder="e.g. Development" />
          </div>
        </div>
      </form>
    </Modal>
  );
}

export default function Teams() {
  const { users, currentUser, inviteMember, removeUser } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch]       = useState('');
  const [filterTeam, setFilterTeam] = useState('All');
  const [openMenu, setOpenMenu]   = useState(null);

  const teams = ['All', ...Array.from(new Set(users.map(u => u.team).filter(Boolean)))];

  const filtered = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchTeam   = filterTeam === 'All' || u.team === filterTeam;
    return matchSearch && matchTeam;
  });

  const handleInvite = (form) => {
    inviteMember(form);
    setShowModal(false);
  };

  const handleRemove = (id) => {
    if (id === currentUser?.id) return alert("You can't remove yourself.");
    if (window.confirm('Remove this member?')) removeUser(id);
    setOpenMenu(null);
  };

  return (
    <div className="animate-slide-up">
      <div className="page-header">
        <div>
          <h1 className="page-title">Teams</h1>
          <p className="page-subtitle">Manage your team members and their roles.</p>
        </div>
        {currentUser?.role === 'Admin' && (
          <button id="invite-btn" className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={16} /> Invite Member
          </button>
        )}
      </div>

      <div className="toolbar">
        <select className="toolbar-select" value={filterTeam} onChange={e => setFilterTeam(e.target.value)}>
          {teams.map(t => <option key={t}>{t === 'All' ? 'All Teams' : t}</option>)}
        </select>
        <div className="search-box" style={{ marginLeft:'auto' }}>
          <input placeholder="Search members..." value={search} onChange={e => setSearch(e.target.value)} style={{ width:220 }} />
        </div>
      </div>

      <div className="card" style={{ overflowX:'auto' }}>
        <table className="projects-table">
          <thead>
            <tr>
              <th>Member</th>
              <th>Email</th>
              <th>Role</th>
              <th>Team</th>
              <th>Joined On</th>
              {currentUser?.role === 'Admin' && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="no-data">No members found</td></tr>
            )}
            {filtered.map(u => (
              <tr key={u.id}>
                <td>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <Avatar user={u} size={34} />
                    <div>
                      <div className="member-name">{u.name}</div>
                    </div>
                  </div>
                </td>
                <td style={{ color:'var(--gray-500)' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                    <Mail size={13} style={{ color:'var(--gray-400)' }} />
                    {u.email}
                  </div>
                </td>
                <td>
                  <span style={{
                    padding:'3px 10px', borderRadius:99, fontSize:12, fontWeight:600,
                    background: u.role==='Admin' ? 'var(--primary-light)' : 'var(--gray-100)',
                    color: u.role==='Admin' ? 'var(--primary)' : 'var(--gray-600)',
                  }}>{u.role}</span>
                </td>
                <td style={{ color:'var(--gray-600)' }}>{u.team || '—'}</td>
                <td style={{ color:'var(--gray-500)' }}>{u.joinedOn ? new Date(u.joinedOn).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' }) : '—'}</td>
                {currentUser?.role === 'Admin' && (
                  <td>
                    <div className="dropdown-wrapper" style={{ position:'relative' }}>
                      <button id={`team-menu-${u.id}`} className="icon-btn" style={{ width:30, height:30 }}
                        onClick={() => setOpenMenu(openMenu===u.id ? null : u.id)}>
                        <MoreHorizontal size={15} />
                      </button>
                      {openMenu === u.id && (
                        <div className="dropdown-menu" style={{ right:0 }}>
                          <div className="dropdown-item danger" onClick={() => handleRemove(u.id)}>
                            <Trash2 size={14} /> Remove
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
          Showing {filtered.length} of {users.length} members
        </div>
      </div>

      {showModal && <InviteModal onClose={() => setShowModal(false)} onSave={handleInvite} />}
    </div>
  );
}

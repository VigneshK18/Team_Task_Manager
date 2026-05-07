// src/pages/Profile.jsx
import React from 'react';
import { MapPin, Phone, Mail, Calendar } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import Avatar from '../components/Avatar.jsx';

export default function Profile() {
  const { currentUser, tasks, activity } = useApp();
  if (!currentUser) return null;

  const myTasks = tasks.filter(t => t.assigneeId === currentUser.id);
  const myActivity = activity.filter(a => a.userId === currentUser.id).slice(0, 5);

  return (
    <div className="animate-slide-up">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Profile</h1>
          <p className="page-subtitle">View and manage your profile.</p>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'300px 1fr', gap:20 }}>
        {/* Left card */}
        <div>
          <div className="card card-pad" style={{ textAlign:'center', marginBottom:16 }}>
            <Avatar user={currentUser} size={90} />
            <div style={{ marginTop:12, fontSize:18, fontWeight:700, color:'var(--gray-900)' }}>{currentUser.name}</div>
            <div style={{ fontSize:13, color:'var(--gray-500)', marginTop:2 }}>{currentUser.role}</div>
            <div className="divider" />
            <div style={{ textAlign:'left' }}>
              {currentUser.email && (
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10, fontSize:13, color:'var(--gray-600)' }}>
                  <Mail size={14} style={{ color:'var(--gray-400)' }} /> {currentUser.email}
                </div>
              )}
              {currentUser.phone && (
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10, fontSize:13, color:'var(--gray-600)' }}>
                  <Phone size={14} style={{ color:'var(--gray-400)' }} /> {currentUser.phone}
                </div>
              )}
              {currentUser.location && (
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10, fontSize:13, color:'var(--gray-600)' }}>
                  <MapPin size={14} style={{ color:'var(--gray-400)' }} /> {currentUser.location}
                </div>
              )}
              {currentUser.joinedOn && (
                <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:13, color:'var(--gray-600)' }}>
                  <Calendar size={14} style={{ color:'var(--gray-400)' }} />
                  Joined {new Date(currentUser.joinedOn).toLocaleDateString('en-US', { month:'long', day:'numeric', year:'numeric' })}
                </div>
              )}
            </div>
          </div>

          {currentUser.skills?.length > 0 && (
            <div className="card card-pad">
              <div style={{ fontWeight:700, fontSize:14, marginBottom:12 }}>Skills</div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                {currentUser.skills.map(s => (
                  <span key={s} style={{
                    padding:'4px 10px', borderRadius:99, background:'var(--primary-light)',
                    color:'var(--primary)', fontSize:12, fontWeight:600
                  }}>{s}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right */}
        <div>
          {currentUser.bio && (
            <div className="card card-pad" style={{ marginBottom:16 }}>
              <div style={{ fontWeight:700, fontSize:14, marginBottom:8 }}>About Me</div>
              <p style={{ fontSize:13.5, color:'var(--gray-600)', lineHeight:1.6 }}>{currentUser.bio}</p>
            </div>
          )}

          <div className="card card-pad" style={{ marginBottom:16 }}>
            <div style={{ fontWeight:700, fontSize:14, marginBottom:14 }}>Task Summary</div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:12 }}>
              {[
                { label:'Total', value: myTasks.length, color:'var(--primary)' },
                { label:'Done', value: myTasks.filter(t=>t.status==='Done').length, color:'var(--success)' },
                { label:'In Progress', value: myTasks.filter(t=>t.status==='In Progress').length, color:'var(--warning)' },
                { label:'To Do', value: myTasks.filter(t=>t.status==='To Do').length, color:'var(--gray-400)' },
              ].map(s => (
                <div key={s.label} style={{ textAlign:'center', padding:'12px', background:'var(--gray-50)', borderRadius:8 }}>
                  <div style={{ fontSize:22, fontWeight:700, color:s.color }}>{s.value}</div>
                  <div style={{ fontSize:12, color:'var(--gray-500)', marginTop:3 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="card card-pad">
            <div style={{ fontWeight:700, fontSize:14, marginBottom:14 }}>Recent Activity</div>
            {myActivity.length === 0 && <div className="no-data">No recent activity</div>}
            {myActivity.map(a => (
              <div key={a.id} className="activity-item">
                <Avatar user={currentUser} size={28} />
                <div className="activity-text" style={{ flex:1 }}>
                  {a.action} {a.target}
                </div>
                <span className="activity-time">{a.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

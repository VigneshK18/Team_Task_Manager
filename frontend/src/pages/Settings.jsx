// src/pages/Settings.jsx
import React, { useState } from 'react';
import { User, Lock, Bell, Palette, Puzzle, CreditCard } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import Avatar from '../components/Avatar.jsx';

const TABS = [
  { id:'profile',      icon:<User size={15}/>,    label:'Profile' },
  { id:'account',      icon:<Lock size={15}/>,    label:'Account' },
  { id:'notifications',icon:<Bell size={15}/>,    label:'Notifications' },
];

export default function Settings() {
  const { currentUser, updateUser } = useApp();
  const [tab, setTab] = useState('profile');
  const [form, setForm] = useState({
    name:     currentUser?.name     || '',
    email:    currentUser?.email    || '',
    phone:    currentUser?.phone    || '',
    location: currentUser?.location || '',
    bio:      currentUser?.bio      || '',
  });
  const [pwForm, setPwForm] = useState({ current:'', next:'', confirm:'' });
  const [saved, setSaved]   = useState(false);

  const set = (k,v) => setForm(f => ({...f,[k]:v}));

  const handleSave = () => {
    updateUser(currentUser.id, form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handlePasswordChange = () => {
    if (!pwForm.current || !pwForm.next) return alert('Please fill all fields');
    if (pwForm.next !== pwForm.confirm) return alert('Passwords do not match');
    updateUser(currentUser.id, { password: pwForm.next });
    setPwForm({ current:'', next:'', confirm:'' });
    alert('Password updated successfully');
  };

  return (
    <div className="animate-slide-up">
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Manage your application settings.</p>
        </div>
      </div>

      <div className="settings-layout">
        <div className="settings-sidebar">
          {TABS.map(t => (
            <div key={t.id} id={`settings-tab-${t.id}`} className={`settings-nav-item${tab===t.id ? ' active':''}`} onClick={() => setTab(t.id)}>
              {t.icon} {t.label}
            </div>
          ))}
        </div>

        <div className="settings-content">
          {tab === 'profile' && (
            <>
              <div className="settings-section-title">Profile Information</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 200px', gap:32 }}>
                <div>
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input className="form-control" value={form.name} onChange={e => set('name', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input className="form-control" value={form.email} onChange={e => set('email', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input className="form-control" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+1 234 567 8900" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Location</label>
                    <input className="form-control" value={form.location} onChange={e => set('location', e.target.value)} placeholder="City, Country" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Bio</label>
                    <textarea className="form-control" rows={3} value={form.bio} onChange={e => set('bio', e.target.value)} placeholder="Tell us about yourself..." />
                  </div>
                </div>
                <div style={{ textAlign:'center' }}>
                  <div style={{ fontSize:12.5, fontWeight:600, color:'var(--gray-600)', marginBottom:12 }}>Profile Picture</div>
                  <Avatar user={currentUser} size={100} />
                  <button className="btn btn-outline btn-sm" style={{ marginTop:12, width:'100%' }}>Change Photo</button>
                  <div style={{ fontSize:11, color:'var(--gray-400)', marginTop:6 }}>JPG, PNG or GIF. Max 5MB</div>
                </div>
              </div>
              <div className="divider" />
              <div style={{ display:'flex', gap:10 }}>
                <button id="save-settings-btn" className="btn btn-primary" onClick={handleSave}>
                  {saved ? '✓ Saved!' : 'Save Changes'}
                </button>
                <button className="btn btn-outline" onClick={() => setForm({ name:currentUser?.name||'', email:currentUser?.email||'', phone:currentUser?.phone||'', location:currentUser?.location||'', bio:currentUser?.bio||'' })}>
                  Discard
                </button>
              </div>
            </>
          )}

          {tab === 'account' && (
            <>
              <div className="settings-section-title">Change Password</div>
              <div style={{ maxWidth:420 }}>
                <div className="form-group">
                  <label className="form-label">Current Password</label>
                  <input type="password" className="form-control" value={pwForm.current} onChange={e => setPwForm(f=>({...f,current:e.target.value}))} />
                </div>
                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <input type="password" className="form-control" value={pwForm.next} onChange={e => setPwForm(f=>({...f,next:e.target.value}))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm New Password</label>
                  <input type="password" className="form-control" value={pwForm.confirm} onChange={e => setPwForm(f=>({...f,confirm:e.target.value}))} />
                </div>
                <button id="change-password-btn" className="btn btn-primary" onClick={handlePasswordChange}>Change Password</button>
              </div>
              <div className="divider" />
              <div className="settings-section-title" style={{ color:'var(--danger)' }}>Danger Zone</div>
              <p style={{ fontSize:13.5, color:'var(--gray-500)', marginBottom:12 }}>Once you delete your account, there is no going back.</p>
              <button className="btn btn-danger">Delete Account</button>
            </>
          )}

          {tab === 'notifications' && (
            <>
              <div className="settings-section-title">Notification Preferences</div>
              {[
                ['Task assigned to me', true],
                ['Task status updated', true],
                ['Project deadline approaching', true],
                ['New team member joined', false],
                ['Weekly summary email', true],
                ['Comment mentions', false],
              ].map(([label, def]) => (
                <div key={label} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 0', borderBottom:'1px solid var(--gray-100)' }}>
                  <span style={{ fontSize:13.5, color:'var(--gray-700)' }}>{label}</span>
                  <label style={{ position:'relative', display:'inline-block', width:42, height:24, cursor:'pointer' }}>
                    <input type="checkbox" defaultChecked={def} style={{ opacity:0, width:0, height:0 }} />
                    <span style={{
                      position:'absolute', inset:0, background:'var(--gray-300)', borderRadius:99, transition:'.2s',
                    }} />
                  </label>
                </div>
              ))}
            </>
          )}


        </div>
      </div>
    </div>
  );
}

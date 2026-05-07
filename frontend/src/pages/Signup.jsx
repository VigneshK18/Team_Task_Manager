// src/pages/Signup.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CheckCheck } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';

export default function Signup() {
  const { doSignup } = useApp();
  const navigate = useNavigate();
  const [form, setForm]     = useState({ name:'', email:'', password:'' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const set = (k,v) => setForm(f => ({...f,[k]:v}));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim()) return setError('Name is required');
    if (form.password.length < 6) return setError('Password must be at least 6 characters');
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    const result = await doSignup(form.name.trim(), form.email, form.password);
    setLoading(false);
    if (result.ok) navigate('/dashboard');
    else           setError(result.error);
  };

  return (
    <div className="auth-page">
      <div className="auth-card animate-slide-up">
        <div className="auth-logo">
          <div className="logo-icon"><CheckCheck size={22} /></div>
          <span style={{ fontSize:22, fontWeight:800, color:'var(--gray-900)', letterSpacing:'-0.5px' }}>TeamTask</span>
        </div>
        <h1 className="auth-title">Create an account</h1>
        <p className="auth-sub">Join your team and start managing tasks</p>

        {error && (
          <div style={{ background:'var(--danger-light)', color:'var(--danger)', padding:'10px 14px', borderRadius:7, fontSize:13.5, marginBottom:16, fontWeight:500 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input id="signup-name" className="form-control" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Rohit Sharma" required />
          </div>
          <div className="form-group">
            <label className="form-label">Email address</label>
            <input id="signup-email" type="email" className="form-control" value={form.email} onChange={e => set('email', e.target.value)} placeholder="name@company.com" required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input id="signup-password" type="password" className="form-control" value={form.password} onChange={e => set('password', e.target.value)} placeholder="At least 6 characters" required />
          </div>
          <button id="signup-btn" type="submit" className="btn btn-primary" style={{ width:'100%', height:42, fontSize:14.5, justifyContent:'center' }} disabled={loading}>
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="auth-switch" style={{ marginTop:20 }}>
          Already have an account? <Link to="/login" style={{ color:'var(--primary)', fontWeight:600, textDecoration:'none' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}

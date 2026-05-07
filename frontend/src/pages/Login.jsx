// src/pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CheckCheck, Eye, EyeOff } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';

export default function Login() {
  const { doLogin } = useApp();
  const navigate    = useNavigate();
  const [form, setForm]     = useState({ email:'', password:'' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const set = (k,v) => setForm(f => ({...f,[k]:v}));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    const result = await doLogin(form.email, form.password);
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
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-sub">Sign in to your account to continue</p>

        {error && (
          <div style={{ background:'var(--danger-light)', color:'var(--danger)', padding:'10px 14px', borderRadius:7, fontSize:13.5, marginBottom:16, fontWeight:500 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email address</label>
            <input
              id="login-email"
              type="email"
              className="form-control"
              value={form.email}
              onChange={e => set('email', e.target.value)}
              placeholder="name@company.com"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label" style={{ display:'flex', justifyContent:'space-between' }}>
              Password
              <span style={{ fontWeight:500, color:'var(--primary)', cursor:'pointer', fontSize:12 }}>Forgot password?</span>
            </label>
            <div style={{ position:'relative' }}>
              <input
                id="login-password"
                type={showPw ? 'text' : 'password'}
                className="form-control"
                value={form.password}
                onChange={e => set('password', e.target.value)}
                placeholder="Enter your password"
                required
                style={{ paddingRight:40 }}
              />
              <button type="button" onClick={() => setShowPw(v=>!v)}
                style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'var(--gray-400)', display:'flex' }}>
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <button
            id="login-btn"
            type="submit"
            className="btn btn-primary"
            style={{ width:'100%', height:42, fontSize:14.5, marginTop:4, justifyContent:'center' }}
            disabled={loading}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>



        <p className="auth-switch">
          Don't have an account? <Link to="/signup" style={{ color:'var(--primary)', fontWeight:600, textDecoration:'none' }}>Sign up</Link>
        </p>
      </div>
    </div>
  );
}

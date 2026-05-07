// src/pages/TeamPulse.jsx – Daily mood & energy check-in
import React, { useState } from 'react';
import { Heart, TrendingUp, Zap, Users, CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import Avatar from '../components/Avatar.jsx';

const MOODS = [
  { emoji: '😴', label: 'Tired',       energy: 15, color: '#94a3b8' },
  { emoji: '😐', label: 'Neutral',     energy: 40, color: '#6b7280' },
  { emoji: '🙂', label: 'Good',         energy: 60, color: '#3b82f6' },
  { emoji: '😄', label: 'Great',        energy: 80, color: '#22c55e' },
  { emoji: '🚀', label: 'Supercharged', energy: 100, color: '#8b5cf6' },
];

const SEED_PULSE = {
  u2: { mood: 3, energy: 75, focus: 'Finishing API work', blockers: '' },
  u3: { mood: 2, energy: 55, focus: 'DB setup', blockers: 'Waiting on credentials' },
  u4: { mood: 4, energy: 90, focus: 'Campaign launch', blockers: '' },
  u5: { mood: 1, energy: 30, focus: 'Bug fixes', blockers: 'Build is broken' },
};

// 30-day heatmap seed data
const seedHeatmap = () => {
  const data = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    data.push({ date: d.toDateString(), energy: Math.floor(Math.random() * 100) });
  }
  return data;
};

const heatColor = (val) => {
  if (val === 0)  return 'var(--gray-100)';
  if (val < 30)   return '#bbf7d0';
  if (val < 50)   return '#86efac';
  if (val < 70)   return '#4ade80';
  if (val < 85)   return '#22c55e';
  return '#15803d';
};

export default function TeamPulse() {
  const { currentUser, users, savePulse, getTodayPulse, addXP, gamification } = useApp();
  const todayPulse = getTodayPulse(currentUser?.id);

  const [step,     setStep]     = useState(todayPulse ? 'done' : 'checkin');
  const [moodIdx,  setMoodIdx]  = useState(-1);
  const [focus,    setFocus]    = useState('');
  const [blockers, setBlockers] = useState('');

  const teamPulses = { ...SEED_PULSE };
  if (todayPulse) teamPulses[currentUser.id] = todayPulse;

  const heatmap = seedHeatmap();

  const avgEnergy = users
    .map(u => teamPulses[u.id]?.energy || null)
    .filter(Boolean)
    .reduce((a, b, _, arr) => a + b / arr.length, 0);

  const handleSubmit = () => {
    if (moodIdx < 0) return;
    const data = { mood: moodIdx, energy: MOODS[moodIdx].energy, focus, blockers };
    savePulse(currentUser.id, data);
    addXP(15, 'Daily check-in');
    setStep('done');
  };

  const teamWithPulse = users.map(u => ({
    user: u,
    pulse: teamPulses[u.id] || null,
  }));

  return (
    <div className="animate-slide-up">
      <div className="page-header">
        <div>
          <h1 className="page-title">Team Pulse 💓</h1>
          <p className="page-subtitle">Daily mood & energy check-in to keep the team in sync.</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ textAlign: 'center', padding: '8px 16px', background: 'var(--primary-light)', borderRadius: 10, border: '1px solid var(--primary)' }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--primary)' }}>{Math.round(avgEnergy)}%</div>
            <div style={{ fontSize: 11, color: 'var(--gray-500)', fontWeight: 600 }}>Team Energy</div>
          </div>
          <div style={{ textAlign: 'center', padding: '8px 16px', background: 'var(--success-light)', borderRadius: 10, border: '1px solid var(--success)' }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--success)' }}>{gamification.streak}</div>
            <div style={{ fontSize: 11, color: 'var(--gray-500)', fontWeight: 600 }}>Day Streak 🔥</div>
          </div>
        </div>
      </div>

      {/* Check-in card */}
      {step !== 'done' ? (
        <div className="checkin-banner">
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>How are you feeling today? ✨</div>
            <div style={{ fontSize: 13.5, opacity: 0.85 }}>Takes 30 seconds · Earn +15 XP · Helps your team know your status</div>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div className="mood-selector" style={{ marginBottom: 0 }}>
              {MOODS.map((m, i) => (
                <button key={i} className={`mood-btn${moodIdx === i ? ' selected' : ''}`}
                  style={moodIdx === i ? { background: m.color + '33', borderColor: m.color } : {}}
                  onClick={() => setMoodIdx(i)} title={m.label}>
                  {m.emoji}
                </button>
              ))}
            </div>
            <button className="btn" style={{ background: '#fff', color: 'var(--primary)', fontWeight: 700 }} onClick={() => setStep('form')}>
              Check In →
            </button>
          </div>
        </div>
      ) : (
        <div style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: '#fff', borderRadius: 'var(--radius-lg)', padding: '20px 24px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
          <CheckCircle size={28} />
          <div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>You've checked in today! 🎉</div>
            <div style={{ fontSize: 13, opacity: 0.85 }}>+15 XP earned · Come back tomorrow to keep your streak going</div>
          </div>
        </div>
      )}

      {step === 'form' && (
        <div className="card card-pad" style={{ marginBottom: 20 }}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Tell us more (optional)</div>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--gray-700)', marginBottom: 6 }}>What are you focusing on today?</div>
            <input className="form-control" value={focus} onChange={e => setFocus(e.target.value)} placeholder="e.g. Finishing the API integration..." />
          </div>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--gray-700)', marginBottom: 6 }}>Any blockers? 🚧</div>
            <input className="form-control" value={blockers} onChange={e => setBlockers(e.target.value)} placeholder="e.g. Waiting on design feedback..." />
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-primary" onClick={handleSubmit} disabled={moodIdx < 0}>Submit Check-in ✓</button>
            <button className="btn btn-outline" onClick={() => setStep('checkin')}>Back</button>
          </div>
        </div>
      )}

      {/* Team cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        <div className="card card-pad">
          <div className="section-header" style={{ marginBottom: 16 }}>
            <span className="section-title">Team Status Today</span>
            <span style={{ fontSize: 12, color: 'var(--gray-500)' }}>{Object.keys(teamPulses).length}/{users.length} checked in</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {teamWithPulse.map(({ user, pulse }) => (
              <div key={user.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Avatar user={user} size={36} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
                    <span style={{ fontSize: 13.5, fontWeight: 600 }}>{user.name}</span>
                    {pulse
                      ? <span style={{ fontSize: 20 }}>{MOODS[pulse.mood]?.emoji}</span>
                      : <span style={{ fontSize: 11.5, color: 'var(--gray-400)' }}>No check-in</span>}
                  </div>
                  <div className="energy-bar-wrap">
                    <div className="energy-bar-fill" style={{ width: `${pulse?.energy || 0}%`, background: MOODS[pulse?.mood || 0]?.color || 'var(--gray-200)' }} />
                  </div>
                  {pulse?.blockers && (
                    <div style={{ fontSize: 11, color: 'var(--danger)', marginTop: 3 }}>🚧 {pulse.blockers}</div>
                  )}
                  {pulse?.focus && !pulse?.blockers && (
                    <div style={{ fontSize: 11, color: 'var(--gray-500)', marginTop: 3 }}>🎯 {pulse.focus}</div>
                  )}
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-600)', width: 36, textAlign: 'right' }}>
                  {pulse?.energy || 0}%
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="card card-pad">
          <div className="section-header" style={{ marginBottom: 16 }}>
            <span className="section-title">Your 30-Day Energy Heatmap</span>
          </div>
          <div className="pulse-heatmap">
            {heatmap.map((d, i) => (
              <div
                key={i}
                className="heatmap-cell"
                style={{ background: heatColor(d.energy) }}
                title={`${d.date}: ${d.energy}% energy`}
              />
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, fontSize: 11, color: 'var(--gray-500)' }}>
            <span>Less</span>
            {[10, 40, 60, 80, 95].map(v => (
              <div key={v} style={{ width: 14, height: 14, borderRadius: 3, background: heatColor(v) }} />
            ))}
            <span>More</span>
          </div>
        </div>
      </div>

      {/* Mood distribution */}
      <div className="card card-pad">
        <div className="section-title" style={{ marginBottom: 16 }}>Team Mood Distribution</div>
        <div style={{ display: 'flex', gap: 12 }}>
          {MOODS.map((m, i) => {
            const count = Object.values(teamPulses).filter(p => p.mood === i).length;
            const pct = Object.keys(teamPulses).length ? (count / Object.keys(teamPulses).length) * 100 : 0;
            return (
              <div key={i} style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ fontSize: 28 }}>{m.emoji}</div>
                <div style={{ height: 60, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', marginTop: 6 }}>
                  <div style={{ width: 32, background: m.color, borderRadius: '4px 4px 0 0', height: `${Math.max(pct, 4)}%`, transition: 'height .4s' }} />
                </div>
                <div style={{ fontSize: 11, color: 'var(--gray-500)', marginTop: 4 }}>{m.label}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: m.color }}>{count}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

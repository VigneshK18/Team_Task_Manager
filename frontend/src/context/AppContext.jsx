import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import * as store from '../data/store.js';
import * as api from '../data/api.js';

const AppContext = createContext(null);

const ACHIEVEMENTS = [
  { id:'first_task',  emoji:'🎯', name:'First Task',    desc:'Complete your first task',        xp:50,  condition: (stats) => stats.done >= 1 },
  { id:'on_fire',     emoji:'🔥', name:'On Fire',       desc:'Complete 5 tasks',                xp:100, condition: (stats) => stats.done >= 5 },
  { id:'team_player', emoji:'🤝', name:'Team Player',   desc:'Assign a task to someone',        xp:75,  condition: (stats) => stats.assigned >= 1 },
  { id:'planner',     emoji:'📅', name:'Planner',       desc:'Create 3 projects',               xp:150, condition: (stats) => stats.projects >= 3 },
  { id:'streak_3',    emoji:'⚡', name:'3-Day Streak',  desc:'Check in 3 days in a row',        xp:200, condition: (stats) => stats.streak >= 3 },
  { id:'centurion',   emoji:'💯', name:'Centurion',     desc:'Earn 100 XP',                     xp:0,   condition: (stats) => stats.xp >= 100 },
  { id:'focuser',     emoji:'⏱️', name:'Deep Focus',    desc:'Complete a Pomodoro session',     xp:80,  condition: (stats) => stats.pomodoros >= 1 },
  { id:'early_bird',  emoji:'🌅', name:'Early Bird',    desc:'Log in before 9AM',               xp:60,  condition: (stats) => stats.earlyBird },
];

export function AppProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => store.getCurrentUser());
  const [users,    setUsers]    = useState([]);
  const [projects, setProjects] = useState([]);
  const [tasks,    setTasks]    = useState([]);
  const [activity, setActivity] = useState(() => store.getActivity());
  const [timeEntries,  setTimeEntries]  = useState(() => store.getTimeEntries());
  const [appUsage,     setAppUsage]     = useState(() => store.getAppUsage());
  const [onlineStatus, setOnlineStatus] = useState(() => store.getOnlineStatus());
  // Live timer state
  const [activeTimer, setActiveTimer] = useState(null); // { taskId, startTime, seconds }

  // ── Dark mode ──
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('ttm_dark');
    return saved ? JSON.parse(saved) : false;
  });

  // ── Gamification (per-user) ──
  const getGamKey = (uid) => `ttm_gam_${uid || 'guest'}`;
  const defaultGam = (uid) => {
    return { xp:0, level:1, streak:0, pomodoros:0, earlyBird:false, badges:[] };
  };
  const loadGam = (uid) => {
    try { const v = localStorage.getItem(getGamKey(uid)); return v ? JSON.parse(v) : defaultGam(uid); } catch { return defaultGam(uid); }
  };
  const [gamification, setGamification] = useState(() => loadGam(store.getCurrentUser()?.id));

  // Reload gamification when user changes
  useEffect(() => {
    if (currentUser?.id) setGamification(loadGam(currentUser.id));
  }, [currentUser?.id]);

  // Team Pulse
  const [pulseData, setPulseData] = useState(() => {
    const saved = localStorage.getItem('ttm_pulse');
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    localStorage.setItem('ttm_dark', JSON.stringify(darkMode));
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(v => !v);

  const addXP = useCallback((amount) => {
    setGamification(g => {
      const newXP   = g.xp + amount;
      const newLevel = Math.floor(newXP / 200) + 1;
      const updated  = { ...g, xp: newXP, level: newLevel };
      localStorage.setItem(getGamKey(currentUser?.id), JSON.stringify(updated));
      return updated;
    });
  }, [currentUser?.id]);

  const unlockBadge = useCallback((badgeId) => {
    setGamification(g => {
      if (g.badges.includes(badgeId)) return g;
      const updated = { ...g, badges: [...g.badges, badgeId] };
      localStorage.setItem(getGamKey(currentUser?.id), JSON.stringify(updated));
      return updated;
    });
  }, [currentUser?.id]);

  const recordPomodoro = useCallback(() => {
    setGamification(g => {
      const updated = { ...g, pomodoros: g.pomodoros + 1 };
      localStorage.setItem(getGamKey(currentUser?.id), JSON.stringify(updated));
      return updated;
    });
    addXP(25);
  }, [currentUser?.id, addXP]);


  const savePulse = useCallback((userId, data) => {
    setPulseData(prev => {
      const today = new Date().toDateString();
      const updated = { ...prev, [`${userId}_${today}`]: { ...data, date: today } };
      localStorage.setItem('ttm_pulse', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const getTodayPulse = useCallback((userId) => {
    const today = new Date().toDateString();
    return pulseData[`${userId}_${today}`] || null;
  }, [pulseData]);

  const refresh = useCallback(async () => {
    if (!currentUser) return;
    const [u, p, t] = await Promise.all([api.getUsers(), api.getProjects(), api.getTasks()]);
    setUsers(u); setProjects(p); setTasks(t);
  }, [currentUser]);

  useEffect(() => { refresh(); }, [refresh]);

  const doLogin = async (email, password) => {
    const result = await api.login(email, password);
    if (result.ok) { setCurrentUser(result.data.user); store.saveCurrentUser(result.data.user); }
    return { ok: result.ok, error: result.data?.error };
  };

  const doSignup = async (name, email, password) => {
    const result = await api.signup(name, email, password);
    if (result.ok) { setCurrentUser(result.data.user); store.saveCurrentUser(result.data.user); }
    return { ok: result.ok, error: result.data?.error };
  };

  const doLogout = () => { api.logout(); store.logout(); setCurrentUser(null); };

  // Projects CRUD
  const createProject = async (data) => {
    const np = await api.createProject(data);
    if (np) setProjects(prev => [...prev, np]);
    store.addActivity(currentUser.id, 'created project', `"${data.name}"`);
    setActivity(store.getActivity());
    addXP(30);
    return np;
  };
  const updateProject = (id, data) => {
    // Backend API omitted for simplicity, optimistic update locally
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
  };
  const deleteProject = (id) => {
    setProjects(prev => prev.filter(p => p.id !== id));
    setTasks(prev => prev.filter(t => t.projectId !== id));
  };

  // Tasks CRUD
  const createTask = async (data) => {
    const nt = await api.createTask({ ...data, reporterId: currentUser?.id });
    if (nt) setTasks(prev => [...prev, nt]);
    store.addActivity(currentUser.id, 'created a new task', `"${data.title}"`);
    setActivity(store.getActivity());
    addXP(10);
    return nt;
  };
  const updateTask = async (id, data) => {
    const prev = tasks.find(t => t.id === id);
    const updated = await api.updateTask(id, data);
    if (updated) setTasks(prevList => prevList.map(t => t.id === id ? updated : t));
    
    if (data.status === 'Done' && prev?.status !== 'Done') {
      addXP(20);
      store.addActivity(currentUser.id, 'completed', `"${data.title || prev?.title || ''}"`);
      setActivity(store.getActivity());
    } else {
      store.addActivity(currentUser.id, 'updated task', `"${data.title || prev?.title || ''}"`);
      setActivity(store.getActivity());
    }
  };
  const deleteTask = async (id) => {
    await api.deleteTask(id);
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  // Users CRUD
  const inviteMember = async (data) => {
    // Signup handles creation
    const res = await api.signup(data.name, data.email, 'pass123', true);
    if (res.ok) setUsers(prev => [...prev, res.data.user]);
    return res.data?.user;
  };
  const updateUser = (id, data) => {
    // Backend API omitted for brevity
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...data } : u));
    if (currentUser?.id === id) { const updated = { ...currentUser, ...data }; store.saveCurrentUser(updated); setCurrentUser(updated); }
  };
  const removeUser = async (id) => {
    await api.deleteUser(id);
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  const getUserById    = (id) => users.find(u => u.id === id);
  const getProjectById = (id) => projects.find(p => p.id === id);

  // Health score computation
  const getProjectHealth = (projectId) => {
    const projectTasks = tasks.filter(t => t.projectId === projectId);
    if (!projectTasks.length) return { score: 100, label: 'excellent' };
    const done = projectTasks.filter(t => t.status === 'Done').length;
    const overdue = projectTasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'Done').length;
    const completion = done / projectTasks.length;
    const penaltyRatio = overdue / projectTasks.length;
    const raw = Math.round((completion * 0.7 - penaltyRatio * 0.5 + 0.4) * 100);
    const score = Math.max(10, Math.min(100, raw));
    const label = score >= 80 ? 'excellent' : score >= 60 ? 'good' : score >= 40 ? 'fair' : 'poor';
    return { score, label };
  };

  // ── Time Tracking ────────────────────────────────────────────────────────
  const startTimer = useCallback((taskId, projectId) => {
    setActiveTimer({ taskId, projectId, startTime: new Date().toISOString(), seconds: 0 });
  }, []);

  const stopTimer = useCallback(() => {
    if (!activeTimer) return;
    const endTime = new Date().toISOString();
    const minutes = Math.round((Date.now() - new Date(activeTimer.startTime).getTime()) / 60000);
    if (minutes < 1) { setActiveTimer(null); return; }
    const task = store.getTasks().find(t => t.id === activeTimer.taskId);
    const entry = {
      id: 'te' + Date.now(),
      userId: currentUser?.id,
      taskId: activeTimer.taskId,
      projectId: activeTimer.projectId,
      description: task?.title || 'Tracked work',
      startTime: activeTimer.startTime,
      endTime,
      minutes,
      date: new Date().toDateString(),
      app: 'TeamTask',
      category: 'Productivity',
    };
    const entries = store.getTimeEntries();
    entries.unshift(entry);
    store.saveTimeEntries(entries);
    setTimeEntries([...entries]);
    setActiveTimer(null);
    addXP(5, 'Tracked time');
  }, [activeTimer, currentUser, addXP]);

  const addManualEntry = useCallback((entry) => {
    const entries = store.getTimeEntries();
    const ne = { ...entry, id: 'te' + Date.now(), userId: currentUser?.id };
    entries.unshift(ne);
    store.saveTimeEntries(entries);
    setTimeEntries([...entries]);
  }, [currentUser]);

  const deleteTimeEntry = useCallback((id) => {
    const entries = store.getTimeEntries().filter(e => e.id !== id);
    store.saveTimeEntries(entries);
    setTimeEntries([...entries]);
  }, []);

  // Productivity score per user (today)
  const getProductivityScore = useCallback((userId) => {
    const today = new Date().toDateString();
    const todayEntries = timeEntries.filter(e => e.userId === userId && e.date === today);
    const totalMinutes = todayEntries.reduce((s, e) => s + e.minutes, 0);
    const expected = 480; // 8h
    const raw = Math.round((totalMinutes / expected) * 100);
    const score = Math.min(100, raw);
    const userUsage = appUsage.filter(a => a.userId === userId && a.date === today);
    const distractionMins = userUsage.filter(a => a.category === 'Distraction').reduce((s, a) => s + a.minutes, 0);
    const penalty = Math.round((distractionMins / Math.max(totalMinutes, 1)) * 20);
    return {
      score: Math.max(0, score - penalty),
      totalMinutes,
      distractionMins,
      activeMinutes: totalMinutes - distractionMins,
      idleMinutes: Math.max(0, expected - totalMinutes),
      label: score >= 80 ? 'High' : score >= 50 ? 'Medium' : 'Low',
    };
  }, [timeEntries, appUsage]);

  // Update online status
  const setUserStatus = useCallback((userId, status) => {
    const updated = { ...onlineStatus, [userId]: { ...onlineStatus[userId], status, lastSeen: new Date().toISOString() } };
    store.saveOnlineStatus(updated);
    setOnlineStatus(updated);
  }, [onlineStatus]);

  return (
    <AppContext.Provider value={{
      currentUser, users, projects, tasks, activity,
      darkMode, toggleDarkMode,
      gamification, addXP, unlockBadge, recordPomodoro, ACHIEVEMENTS,
      pulseData, savePulse, getTodayPulse,
      timeEntries, appUsage, onlineStatus, activeTimer,
      startTimer, stopTimer, addManualEntry, deleteTimeEntry,
      getProductivityScore, setUserStatus,
      doLogin, doSignup, doLogout,
      createProject, updateProject, deleteProject,
      createTask, updateTask, deleteTask,
      inviteMember, updateUser, removeUser,
      getUserById, getProjectById, getProjectHealth, refresh,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);


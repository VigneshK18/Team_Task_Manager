// src/App.jsx
import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext.jsx';
import Sidebar            from './components/Sidebar.jsx';
import Header             from './components/Header.jsx';
import FocusTimer         from './components/FocusTimer.jsx';
import QuickCapture       from './components/QuickCapture.jsx';
import TimeTrackerWidget  from './components/TimeTrackerWidget.jsx';
import Dashboard    from './pages/Dashboard.jsx';
import Projects     from './pages/Projects.jsx';
import Tasks        from './pages/Tasks.jsx';
import Teams        from './pages/Teams.jsx';
import CalendarPage from './pages/CalendarPage.jsx';
import Reports      from './pages/Reports.jsx';
import Settings     from './pages/Settings.jsx';
import Profile      from './pages/Profile.jsx';
import TeamPulse    from './pages/TeamPulse.jsx';
import Analytics    from './pages/Analytics.jsx';
import Login        from './pages/Login.jsx';
import Signup       from './pages/Signup.jsx';

function ProtectedLayout({ children }) {
  const { currentUser } = useApp();
  const [showQC, setShowQC] = useState(false);

  React.useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); setShowQC(v => !v); }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  if (!currentUser) return <Navigate to="/login" replace />;

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-area">
        <Header onQuickCapture={() => setShowQC(v => !v)} />
        <main className="page-content">{children}</main>
      </div>
      {/* Floating widgets */}
      <FocusTimer />
      <TimeTrackerWidget />
      {showQC && <QuickCapture onClose={() => setShowQC(false)} />}
    </div>
  );
}

function AppRoutes() {
  const { currentUser } = useApp();
  return (
    <Routes>
      <Route path="/login"     element={currentUser ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/signup"    element={currentUser ? <Navigate to="/dashboard" /> : <Signup />} />
      <Route path="/dashboard" element={<ProtectedLayout><Dashboard /></ProtectedLayout>} />
      <Route path="/projects"  element={<ProtectedLayout><Projects /></ProtectedLayout>} />
      <Route path="/tasks"     element={<ProtectedLayout><Tasks /></ProtectedLayout>} />
      <Route path="/teams"     element={<ProtectedLayout><Teams /></ProtectedLayout>} />
      <Route path="/calendar"  element={<ProtectedLayout><CalendarPage /></ProtectedLayout>} />
      <Route path="/reports"   element={<ProtectedLayout><Reports /></ProtectedLayout>} />
      <Route path="/settings"  element={<ProtectedLayout><Settings /></ProtectedLayout>} />
      <Route path="/profile"   element={<ProtectedLayout><Profile /></ProtectedLayout>} />
      <Route path="/pulse"     element={<ProtectedLayout><TeamPulse /></ProtectedLayout>} />
      <Route path="/analytics"  element={<ProtectedLayout><Analytics /></ProtectedLayout>} />
      <Route path="*" element={<Navigate to={currentUser ? '/dashboard' : '/login'} replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProvider>
  );
}

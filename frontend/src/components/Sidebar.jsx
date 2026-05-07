// src/components/Sidebar.jsx
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FolderOpen, CheckSquare, Users, Calendar, BarChart2, Settings, Plus, CheckCheck, Activity, TrendingUp } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { COLORS } from '../data/store.js';

const NAV = [
  { to: '/dashboard', icon: <LayoutDashboard size={17} />, label: 'Dashboard'  },
  { to: '/projects',  icon: <FolderOpen size={17} />,      label: 'Projects'   },
  { to: '/tasks',     icon: <CheckSquare size={17} />,     label: 'Tasks'      },
  { to: '/teams',     icon: <Users size={17} />,           label: 'Teams'      },
  { to: '/pulse',     icon: <Activity size={17} />,        label: 'Team Pulse' },
  { to: '/analytics', icon: <TrendingUp size={17} />,      label: 'Analytics'  },
  { to: '/calendar',  icon: <Calendar size={17} />,        label: 'Calendar'   },
  { to: '/reports',   icon: <BarChart2 size={17} />,       label: 'Reports'    },
  { to: '/settings',  icon: <Settings size={17} />,        label: 'Settings'   },
];

export default function Sidebar() {
  const { projects, currentUser } = useApp();
  const navigate = useNavigate();

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon"><CheckCheck size={18} /></div>
        <span className="logo-text">TeamTask</span>
      </div>

      <nav className="sidebar-nav">
        {NAV.map(n => (
          <NavLink
            key={n.to}
            to={n.to}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            {n.icon}
            {n.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-projects">
        <div className="sidebar-section-label" style={{ paddingLeft: 8 }}>Projects</div>
        {projects.slice(0, 5).map((p, i) => (
          <div
            key={p.id}
            className="sidebar-project-item"
            onClick={() => navigate('/projects')}
          >
            <span className="project-dot" style={{ background: p.color || COLORS[i % COLORS.length] }} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
          </div>
        ))}
        {currentUser?.role === 'Admin' && (
          <div className="new-project-btn" onClick={() => navigate('/projects')}>
            <Plus size={14} /> New Project
          </div>
        )}
      </div>
    </aside>
  );
}

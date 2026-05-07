// src/components/StatusBadge.jsx
import React from 'react';

const map = {
  'To Do':       'todo',
  'In Progress': 'in-progress',
  'In Review':   'in-review',
  'Done':        'done',
  'On Hold':     'on-hold',
  'Overdue':     'overdue',
  'Not Started': 'todo',
};

export default function StatusBadge({ status }) {
  return (
    <span className={`status-badge ${map[status] || 'todo'}`}>
      <span className="status-dot" />
      {status}
    </span>
  );
}

export function PriorityBadge({ priority }) {
  const cls = { High: 'high', Medium: 'medium', Low: 'low' }[priority] || 'low';
  return <span className={`priority-badge ${cls}`}>{priority}</span>;
}

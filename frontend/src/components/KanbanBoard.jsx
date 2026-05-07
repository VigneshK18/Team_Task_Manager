// src/components/KanbanBoard.jsx – Drag-and-drop Kanban view
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import StatusBadge, { PriorityBadge } from './StatusBadge.jsx';
import Avatar from './Avatar.jsx';

const COLUMNS = [
  { id: 'To Do',       label: 'To Do',       color: '#94a3b8', bg: '#f8fafc' },
  { id: 'In Progress', label: 'In Progress',  color: '#3b82f6', bg: '#eff6ff' },
  { id: 'In Review',   label: 'In Review',    color: '#f59e0b', bg: '#fffbeb' },
  { id: 'Done',        label: 'Done',         color: '#22c55e', bg: '#f0fdf4' },
];

export default function KanbanBoard({ tasks, onEditTask, onNewTask }) {
  const { updateTask, getUserById, projects } = useApp();
  const [dragging, setDragging] = useState(null);
  const [dragOver, setDragOver] = useState(null);

  const handleDragStart = (e, task) => {
    setDragging(task);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = (e, colId) => {
    e.preventDefault();
    if (dragging && dragging.status !== colId) {
      updateTask(dragging.id, { ...dragging, status: colId });
    }
    setDragging(null);
    setDragOver(null);
  };

  const formatDate = (d) => {
    if (!d) return null;
    const dt = new Date(d);
    const isOver = dt < new Date();
    const label  = dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return { label, isOver };
  };

  return (
    <div className="kanban-board">
      {COLUMNS.map(col => {
        const colTasks = tasks.filter(t => t.status === col.id);
        return (
          <div key={col.id} className="kanban-col">
            {/* Column header */}
            <div className="kanban-col-header" style={{ background: col.bg, border: `1px solid ${col.color}22` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="kanban-col-title" style={{ color: col.color }}>{col.label}</span>
                <span className="kanban-col-count" style={{ background: col.color + '22', color: col.color }}>
                  {colTasks.length}
                </span>
              </div>
              <button
                onClick={() => onNewTask(col.id)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: col.color, padding: 2 }}
                title={`Add to ${col.label}`}
              >
                <Plus size={15} />
              </button>
            </div>

            {/* Drop zone */}
            <div
              className={`kanban-cards${dragOver === col.id ? ' drag-over' : ''}`}
              onDragOver={e => { e.preventDefault(); setDragOver(col.id); }}
              onDragLeave={() => setDragOver(null)}
              onDrop={e => handleDrop(e, col.id)}
            >
              {colTasks.map(task => {
                const assignee = getUserById(task.assigneeId);
                const proj     = projects.find(p => p.id === task.projectId);
                const due      = formatDate(task.dueDate);

                return (
                  <div
                    key={task.id}
                    id={`kanban-card-${task.id}`}
                    className={`kanban-card${dragging?.id === task.id ? ' dragging' : ''}`}
                    draggable
                    onDragStart={e => handleDragStart(e, task)}
                    onDragEnd={() => setDragging(null)}
                    onClick={() => onEditTask(task)}
                  >
                    {/* Project tag */}
                    {proj && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 8 }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: proj.color, flexShrink: 0 }} />
                        <span style={{ fontSize: 11, color: 'var(--gray-500)', fontWeight: 500 }}>{proj.name}</span>
                      </div>
                    )}

                    <div className="kanban-card-title">{task.title}</div>

                    <div className="kanban-card-meta">
                      <PriorityBadge priority={task.priority} />
                      {due && (
                        <span style={{ fontSize: 11, color: due.isOver ? 'var(--danger)' : 'var(--gray-500)', fontWeight: 500 }}>
                          📅 {due.label}
                        </span>
                      )}
                    </div>

                    <div className="kanban-card-footer">
                      {assignee
                        ? <Avatar user={assignee} size={24} />
                        : <span style={{ fontSize: 11, color: 'var(--gray-400)' }}>Unassigned</span>}
                      {task.description && (
                        <span style={{ fontSize: 11, color: 'var(--gray-400)' }}>📝</span>
                      )}
                    </div>
                  </div>
                );
              })}

              {colTasks.length === 0 && (
                <div style={{ textAlign: 'center', padding: '24px 12px', color: 'var(--gray-400)', fontSize: 13 }}>
                  Drop tasks here
                </div>
              )}
            </div>

            {/* Add card button */}
            <div className="kanban-add-card" onClick={() => onNewTask(col.id)}>
              <Plus size={13} /> Add task
            </div>
          </div>
        );
      })}
    </div>
  );
}

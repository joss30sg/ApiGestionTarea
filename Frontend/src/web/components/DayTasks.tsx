import React from 'react';
import { Task } from '../api';

const STATUS_COLORS: Record<string, string> = {
  Pending: '#f59e0b',
  InProgress: '#0a84ff',
  Completed: '#34c759',
};
const STATUS_LABELS: Record<string, string> = {
  Pending: 'Pendiente',
  InProgress: 'En Progreso',
  Completed: 'Completada',
};
const STATUS_ICONS: Record<string, string> = {
  Pending: '⏳',
  InProgress: '🔧',
  Completed: '✅',
};
const PRIORITY_LABELS: Record<string, string> = {
  Low: 'Baja',
  Medium: 'Media',
  High: 'Alta',
};

function getStatusClass(s: string) {
  return { Pending: 'pending', InProgress: 'in-progress', Completed: 'completed' }[s] || '';
}
function getPriorityClass(p: string) {
  return { Low: 'low', Medium: 'medium', High: 'high' }[p] || '';
}

interface Props {
  label: string;
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onComplete: (task: Task) => void;
}

const STATUSES = ['Pending', 'InProgress', 'Completed'] as const;

export default function DayTasks({ label, tasks, onEdit, onDelete, onComplete }: Props) {
  if (tasks.length === 0) {
    return (
      <div className="selected-day-section">
        <div className="selected-day-title">{label}</div>
        <div className="no-tasks-msg">Sin tareas en este día</div>
      </div>
    );
  }

  const groups: Record<string, Task[]> = { Pending: [], InProgress: [], Completed: [] };
  tasks.forEach(t => { if (groups[t.status]) groups[t.status].push(t); });

  return (
    <div className="selected-day-section">
      <div className="selected-day-title">{label}</div>
      {STATUSES.map(s => {
        if (groups[s].length === 0) return null;
        return (
          <div key={s}>
            <div className="status-group-title">
              <span className="sg-dot" style={{ background: STATUS_COLORS[s] }} />
              {STATUS_ICONS[s]} {STATUS_LABELS[s]}
              <span className="sg-count">({groups[s].length})</span>
            </div>
            {groups[s].map(task => (
              <div
                key={task.id}
                className="task-card"
                style={{ marginBottom: 10, borderLeftColor: STATUS_COLORS[task.status] }}
              >
                <div className="task-title">{task.title}</div>
                {task.description && <div className="task-description">{task.description}</div>}
                <div className="task-footer">
                  <span className={`badge status ${getStatusClass(task.status)}`}>
                    {STATUS_LABELS[task.status] || task.status}
                  </span>
                  <span className={`badge priority ${getPriorityClass(task.priority)}`}>
                    {PRIORITY_LABELS[task.priority] || task.priority}
                  </span>
                </div>
                <div className="task-actions">
                  {task.status !== 'Completed' && (
                    <button className="btn-complete" onClick={() => onComplete(task)}>
                      ✅ Completar
                    </button>
                  )}
                  <button className="btn-edit" onClick={() => onEdit(task)}>✏️ Editar</button>
                  <button className="btn-delete" onClick={() => onDelete(task)}>🗑️ Eliminar</button>
                </div>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

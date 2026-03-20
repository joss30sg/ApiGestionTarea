import React from 'react';
import { Task } from '../api';

const STATUS_LABELS: Record<string, string> = {
  Pending: 'Pendiente',
  InProgress: 'En Progreso',
  Completed: 'Completada',
};

interface Props {
  tasks: Task[];
  activeFilter: string | null;
  onToggle: (status: string) => void;
}

const STATUSES = ['Pending', 'InProgress', 'Completed'] as const;

export default function StatusSummary({ tasks, activeFilter, onToggle }: Props) {
  const counts: Record<string, number> = { Pending: 0, InProgress: 0, Completed: 0 };
  tasks.forEach(t => {
    if (t.status in counts) counts[t.status]++;
  });

  return (
    <div className="calendar-summary">
      {STATUSES.map(s => (
        <div
          key={s}
          className={`summary-item${activeFilter === s ? ' active' : ''}`}
          onClick={() => onToggle(s)}
        >
          <span className={`summary-dot ${s.toLowerCase()}`} />
          <span className="summary-label">{STATUS_LABELS[s]}</span>
          <span className="summary-count">{counts[s]}</span>
        </div>
      ))}
    </div>
  );
}

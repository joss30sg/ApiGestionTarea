import React, { useMemo } from 'react';
import { Task } from '../api';

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  Pending:    { label: 'Pendiente',   color: '#f59e0b', icon: '⏳' },
  InProgress: { label: 'En Progreso', color: '#0a84ff', icon: '🔧' },
  Completed:  { label: 'Completada',  color: '#34c759', icon: '✅' },
};

const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  High:   { label: 'Alta',  color: '#ef4444' },
  Medium: { label: 'Media', color: '#f59e0b' },
  Low:    { label: 'Baja',  color: '#22c55e' },
};

interface Props {
  tasks: Task[];
  activeFilter: string | null;
  onToggle: (status: string) => void;
}

/* ─── SVG Donut Chart ─── */
function DonutChart({ counts, total }: { counts: Record<string, number>; total: number }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;

  const segments = useMemo(() => {
    const statuses = ['Completed', 'InProgress', 'Pending'] as const;
    let offset = 0;
    return statuses.map(s => {
      const pct = total > 0 ? counts[s] / total : 0;
      const dash = pct * circumference;
      const seg = { status: s, dash, gap: circumference - dash, offset, color: STATUS_CONFIG[s].color };
      offset += dash;
      return seg;
    });
  }, [counts, total, circumference]);

  return (
    <div className="donut-wrapper">
      <svg viewBox="0 0 128 128" className="donut-svg">
        {/* Background circle */}
        <circle cx="64" cy="64" r={radius} fill="none" stroke="var(--border-color)" strokeWidth="14" opacity="0.3" />
        {segments.map(seg => (
          <circle
            key={seg.status}
            cx="64"
            cy="64"
            r={radius}
            fill="none"
            stroke={seg.color}
            strokeWidth="14"
            strokeDasharray={`${seg.dash} ${seg.gap}`}
            strokeDashoffset={-seg.offset}
            strokeLinecap="round"
            className="donut-segment"
          />
        ))}
      </svg>
      <div className="donut-center">
        <span className="donut-total">{total}</span>
        <span className="donut-label">Tareas</span>
      </div>
    </div>
  );
}

/* ─── Progress Bar ─── */
function ProgressBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="progress-bar-track">
      <div
        className="progress-bar-fill"
        style={{ width: `${pct}%`, backgroundColor: color }}
      />
    </div>
  );
}

/* ─── Main Dashboard ─── */
export default function Dashboard({ tasks, activeFilter, onToggle }: Props) {
  const counts = useMemo(() => {
    const c: Record<string, number> = { Pending: 0, InProgress: 0, Completed: 0 };
    tasks.forEach(t => { if (t.status in c) c[t.status]++; });
    return c;
  }, [tasks]);

  const priorityCounts = useMemo(() => {
    const c: Record<string, number> = { High: 0, Medium: 0, Low: 0 };
    tasks.forEach(t => { if (t.priority in c) c[t.priority]++; });
    return c;
  }, [tasks]);

  const total = tasks.length;
  const completionPct = total > 0 ? Math.round((counts.Completed / total) * 100) : 0;

  return (
    <div className="dashboard">
      {/* Top row: Donut + Status cards */}
      <div className="dashboard-top">
        <DonutChart counts={counts} total={total} />

        <div className="status-cards">
          {(['Pending', 'InProgress', 'Completed'] as const).map(s => {
            const cfg = STATUS_CONFIG[s];
            const count = counts[s];
            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
            const isActive = activeFilter === s;
            return (
              <div
                key={s}
                className={`status-card${isActive ? ' active' : ''}`}
                onClick={() => onToggle(s)}
                style={{ '--card-accent': cfg.color } as React.CSSProperties}
              >
                <div className="status-card-header">
                  <span className="status-card-icon">{cfg.icon}</span>
                  <span className="status-card-count">{count}</span>
                </div>
                <div className="status-card-label">{cfg.label}</div>
                <ProgressBar value={count} max={total} color={cfg.color} />
                <div className="status-card-pct">{pct}%</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Completion bar */}
      <div className="completion-bar-section">
        <div className="completion-header">
          <span>Progreso general</span>
          <span className="completion-pct">{completionPct}%</span>
        </div>
        <div className="completion-track">
          <div
            className="completion-fill"
            style={{ width: `${completionPct}%` }}
          />
        </div>
      </div>

      {/* Priority breakdown */}
      <div className="priority-section">
        <div className="priority-title">Por prioridad</div>
        <div className="priority-bars">
          {(['High', 'Medium', 'Low'] as const).map(p => {
            const cfg = PRIORITY_CONFIG[p];
            const count = priorityCounts[p];
            return (
              <div key={p} className="priority-row">
                <span className="priority-label" style={{ color: cfg.color }}>
                  {cfg.label}
                </span>
                <div className="priority-bar-track">
                  <div
                    className="priority-bar-fill"
                    style={{
                      width: `${total > 0 ? (count / total) * 100 : 0}%`,
                      backgroundColor: cfg.color,
                    }}
                  />
                </div>
                <span className="priority-count">{count}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

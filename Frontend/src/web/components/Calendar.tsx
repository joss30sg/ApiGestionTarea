import React from 'react';
import { Task } from '../api';

const STATUS_COLORS: Record<string, string> = {
  Pending: '#f59e0b',
  InProgress: '#0a84ff',
  Completed: '#34c759',
};

interface Props {
  year: number;
  month: number;
  tasks: Task[];
  selectedDate: string | null;
  onSelectDay: (dateKey: string) => void;
  toDateKey: (dateStr: string) => string;
}

export default function Calendar({ year, month, tasks, selectedDate, onSelectDay, toDateKey }: Props) {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const todayKey = toDateKey(new Date().toISOString());

  // Group tasks by date and collect statuses
  const statusByDate: Record<string, Set<string>> = {};
  tasks.forEach(t => {
    const key = toDateKey(t.createdAt);
    if (!key) return;
    if (!statusByDate[key]) statusByDate[key] = new Set();
    statusByDate[key].add(t.status);
  });

  const cells: React.ReactNode[] = [];

  // Empty leading cells
  for (let i = 0; i < firstDay; i++) {
    cells.push(<div key={`e-${i}`} className="day-cell empty" />);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const isToday = key === todayKey;
    const isSelected = key === selectedDate;
    const statuses = statusByDate[key];

    let cls = 'day-cell';
    if (isToday) cls += ' today';
    if (isSelected) cls += ' selected';

    cells.push(
      <div key={key} className={cls} onClick={() => onSelectDay(key)}>
        <span className="day-num">{d}</span>
        {statuses && (
          <div className="dots">
            {Array.from(statuses).map(s => (
              <span key={s} style={{ background: STATUS_COLORS[s] || '#999' }} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return <div className="calendar-grid">{cells}</div>;
}

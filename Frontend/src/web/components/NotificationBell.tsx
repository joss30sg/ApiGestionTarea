import React, { useState, useRef, useEffect } from 'react';
import { Task } from '../api';

interface Notification {
  id: string;
  taskId: string;
  title: string;
  message: string;
  type: 'overdue' | 'due-today' | 'due-soon';
  read: boolean;
  timestamp: Date;
}

const TYPE_CONFIG: Record<string, { icon: string; label: string; color: string }> = {
  overdue: { icon: '🔴', label: 'Vencida', color: '#dc2626' },
  'due-today': { icon: '🟡', label: 'Vence hoy', color: '#f59e0b' },
  'due-soon': { icon: '🟠', label: 'Próxima a vencer', color: '#ea580c' },
};

function generateNotifications(tasks: Task[]): Notification[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const in3Days = new Date(today);
  in3Days.setDate(in3Days.getDate() + 3);

  const notifications: Notification[] = [];

  for (const task of tasks) {
    if (!task.dueDate || task.status === 'Completed') continue;

    const due = new Date(task.dueDate);
    const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate());

    if (dueDay < today) {
      notifications.push({
        id: `overdue-${task.id}`,
        taskId: task.id,
        title: task.title,
        message: `Venció el ${due.toLocaleDateString()}`,
        type: 'overdue',
        read: false,
        timestamp: due,
      });
    } else if (dueDay.getTime() === today.getTime()) {
      notifications.push({
        id: `due-today-${task.id}`,
        taskId: task.id,
        title: task.title,
        message: `Vence hoy a las ${due.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        type: 'due-today',
        read: false,
        timestamp: due,
      });
    } else if (dueDay < in3Days) {
      notifications.push({
        id: `due-soon-${task.id}`,
        taskId: task.id,
        title: task.title,
        message: `Vence el ${due.toLocaleDateString()}`,
        type: 'due-soon',
        read: false,
        timestamp: due,
      });
    }
  }

  notifications.sort((a, b) => {
    const order = { overdue: 0, 'due-today': 1, 'due-soon': 2 };
    return (order[a.type] ?? 3) - (order[b.type] ?? 3);
  });

  return notifications;
}

interface Props {
  tasks: Task[];
}

export default function NotificationBell({ tasks }: Props) {
  const [open, setOpen] = useState(false);
  const [readIds, setReadIds] = useState<Set<string>>(() => {
    try {
      const saved = sessionStorage.getItem('readNotifications');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });
  const panelRef = useRef<HTMLDivElement>(null);

  const notifications = generateNotifications(tasks);
  const unreadCount = notifications.filter(n => !readIds.has(n.id)).length;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const markAsRead = (id: string) => {
    setReadIds(prev => {
      const next = new Set(prev);
      next.add(id);
      sessionStorage.setItem('readNotifications', JSON.stringify([...next]));
      return next;
    });
  };

  const markAllAsRead = () => {
    const allIds = new Set(notifications.map(n => n.id));
    setReadIds(allIds);
    sessionStorage.setItem('readNotifications', JSON.stringify([...allIds]));
    setOpen(false);
  };

  return (
    <div className="notification-wrapper" ref={panelRef}>
      <button
        className="notification-bell"
        onClick={() => setOpen(v => !v)}
        title="Notificaciones"
        aria-label={`Notificaciones${notifications.length > 0 ? `, ${notifications.length} alertas` : ''}`}
      >
        🔔
        {notifications.length > 0 && (
          <span className="notification-badge">{notifications.length}</span>
        )}
      </button>

      {open && (
        <>
          <div className="notification-overlay" onClick={() => setOpen(false)} />
          <div className="notification-panel">
            <div className="notification-header">
              <span className="notification-panel-title">Notificaciones</span>
              {notifications.length > 0 && (
                <button className="notification-mark-all" onClick={markAllAsRead}>
                  Marcar todas como leídas
                </button>
              )}
            </div>

            <div className="notification-list">
              {notifications.length === 0 ? (
                <div className="notification-empty">
                  ✅ No hay alertas de vencimiento
                </div>
              ) : (
                notifications.map(n => {
                  const config = TYPE_CONFIG[n.type];
                  const isRead = readIds.has(n.id);
                  return (
                    <div
                      key={n.id}
                      className={`notification-item ${isRead ? 'read' : 'unread'}`}
                      onClick={() => markAsRead(n.id)}
                    >
                      <span className="notification-icon">{config.icon}</span>
                      <div className="notification-content">
                        <div className="notification-item-title">{n.title}</div>
                        <div className="notification-item-msg">{n.message}</div>
                        <span className="notification-type-badge" style={{ background: config.color }}>
                          {config.label}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

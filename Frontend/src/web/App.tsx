import React, { useState, useEffect, useCallback } from 'react';
import { Task, fetchTasks, createTask, updateTask, deleteTask, TaskPayload } from './api';
import Calendar from './components/Calendar';
import StatusSummary from './components/StatusSummary';
import DayTasks from './components/DayTasks';
import TaskModal from './components/TaskModal';
import ConfirmDialog from './components/ConfirmDialog';

const MONTH_NAMES = [
  'Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'
];

function toDateKey(dateStr: string): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Confirm dialog state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmMsg, setConfirmMsg] = useState('');
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const loadTasks = useCallback(async () => {
    try {
      const items = await fetchTasks();
      setTasks(items);
      setError('');
      // Position on the month of the first task
      if (items.length > 0) {
        const first = new Date(items[0].createdAt);
        if (!isNaN(first.getTime())) {
          setYear(first.getFullYear());
          setMonth(first.getMonth());
        }
      }
    } catch {
      setError('Error al cargar tareas');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();

    // SSE: actualización en tiempo real
    const es = new EventSource('/api/events');
    es.addEventListener('task-change', () => {
      loadTasks();
    });
    es.onerror = () => {
      // Reconexión automática por el navegador
    };
    return () => es.close();
  }, [loadTasks]);

  const filteredTasks = statusFilter
    ? tasks.filter(t => t.status === statusFilter)
    : tasks;

  const handlePrevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
    setSelectedDate(null);
  };

  const handleNextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
    setSelectedDate(null);
  };

  const handleSave = async (payload: TaskPayload, id?: string) => {
    if (id) {
      await updateTask(id, payload);
    } else {
      await createTask(payload);
    }
    setModalOpen(false);
    setEditingTask(null);
    await loadTasks();
  };

  const handleMarkComplete = async (task: Task) => {
    await updateTask(task.id, {
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      state: 'Completed',
    });
    await loadTasks();
  };

  const handleDeleteRequest = (taskId: string) => {
    setConfirmMsg('¿Estás seguro de eliminar esta tarea? Esta acción no se puede deshacer.');
    setPendingAction(() => async () => {
      await deleteTask(taskId);
      await loadTasks();
    });
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    if (pendingAction) await pendingAction();
    setConfirmOpen(false);
    setPendingAction(null);
  };

  const dayTasks = selectedDate
    ? filteredTasks.filter(t => toDateKey(t.createdAt) === selectedDate)
    : [];

  const selectedDateParts = selectedDate ? selectedDate.split('-').map(Number) : null;
  const selectedDayLabel = selectedDateParts
    ? `${selectedDateParts[2]} de ${MONTH_NAMES[selectedDateParts[1] - 1]} ${selectedDateParts[0]}`
    : '';

  return (
    <div className="app-container">
      <header className="header">
        <h1>⚡ API de Gestión de Tareas</h1>
        <div className="task-count">
          {loading
            ? 'Cargando...'
            : error
            ? error
            : `${tasks.length} tarea${tasks.length !== 1 ? 's' : ''} registrada${tasks.length !== 1 ? 's' : ''}`}
        </div>
      </header>

      <StatusSummary
        tasks={tasks}
        activeFilter={statusFilter}
        onToggle={s => setStatusFilter(prev => (prev === s ? null : s))}
      />

      <div className="month-nav">
        <button onClick={handlePrevMonth} aria-label="Mes anterior">‹</button>
        <span className="month-title">{MONTH_NAMES[month]} {year}</span>
        <button onClick={handleNextMonth} aria-label="Mes siguiente">›</button>
      </div>

      <div className="week-header">
        {['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'].map(d => (
          <span key={d}>{d}</span>
        ))}
      </div>

      <Calendar
        year={year}
        month={month}
        tasks={filteredTasks}
        selectedDate={selectedDate}
        onSelectDay={setSelectedDate}
        toDateKey={toDateKey}
      />

      {selectedDate && (
        <DayTasks
          label={selectedDayLabel}
          tasks={dayTasks}
          onEdit={task => { setEditingTask(task); setModalOpen(true); }}
          onDelete={task => handleDeleteRequest(task.id)}
          onComplete={handleMarkComplete}
        />
      )}

      <button
        className="fab-add"
        onClick={() => { setEditingTask(null); setModalOpen(true); }}
        title="Nueva tarea"
        aria-label="Crear nueva tarea"
      >
        ＋
      </button>

      {modalOpen && (
        <TaskModal
          task={editingTask}
          onSave={handleSave}
          onClose={() => { setModalOpen(false); setEditingTask(null); }}
        />
      )}

      {confirmOpen && (
        <ConfirmDialog
          message={confirmMsg}
          onConfirm={handleConfirm}
          onCancel={() => { setConfirmOpen(false); setPendingAction(null); }}
        />
      )}
    </div>
  );
}

import React, { useState, useEffect, useCallback } from 'react';
import { Task, fetchTasks, createTask, updateTask, deleteTask, TaskPayload } from './api';
import Calendar from './components/Calendar';
import StatusSummary from './components/StatusSummary';
import Dashboard from './components/Dashboard';
import DayTasks from './components/DayTasks';
import TaskModal from './components/TaskModal';
import ConfirmDialog from './components/ConfirmDialog';
import ToastContainer, { showToast } from './components/ToastContainer';
import { SkeletonSummary, SkeletonCards } from './components/Skeleton';
import LoginScreen from './components/LoginScreen';
import RegisterScreen from './components/RegisterScreen';
import ReportView from './components/ReportView';

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

  // Auth state
  const [authToken, setAuthToken] = useState<string | null>(() =>
    sessionStorage.getItem('authToken')
  );
  const [userRole, setUserRole] = useState<string>(() =>
    sessionStorage.getItem('userRole') || ''
  );
  const [showReport, setShowReport] = useState(false);
  const [authView, setAuthView] = useState<'login' | 'register'>('login');

  const isAuthenticated = !!authToken;
  const isAdmin = userRole === 'Admin';

  function parseRole(token: string): string {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      // JWT role claim can be under different keys
      return payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']
        || payload.role || 'User';
    } catch {
      return 'User';
    }
  }

  const handleLogin = (token: string) => {
    const role = parseRole(token);
    sessionStorage.setItem('authToken', token);
    sessionStorage.setItem('userRole', role);
    setAuthToken(token);
    setUserRole(role);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('userRole');
    setAuthToken(null);
    setUserRole('');
    setShowReport(false);
  };

  // Dark mode
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Confirm dialog state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmMsg, setConfirmMsg] = useState('');
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const loadTasks = useCallback(async () => {
    try {
      const result = await fetchTasks();
      setTasks(result.items);
      setError('');
      // Position on the month of the first task
      if (result.items.length > 0) {
        const first = new Date(result.items[0].createdAt);
        if (!isNaN(first.getTime())) {
          setYear(first.getFullYear());
          setMonth(first.getMonth());
        }
      }
    } catch {
      setError('Error al cargar tareas');
      showToast('Error al cargar tareas', 'error');
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
      showToast('Tarea actualizada correctamente', 'success');
    } else {
      await createTask(payload);
      showToast('Tarea creada correctamente', 'success');
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
    showToast('Tarea completada', 'success');
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
    showToast('Tarea eliminada', 'info');
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
      {!isAuthenticated ? (
        authView === 'login' ? (
          <LoginScreen onLogin={handleLogin} onGoToRegister={() => setAuthView('register')} />
        ) : (
          <RegisterScreen onRegistered={() => setAuthView('login')} onGoToLogin={() => setAuthView('login')} />
        )
      ) : (
        <>
      <ToastContainer />
      <header className="header">
        <div className="header-row">
          <h1>⚡ API de Gestión de Tareas</h1>
          <div className="header-buttons">
            {isAdmin && (
              <button
                className="report-toggle-btn"
                onClick={() => setShowReport(v => !v)}
                title="Ver reporte"
                aria-label="Ver reporte de tareas"
              >
                📊
              </button>
            )}
            <button
              className="theme-toggle"
              onClick={() => setDarkMode(d => !d)}
              title={darkMode ? 'Modo claro' : 'Modo oscuro'}
              aria-label={darkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
            <button
              className="logout-btn"
              onClick={handleLogout}
              title="Cerrar sesión"
              aria-label="Cerrar sesión"
            >
              🚪
            </button>
          </div>
        </div>
        <div className="task-count">
          {loading
            ? 'Cargando...'
            : error
            ? error
            : `${tasks.length} tarea${tasks.length !== 1 ? 's' : ''} registrada${tasks.length !== 1 ? 's' : ''}`}
          {isAdmin && <span className="role-badge admin">Admin</span>}
          {!isAdmin && <span className="role-badge user">Usuario</span>}
        </div>
      </header>

      {loading ? (
        <SkeletonSummary />
      ) : (
        <>
          <div className="main-layout">
            {/* Left column: Dashboard + Priority */}
            <div className="main-left">
              <Dashboard
                tasks={tasks}
                activeFilter={statusFilter}
                onToggle={s => setStatusFilter(prev => (prev === s ? null : s))}
              />
            </div>

            {/* Right column: Calendar */}
            <div className="main-right">
              <div className="calendar-section">
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
              </div>
            </div>
          </div>

          <StatusSummary
            tasks={tasks}
            activeFilter={statusFilter}
            onToggle={s => setStatusFilter(prev => (prev === s ? null : s))}
          />
        </>
      )}

      {selectedDate && (
        <DayTasks
          label={selectedDayLabel}
          tasks={dayTasks}
          onEdit={task => { setEditingTask(task); setModalOpen(true); }}
          onDelete={task => handleDeleteRequest(task.id)}
          onComplete={handleMarkComplete}
          readOnly={isAdmin}
        />
      )}

      {!isAdmin && (
        <button
          className="fab-add"
          onClick={() => { setEditingTask(null); setModalOpen(true); }}
          title="Nueva tarea"
          aria-label="Crear nueva tarea"
        >
          ＋
        </button>
      )}

      {!isAdmin && modalOpen && (
        <TaskModal
          task={editingTask}
          onSave={handleSave}
          onClose={() => { setModalOpen(false); setEditingTask(null); }}
        />
      )}

      {!isAdmin && confirmOpen && (
        <ConfirmDialog
          message={confirmMsg}
          onConfirm={handleConfirm}
          onCancel={() => { setConfirmOpen(false); setPendingAction(null); }}
        />
      )}

      {isAdmin && showReport && (
        <ReportView tasks={tasks} onClose={() => setShowReport(false)} />
      )}
        </>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Task, TaskPayload } from '../api';

interface Props {
  task: Task | null; // null = creating new
  onSave: (payload: TaskPayload, id?: string) => Promise<void>;
  onClose: () => void;
}

export default function TaskModal({ task, onSave, onClose }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [state, setState] = useState('Pending');
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [workedHours, setWorkedHours] = useState('0');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setPriority(task.priority);
      setState(task.status);
      setStartDate(task.startDate ? task.startDate.slice(0, 16) : '');
      setDueDate(task.dueDate ? task.dueDate.slice(0, 16) : '');
      setWorkedHours(String(task.workedHours ?? 0));
    } else {
      setTitle('');
      setDescription('');
      setPriority('Medium');
      setState('Pending');
      setStartDate('');
      setDueDate('');
      setWorkedHours('0');
    }
  }, [task]);

  const handleSave = async () => {
    if (!title.trim()) {
      setError('El título es obligatorio.');
      return;
    }
    if (startDate && dueDate && new Date(dueDate) < new Date(startDate)) {
      setError('La fecha de fin no puede ser anterior a la de inicio.');
      return;
    }
    const hours = parseFloat(workedHours) || 0;
    if (hours < 0) {
      setError('Las horas trabajadas no pueden ser negativas.');
      return;
    }
    setError('');
    setSaving(true);
    try {
      await onSave(
        {
          title: title.trim(),
          description: description.trim(),
          priority,
          state,
          startDate: startDate ? new Date(startDate).toISOString() : null,
          dueDate: dueDate ? new Date(dueDate).toISOString() : null,
          workedHours: hours,
        },
        task?.id
      );
    } catch (e: any) {
      setError(e.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay show" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2>{task ? 'Editar Tarea' : 'Nueva Tarea'}</h2>

        <label htmlFor="task-title">Título *</label>
        <input
          id="task-title"
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Ej: Revisar documentacion"
          maxLength={200}
        />

        <label htmlFor="task-desc">Descripción</label>
        <textarea
          id="task-desc"
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Descripción de la tarea..."
          maxLength={2000}
        />

        <label htmlFor="task-priority">Prioridad</label>
        <select id="task-priority" value={priority} onChange={e => setPriority(e.target.value)}>
          <option value="Low">Baja</option>
          <option value="Medium">Media</option>
          <option value="High">Alta</option>
        </select>

        <label htmlFor="task-state">Estado</label>
        <select id="task-state" value={state} onChange={e => setState(e.target.value)}>
          <option value="Pending">Pendiente</option>
          <option value="InProgress">En Progreso</option>
          <option value="Completed">Completada</option>
        </select>

        <label htmlFor="task-start">Fecha de inicio</label>
        <input
          id="task-start"
          type="datetime-local"
          value={startDate}
          onChange={e => setStartDate(e.target.value)}
        />

        <label htmlFor="task-due">Fecha de fin</label>
        <input
          id="task-due"
          type="datetime-local"
          value={dueDate}
          onChange={e => setDueDate(e.target.value)}
        />

        <label htmlFor="task-hours">Horas trabajadas</label>
        <input
          id="task-hours"
          type="number"
          min="0"
          step="0.5"
          value={workedHours}
          onChange={e => setWorkedHours(e.target.value)}
        />

        {error && <div className="modal-error">{error}</div>}

        <div className="modal-actions">
          <button className="btn btn-cancel" onClick={onClose} disabled={saving}>
            Cancelar
          </button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Guardando...' : task ? 'Actualizar' : 'Crear'}
          </button>
        </div>
      </div>
    </div>
  );
}

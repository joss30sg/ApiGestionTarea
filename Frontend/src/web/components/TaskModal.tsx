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
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setPriority(task.priority);
      setState(task.status);
    } else {
      setTitle('');
      setDescription('');
      setPriority('Medium');
      setState('Pending');
    }
  }, [task]);

  const handleSave = async () => {
    if (!title.trim()) {
      setError('El título es obligatorio.');
      return;
    }
    setError('');
    setSaving(true);
    try {
      await onSave(
        { title: title.trim(), description: description.trim(), priority, state },
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

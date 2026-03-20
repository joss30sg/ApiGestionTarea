import React from 'react';

interface Props {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({ message, onConfirm, onCancel }: Props) {
  return (
    <div className="confirm-overlay show" onClick={onCancel}>
      <div className="confirm-box" onClick={e => e.stopPropagation()}>
        <p>{message}</p>
        <div className="modal-actions">
          <button className="btn btn-cancel" onClick={onCancel}>Cancelar</button>
          <button className="btn btn-danger" onClick={onConfirm}>Eliminar</button>
        </div>
      </div>
    </div>
  );
}

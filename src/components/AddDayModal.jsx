import { useState, useEffect } from 'react';
import { X, Moon } from 'lucide-react';

export default function AddDayModal({ onClose, onSave, editDay }) {
  const [name, setName] = useState('');
  const [routine, setRoutine] = useState('');
  const [isRestDay, setIsRestDay] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (editDay) {
      setName(editDay.name);
      setRoutine(editDay.routine);
      setIsRestDay(editDay.isRestDay);
    }
  }, [editDay]);

  const handleClose = () => {
    setClosing(true);
    setTimeout(onClose, 280);
  };

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({ name: name.trim(), routine: routine.trim(), isRestDay });
    handleClose();
  };

  return (
    <div className={`modal-overlay ${closing ? 'closing' : ''}`} onClick={handleClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="modal-handle"><div className="modal-handle-bar" /></div>
        <div className="modal-header">
          <div className="modal-title">{editDay ? 'Editar Día' : 'Nuevo Día'}</div>
          <button className="modal-close" onClick={handleClose}><X size={24} /></button>
        </div>
        <div className="form-fields">
          <div className="field">
            <label className="field-label">Nombre del día</label>
            <input
              type="text"
              placeholder="Ej: Lunes"
              value={name}
              onChange={e => setName(e.target.value)}
              autoFocus
            />
          </div>
          {!isRestDay && (
            <div className="field">
              <label className="field-label">Nombre de la rutina</label>
              <input
                type="text"
                placeholder="Ej: Pecho y Tríceps"
                value={routine}
                onChange={e => setRoutine(e.target.value)}
              />
            </div>
          )}
          <div className="toggle-row">
            <div className="toggle-label">
              <Moon size={18} color="var(--accent-coral)" />
              <span>Día de descanso</span>
            </div>
            <div
              className={`toggle-track ${isRestDay ? 'active' : ''}`}
              onClick={() => setIsRestDay(!isRestDay)}
            >
              <div className="toggle-thumb" />
            </div>
          </div>
        </div>
        <button className="btn-primary" onClick={handleSave} disabled={!name.trim()}>
          {editDay ? 'Guardar Cambios' : 'Guardar Día'}
        </button>
      </div>
    </div>
  );
}

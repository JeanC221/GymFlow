import { useState, useEffect } from 'react';
import { X, Plus, Minus } from 'lucide-react';

export default function AddExerciseModal({ onClose, onSave, editExercise }) {
  const [name, setName] = useState('');
  const [seriesCount, setSeriesCount] = useState(3);
  const [seriesConfig, setSeriesConfig] = useState([]);
  const [notes, setNotes] = useState('');
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (editExercise) {
      setName(editExercise.name);
      setSeriesCount(editExercise.series.length);
      setSeriesConfig(editExercise.series.map(s => ({ weight: s.weight, reps: s.reps })));
      setNotes(editExercise.notes || '');
    }
  }, [editExercise]);

  useEffect(() => {
    setSeriesConfig(prev => {
      const next = [];
      for (let i = 0; i < seriesCount; i++) {
        next.push(prev[i] || { weight: '', reps: '' });
      }
      return next;
    });
  }, [seriesCount]);

  const handleClose = () => {
    setClosing(true);
    setTimeout(onClose, 280);
  };

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({ name: name.trim(), seriesCount, seriesConfig, notes: notes.trim() });
    handleClose();
  };

  const updateSeriesConfig = (index, field, value) => {
    setSeriesConfig(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  return (
    <div className={`modal-overlay ${closing ? 'closing' : ''}`} onClick={handleClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="modal-handle"><div className="modal-handle-bar" /></div>
        <div className="modal-header">
          <div className="modal-title">{editExercise ? 'Editar Ejercicio' : 'Nuevo Ejercicio'}</div>
          <button className="modal-close" onClick={handleClose}><X size={24} /></button>
        </div>
        <div className="form-fields">
          <div className="field">
            <label className="field-label">Nombre del ejercicio</label>
            <input
              type="text"
              placeholder="Ej: Press Banca"
              value={name}
              onChange={e => setName(e.target.value)}
              autoFocus
            />
          </div>
          <div className="field">
            <label className="field-label">Número de series</label>
            <div className="stepper">
              <button
                className="stepper-btn"
                onClick={() => setSeriesCount(c => Math.max(1, c - 1))}
              >
                <Minus size={18} color="var(--text-secondary)" />
              </button>
              <div className="stepper-value">{seriesCount}</div>
              <button
                className="stepper-btn"
                onClick={() => setSeriesCount(c => Math.min(10, c + 1))}
              >
                <Plus size={18} color="var(--accent-blue)" />
              </button>
            </div>
          </div>
          <div className="field">
            <label className="field-label">Configuración por serie</label>
            <div className="series-config">
              {seriesConfig.map((s, i) => (
                <div className="series-config-row" key={i}>
                  <div className="series-config-num">{i + 1}</div>
                  <div className="series-config-input">
                    <input
                      type="number"
                      inputMode="decimal"
                      placeholder="0"
                      value={s.weight}
                      onChange={e => updateSeriesConfig(i, 'weight', e.target.value)}
                    />
                    <span>kg</span>
                  </div>
                  <div className="series-config-input">
                    <input
                      type="number"
                      inputMode="numeric"
                      placeholder="0"
                      value={s.reps}
                      onChange={e => updateSeriesConfig(i, 'reps', e.target.value)}
                    />
                    <span>reps</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="field">
            <label className="field-label">Notas (opcional)</label>
            <textarea
              placeholder="Ej: Agarre cerrado, pausa en pecho..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>
        </div>
        <button className="btn-primary" onClick={handleSave} disabled={!name.trim()}>
          {editExercise ? 'Guardar Cambios' : 'Guardar Ejercicio'}
        </button>
      </div>
    </div>
  );
}

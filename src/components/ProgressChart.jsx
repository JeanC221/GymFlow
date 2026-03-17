import { useState, useMemo } from 'react';
import { X, TrendingUp, ChevronDown } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';

export default function ProgressChart({ days, onClose, weightUnit }) {
  const [history] = useLocalStorage('gym-history', []);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [showPicker, setShowPicker] = useState(false);

  // Get unique exercise names from all days
  const exerciseNames = useMemo(() => {
    const names = new Set();
    days.forEach(d => d.exercises.forEach(ex => names.add(ex.name)));
    return [...names].sort();
  }, [days]);

  // Pick first exercise by default
  const active = selectedExercise || exerciseNames[0] || '';

  // Filter history for selected exercise
  const chartData = useMemo(() => {
    return history
      .filter(h => h.exercise === active)
      .slice(-10); // last 10 entries
  }, [history, active]);

  if (exerciseNames.length === 0) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-sheet" onClick={e => e.stopPropagation()}>
          <div className="modal-handle"><div className="modal-handle-bar" /></div>
          <div className="modal-header">
            <h2 className="modal-title">Progreso</h2>
            <button className="modal-close" onClick={onClose}><X size={22} /></button>
          </div>
          <div className="empty-state" style={{ padding: '40px 0' }}>
            <TrendingUp size={48} color="var(--text-muted)" />
            <div className="empty-state-title">Sin ejercicios</div>
            <div className="empty-state-desc">Agrega ejercicios para ver tu progreso</div>
          </div>
        </div>
      </div>
    );
  }

  const maxVal = chartData.length > 0 ? Math.max(...chartData.map(d => d.maxWeight || 0), 1) : 1;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="modal-handle"><div className="modal-handle-bar" /></div>
        <div className="modal-header">
          <h2 className="modal-title">Progreso</h2>
          <button className="modal-close" onClick={onClose}><X size={22} /></button>
        </div>

        {/* Exercise picker */}
        <div className="progress-picker" onClick={() => setShowPicker(!showPicker)}>
          <span>{active}</span>
          <ChevronDown size={16} color="var(--text-secondary)" />
        </div>
        {showPicker && (
          <div className="progress-picker-list">
            {exerciseNames.map(name => (
              <button
                key={name}
                className={`progress-picker-item ${name === active ? 'active' : ''}`}
                onClick={() => { setSelectedExercise(name); setShowPicker(false); }}
              >{name}</button>
            ))}
          </div>
        )}

        {/* Chart */}
        {chartData.length === 0 ? (
          <div className="empty-state" style={{ padding: '32px 0' }}>
            <TrendingUp size={40} color="var(--text-muted)" />
            <div className="empty-state-title">Sin historial</div>
            <div className="empty-state-desc">Completa series para registrar tu progreso. El peso máximo se guarda automáticamente.</div>
          </div>
        ) : (
          <div className="progress-chart">
            <div className="progress-bars">
              {chartData.map((entry, i) => {
                const height = Math.max((entry.maxWeight / maxVal) * 120, 8);
                return (
                  <div className="progress-bar-col" key={i}>
                    <span className="progress-bar-value">{entry.maxWeight}{weightUnit}</span>
                    <div className="progress-bar" style={{ height }} />
                    <span className="progress-bar-label">{entry.dateLabel}</span>
                  </div>
                );
              })}
            </div>
            {chartData.length >= 2 && (
              <div className="progress-summary">
                <TrendingUp size={14} color="var(--accent-green)" />
                <span>
                  {chartData[chartData.length - 1].maxWeight >= chartData[0].maxWeight
                    ? `+${(chartData[chartData.length - 1].maxWeight - chartData[0].maxWeight).toFixed(1)}${weightUnit} desde la primera entrada`
                    : `${(chartData[chartData.length - 1].maxWeight - chartData[0].maxWeight).toFixed(1)}${weightUnit} desde la primera entrada`}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

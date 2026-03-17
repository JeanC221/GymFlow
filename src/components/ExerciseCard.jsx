import { useState } from 'react';
import { Dumbbell, ChevronUp, ChevronDown, MessageSquare, StickyNote, Plus, Check } from 'lucide-react';
import { getExerciseColor, getExerciseSummary } from '../utils';
import { SwipeableItem } from './ConfirmDialog';

export default function ExerciseCard({
  exercise,
  index,
  weightUnit = 'kg',
  onToggleSeries,
  onUpdateSeries,
  onAddSeries,
  onEdit,
  onDelete,
}) {
  const [expanded, setExpanded] = useState(index === 0);
  const color = getExerciseColor(index);
  const summary = getExerciseSummary(exercise, weightUnit);

  const content = (
    <div className="exercise-card">
      <div className="exercise-header" onClick={() => setExpanded(!expanded)}>
        <div className="exercise-header-left">
          <Dumbbell size={18} color={color} />
          <span style={{ fontSize: 15, fontWeight: 600 }}>{exercise.name}</span>
        </div>
        <div className="exercise-header-actions">
          {exercise.notes && <MessageSquare size={16} color="var(--text-muted)" />}
          {expanded ? (
            <ChevronUp size={18} color="var(--text-secondary)" />
          ) : (
            <ChevronDown size={18} color="var(--text-secondary)" />
          )}
        </div>
      </div>

      {expanded ? (
        <>
          <div className="series-container">
            <div className="series-header-row">
              <span className="series-col-num">Serie</span>
              <span className="series-col-weight">Peso</span>
              <span className="series-col-reps">Reps</span>
              <span className="series-col-spacer" />
              <span className="series-col-check"><Check size={14} color="var(--text-muted)" /></span>
            </div>
            <div className="series-divider" />
            {exercise.series.map((s, i) => (
              <div className="series-row" key={s.id}>
                <span className="series-col-num series-num">{i + 1}</span>
                <input
                  className="series-value series-col-weight"
                  type="text"
                  inputMode="decimal"
                  value={s.weight}
                  onChange={e => onUpdateSeries(exercise.id, s.id, 'weight', e.target.value)}
                  placeholder="—"
                />
                <input
                  className="series-value series-col-reps"
                  type="text"
                  inputMode="numeric"
                  value={s.reps}
                  onChange={e => onUpdateSeries(exercise.id, s.id, 'reps', e.target.value)}
                  placeholder="—"
                />
                <span className="series-col-spacer" />
                <div
                  className={`check-box ${s.completed ? 'checked' : ''}`}
                  onClick={() => onToggleSeries(exercise.id, s.id)}
                >
                  {s.completed && <Check size={14} color="#FFFFFF" />}
                </div>
              </div>
            ))}
            <button className="add-series-btn" onClick={() => onAddSeries(exercise.id)}>
              <Plus size={14} /> Agregar serie
            </button>
          </div>
          {exercise.notes && (
            <div className="exercise-note">
              <StickyNote size={12} color="var(--accent-amber)" />
              {exercise.notes}
            </div>
          )}
        </>
      ) : (
        <div className="exercise-summary">
          <span>{summary}</span>
        </div>
      )}
    </div>
  );

  return (
    <SwipeableItem onEdit={onEdit} onDelete={onDelete}>
      {content}
    </SwipeableItem>
  );
}

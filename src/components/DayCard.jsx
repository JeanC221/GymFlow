import { Dumbbell, ChevronRight, Moon, StickyNote, Copy } from 'lucide-react';
import { SwipeableItem } from './ConfirmDialog';

const BADGE_COLORS = {
  blue: { bg: '#3B82F620', text: 'var(--accent-blue)' },
  green: { bg: '#32D58320', text: 'var(--accent-green)' },
  indigo: { bg: '#6366F120', text: 'var(--accent-indigo)' },
  amber: { bg: '#FFB54720', text: 'var(--accent-amber)' },
};

const COLOR_KEYS = Object.keys(BADGE_COLORS);

export default function DayCard({ day, index, onClick, onEdit, onDelete, onDuplicate }) {
  const colorKey = COLOR_KEYS[index % COLOR_KEYS.length];
  const badgeColor = BADGE_COLORS[colorKey];
  const exerciseCount = day.exercises?.length || 0;

  const card = (
    <div
      className={`day-card ${day.isRestDay ? 'rest-day' : ''}`}
      onClick={onClick}
    >
      <div className="day-card-content">
        <div className="day-card-name">{day.name}</div>
        {!day.isRestDay && day.routine && (
          <div className="day-card-routine">{day.routine}</div>
        )}
        <div className="day-card-badges">
          {day.isRestDay ? (
            <div className="day-card-badge" style={{ background: 'var(--rest-day)', color: 'var(--accent-coral)' }}>
              <Moon size={12} />
              Día de descanso
            </div>
          ) : (
            <div className="day-card-badge" style={{ background: badgeColor.bg, color: badgeColor.text }}>
              {exerciseCount} {exerciseCount === 1 ? 'ejercicio' : 'ejercicios'}
            </div>
          )}
          {day.notes && (
            <div className="day-card-badge" style={{ background: '#FFB54720', color: 'var(--accent-amber)' }}>
              <StickyNote size={10} />
            </div>
          )}
        </div>
      </div>
      <ChevronRight size={20} color="var(--text-muted)" />
    </div>
  );

  return (
    <SwipeableItem onEdit={onEdit} onDelete={onDelete} onDuplicate={onDuplicate}>
      {card}
    </SwipeableItem>
  );
}

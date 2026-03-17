import { Dumbbell } from 'lucide-react';

export default function EmptyState({ type = 'days' }) {
  return (
    <div className="empty-state">
      <Dumbbell size={64} />
      <div className="empty-state-title">
        {type === 'days' ? 'Sin días creados' : 'Sin ejercicios'}
      </div>
      <div className="empty-state-desc">
        {type === 'days'
          ? 'Toca + para agregar tu primer día de entrenamiento'
          : 'Toca + para agregar tu primer ejercicio'
        }
      </div>
    </div>
  );
}

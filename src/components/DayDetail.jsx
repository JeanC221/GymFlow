import { useState } from 'react';
import { ArrowLeft, Plus, GripVertical } from 'lucide-react';
import ExerciseCard from './ExerciseCard';
import EmptyState from './EmptyState';
import AddExerciseModal from './AddExerciseModal';
import ConfirmDialog from './ConfirmDialog';
import { createExercise, createId } from '../utils';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortableExercise({ exercise, index, ...props }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: exercise.id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    position: 'relative',
    zIndex: isDragging ? 10 : 0,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <div className="drag-handle" {...attributes} {...listeners}>
        <GripVertical size={16} />
      </div>
      <ExerciseCard exercise={exercise} index={index} {...props} />
    </div>
  );
}

export default function DayDetail({ day, onBack, onUpdateDay }) {
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [editingExercise, setEditingExercise] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
  );

  const updateExercises = (newExercises) => {
    onUpdateDay({ ...day, exercises: newExercises });
  };

  const handleSaveExercise = (data) => {
    if (editingExercise) {
      const updated = day.exercises.map(ex =>
        ex.id === editingExercise.id
          ? {
              ...ex,
              name: data.name,
              notes: data.notes,
              series: Array.from({ length: data.seriesCount }, (_, i) => ({
                id: ex.series[i]?.id || createId(),
                weight: data.seriesConfig[i]?.weight || '',
                reps: data.seriesConfig[i]?.reps || '',
                completed: ex.series[i]?.completed || false,
              })),
            }
          : ex
      );
      updateExercises(updated);
      setEditingExercise(null);
    } else {
      const newEx = createExercise(data.name, data.seriesCount, data.seriesConfig, data.notes);
      updateExercises([...day.exercises, newEx]);
    }
  };

  const handleToggleSeries = (exerciseId, seriesId) => {
    updateExercises(
      day.exercises.map(ex =>
        ex.id === exerciseId
          ? {
              ...ex,
              series: ex.series.map(s =>
                s.id === seriesId ? { ...s, completed: !s.completed } : s
              ),
            }
          : ex
      )
    );
  };

  const handleUpdateSeries = (exerciseId, seriesId, field, value) => {
    updateExercises(
      day.exercises.map(ex =>
        ex.id === exerciseId
          ? {
              ...ex,
              series: ex.series.map(s =>
                s.id === seriesId ? { ...s, [field]: value } : s
              ),
            }
          : ex
      )
    );
  };

  const handleAddSeries = (exerciseId) => {
    updateExercises(
      day.exercises.map(ex =>
        ex.id === exerciseId
          ? {
              ...ex,
              series: [
                ...ex.series,
                { id: createId(), weight: '', reps: '', completed: false },
              ],
            }
          : ex
      )
    );
  };

  const handleDeleteExercise = () => {
    if (!confirmDelete) return;
    updateExercises(day.exercises.filter(ex => ex.id !== confirmDelete));
    setConfirmDelete(null);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = day.exercises.findIndex(e => e.id === active.id);
    const newIndex = day.exercises.findIndex(e => e.id === over.id);
    updateExercises(arrayMove(day.exercises, oldIndex, newIndex));
  };

  return (
    <div className="screen">
      <div className="header">
        <div className="header-back">
          <button onClick={onBack} style={{ padding: 4 }}>
            <ArrowLeft size={24} color="var(--text-primary)" />
          </button>
          <div className="header-back-info">
            <div className="header-title" style={{ fontSize: 24 }}>{day.name}</div>
            {day.routine && <div className="header-subtitle">{day.routine}</div>}
          </div>
        </div>
      </div>

      {day.exercises.length === 0 ? (
        <EmptyState type="exercises" />
      ) : (
        <div className="scrollable">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={day.exercises.map(e => e.id)} strategy={verticalListSortingStrategy}>
              <div className="exercise-list">
                {day.exercises.map((ex, i) => (
                  <SortableExercise
                    key={ex.id}
                    exercise={ex}
                    index={i}
                    onToggleSeries={handleToggleSeries}
                    onUpdateSeries={handleUpdateSeries}
                    onAddSeries={handleAddSeries}
                    onEdit={() => { setEditingExercise(ex); setShowAddExercise(true); }}
                    onDelete={() => setConfirmDelete(ex.id)}
                  />
                ))}
                {day.exercises.length > 1 && (
                  <div className="reorder-hint">
                    <GripVertical size={14} />
                    Mantén para reordenar
                  </div>
                )}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      )}

      <div className="fab-container">
        <button className="fab" onClick={() => { setEditingExercise(null); setShowAddExercise(true); }}>
          <Plus />
        </button>
      </div>

      {showAddExercise && (
        <AddExerciseModal
          onClose={() => { setShowAddExercise(false); setEditingExercise(null); }}
          onSave={handleSaveExercise}
          editExercise={editingExercise}
        />
      )}

      {confirmDelete && (
        <ConfirmDialog
          title="Eliminar ejercicio"
          message="¿Estás seguro de que quieres eliminar este ejercicio? Esta acción no se puede deshacer."
          onConfirm={handleDeleteExercise}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}

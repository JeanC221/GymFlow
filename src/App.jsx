import { useState, useEffect } from 'react';
import { Plus, Settings, Search, X, GripVertical, TrendingUp } from 'lucide-react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { createDay, cloneDay, createId } from './utils';
import DayCard from './components/DayCard';
import DayDetail from './components/DayDetail';
import AddDayModal from './components/AddDayModal';
import EmptyState from './components/EmptyState';
import ConfirmDialog from './components/ConfirmDialog';
import SettingsPanel from './components/SettingsPanel';
import ProgressChart from './components/ProgressChart';
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

function SortableDay({ day, index, ...props }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: day.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    position: 'relative',
    zIndex: isDragging ? 10 : 0,
  };
  return (
    <div ref={setNodeRef} style={style}>
      <div className="day-drag-handle" {...attributes} {...listeners}>
        <GripVertical size={16} />
      </div>
      <DayCard day={day} index={index} {...props} />
    </div>
  );
}

export default function App() {
  const [days, setDays] = useLocalStorage('gym-days', []);
  const [weightUnit, setWeightUnit] = useLocalStorage('gym-weight-unit', 'kg');
  const [theme, setTheme] = useLocalStorage('gym-theme', 'dark');
  const [currentView, setCurrentView] = useState('list');
  const [selectedDayId, setSelectedDayId] = useState(null);
  const [showAddDay, setShowAddDay] = useState(false);
  const [editingDay, setEditingDay] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [history, setHistory] = useLocalStorage('gym-history', []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
  );

  const selectedDay = days.find(d => d.id === selectedDayId);

  // Apply theme to document body
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.body.style.background = theme === 'light' ? '#F5F5F7' : '#0B0B0E';
  }, [theme]);

  const handleSaveDay = (data) => {
    if (editingDay) {
      setDays(prev =>
        prev.map(d =>
          d.id === editingDay.id
            ? { ...d, name: data.name, routine: data.routine, isRestDay: data.isRestDay, notes: data.notes }
            : d
        )
      );
      setEditingDay(null);
    } else {
      const newDay = createDay(data.name, data.routine, data.isRestDay);
      newDay.notes = data.notes || '';
      setDays(prev => [...prev, newDay]);
    }
  };

  const handleDuplicateDay = (day) => {
    const cloned = cloneDay(day);
    setDays(prev => [...prev, cloned]);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = days.findIndex(d => d.id === active.id);
    const newIndex = days.findIndex(d => d.id === over.id);
    setDays(arrayMove(days, oldIndex, newIndex));
  };

  const filteredDays = searchQuery
    ? days.filter(d =>
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (d.routine && d.routine.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : days;

  const handleDeleteDay = () => {
    if (!confirmDelete) return;
    setDays(prev => prev.filter(d => d.id !== confirmDelete));
    setConfirmDelete(null);
  };

  const handleUpdateDay = (updatedDay) => {
    setDays(prev => prev.map(d => d.id === updatedDay.id ? updatedDay : d));
    // Record progress history for exercises with all series complete
    const today = new Date().toISOString().slice(0, 10);
    const dateLabel = new Date().toLocaleDateString('es', { day: 'numeric', month: 'short' });
    updatedDay.exercises.forEach(ex => {
      const allDone = ex.series.length > 0 && ex.series.every(s => s.completed);
      const weights = ex.series.map(s => parseFloat(s.weight)).filter(w => !isNaN(w) && w > 0);
      if (allDone && weights.length > 0) {
        const maxWeight = Math.max(...weights);
        setHistory(prev => {
          const exists = prev.find(h => h.exercise === ex.name && h.date === today);
          if (exists) {
            return prev.map(h =>
              h.exercise === ex.name && h.date === today
                ? { ...h, maxWeight: Math.max(h.maxWeight, maxWeight) }
                : h
            );
          }
          return [...prev, { exercise: ex.name, date: today, dateLabel, maxWeight }];
        });
      }
    });
  };

  const handleClearAll = () => {
    setDays([]);
    setHistory([]);
    setShowSettings(false);
  };

  const handleResetSeries = () => {
    setDays(prev => prev.map(day => ({
      ...day,
      exercises: day.exercises.map(ex => ({
        ...ex,
        series: ex.series.map(s => ({ ...s, completed: false }))
      }))
    })));
  };

  const openDay = (day) => {
    setSelectedDayId(day.id);
    setCurrentView('detail');
  };

  if (currentView === 'detail' && selectedDay) {
    return (
      <DayDetail
        day={selectedDay}
        onBack={() => setCurrentView('list')}
        onUpdateDay={handleUpdateDay}
        weightUnit={weightUnit}
        theme={theme}
      />
    );
  }

  return (
    <div className="screen" data-theme={theme}>
      <div className="header">
        <div className="header-title">Mi Rutina</div>
        <div style={{ display: 'flex', gap: 4 }}>
          {days.length > 0 && (
            <button style={{ padding: 4 }} onClick={() => setShowProgress(true)}>
              <TrendingUp size={22} color="var(--text-secondary)" />
            </button>
          )}
          {days.length > 2 && (
            <button style={{ padding: 4 }} onClick={() => setShowSearch(!showSearch)}>
              <Search size={22} color="var(--text-secondary)" />
            </button>
          )}
          <button style={{ padding: 4 }} onClick={() => setShowSettings(true)}>
            <Settings size={24} color="var(--text-secondary)" />
          </button>
        </div>
      </div>

      {showSearch && (
        <div className="search-bar">
          <Search size={16} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Buscar día o rutina..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            autoFocus
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} style={{ padding: 2 }}>
              <X size={16} color="var(--text-secondary)" />
            </button>
          )}
        </div>
      )}

      {days.length === 0 ? (
        <EmptyState type="days" />
      ) : filteredDays.length === 0 ? (
        <div className="empty-state">
          <Search size={48} color="var(--text-muted)" />
          <div className="empty-state-title">Sin resultados</div>
          <div className="empty-state-desc">No hay días que coincidan con "{searchQuery}"</div>
        </div>
      ) : (
        <div className="scrollable">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={filteredDays.map(d => d.id)} strategy={verticalListSortingStrategy}>
              <div className="days-list">
                {filteredDays.map((day, i) => (
                  <SortableDay
                    key={day.id}
                    day={day}
                    index={i}
                    onClick={() => openDay(day)}
                    onEdit={() => { setEditingDay(day); setShowAddDay(true); }}
                    onDelete={() => setConfirmDelete(day.id)}
                    onDuplicate={() => handleDuplicateDay(day)}
                  />
                ))}
                {filteredDays.length > 1 && !searchQuery && (
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
        <button className="fab" onClick={() => { setEditingDay(null); setShowAddDay(true); }}>
          <Plus />
        </button>
      </div>

      {showAddDay && (
        <AddDayModal
          onClose={() => { setShowAddDay(false); setEditingDay(null); }}
          onSave={handleSaveDay}
          editDay={editingDay}
        />
      )}

      {confirmDelete && (
        <ConfirmDialog
          title="Eliminar dia"
          message="Estas seguro de que quieres eliminar este dia y todos sus ejercicios? Esta accion no se puede deshacer."
          onConfirm={handleDeleteDay}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

      {showSettings && (
        <SettingsPanel
          onClose={() => setShowSettings(false)}
          onClearAll={handleClearAll}
          onResetSeries={handleResetSeries}
          weightUnit={weightUnit}
          onChangeUnit={setWeightUnit}
          theme={theme}
          onChangeTheme={setTheme}
        />
      )}

      {showProgress && (
        <ProgressChart
          days={days}
          onClose={() => setShowProgress(false)}
          weightUnit={weightUnit}
        />
      )}
    </div>
  );
}

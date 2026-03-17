import { useState } from 'react';
import { Plus, Settings } from 'lucide-react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { createDay } from './utils';
import DayCard from './components/DayCard';
import DayDetail from './components/DayDetail';
import AddDayModal from './components/AddDayModal';
import EmptyState from './components/EmptyState';
import ConfirmDialog from './components/ConfirmDialog';

export default function App() {
  const [days, setDays] = useLocalStorage('gym-days', []);
  const [currentView, setCurrentView] = useState('list');
  const [selectedDayId, setSelectedDayId] = useState(null);
  const [showAddDay, setShowAddDay] = useState(false);
  const [editingDay, setEditingDay] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const selectedDay = days.find(d => d.id === selectedDayId);

  const handleSaveDay = (data) => {
    if (editingDay) {
      setDays(prev =>
        prev.map(d =>
          d.id === editingDay.id
            ? { ...d, name: data.name, routine: data.routine, isRestDay: data.isRestDay, exercises: data.isRestDay ? [] : d.exercises }
            : d
        )
      );
      setEditingDay(null);
    } else {
      const newDay = createDay(data.name, data.routine, data.isRestDay);
      setDays(prev => [...prev, newDay]);
    }
  };

  const handleDeleteDay = () => {
    if (!confirmDelete) return;
    setDays(prev => prev.filter(d => d.id !== confirmDelete));
    setConfirmDelete(null);
  };

  const handleUpdateDay = (updatedDay) => {
    setDays(prev => prev.map(d => d.id === updatedDay.id ? updatedDay : d));
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
      />
    );
  }

  return (
    <div className="screen">
      <div className="header">
        <div className="header-title">Mi Rutina</div>
        <button style={{ padding: 4 }}>
          <Settings size={24} color="var(--text-secondary)" />
        </button>
      </div>

      {days.length === 0 ? (
        <EmptyState type="days" />
      ) : (
        <div className="scrollable">
          <div className="days-list">
            {days.map((day, i) => (
              <DayCard
                key={day.id}
                day={day}
                index={i}
                onClick={() => openDay(day)}
                onEdit={() => { setEditingDay(day); setShowAddDay(true); }}
                onDelete={() => setConfirmDelete(day.id)}
              />
            ))}
          </div>
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
    </div>
  );
}

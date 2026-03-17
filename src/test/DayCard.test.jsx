import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DayCard from '../components/DayCard';
import { createDay, createExercise } from '../utils';

describe('DayCard', () => {
  it('renders day name and routine', () => {
    const day = createDay('Lunes', 'Push', false);
    render(<DayCard day={day} index={0} onClick={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} onDuplicate={vi.fn()} />);
    expect(screen.getByText('Lunes')).toBeInTheDocument();
    expect(screen.getByText('Push')).toBeInTheDocument();
  });

  it('shows exercise count badge', () => {
    const day = createDay('Martes', 'Pull', false);
    day.exercises = [createExercise('Curl', 3, [], ''), createExercise('Remo', 3, [], '')];
    render(<DayCard day={day} index={1} onClick={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} onDuplicate={vi.fn()} />);
    expect(screen.getByText('2 ejercicios')).toBeInTheDocument();
  });

  it('shows singular form for 1 exercise', () => {
    const day = createDay('Miércoles', 'Legs', false);
    day.exercises = [createExercise('Sentadilla', 3, [], '')];
    render(<DayCard day={day} index={2} onClick={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} onDuplicate={vi.fn()} />);
    expect(screen.getByText('1 ejercicio')).toBeInTheDocument();
  });

  it('shows "Descanso" badge for rest days', () => {
    const day = createDay('Domingo', '', true);
    render(<DayCard day={day} index={6} onClick={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} onDuplicate={vi.fn()} />);
    expect(screen.getByText('Descanso')).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const onClick = vi.fn();
    const day = createDay('Lunes', 'Push', false);
    render(<DayCard day={day} index={0} onClick={onClick} onEdit={vi.fn()} onDelete={vi.fn()} onDuplicate={vi.fn()} />);
    fireEvent.click(screen.getByText('Lunes'));
    expect(onClick).toHaveBeenCalled();
  });

  it('shows progress percentage when exercises have completed series', () => {
    const day = createDay('Lunes', 'Push', false);
    day.exercises = [createExercise('Press', 4, [], '')];
    day.exercises[0].series[0].completed = true;
    day.exercises[0].series[1].completed = true;
    render(<DayCard day={day} index={0} onClick={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} onDuplicate={vi.fn()} />);
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('shows notes badge when day has notes', () => {
    const day = createDay('Lunes', 'Push', false);
    day.notes = 'calentamiento previo';
    render(<DayCard day={day} index={0} onClick={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} onDuplicate={vi.fn()} />);
    // Notes badge renders a StickyNote icon, the badge itself should exist
    const badges = document.querySelectorAll('.day-card-badge');
    expect(badges.length).toBeGreaterThanOrEqual(2); // exercise count + notes
  });
});

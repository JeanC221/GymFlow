import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ExerciseCard from '../components/ExerciseCard';
import { createExercise } from '../utils';

describe('ExerciseCard', () => {
  const makeExercise = (overrides = {}) => {
    const ex = createExercise('Press Banca', 3, [
      { weight: '80', reps: '10' },
      { weight: '85', reps: '8' },
      { weight: '90', reps: '6' },
    ], 'agarre cerrado');
    return { ...ex, ...overrides };
  };

  const defaultProps = {
    exercise: makeExercise(),
    index: 0,
    weightUnit: 'kg',
    onToggleSeries: vi.fn(),
    onUpdateSeries: vi.fn(),
    onAddSeries: vi.fn(),
    onEdit: vi.fn(),
    onDelete: vi.fn(),
  };

  it('renders exercise name', () => {
    render(<ExerciseCard {...defaultProps} />);
    expect(screen.getByText('Press Banca')).toBeInTheDocument();
  });

  it('first exercise starts expanded (index 0)', () => {
    render(<ExerciseCard {...defaultProps} index={0} />);
    // Expanded shows series rows with weight values
    expect(screen.getByDisplayValue('80')).toBeInTheDocument();
    expect(screen.getByDisplayValue('85')).toBeInTheDocument();
    expect(screen.getByDisplayValue('90')).toBeInTheDocument();
  });

  it('non-first exercise starts collapsed showing summary', () => {
    render(<ExerciseCard {...defaultProps} index={1} />);
    // Collapsed shows summary text
    expect(screen.getByText(/3 series/)).toBeInTheDocument();
    // Should NOT show individual weight inputs
    expect(screen.queryByDisplayValue('80')).not.toBeInTheDocument();
  });

  it('toggles expanded/collapsed on header click', async () => {
    render(<ExerciseCard {...defaultProps} index={1} />);
    // Initially collapsed
    expect(screen.queryByDisplayValue('80')).not.toBeInTheDocument();
    
    // Click to expand
    fireEvent.click(screen.getByText('Press Banca'));
    expect(screen.getByDisplayValue('80')).toBeInTheDocument();
    
    // Click to collapse
    fireEvent.click(screen.getByText('Press Banca'));
    expect(screen.queryByDisplayValue('80')).not.toBeInTheDocument();
  });

  it('shows notes when expanded', () => {
    render(<ExerciseCard {...defaultProps} index={0} />);
    expect(screen.getByText('agarre cerrado')).toBeInTheDocument();
  });

  it('calls onToggleSeries when checkbox is clicked', () => {
    const onToggleSeries = vi.fn();
    const ex = makeExercise();
    render(<ExerciseCard {...defaultProps} exercise={ex} onToggleSeries={onToggleSeries} index={0} />);
    
    // Click the first checkbox
    const checkboxes = document.querySelectorAll('.check-box');
    fireEvent.click(checkboxes[0]);
    expect(onToggleSeries).toHaveBeenCalledWith(ex.id, ex.series[0].id);
  });

  it('calls onAddSeries when add button clicked', () => {
    const onAddSeries = vi.fn();
    const ex = makeExercise();
    render(<ExerciseCard {...defaultProps} exercise={ex} onAddSeries={onAddSeries} index={0} />);
    
    fireEvent.click(screen.getByText('Agregar serie'));
    expect(onAddSeries).toHaveBeenCalledWith(ex.id);
  });

  it('calls onUpdateSeries when weight input changes', async () => {
    const onUpdateSeries = vi.fn();
    const ex = makeExercise();
    render(<ExerciseCard {...defaultProps} exercise={ex} onUpdateSeries={onUpdateSeries} index={0} />);
    
    const weightInput = screen.getByDisplayValue('80');
    fireEvent.change(weightInput, { target: { value: '100' } });
    expect(onUpdateSeries).toHaveBeenCalledWith(ex.id, ex.series[0].id, 'weight', '100');
  });
});

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddExerciseModal from '../components/AddExerciseModal';

describe('AddExerciseModal', () => {
  const defaultProps = {
    onClose: vi.fn(),
    onSave: vi.fn(),
    editExercise: null,
  };

  it('renders new exercise form', () => {
    render(<AddExerciseModal {...defaultProps} />);
    expect(screen.getByText('Nuevo Ejercicio')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Ej: Press Banca')).toBeInTheDocument();
  });

  it('starts with 3 series by default', () => {
    render(<AddExerciseModal {...defaultProps} />);
    // Stepper value shows 3
    const stepper = document.querySelector('.stepper-value');
    expect(stepper).toHaveTextContent('3');
    // 3 series config rows (numbered 1, 2, 3)
    const nums = document.querySelectorAll('.series-config-num');
    expect(nums).toHaveLength(3);
  });

  it('increments and decrements series count', async () => {
    render(<AddExerciseModal {...defaultProps} />);
    const stepperBtns = document.querySelectorAll('.stepper-btn');
    const stepper = document.querySelector('.stepper-value');
    
    // Decrement: 3 -> 2
    await userEvent.click(stepperBtns[0]);
    expect(stepper).toHaveTextContent('2');

    // Increment: 2 -> 3
    await userEvent.click(stepperBtns[1]);
    expect(stepper).toHaveTextContent('3');
  });

  it('disables save when name is empty', () => {
    render(<AddExerciseModal {...defaultProps} />);
    const saveBtn = screen.getByText('Guardar Ejercicio');
    expect(saveBtn).toBeDisabled();
  });

  it('saves exercise with correct data', async () => {
    const onSave = vi.fn();
    render(<AddExerciseModal {...defaultProps} onSave={onSave} />);
    
    await userEvent.type(screen.getByPlaceholderText('Ej: Press Banca'), 'Sentadilla');
    fireEvent.click(screen.getByText('Guardar Ejercicio'));
    
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Sentadilla',
        seriesCount: 3,
      })
    );
  });

  it('populates form when editing', () => {
    const editExercise = {
      name: 'Press Banca',
      notes: 'agarre cerrado',
      series: [
        { id: '1', weight: '80', reps: '10', completed: false },
        { id: '2', weight: '85', reps: '8', completed: true },
      ],
    };
    render(<AddExerciseModal {...defaultProps} editExercise={editExercise} />);
    expect(screen.getByText('Editar Ejercicio')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Press Banca')).toBeInTheDocument();
    expect(screen.getByDisplayValue('agarre cerrado')).toBeInTheDocument();
    expect(screen.getByDisplayValue('80')).toBeInTheDocument();
    expect(screen.getByDisplayValue('85')).toBeInTheDocument();
  });
});

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddDayModal from '../components/AddDayModal';

describe('AddDayModal', () => {
  const defaultProps = {
    onClose: vi.fn(),
    onSave: vi.fn(),
    editDay: null,
    usedDays: [],
  };

  it('renders with all weekday options', () => {
    render(<AddDayModal {...defaultProps} />);
    expect(screen.getByText('Nuevo Día')).toBeInTheDocument();
    expect(screen.getByText('Selecciona un día')).toBeInTheDocument();
  });

  it('shows weekday picker when clicking the selector', async () => {
    render(<AddDayModal {...defaultProps} />);
    await userEvent.click(screen.getByText('Selecciona un día'));
    expect(screen.getByText('Lunes')).toBeInTheDocument();
    expect(screen.getByText('Viernes')).toBeInTheDocument();
    expect(screen.getByText('Domingo')).toBeInTheDocument();
  });

  it('marks used days as disabled', async () => {
    render(<AddDayModal {...defaultProps} usedDays={['Lunes', 'Martes']} />);
    await userEvent.click(screen.getByText('Selecciona un día'));
    
    const lunes = screen.getByText('Lunes').closest('button');
    expect(lunes).toBeDisabled();
    expect(screen.getAllByText('En uso')).toHaveLength(2);
    
    const miercoles = screen.getByText('Miércoles').closest('button');
    expect(miercoles).not.toBeDisabled();
  });

  it('selects a day and enables saving', async () => {
    const onSave = vi.fn();
    render(<AddDayModal {...defaultProps} onSave={onSave} />);
    
    // Open picker and select
    await userEvent.click(screen.getByText('Selecciona un día'));
    await userEvent.click(screen.getByText('Miércoles'));
    
    // Save
    fireEvent.click(screen.getByText('Guardar Día'));
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Miércoles' })
    );
  });

  it('populates fields when editing', () => {
    const editDay = { name: 'Lunes', routine: 'Push', isRestDay: false, notes: 'notas' };
    render(<AddDayModal {...defaultProps} editDay={editDay} />);
    expect(screen.getByText('Editar Día')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Push')).toBeInTheDocument();
    expect(screen.getByDisplayValue('notas')).toBeInTheDocument();
  });

  it('hides routine field when rest day is toggled', async () => {
    render(<AddDayModal {...defaultProps} />);
    
    // Open picker and select a day first
    await userEvent.click(screen.getByText('Selecciona un día'));
    await userEvent.click(screen.getByText('Sábado'));
    
    // Toggle rest day by clicking the toggle track
    const toggleTrack = document.querySelector('.toggle-track');
    fireEvent.click(toggleTrack);
    
    // Routine input should not be visible
    expect(screen.queryByPlaceholderText('Ej: Pecho y Tríceps')).not.toBeInTheDocument();
  });
});

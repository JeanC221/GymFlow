import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SettingsPanel from '../components/SettingsPanel';

describe('SettingsPanel', () => {
  const defaultProps = {
    onClose: vi.fn(),
    onClearAll: vi.fn(),
    onResetSeries: vi.fn(),
    weightUnit: 'kg',
    onChangeUnit: vi.fn(),
    theme: 'dark',
    onChangeTheme: vi.fn(),
  };

  it('renders all settings sections', () => {
    render(<SettingsPanel {...defaultProps} />);
    expect(screen.getByText('Ajustes')).toBeInTheDocument();
    expect(screen.getByText('Tema')).toBeInTheDocument();
    expect(screen.getByText('Unidad de peso')).toBeInTheDocument();
    expect(screen.getByText('Desmarcar todas las series')).toBeInTheDocument();
    expect(screen.getByText('Borrar todos los datos')).toBeInTheDocument();
  });

  it('shows active theme button', () => {
    render(<SettingsPanel {...defaultProps} theme="dark" />);
    const oscuroBtn = screen.getByText('Oscuro');
    expect(oscuroBtn).toHaveClass('active');
  });

  it('calls onChangeTheme when theme button clicked', async () => {
    const onChangeTheme = vi.fn();
    render(<SettingsPanel {...defaultProps} onChangeTheme={onChangeTheme} />);
    await userEvent.click(screen.getByText('Claro'));
    expect(onChangeTheme).toHaveBeenCalledWith('light');
  });

  it('shows active weight unit', () => {
    render(<SettingsPanel {...defaultProps} weightUnit="kg" />);
    const kgBtn = screen.getByText('kg');
    expect(kgBtn).toHaveClass('active');
  });

  it('calls onChangeUnit when unit button clicked', async () => {
    const onChangeUnit = vi.fn();
    render(<SettingsPanel {...defaultProps} onChangeUnit={onChangeUnit} />);
    await userEvent.click(screen.getByText('lbs'));
    expect(onChangeUnit).toHaveBeenCalledWith('lbs');
  });

  it('shows confirmation buttons on reset click', async () => {
    render(<SettingsPanel {...defaultProps} />);
    await userEvent.click(screen.getByText('Reiniciar'));
    expect(screen.getByText('Sí')).toBeInTheDocument();
    expect(screen.getByText('No')).toBeInTheDocument();
  });

  it('calls onResetSeries on confirmation', async () => {
    const onResetSeries = vi.fn();
    render(<SettingsPanel {...defaultProps} onResetSeries={onResetSeries} />);
    await userEvent.click(screen.getByText('Reiniciar'));
    await userEvent.click(screen.getByText('Sí'));
    expect(onResetSeries).toHaveBeenCalled();
  });

  it('shows confirmation buttons on delete click', async () => {
    render(<SettingsPanel {...defaultProps} />);
    await userEvent.click(screen.getByText('Borrar'));
    expect(screen.getByText('Sí')).toBeInTheDocument();
    expect(screen.getByText('No')).toBeInTheDocument();
  });

  it('calls onClearAll on confirmation', async () => {
    const onClearAll = vi.fn();
    render(<SettingsPanel {...defaultProps} onClearAll={onClearAll} />);
    await userEvent.click(screen.getByText('Borrar'));
    await userEvent.click(screen.getByText('Sí'));
    expect(onClearAll).toHaveBeenCalled();
  });

  it('cancels delete when No is clicked', async () => {
    const onClearAll = vi.fn();
    render(<SettingsPanel {...defaultProps} onClearAll={onClearAll} />);
    await userEvent.click(screen.getByText('Borrar'));
    await userEvent.click(screen.getByText('No'));
    expect(onClearAll).not.toHaveBeenCalled();
    // Back to initial state
    expect(screen.getByText('Borrar')).toBeInTheDocument();
  });

  it('shows version footer', () => {
    render(<SettingsPanel {...defaultProps} />);
    expect(screen.getByText('GymFlow v1.0')).toBeInTheDocument();
  });

  it('calls onClose when overlay clicked', () => {
    const onClose = vi.fn();
    render(<SettingsPanel {...defaultProps} onClose={onClose} />);
    fireEvent.click(document.querySelector('.modal-overlay'));
    expect(onClose).toHaveBeenCalled();
  });
});

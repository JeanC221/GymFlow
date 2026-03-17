import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';

// We need to wait for the skeleton loading to finish (600ms timer)
async function waitForAppLoad() {
  await waitFor(() => {
    expect(screen.queryByText('Sin días creados')).toBeInTheDocument();
  }, { timeout: 2000 });
}

describe('App integration', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders header and empty state initially', async () => {
    render(<App />);
    expect(screen.getByText('Mi Rutina')).toBeInTheDocument();

    // Advance past skeleton loading
    act(() => { vi.advanceTimersByTime(700); });

    expect(screen.getByText('Sin días creados')).toBeInTheDocument();
  });

  it('opens add day modal when FAB is clicked', async () => {
    render(<App />);
    act(() => { vi.advanceTimersByTime(700); });

    // Click FAB
    const fab = document.querySelector('.fab');
    fireEvent.click(fab);

    expect(screen.getByText('Nuevo Día')).toBeInTheDocument();
  });

  it('creates a new day end-to-end', async () => {
    vi.useRealTimers();
    const user = userEvent.setup();
    render(<App />);

    // Wait for loading
    await waitFor(() => {
      expect(screen.getByText('Sin días creados')).toBeInTheDocument();
    }, { timeout: 2000 });

    // Click FAB
    const fab = document.querySelector('.fab');
    await user.click(fab);

    // Select a day
    await user.click(screen.getByText('Selecciona un día'));
    await user.click(screen.getByText('Lunes'));

    // Enter routine name
    await user.type(screen.getByPlaceholderText('Ej: Pecho y Tríceps'), 'Push');

    // Save
    await user.click(screen.getByText('Guardar Día'));

    // Wait for modal to close
    await waitFor(() => {
      expect(screen.queryByText('Nuevo Día')).not.toBeInTheDocument();
    });

    // Day should appear in list
    expect(screen.getByText('Lunes')).toBeInTheDocument();
    expect(screen.getByText('Push')).toBeInTheDocument();

    // Verify localStorage persistence
    const stored = JSON.parse(localStorage.getItem('gym-days'));
    expect(stored).toHaveLength(1);
    expect(stored[0].name).toBe('Lunes');
    expect(stored[0].routine).toBe('Push');
  });

  it('opens settings panel', async () => {
    vi.useRealTimers();
    const user = userEvent.setup();
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText('Sin días creados')).toBeInTheDocument();
    }, { timeout: 2000 });

    // Click settings button
    const buttons = screen.getAllByRole('button');
    const settingsBtn = buttons.find(b => b.querySelector('.lucide-settings'));
    await user.click(settingsBtn);

    expect(screen.getByText('Ajustes')).toBeInTheDocument();
    expect(screen.getByText('Tema')).toBeInTheDocument();
  });

  it('persists theme change to localStorage', async () => {
    vi.useRealTimers();
    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Sin días creados')).toBeInTheDocument();
    }, { timeout: 2000 });

    // Open settings
    const buttons = screen.getAllByRole('button');
    const settingsBtn = buttons.find(b => b.querySelector('.lucide-settings'));
    await user.click(settingsBtn);

    // Switch to light theme
    await user.click(screen.getByText('Claro'));

    const storedTheme = JSON.parse(localStorage.getItem('gym-theme'));
    expect(storedTheme).toBe('light');
  });

  it('persists weight unit change', async () => {
    vi.useRealTimers();
    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Sin días creados')).toBeInTheDocument();
    }, { timeout: 2000 });

    // Open settings
    const buttons = screen.getAllByRole('button');
    const settingsBtn = buttons.find(b => b.querySelector('.lucide-settings'));
    await user.click(settingsBtn);

    // Switch to lbs
    await user.click(screen.getByText('lbs'));

    const storedUnit = JSON.parse(localStorage.getItem('gym-weight-unit'));
    expect(storedUnit).toBe('lbs');
  });

  it('navigates to day detail and back', async () => {
    // Pre-populate a day
    const day = {
      id: 'test-day-1',
      name: 'Lunes',
      routine: 'Push',
      isRestDay: false,
      notes: '',
      emoji: '',
      exercises: [],
    };
    localStorage.setItem('gym-days', JSON.stringify([day]));

    vi.useRealTimers();
    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Lunes')).toBeInTheDocument();
    }, { timeout: 2000 });

    // Click the day card
    fireEvent.click(screen.getByText('Lunes'));

    await waitFor(() => {
      expect(screen.getByText('Sin ejercicios')).toBeInTheDocument();
    });

    // Click back button
    const backBtn = document.querySelector('.header-back button');
    fireEvent.click(backBtn);

    await waitFor(() => {
      expect(screen.getByText('Mi Rutina')).toBeInTheDocument();
    });
  });

  it('clear all data from settings', async () => {
    // Pre-populate
    localStorage.setItem('gym-days', JSON.stringify([{
      id: 'd1', name: 'Lunes', routine: 'Push', isRestDay: false, notes: '', emoji: '', exercises: [],
    }]));

    vi.useRealTimers();
    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Lunes')).toBeInTheDocument();
    }, { timeout: 2000 });

    // Open settings
    const buttons = screen.getAllByRole('button');
    const settingsBtn = buttons.find(b => b.querySelector('.lucide-settings'));
    await user.click(settingsBtn);

    // Click "Borrar"
    await user.click(screen.getByText('Borrar'));
    // Confirm
    await user.click(screen.getByText('Sí'));

    await waitFor(() => {
      expect(screen.getByText('Sin días creados')).toBeInTheDocument();
    });

    expect(JSON.parse(localStorage.getItem('gym-days'))).toEqual([]);
  });

  it('filters days with search', async () => {
    // Pre-populate with 3 days
    const days = [
      { id: 'd1', name: 'Lunes', routine: 'Push', isRestDay: false, notes: '', emoji: '', exercises: [] },
      { id: 'd2', name: 'Martes', routine: 'Pull', isRestDay: false, notes: '', emoji: '', exercises: [] },
      { id: 'd3', name: 'Miércoles', routine: 'Legs', isRestDay: false, notes: '', emoji: '', exercises: [] },
    ];
    localStorage.setItem('gym-days', JSON.stringify(days));

    vi.useRealTimers();
    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Lunes')).toBeInTheDocument();
    }, { timeout: 2000 });

    // Click search button (shows when > 2 days)
    const buttons = screen.getAllByRole('button');
    const searchBtn = buttons.find(b => b.querySelector('.lucide-search'));
    await user.click(searchBtn);

    // Type in search
    const searchInput = screen.getByPlaceholderText('Buscar día o rutina...');
    await user.type(searchInput, 'Pull');

    // Only Martes should be visible
    expect(screen.getByText('Martes')).toBeInTheDocument();
    expect(screen.queryByText('Lunes')).not.toBeInTheDocument();
    expect(screen.queryByText('Miércoles')).not.toBeInTheDocument();
  });
});

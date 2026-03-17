import { describe, it, expect, vi } from 'vitest';
import {
  createId,
  getExerciseColor,
  createDay,
  cloneDay,
  getDayProgress,
  calculateStreak,
  createExercise,
  getExerciseSummary,
} from '../utils';

describe('createId', () => {
  it('returns a non-empty string', () => {
    expect(createId()).toBeTruthy();
    expect(typeof createId()).toBe('string');
  });

  it('returns unique ids', () => {
    const ids = new Set(Array.from({ length: 100 }, () => createId()));
    expect(ids.size).toBe(100);
  });
});

describe('getExerciseColor', () => {
  it('returns a CSS variable', () => {
    expect(getExerciseColor(0)).toMatch(/^var\(--accent-/);
  });

  it('cycles through colors', () => {
    const c0 = getExerciseColor(0);
    const c5 = getExerciseColor(5);
    expect(c0).toBe(c5);
  });
});

describe('createDay', () => {
  it('creates a day with correct properties', () => {
    const day = createDay('Lunes', 'Push', false);
    expect(day).toMatchObject({
      name: 'Lunes',
      routine: 'Push',
      isRestDay: false,
      notes: '',
      exercises: [],
    });
    expect(day.id).toBeTruthy();
  });

  it('clears routine for rest days', () => {
    const day = createDay('Domingo', 'whatever', true);
    expect(day.routine).toBe('');
    expect(day.isRestDay).toBe(true);
  });
});

describe('cloneDay', () => {
  it('creates a copy with new id and "(copia)" suffix', () => {
    const original = createDay('Lunes', 'Push', false);
    original.exercises = [
      createExercise('Press Banca', 3, [{ weight: '80', reps: '10' }], ''),
    ];
    const copy = cloneDay(original);

    expect(copy.id).not.toBe(original.id);
    expect(copy.name).toBe('Lunes (copia)');
    expect(copy.exercises).toHaveLength(1);
    expect(copy.exercises[0].id).not.toBe(original.exercises[0].id);
    expect(copy.exercises[0].name).toBe('Press Banca');
    // Series IDs should be different
    expect(copy.exercises[0].series[0].id).not.toBe(original.exercises[0].series[0].id);
    // Series completion should be reset
    expect(copy.exercises[0].series[0].completed).toBe(false);
  });
});

describe('getDayProgress', () => {
  it('returns 0 for a day with no exercises', () => {
    const day = createDay('Lunes', 'Push', false);
    expect(getDayProgress(day)).toBe(0);
  });

  it('returns 0 when no series completed', () => {
    const day = createDay('Lunes', 'Push', false);
    day.exercises = [createExercise('Press', 3, [], '')];
    expect(getDayProgress(day)).toBe(0);
  });

  it('returns 1 when all series completed', () => {
    const day = createDay('Lunes', 'Push', false);
    day.exercises = [createExercise('Press', 2, [], '')];
    day.exercises[0].series.forEach(s => { s.completed = true; });
    expect(getDayProgress(day)).toBe(1);
  });

  it('returns correct fraction for partial completion', () => {
    const day = createDay('Lunes', 'Push', false);
    day.exercises = [createExercise('Press', 4, [], '')];
    day.exercises[0].series[0].completed = true;
    day.exercises[0].series[1].completed = true;
    expect(getDayProgress(day)).toBe(0.5);
  });
});

describe('calculateStreak', () => {
  it('returns 0 for empty history', () => {
    expect(calculateStreak([])).toBe(0);
    expect(calculateStreak(null)).toBe(0);
  });

  it('returns 1 for today only', () => {
    const today = new Date().toISOString().slice(0, 10);
    expect(calculateStreak([{ date: today }])).toBe(1);
  });

  it('counts consecutive days', () => {
    const d = (offset) => new Date(Date.now() - offset * 86400000).toISOString().slice(0, 10);
    const history = [
      { date: d(0) },
      { date: d(1) },
      { date: d(2) },
    ];
    expect(calculateStreak(history)).toBe(3);
  });

  it('breaks on gap', () => {
    const d = (offset) => new Date(Date.now() - offset * 86400000).toISOString().slice(0, 10);
    const history = [
      { date: d(0) },
      { date: d(1) },
      { date: d(3) }, // gap at day 2
    ];
    expect(calculateStreak(history)).toBe(2);
  });
});

describe('createExercise', () => {
  it('creates exercise with correct series count', () => {
    const config = [
      { weight: '80', reps: '10' },
      { weight: '85', reps: '8' },
      { weight: '90', reps: '6' },
    ];
    const ex = createExercise('Press Banca', 3, config, 'agarre cerrado');
    expect(ex.name).toBe('Press Banca');
    expect(ex.notes).toBe('agarre cerrado');
    expect(ex.series).toHaveLength(3);
    expect(ex.series[0].weight).toBe('80');
    expect(ex.series[0].reps).toBe('10');
    expect(ex.series[0].completed).toBe(false);
    expect(ex.series[2].weight).toBe('90');
  });

  it('defaults missing config to empty strings', () => {
    const ex = createExercise('Curl', 2, [], '');
    expect(ex.series[0].weight).toBe('');
    expect(ex.series[0].reps).toBe('');
  });
});

describe('getExerciseSummary', () => {
  it('shows only series count when no data', () => {
    const ex = createExercise('Curl', 3, [], '');
    expect(getExerciseSummary(ex)).toBe('3 series');
  });

  it('shows weight and reps range', () => {
    const config = [
      { weight: '60', reps: '10' },
      { weight: '80', reps: '8' },
    ];
    const ex = createExercise('Press', 2, config, '');
    const summary = getExerciseSummary(ex, 'kg');
    expect(summary).toContain('2 series');
    expect(summary).toContain('60-80 kg');
    expect(summary).toContain('8-10 reps');
  });

  it('shows single value when all weights equal', () => {
    const config = [
      { weight: '50', reps: '10' },
      { weight: '50', reps: '10' },
    ];
    const ex = createExercise('Lat', 2, config, '');
    const summary = getExerciseSummary(ex, 'lbs');
    expect(summary).toContain('50 lbs');
    expect(summary).toContain('10 reps');
  });
});

export function createId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

const EXERCISE_COLORS = ['--accent-blue', '--accent-indigo', '--accent-green', '--accent-amber', '--accent-coral'];

export function getExerciseColor(index) {
  return `var(${EXERCISE_COLORS[index % EXERCISE_COLORS.length]})`;
}

export function createDay(name, routine, isRestDay) {
  return {
    id: createId(),
    name,
    routine: isRestDay ? '' : routine,
    isRestDay,
    notes: '',
    emoji: '',
    exercises: [],
  };
}

export function cloneDay(day) {
  return {
    ...day,
    id: createId(),
    name: `${day.name} (copia)`,
    exercises: day.exercises.map(ex => ({
      ...ex,
      id: createId(),
      series: ex.series.map(s => ({ ...s, id: createId(), completed: false })),
    })),
  };
}

export function getDayProgress(day) {
  if (!day.exercises || day.exercises.length === 0) return 0;
  const totalSeries = day.exercises.reduce((sum, ex) => sum + ex.series.length, 0);
  if (totalSeries === 0) return 0;
  const completedSeries = day.exercises.reduce(
    (sum, ex) => sum + ex.series.filter(s => s.completed).length, 0
  );
  return completedSeries / totalSeries;
}

export function calculateStreak(history) {
  if (!history || history.length === 0) return 0;
  const dates = [...new Set(history.map(h => h.date))].sort().reverse();
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  if (dates[0] !== today && dates[0] !== yesterday) return 0;
  let streak = 1;
  for (let i = 0; i < dates.length - 1; i++) {
    const curr = new Date(dates[i]);
    const prev = new Date(dates[i + 1]);
    const diffDays = (curr - prev) / 86400000;
    if (diffDays === 1) streak++;
    else break;
  }
  return streak;
}

export function createExercise(name, seriesCount, seriesConfig, notes) {
  return {
    id: createId(),
    name,
    notes,
    series: Array.from({ length: seriesCount }, (_, i) => ({
      id: createId(),
      weight: seriesConfig[i]?.weight || '',
      reps: seriesConfig[i]?.reps || '',
      completed: false,
    })),
  };
}

export function getExerciseSummary(exercise, unit = 'kg') {
  const count = exercise.series.length;
  const weights = exercise.series.map(s => s.weight).filter(Boolean);
  const reps = exercise.series.map(s => s.reps).filter(Boolean);
  
  if (weights.length === 0 && reps.length === 0) {
    return `${count} series`;
  }

  const parts = [];
  if (weights.length > 0) {
    const minW = Math.min(...weights.map(Number));
    const maxW = Math.max(...weights.map(Number));
    parts.push(minW === maxW ? `${minW} ${unit}` : `${minW}-${maxW} ${unit}`);
  }
  if (reps.length > 0) {
    const minR = Math.min(...reps.map(Number));
    const maxR = Math.max(...reps.map(Number));
    parts.push(minR === maxR ? `${minR} reps` : `${minR}-${maxR} reps`);
  }

  return `${count} series · ${parts.join(' × ')}`;
}

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
    exercises: [],
  };
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

export function getExerciseSummary(exercise) {
  const count = exercise.series.length;
  const weights = exercise.series.map(s => s.weight).filter(Boolean);
  const reps = exercise.series.map(s => s.reps).filter(Boolean);
  
  if (weights.length === 0 && reps.length === 0) {
    return `${count} series`;
  }

  const minW = Math.min(...weights.map(Number));
  const maxW = Math.max(...weights.map(Number));
  const minR = Math.min(...reps.map(Number));
  const maxR = Math.max(...reps.map(Number));

  const weightStr = minW === maxW ? `${minW} kg` : `${minW}-${maxW} kg`;
  const repsStr = minR === maxR ? `${minR} reps` : `${minR}-${maxR} reps`;

  return `${count} series · ${weightStr} × ${repsStr}`;
}

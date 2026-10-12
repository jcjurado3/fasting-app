export const GROWTH_MARKS = [0, 12, 24, 36, 48, 60, 72] as const;

export const growthStages = [
  { hour: 0, title: 'Seed', detail: 'A small start' },
  { hour: 12, title: 'Sprout', detail: 'The trunk rises' },
  { hour: 24, title: 'First branches', detail: 'A wider reach' },
  { hour: 36, title: 'Canopy', detail: 'Leaves begin' },
  { hour: 48, title: 'Taking root', detail: 'Roots show' },
  { hour: 60, title: 'Fuller crown', detail: 'The canopy fills' },
  { hour: 72, title: 'Rooted', detail: 'The window is complete' },
] as const;

export function growthReveal(hours: number, start: number, end: number) {
  if (!Number.isFinite(hours) || hours <= start || end <= start) return 0;
  if (hours >= end) return 1;
  return (hours - start) / (end - start);
}

export function growthState(hours: number) {
  const safe = Number.isFinite(hours) ? Math.max(0, hours) : 0;
  const clamped = Math.min(72, safe);
  const stage = [...growthStages].reverse().find((item) => clamped >= item.hour) ?? growthStages[0];
  return {
    hours: clamped,
    percent: (clamped / 72) * 100,
    pastWindow: safe > 72,
    stage,
    trunk: growthReveal(clamped, 0, 12),
    branches: growthReveal(clamped, 12, 24),
    leaves: growthReveal(clamped, 24, 36),
    roots: growthReveal(clamped, 36, 48),
    crown: growthReveal(clamped, 48, 60),
    settled: growthReveal(clamped, 60, 72),
    marks: GROWTH_MARKS.map((hour) => ({
      hour,
      reached: clamped >= hour,
      current: hour === stage.hour,
    })),
  };
}

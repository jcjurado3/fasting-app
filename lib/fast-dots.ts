export const FAST_WINDOW_HOURS = 72;

const rings = [
  { count: 24, radius: 80 },
  { count: 20, radius: 64 },
  { count: 16, radius: 48 },
  { count: 12, radius: 32 },
];

export const hourDots = rings.flatMap((ring) => Array.from({ length: ring.count }, (_, index) => {
  const angle = -Math.PI / 2 + (index / ring.count) * Math.PI * 2;
  return { x: 100 + Math.cos(angle) * ring.radius, y: 100 + Math.sin(angle) * ring.radius };
}));

export const SECOND_DOTS = 60;
export const secondRingRadius = 18;
export const secondDots = Array.from({ length: SECOND_DOTS }, (_, index) => {
  const angle = -Math.PI / 2 + (index / SECOND_DOTS) * Math.PI * 2;
  return { x: 100 + Math.cos(angle) * secondRingRadius, y: 100 + Math.sin(angle) * secondRingRadius };
});

export function elapsedWholeSeconds(elapsedHours: number) {
  return Math.max(0, Math.floor(Math.max(0, elapsedHours) * 3600));
}

export function secondOfMinute(elapsedHours: number) {
  return elapsedWholeSeconds(elapsedHours) % SECOND_DOTS;
}

export function windowRemaining(elapsedHours: number) {
  const hours = Math.max(0, FAST_WINDOW_HOURS - Math.max(0, elapsedHours));
  return { hours, seconds: Math.round(hours * 3600) };
}

export function formatHoursLeft(elapsedHours: number) {
  const rounded = Math.round(windowRemaining(elapsedHours).hours * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}

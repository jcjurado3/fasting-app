export type GardenFast = { start: string; end?: string };

export function elapsedGardenHours(fast: GardenFast | null | undefined, now: number) {
  if (!fast?.start || !Number.isFinite(now)) return 0;
  const start = new Date(fast.start).getTime();
  const end = fast.end ? new Date(fast.end).getTime() : now;
  if (!Number.isFinite(start) || !Number.isFinite(end)) return 0;
  return Math.max(0, (end - start) / 3600000);
}

function hourLabel(hours: number) {
  const whole = Math.floor(hours);
  return whole === 1 ? '1 hour' : `${whole} hours`;
}

export function gardenStatus(fast: GardenFast | null, now: number) {
  const hours = elapsedGardenHours(fast, now);
  if (!fast) return { hours: 0, active: false, ended: false, label: 'Not started' };
  if (fast.end) return { hours, active: false, ended: true, label: `Ended · ${hourLabel(hours)}` };
  if (hours >= 72) return { hours, active: true, ended: false, label: 'Window complete' };
  if (hours < 1) return { hours, active: true, ended: false, label: 'In progress · just begun' };
  return { hours, active: true, ended: false, label: `In progress · ${hourLabel(hours)}` };
}

export function resolveGardenFast(input: {
  yours: boolean;
  current: GardenFast | null;
  shared: GardenFast | null | undefined;
  local: GardenFast | null;
  useShared: boolean;
}) {
  if (input.yours) return input.current;
  if (input.useShared && input.shared !== undefined) return input.shared;
  return input.local;
}

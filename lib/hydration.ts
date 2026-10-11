export function hydrationFill(ml: number, goal: number) {
  if (!Number.isFinite(ml) || !Number.isFinite(goal) || goal <= 0 || ml <= 0) return 0;
  return Math.min(100, (ml / goal) * 100);
}

export function hydrationSeams(amountsNewestFirst: number[], goal: number) {
  const amounts = [...amountsNewestFirst].reverse().filter((amount) => Number.isFinite(amount) && amount > 0);
  const fill = hydrationFill(amounts.reduce((sum, amount) => sum + amount, 0), goal);
  let total = 0;
  const seams: number[] = [];
  for (const amount of amounts) {
    total += amount;
    const at = hydrationFill(total, goal);
    if (at > 4 && fill - at > 6) seams.push(Math.round(at * 10) / 10);
  }
  return seams;
}

export function hydrationNote(ml: number, goal: number) {
  if (!(ml > 0) || !(goal > 0)) return 'Small sips, throughout the day.';
  if (ml > goal) return "A little past today's reference.";
  if (ml >= goal) return "Today's reference is met.";
  return 'Small sips, throughout the day.';
}

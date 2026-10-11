import { createClient } from '@supabase/supabase-js';
export const people = ['Jimmy', 'Juan', 'Bre'] as const;
export type Person = (typeof people)[number];
export type Intake = { id: string; type: string; amount: number; at: string; note: string };
export type Fast = { id: string; start: string; meal: string; mealAt: string; end?: string };
export type CheckMoment = 'before' | 'day-1' | 'day-2' | 'day-3' | 'after';
export type WeightUnit = 'lb' | 'kg';
export type CheckIn = { id: string; fastId: string | null; moment: CheckMoment; at: string; weight: number | null; unit: WeightUnit; note: string; photo: string | null };
export type SleepLog = { id: string; at: string; hours: number; quality: string; note: string };
export type WorkoutLog = { id: string; at: string; kind: string; minutes: number; note: string };
export type Journal = { fasts: Fast[]; intake: Intake[]; checks: Record<string, boolean>; waterGoal: number; notes: {id:string; at:string; text:string; mood:string}[]; checkins: CheckIn[]; sleep: SleepLog[]; workouts: WorkoutLog[] };
export const emptyJournal = (): Journal => ({fasts:[], intake:[], checks:{}, waterGoal:2000, notes:[], checkins:[], sleep:[], workouts:[]});
export function normalizeJournal(value: unknown): Journal {
  const raw = value && typeof value === 'object' ? value as Partial<Journal> : {};
  return {
    ...emptyJournal(),
    ...raw,
    fasts: Array.isArray(raw.fasts) ? raw.fasts : [],
    intake: Array.isArray(raw.intake) ? raw.intake : [],
    checks: raw.checks && typeof raw.checks === 'object' ? raw.checks : {},
    waterGoal: typeof raw.waterGoal === 'number' ? raw.waterGoal : 2000,
    notes: Array.isArray(raw.notes) ? raw.notes : [],
    checkins: Array.isArray(raw.checkins) ? raw.checkins : [],
    sleep: Array.isArray(raw.sleep) ? raw.sleep : [],
    workouts: Array.isArray(raw.workouts) ? raw.workouts : [],
  };
}
export function suggestedMoment(fast: Fast | undefined, hours: number): CheckMoment {
  if (!fast) return 'before';
  if (fast.end || hours >= 72) return 'after';
  if (hours >= 48) return 'day-3';
  if (hours >= 24) return 'day-2';
  return 'day-1';
}
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
export const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL && publishableKey ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, publishableKey) : null;
export function elapsedHours(fast: Fast | undefined, now: number) { return fast ? Math.max(0, ((fast.end ? new Date(fast.end).getTime() : now) - new Date(fast.start).getTime()) / 3600000) : 0; }
export function todayIntake(items: Intake[], now: number) { return items.filter(i => new Date(i.at).toDateString() === new Date(now).toDateString()); }

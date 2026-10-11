import { createClient } from '@supabase/supabase-js';
export const people = ['Jimmy', 'Juan', 'Bre'] as const;
export type Person = (typeof people)[number];
export type Intake = { id: string; type: string; amount: number; at: string; note: string };
export type Fast = { id: string; start: string; meal: string; mealAt: string; end?: string };
export type Journal = { fasts: Fast[]; intake: Intake[]; checks: Record<string, boolean>; waterGoal: number; notes: {id:string; at:string; text:string; mood:string}[] };
export const emptyJournal = (): Journal => ({fasts:[], intake:[], checks:{}, waterGoal:2000, notes:[]});
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
export const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL && publishableKey ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, publishableKey) : null;
export function elapsedHours(fast: Fast | undefined, now: number) { return fast ? Math.max(0, ((fast.end ? new Date(fast.end).getTime() : now) - new Date(fast.start).getTime()) / 3600000) : 0; }
export function todayIntake(items: Intake[], now: number) { return items.filter(i => new Date(i.at).toDateString() === new Date(now).toDateString()); }

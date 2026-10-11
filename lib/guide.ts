export type GlucoseUnit = 'mg/dL' | 'mmol/L';

export type Phase = {
  hour: number;
  title: string;
  label: string;
  status: string;
  autophagy: string;
  glance: string;
  text: string;
  body: string;
  image: string;
  alt: string;
};

export const phases: Phase[] = [
  {
    hour: 0,
    title: 'Fed state',
    label: '0–12 hours',
    status: 'Anabolic',
    autophagy: 'Baseline',
    glance: 'Digestion',
    text: 'The last meal is still at work. Insulin is higher, growth signals are active, and autophagy stays near its everyday baseline.',
    body: 'Insulin is still up, and mTOR is active. You are running on glucose from the last meal, so autophagy stays near its everyday baseline. Settle in, make room for rest, and notice how you feel.',
    image: '/guide/guide-fed.jpg',
    alt: 'A ceramic bowl with the remains of a simple meal, an olive sprig, and a linen cloth in morning light.',
  },
  {
    hour: 12,
    title: 'Glycogen easing',
    label: '12–24 hours',
    status: 'Catabolic transition',
    autophagy: 'Early',
    glance: 'Glycogen',
    text: 'Stored liver glycogen starts to run down. Insulin falls, glucagon rises, and early autophagy pathways can begin to stir.',
    body: 'Liver glycogen, the stored sugar, starts to run out. Insulin falls and glucagon rises. The BodySpec guide places the first flicker of autophagy around hours 18 to 24, once a fuel shortage registers. Keep the day gentle, and keep fluids close.',
    image: '/guide/guide-glycogen.jpg',
    alt: 'An empty ceramic plate, a glass of water, and a single leaf suspended in dawn light.',
  },
  {
    hour: 24,
    title: 'Ketosis shift',
    label: '24–48 hours',
    status: 'Fat burning',
    autophagy: 'Rising',
    glance: 'Ketosis',
    text: 'With glycogen largely spent, the liver turns fat into ketones. This is the stretch where the BodySpec guide describes autophagy ramping up.',
    body: 'Glycogen is largely spent, so the liver turns fat into ketones. AMPK, the cellular energy sensor, is described as surging here, which quiets mTOR. This is where the guide says autophagy ramps up, with more attention on damaged proteins. Check in with your energy, and keep listening.',
    image: '/guide/guide-ketosis.jpg',
    alt: 'A small terracotta oil lamp and a dish of oil beside olive leaves.',
  },
  {
    hour: 48,
    title: 'Peak window',
    label: '48–72 hours',
    status: 'Deep repair',
    autophagy: 'Peak zone',
    glance: 'Peak zone',
    text: 'Insulin is very low and ketones are typically higher. BodySpec calls hours 48 to 72 the peak autophagy window of a three-day fast.',
    body: 'Insulin is very low, and ketones such as beta-hydroxybutyrate are typically high. BodySpec calls hours 48 to 72 the peak zone of a three-day fast, and treats 72 hours as a sensible place to stop. The process can continue past that mark. The safer balance is to come back to food. Plan a small first meal. Ending earlier is always a valid choice.',
    image: '/guide/guide-autophagy.jpg',
    alt: 'Overlapping leaves folding inward around a pale new shoot.',
  },
  {
    hour: 72,
    title: 'Gentle return',
    label: '72 hours',
    status: 'Refeed',
    autophagy: 'Ease out',
    glance: 'Refeed',
    text: 'The planned window is complete. End the fast and come back to food slowly, starting with a small warm portion.',
    body: 'The planned window is complete. End the fast and come back to food slowly, starting with a small warm portion.',
    image: '/guide/guide-refeed.jpg',
    alt: 'A small plate of soft eggs and avocado on a linen cloth.',
  },
];

export type GkiZone = {
  tone: 'none' | 'low' | 'mid' | 'high' | 'peak';
  range: string;
  state: string;
  autophagy: string;
};

export const gkiZones: GkiZone[] = [
  { tone: 'none', range: 'Above 9', state: 'No ketosis', autophagy: 'Baseline' },
  { tone: 'low', range: '6 – 9', state: 'Mild ketosis', autophagy: 'Low' },
  { tone: 'mid', range: '3 – 6', state: 'Moderate ketosis', autophagy: 'Moderate' },
  { tone: 'high', range: '1 – 3', state: 'High therapeutic', autophagy: 'Deep zone' },
  { tone: 'peak', range: 'Below 1', state: 'Peak therapeutic', autophagy: 'Research level' },
];

export function phaseAt(hours: number): Phase {
  return phases.filter((phase) => hours >= phase.hour).at(-1) ?? phases[0];
}

export function convertGlucose(value: number, from: GlucoseUnit, to: GlucoseUnit): number {
  if (from === to || !Number.isFinite(value)) return value;
  const mmol = from === 'mg/dL' ? value / 18 : value;
  return to === 'mg/dL' ? mmol * 18 : mmol;
}

/** Glucose-ketone index. mg/dL glucose is divided by 18 before the ketone ratio. */
export function gkiScore(glucose: number, ketones: number, unit: GlucoseUnit): number | null {
  if (!Number.isFinite(glucose) || !Number.isFinite(ketones) || glucose <= 0 || ketones <= 0) return null;
  return convertGlucose(glucose, unit, 'mmol/L') / ketones;
}

/** Shared edges belong to the deeper band: 9 is mild, 6 is moderate, 3 and 1 are high. */
export function gkiZone(score: number): GkiZone {
  if (score < 1) return gkiZones[4];
  if (score <= 3) return gkiZones[3];
  if (score <= 6) return gkiZones[2];
  if (score <= 9) return gkiZones[1];
  return gkiZones[0];
}

export const TOUR_SEEN = 'still:tour';

export const tourSteps = [
  {
    id: 'welcome',
    title: 'How Still works',
    body: 'A quiet companion for a 72-hour fast. This browser keeps a local journal until you sign in with the email reserved for you.',
    target: null,
  },
  {
    id: 'fast',
    title: 'Your fast',
    body: 'Begin now, or enter a time you already started. The clock and the dots follow the same 72 hours, and you can end the fast whenever you need to.',
    target: 'fast',
  },
  {
    id: 'care',
    title: 'Care along the way',
    body: 'Water, a short daily list, and a body check-in sit with the fast. Sleep, workouts, and notes live a page away, each saved with the profile you choose.',
    target: 'care',
  },
  {
    id: 'profile',
    title: 'Choose your profile',
    body: 'Jimmy, Juan, and Bre each keep a separate journal. Choose the name your email was reserved for before you sign in.',
    target: 'profile',
  },
  {
    id: 'sign-in',
    title: 'Sign in to save',
    body: 'Sign in with your password, or email a link and open it on this device. The cloud journal follows that email, and the profile reserved for it.',
    target: 'sign-in',
  },
] as const;

export type TourStep = (typeof tourSteps)[number];

export function tourStep(index: number) {
  return tourSteps[Math.min(tourSteps.length - 1, Math.max(0, index))];
}

export function placeTourCard(
  target: { top: number; height: number; left: number; width: number } | null,
  viewport: { width: number; height: number },
) {
  const width = Math.min(380, Math.max(240, viewport.width - 24));
  const centerLeft = Math.max(12, (viewport.width - width) / 2);
  if (!target) return { placement: 'center' as const, top: 0, left: centerLeft, width };
  if (viewport.width < 760) return { placement: 'dock' as const, top: 0, left: 12, width: viewport.width - 24 };
  const left = Math.min(Math.max(12, target.left + target.width / 2 - width / 2), viewport.width - width - 12);
  const belowTop = target.top + target.height + 16;
  if (viewport.height - belowTop >= 230) return { placement: 'below' as const, top: belowTop, left, width };
  if (target.top >= 250) return { placement: 'above' as const, top: target.top - 16, left, width };
  return { placement: 'dock' as const, top: 0, left: 12, width: viewport.width - 24 };
}

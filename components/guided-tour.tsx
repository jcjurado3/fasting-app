'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { people, type Person } from '@/lib/store';
import { TOUR_SEEN, placeTourCard, tourStep, tourSteps } from '@/lib/tour';

export function GuidedTour({ signedOut, ready, launch, person, onPerson, onOverview, onSignIn }: {
  signedOut: boolean;
  ready: boolean;
  launch: number;
  person: Person;
  onPerson: (person: Person) => void;
  onOverview: () => void;
  onSignIn: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState(false);
  const [box, setBox] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
  const [viewport, setViewport] = useState({ width: 1200, height: 800 });
  const overview = useRef(onOverview);
  const started = useRef(false);
  overview.current = onOverview;

  useEffect(() => {
    if (!signedOut) setOpen(false);
  }, [signedOut]);

  useEffect(() => {
    if (!signedOut || !ready || started.current || localStorage.getItem(TOUR_SEEN)) return;
    started.current = true;
    setIndex(0);
    setPicked(false);
    setOpen(true);
  }, [signedOut, ready]);

  useEffect(() => {
    if (!launch || !signedOut) return;
    setIndex(0);
    setPicked(false);
    setOpen(true);
  }, [launch, signedOut]);

  useEffect(() => {
    if (open) overview.current();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const step = tourStep(index);
    const node = step.target ? document.querySelector<HTMLElement>(`[data-tour="${step.target}"]`) : null;
    node?.scrollIntoView({ block: 'center', inline: 'nearest' });
    function measure() {
      const current = step.target ? document.querySelector<HTMLElement>(`[data-tour="${step.target}"]`) : null;
      const rect = current?.getBoundingClientRect();
      setBox(rect && rect.width > 0 ? { top: rect.top, left: rect.left, width: rect.width, height: rect.height } : null);
      setViewport({ width: window.innerWidth, height: window.innerHeight });
    }
    const frame = requestAnimationFrame(measure);
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure, true);
    };
  }, [open, index]);

  useEffect(() => {
    if (!open) return;
    document.getElementById('tour-title')?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') dismiss();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, index]);

  function dismiss() {
    localStorage.setItem(TOUR_SEEN, '1');
    setOpen(false);
  }

  if (!open || !signedOut) return null;

  const step = tourStep(index);
  const last = index === tourSteps.length - 1;
  const frame = placeTourCard(box, viewport);
  const narrow = viewport.width < 760;
  const cardStyle = frame.placement === 'center'
    ? { top: '50%', left: '50%', width: frame.width, transform: 'translate(-50%, -50%)' }
    : frame.placement === 'dock'
      ? { left: 12, right: 12, bottom: narrow ? 84 : 20, width: 'auto' }
      : frame.placement === 'above'
        ? { top: frame.top, left: frame.left, width: frame.width, transform: 'translateY(-100%)' }
        : { top: frame.top, left: frame.left, width: frame.width };

  function next() {
    if (last) {
      dismiss();
      onSignIn();
      return;
    }
    if (step.id === 'profile' && !picked) return;
    setIndex(index + 1);
  }

  return (
    <div className={box ? 'tour-root has-spot' : 'tour-root'}>
      <div className="tour-backdrop" />
      {box && <div className="tour-spot" style={{ top: box.top - 8, left: box.left - 8, width: box.width + 16, height: box.height + 16 }} />}
      <section className="tour-card" role="dialog" aria-modal="true" aria-labelledby="tour-title" style={cardStyle}>
        <div className="tour-progress" aria-hidden="true">{tourSteps.map((item, itemIndex) => <i key={item.id} className={itemIndex === index ? 'on' : undefined} />)}</div>
        <p className="eyebrow"><span /> How it works · {index + 1} of {tourSteps.length}</p>
        <h2 id="tour-title" tabIndex={-1}>{step.title}</h2>
        <p>{step.body}</p>
        {step.id === 'profile' && (
          <div className="tour-people" role="group" aria-label="Choose your profile">
            {people.map((name) => (
              <button type="button" key={name} aria-pressed={picked && person === name} className={picked && person === name ? 'chosen' : undefined} onClick={() => { onPerson(name); setPicked(true); }}>
                <span className="avatar small" aria-hidden="true">{name[0]}</span>
                {name}
              </button>
            ))}
          </div>
        )}
        <div className="tour-actions">
          <button type="button" className="text-link tour-skip" onClick={dismiss}>Skip</button>
          <div>
            {index > 0 && <button type="button" className="button secondary" onClick={() => setIndex(index - 1)}>Back</button>}
            <button type="button" className="button primary" disabled={step.id === 'profile' && !picked} onClick={next}>{last ? 'Sign in' : 'Next'} <ArrowRight size={15} /></button>
          </div>
        </div>
      </section>
    </div>
  );
}

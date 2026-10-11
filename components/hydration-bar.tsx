'use client';

import { useEffect, useRef, useState } from 'react';
import { hydrationFill, hydrationNote, hydrationSeams } from '@/lib/hydration';

function useSettledMilliliters(ml: number) {
  const [shown, setShown] = useState(ml);
  const from = useRef(ml);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const start = from.current;
    if (reduce || start === ml) {
      from.current = ml;
      setShown(ml);
      return;
    }
    const began = performance.now();
    let frame = requestAnimationFrame(function tick(now) {
      const progress = Math.min(1, (now - began) / 800);
      const eased = 1 - (1 - progress) ** 3;
      const next = start + (ml - start) * eased;
      from.current = next;
      setShown(next);
      if (progress < 1) frame = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(frame);
  }, [ml]);

  return shown;
}

export function HydrationBar({ ml, goal, sips }: { ml: number; goal: number; sips: number[] }) {
  const fill = hydrationFill(ml, goal);
  const shown = useSettledMilliliters(ml);
  const seams = hydrationSeams(sips, goal);
  const met = goal > 0 && ml >= goal;
  const liters = (value: number, digits: number) => (Math.max(0, value) / 1000).toFixed(digits);

  return (
    <div className="hydration-meter">
      <div className="water-total">{liters(shown, 2)} <span>/ {liters(goal, 1)} L</span></div>
      <div
        className={met ? 'hydration-track met' : 'hydration-track'}
        role="meter"
        aria-valuemin={0}
        aria-valuemax={Math.max(0, goal)}
        aria-valuenow={Math.max(0, Math.round(ml))}
        aria-label={`${liters(ml, 2)} liters toward today's ${liters(goal, 1)} liter reference`}
      >
        <div className="hydration-fill" style={{ width: `${fill}%` }}>
          <span className="hydration-sheen" />
        </div>
        {seams.map((at, index) => <span className="hydration-seam" key={`${at}-${index}`} style={{ left: `${at}%` }} />)}
        {fill > 0 && <span className="hydration-bead" style={{ left: `clamp(14px, ${fill}%, calc(100% - 14px))` }}><i key={Math.round(ml)} /></span>}
      </div>
      <div className="hydration-scale"><span>0</span><span>{liters(goal / 2, 1)}</span><span>{liters(goal, 1)} L</span></div>
      <p>{hydrationNote(ml, goal)}</p>
    </div>
  );
}

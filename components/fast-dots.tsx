'use client';

import { FAST_WINDOW_HOURS, SECOND_DOTS, elapsedWholeSeconds, formatHoursLeft, hourDots, secondDots, secondOfMinute, secondRingRadius, windowRemaining } from '@/lib/fast-dots';

export function FastDots({ hours, live, unit, onUnit }: { hours: number; live: boolean; unit: 'hours' | 'seconds'; onUnit: (unit: 'hours' | 'seconds') => void }) {
  const current = Math.floor(hours);
  const passed = Math.min(FAST_WINDOW_HOURS, Math.max(0, current));
  const nowIndex = live && current < FAST_WINDOW_HOURS ? current : -1;
  const left = FAST_WINDOW_HOURS - passed - (nowIndex >= 0 ? 1 : 0);
  const remaining = windowRemaining(hours);
  const percent = Math.min(100, Math.max(0, hours) / FAST_WINDOW_HOURS * 100);
  const ticking = nowIndex >= 0;
  const second = secondOfMinute(hours);
  const orbit = 2 * Math.PI * secondRingRadius;

  return (
    <div className="dot-view">
      <div className={unit === 'seconds' ? 'dot-field deep' : 'dot-field'}>
        <svg viewBox="0 0 200 200" role="img" aria-label={`${passed} of ${FAST_WINDOW_HOURS} hours passed, ${formatHoursLeft(hours)} hours left${ticking ? `, second ${second + 1} of this minute` : ''}`}>
          <g className="dot-zoom">
          {hourDots.map((dot, index) => {
            const state = index < passed ? 'passed' : index === nowIndex ? 'now' : 'left';
            return <circle key={index} className={`hour-dot ${state}`} cx={dot.x} cy={dot.y} r={state === 'now' ? 4.2 : 3.15} />;
          })}
          {ticking && <circle className="second-orbit" cx="100" cy="100" r={secondRingRadius} />}
          {ticking && <circle className="second-progress" cx="100" cy="100" r={secondRingRadius} strokeDasharray={`${(second / SECOND_DOTS) * orbit} ${orbit}`} />}
          {ticking && secondDots.map((dot, index) => {
            const behind = second - index;
            const state = index === second ? 'now' : behind > 0 && behind <= 4 ? 'trail' : index < second ? 'passed' : 'left';
            return <circle key={index} className={`second-dot ${state}`} cx={dot.x} cy={dot.y} r={state === 'now' ? 1.7 : state === 'trail' ? 1.25 : 0.95} />;
          })}
          {ticking && <g className="second-bead" style={{ transform: `rotate(${elapsedWholeSeconds(hours) * 6}deg)` }}><circle cx="100" cy={100 - secondRingRadius} r={unit === 'seconds' ? 2.8 : 2.15} /></g>}
          </g>
        </svg>
      </div>
      <div className={unit === 'seconds' ? 'dot-remain seconds' : 'dot-remain'}>
        <b>{unit === 'hours' ? formatHoursLeft(hours) : remaining.seconds.toLocaleString()}</b>
        <span>{unit === 'hours' ? 'hours left' : 'seconds left'}</span>
      </div>
      <div className="unit-toggle dot-tools" role="group" aria-label="Remaining time">
        <button type="button" aria-pressed={unit === 'hours'} onClick={() => onUnit('hours')}>Hours</button>
        <button type="button" aria-pressed={unit === 'seconds'} onClick={() => onUnit('seconds')}>Seconds</button>
      </div>
      <div className="progress-track dot-track" aria-hidden="true"><span style={{ width: `${percent}%` }} /></div>
      <p className="dot-percent">{Math.floor(percent)}% of the 72-hour window</p>
      <div className="dot-legend">
        <span><i className="passed" />{passed} passed</span>
        {nowIndex >= 0 && <span><i className="now" />This hour</span>}
        <span><i className="left" />{left} left</span>
      </div>
    </div>
  );
}

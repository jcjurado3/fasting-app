'use client';

import { useId, type CSSProperties } from 'react';
import { growthState } from '@/lib/bonsai';

function drawn(amount: number): CSSProperties {
  return { strokeDasharray: 1, strokeDashoffset: 1 - amount, opacity: amount === 0 ? 0 : 1 };
}

function Stem({ d, amount, stroke, width }: { d: string; amount: number; stroke: string; width: number }) {
  return <path className="bonsai-grow" d={d} fill="none" stroke={stroke} strokeWidth={width} strokeLinecap="round" pathLength={1} style={drawn(amount)} />;
}

function Leaf({ cx, cy, rx, ry, amount, tilt, fill }: { cx: number; cy: number; rx: number; ry: number; amount: number; tilt: number; fill: string }) {
  const scale = 0.25 + amount * 0.75;
  return (
    <g className="bonsai-grow" style={{ opacity: amount, transform: `translate(${cx}px, ${cy}px) rotate(${tilt}deg) scale(${scale})` }}>
      <ellipse cx="0" cy="0" rx={rx} ry={ry} fill={fill} />
      <path d={`M${-rx * 0.45} 2 Q0 ${-ry * 0.8} ${rx * 0.55} -1`} fill="none" stroke="#73966c" strokeWidth="2.5" strokeLinecap="round" opacity="0.55" />
    </g>
  );
}

export function Bonsai({ hours, live = false }: { hours: number; live?: boolean }) {
  const growth = growthState(hours);
  const leafId = `leaf-${useId().replace(/:/g, '')}`;
  const { trunk, branches, leaves, roots, crown, settled, stage, percent } = growth;
  return (
    <svg className={live ? 'bonsai is-live' : 'bonsai'} viewBox="0 0 420 330" role="img" aria-label={`${stage.title}. ${Math.round(percent)} percent of the 72-hour window.`}>
      <defs>
        <linearGradient id={leafId} x2="0" y2="1">
          <stop stopColor="#6ea07a" />
          <stop offset="1" stopColor="#315a42" />
        </linearGradient>
      </defs>
      <circle cx="210" cy="138" r="118" fill="#e7ebd9" />
      <circle cx="210" cy="138" r="96" fill="#f3f5ea" />
      <path d="M46 232q72-20 164 2t164-4" fill="none" stroke="#d3d9c2" />
      <ellipse cx="210" cy="292" rx="86" ry="9" fill="#d6dac7" />
      <path d="M156 246h108l-14 34H170z" fill="#b47554" />
      <path d="M168 254h84l-7 18H175z" fill="#c68862" />
      <path d="M150 240h120v9H150z" fill="#d29770" />
      <path d="M176 278v5m68-5v5" stroke="#8a593e" strokeWidth="7" strokeLinecap="round" />
      <ellipse cx="210" cy="244" rx="34" ry="7" fill="#4b4636" />
      <Stem d="M198 242C176 250 154 244 136 230" amount={roots} stroke="#8d6a49" width={3.5} />
      <Stem d="M222 242C246 250 270 242 288 228" amount={roots} stroke="#8d6a49" width={3.5} />
      <ellipse cx="210" cy="241" rx="4.5" ry="3" fill="#6b5340" />
      <ellipse cx="210" cy="228" rx={3 + trunk * 1.5} ry={6 + trunk * 2} fill="#6f8f68" opacity={0.45 + trunk * 0.55} />
      <Stem d="M210 240C206 196 190 160 204 118C212 92 198 68 210 46" amount={trunk} stroke="#805b3c" width={8} />
      <Stem d="M206 232C204 198 194 166 204 128" amount={trunk} stroke="#a17b53" width={2.5} />
      <g>
        <Stem d="M202 150C176 142 146 148 118 132" amount={branches} stroke="#805b3c" width={5} />
        <Stem d="M208 112C236 100 266 104 294 88" amount={branches} stroke="#805b3c" width={4.5} />
        <Stem d="M206 78C186 62 166 54 148 42" amount={branches} stroke="#805b3c" width={4} />
      </g>
      <g className={live ? 'bonsai-canopy is-live' : 'bonsai-canopy'}>
        <Leaf cx={118} cy={126} rx={34} ry={16} amount={leaves} tilt={-18} fill={`url(#${leafId})`} />
        <Leaf cx={292} cy={84} rx={32} ry={15} amount={leaves} tilt={16} fill={`url(#${leafId})`} />
        <Leaf cx={150} cy={40} rx={30} ry={15} amount={leaves} tilt={-8} fill={`url(#${leafId})`} />
        <Leaf cx={168} cy={108} rx={36} ry={17} amount={crown} tilt={-24} fill={`url(#${leafId})`} />
        <Leaf cx={248} cy={62} rx={38} ry={18} amount={crown} tilt={12} fill={`url(#${leafId})`} />
        <Leaf cx={214} cy={34} rx={40} ry={18} amount={settled} tilt={-4} fill={`url(#${leafId})`} />
        <Leaf cx={96} cy={112} rx={24} ry={12} amount={settled} tilt={-28} fill={`url(#${leafId})`} />
      </g>
    </svg>
  );
}

export function GrowthMarks({ hours, live = false }: { hours: number; live?: boolean }) {
  const growth = growthState(hours);
  return (
    <div className="growth-timeline">
      <div className="growth-track" aria-hidden="true"><span style={{ width: `${growth.percent}%` }} /></div>
      <ol className={live ? 'growth-marks is-live' : 'growth-marks'} aria-label="12-hour growth checkpoints">
        {growth.marks.map((mark) => (
          <li key={mark.hour} className={mark.current ? 'now' : mark.reached ? 'reached' : undefined} aria-current={mark.current ? 'step' : undefined}>
            <i aria-hidden="true" />
            <b>{mark.hour}</b>
          </li>
        ))}
      </ol>
    </div>
  );
}

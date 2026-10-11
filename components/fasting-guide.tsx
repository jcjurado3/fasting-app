'use client';

import { useState } from 'react';
import { ArrowUpRight, Droplets } from 'lucide-react';
import { convertGlucose, gkiScore, gkiZone, gkiZones, phaseAt, phases, type GlucoseUnit } from '@/lib/guide';

const sources = [
  { href: 'https://www.bodyspec.com/blog/post/72hour_fast_autophagy_guide', label: 'BodySpec 72-hour autophagy guide' },
  { href: 'https://doi.org/10.1186/s12986-015-0009-4', label: 'Meidenbauer et al., 2015, on the GKI' },
  { href: 'https://my.clevelandclinic.org/health/articles/24058-autophagy', label: 'Cleveland Clinic on autophagy' },
];

export function FastingGuide({ hours, fasting }: { hours: number; fasting: boolean }) {
  const here = fasting ? phaseAt(hours) : null;
  const windows = phases.filter((phase) => phase.hour < 72);

  return (
    <div className="guide-stack">
      <section className="card guide-hero">
        <img src="/guide/guide-autophagy.jpg" alt="Overlapping leaves folding inward around a pale new shoot, a garden image for cellular recycling." width={1152} height={864} />
        <div className="guide-hero-copy">
          <span className="eyebrow"><span />CARE COMES FIRST</span>
          <h2>A guide, not a prescription.</h2>
          <p>Autophagy is the cell’s own recycling. When fuel runs low, cells can clear damaged proteins and worn parts and reuse what is still useful. Shorter fasts mostly train metabolic flexibility. The <a href={sources[0].href} target="_blank" rel="noreferrer">BodySpec autophagy guide</a> treats a 72-hour fast as the window where that housekeeping is deepest, before a longer fast asks more of you than it returns.</p>
          <p>Talk with a clinician before you begin. Pregnancy, breastfeeding, an eating-disorder history, diabetes, and many medications change whether a fast this long is safe.</p>
        </div>
      </section>

      <div className="switch-grid">
        <article className="card switch-card">
          <span className="eyebrow"><span />GROWTH SIGNAL</span>
          <h3>mTOR</h3>
          <p>When protein and carbohydrate are coming in, mTOR tells cells to build. In that setting, autophagy stays at a low hum. High mTOR, quiet recycling.</p>
        </article>
        <article className="card switch-card">
          <span className="eyebrow"><span />ENERGY SENSOR</span>
          <h3>AMPK</h3>
          <p>When cellular energy falls, AMPK answers. It quiets mTOR and opens the door to autophagy. A long fast is one of the conditions described for that handoff. High AMPK, more recycling.</p>
        </article>
      </div>

      <section className="guide-block" aria-labelledby="timeline-heading">
        <div className="guide-heading">
          <span className="eyebrow"><span />HOUR BY HOUR</span>
          <h2 id="timeline-heading">The 72-hour autophagy timeline</h2>
          <p>BodySpec walks the fast as a dimmer, brightening across four stages. These cards follow that map. Your overview timer counts hours. Cellular repair stays invisible to a clock.</p>
          {here && <p className="here-banner"><i />{here.hour >= 72 ? 'Your 72-hour window is complete. The refeed below is the next step.' : `You are in the ${here.label} window · ${here.title}.`}</p>}
        </div>
        <ol className="timeline-list">
          {windows.map((phase) => {
            const current = here?.hour === phase.hour;
            return (
              <li key={phase.hour} className={current ? 'card timeline-card is-current' : 'card timeline-card'} aria-current={current ? 'step' : undefined}>
                <div className="timeline-copy">
                  <div className="timeline-meta">
                    <span className="subtle-tag">{phase.label}</span>
                    {current && <span className="here-pill"><i />You are here</span>}
                  </div>
                  <h3>{phase.title}</h3>
                  <p className="timeline-status">{phase.status}</p>
                  <p>{phase.body}</p>
                  <span className="autophagy-tag">Autophagy · {phase.autophagy}</span>
                </div>
                <img src={phase.image} alt={phase.alt} width={1152} height={864} loading="lazy" />
              </li>
            );
          })}
        </ol>
      </section>

      <section className="guide-block" aria-labelledby="gki-heading">
        <div className="guide-heading">
          <span className="eyebrow"><span />GLUCOSE-KETONE INDEX</span>
          <h2 id="gki-heading">Measuring the invisible</h2>
          <p>You cannot feel a cell recycling itself. The glucose-ketone index, GKI, folds a blood glucose reading and a blood ketone reading into one number. Lower means deeper ketosis. BodySpec, following Meidenbauer and colleagues in 2015, uses that depth as a stand-in for autophagy potential. A finger-stick can describe ketosis. It cannot verify cellular repair.</p>
        </div>
        <div className="gki-layout">
          <figure className="card gki-photo">
            <img src="/guide/guide-gki.jpg" alt="A closed notebook, a blank handheld meter, a glass of water, and a dropper bottle on a wooden table." width={1152} height={864} loading="lazy" />
          </figure>
          <GkiCalculator />
        </div>
      </section>

      <section className="guide-block" aria-labelledby="refeed-heading">
        <div className="guide-heading">
          <span className="eyebrow"><span />SAFETY &amp; REFEEDING</span>
          <h2 id="refeed-heading">Don&apos;t wreck the progress</h2>
          <p>A careless ending can undo the care you just took. The stomach has been quiet. A huge meal can mean pain, bloating, and nausea. With longer fasts, or if someone is already undernourished, a rushed refeed is also where refeeding syndrome becomes a real, if uncommon, concern. Come back slowly.</p>
          {here?.hour === 72 && <p className="here-banner"><i />You are here · time for a small first meal.</p>}
        </div>

        <article className="card refeed-lead">
          <img src="/guide/guide-hydration.jpg" alt="A glass carafe of water, a small bowl of salt, and a sprig of herbs." width={1152} height={864} loading="lazy" />
          <div>
            <span className="round-icon"><Droplets size={20} /></span>
            <h3>Hydration is part of the fast</h3>
            <p>Water alone does not cover what you lose. As insulin drops, sodium, potassium, and magnesium leave more quickly.</p>
            <ul>
              <li>Sip sugar-free electrolyte water through the day.</li>
              <li>Leave sugary sports drinks alone. The sugar breaks a strict fast.</li>
              <li>Plain tea and black coffee can be logged if you drink them. Anything with calories, including broth, is food and ends a strict fast.</li>
              <li>Kidney, heart, and blood-pressure conditions change which minerals are safe. Ask your clinician about amounts before you add a mix.</li>
            </ul>
          </div>
        </article>

        <div className="refeed-pair">
          <article className="card refeed-card">
            <img src="/guide/guide-broth.jpg" alt="A small ceramic bowl of broth with cooked vegetables on a linen cloth." width={1152} height={864} loading="lazy" />
            <div>
              <span className="subtle-tag">First meal · after hour 72</span>
              <h3>A small, warm beginning</h3>
              <p>Bone broth, or a small bowl of cooked vegetables. BodySpec suggests this as the meal that wakes digestion without overwhelming it. Broth counts as food. Log it as a refeed, then end the fast so your journal keeps an honest finish time.</p>
            </div>
          </article>
          <article className="card refeed-card">
            <img src="/guide/guide-refeed.jpg" alt="A modest plate of soft eggs and avocado, a second gentle meal." width={1152} height={864} loading="lazy" />
            <div>
              <span className="subtle-tag">Second meal · about an hour later</span>
              <h3>Protein, then gentle fat</h3>
              <p>Eggs, chicken, or another lean protein, with something like avocado. Keep the portion modest. Give this meal a little time before you eat again.</p>
            </div>
          </article>
        </div>

        <div className="caution-grid">
          <article className="card caution-card">
            <h3>Leave these for later</h3>
            <p>Alcohol, a heavy load of carbohydrate, and raw cruciferous vegetables in the first meals. They are a common reason a careful fast ends in bloating.</p>
            <div className="avoid-list">
              <span>Alcohol</span>
              <span>Heavy starches</span>
              <span>Raw cruciferous vegetables</span>
            </div>
          </article>
          <article className="card caution-card">
            <h3>Skip a fast this long if</h3>
            <ul>
              <li>You are pregnant or breastfeeding.</li>
              <li>You live with type 1 diabetes. Ketoacidosis is the risk the guide flags.</li>
              <li>You have a history of an eating disorder.</li>
              <li>You have not talked with a clinician, especially before going past 24 hours.</li>
            </ul>
            <p className="safety">End the fast if you feel unwell. Fainting, confusion, chest pain, or severe weakness needs urgent medical help.</p>
          </article>
        </div>
      </section>

      <div className="source-links">
        {sources.map((source) => (
          <a key={source.href} href={source.href} target="_blank" rel="noreferrer">{source.label} <ArrowUpRight size={15} /></a>
        ))}
      </div>
      <p className="guide-credit">Stage names, the GKI bands, and the refeed sequence are summarized from the BodySpec guide. They are a reading companion for your journal, and they are not personal medical advice.</p>
    </div>
  );
}

function GkiCalculator() {
  const [unit, setUnit] = useState<GlucoseUnit>('mg/dL');
  const [glucose, setGlucose] = useState('');
  const [ketones, setKetones] = useState('');
  const score = gkiScore(Number(glucose), Number(ketones), unit);
  const zone = score == null ? null : gkiZone(score);

  function chooseUnit(next: GlucoseUnit) {
    if (next === unit) return;
    const value = Number(glucose);
    if (Number.isFinite(value) && value > 0) {
      const converted = convertGlucose(value, unit, next);
      setGlucose(String(Math.round(converted * 10) / 10));
    }
    setUnit(next);
  }

  return (
    <>
    <div className="card gki-calc">
      <div className="unit-toggle" role="group" aria-label="Glucose unit">
        {(['mg/dL', 'mmol/L'] as const).map((option) => (
          <button key={option} type="button" aria-pressed={unit === option} onClick={() => chooseUnit(option)}>{option}</button>
        ))}
      </div>
      <div className="gki-fields">
        <label>Blood glucose
          <input inputMode="decimal" min="0" step="0.1" value={glucose} placeholder={unit === 'mg/dL' ? '90' : '5.0'} onChange={(event) => setGlucose(event.target.value)} />
        </label>
        <label>Ketones (mmol/L)
          <input inputMode="decimal" min="0" step="0.1" value={ketones} placeholder="2.0" onChange={(event) => setKetones(event.target.value)} />
        </label>
      </div>
      <p className="formula">{unit === 'mg/dL' ? '(glucose ÷ 18) ÷ ketones' : 'glucose ÷ ketones'}</p>
      <div className="gki-result" aria-live="polite">
        {score == null || !zone ? (
          <p>Enter both readings. A home dual meter is the usual way to collect them.</p>
        ) : (
          <>
            <b>{score.toFixed(1)}</b>
            <span>{zone.state}</span>
            <small>Autophagy potential on this chart · {zone.autophagy}</small>
          </>
        )}
      </div>
      <p className="gki-goal">BodySpec’s aim for days 2 and 3 is a GKI from 1 to 3. A reading of 90 mg/dL glucose and 2.0 mmol/L ketones lands at 2.5.</p>
    </div>
    <div className="card gki-table-card">
      <table className="gki-table">
        <caption>GKI bands as framed by the BodySpec guide from Meidenbauer et al., Nutrition &amp; Metabolism, 2015. The aim they give for days 2 and 3 is a score from 1 to 3.</caption>
        <thead>
          <tr>
            <th scope="col">GKI</th>
            <th scope="col">Metabolic state</th>
            <th scope="col">Autophagy potential</th>
          </tr>
        </thead>
        <tbody>
          {gkiZones.map((row) => (
            <tr key={row.tone} className={zone?.tone === row.tone ? 'is-active' : undefined} aria-current={zone?.tone === row.tone ? 'true' : undefined}>
              <td>{row.range}</td>
              <td>{row.state}</td>
              <td>{row.autophagy}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </>
  );
}

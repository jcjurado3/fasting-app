'use client';

import { useEffect, useRef, useState } from 'react';
import { Camera, Check, Dumbbell, Moon, Scale, Trash2 } from 'lucide-react';
import { suggestedMoment, type CheckIn, type CheckMoment, type Fast, type Journal, type WeightUnit } from '@/lib/store';

const moments: { id: CheckMoment; label: string; hint: string }[] = [
  { id: 'before', label: 'Before', hint: 'A starting point' },
  { id: 'day-1', label: 'Day 1', hint: 'First day' },
  { id: 'day-2', label: 'Day 2', hint: 'The middle' },
  { id: 'day-3', label: 'Day 3', hint: 'Long day' },
  { id: 'after', label: 'After', hint: 'The return' },
];
const qualities = ['Restless', 'Light', 'Steady', 'Deep'];
const workoutKinds = ['Walk', 'Strength', 'Mobility', 'Yoga', 'Cycle', 'Other'];

function localDay(d = new Date()) { return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10); }
function localStamp(d = new Date()) { return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16); }
function formatWhen(v: string) { return new Date(v).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }); }
function weightText(entry?: CheckIn) { return entry?.weight == null ? 'Add weight' : `${entry.weight} ${entry.unit}`; }

async function compressPhoto(file: File) {
  if (!file.type.startsWith('image/')) throw new Error('Choose a photo.');
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1280 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const context = canvas.getContext('2d');
  if (!context) throw new Error('This photo could not be prepared.');
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close?.();
  const url = canvas.toDataURL('image/jpeg', 0.72);
  if (url.length > 350000) throw new Error('That photo is too large after resizing. Try another one.');
  return url;
}

function validWeight(value: string, unit: WeightUnit) {
  if (!value) return true;
  const weight = Number(value);
  const [min, max] = unit === 'lb' ? [50, 700] : [22, 320];
  return Number.isFinite(weight) && weight >= min && weight <= max;
}

export function CheckInStrip({ journal, fast, hours, onOpen }: { journal: Journal; fast: Fast | undefined; hours: number; onOpen: (moment: CheckMoment) => void }) {
  const suggested = suggestedMoment(fast, hours);
  const journeyId = fast?.id ?? null;
  return (
    <section className="card checkin-strip">
      <div className="card-top"><h2><Scale size={18} />Body check-in</h2><button className="text-link" onClick={() => onOpen(suggested)}>Open check-in</button></div>
      <p className="section-description">A photo and weight before the fast, on each day, and after.</p>
      <div className="moment-row">
        {moments.map((item) => {
          const entry = journal.checkins.find((checkin) => checkin.fastId === journeyId && checkin.moment === item.id);
          return (
            <button key={item.id} className={item.id === suggested ? 'moment current' : 'moment'} onClick={() => onOpen(item.id)}>
              <span className="moment-photo">{entry?.photo ? <img src={entry.photo} alt="" /> : <Camera size={16} />}</span>
              <b>{item.label}</b>
              <small>{weightText(entry)}</small>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export function CheckInPanel({ journal, fast, hours, busy, focusMoment, onSave }: { journal: Journal; fast: Fast | undefined; hours: number; busy: boolean; focusMoment: CheckMoment | null; onSave: (next: Journal) => Promise<boolean> }) {
  const suggested = suggestedMoment(fast, hours);
  const journeyId = fast?.id ?? null;
  const [moment, setMoment] = useState<CheckMoment>(focusMoment ?? suggested);
  const [weight, setWeight] = useState('');
  const [unit, setUnit] = useState<WeightUnit>('lb');
  const [note, setNote] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [formError, setFormError] = useState('');
  const [logError, setLogError] = useState('');
  const [sleepHours, setSleepHours] = useState('7.5');
  const [sleepNight, setSleepNight] = useState(localDay());
  const [sleepQuality, setSleepQuality] = useState('Steady');
  const [sleepNote, setSleepNote] = useState('');
  const [workoutAt, setWorkoutAt] = useState(localStamp());
  const [workoutKind, setWorkoutKind] = useState('Walk');
  const [workoutMinutes, setWorkoutMinutes] = useState('30');
  const [workoutNote, setWorkoutNote] = useState('');
  const photoRef = useRef<HTMLInputElement>(null);
  const saved = journal.checkins.find((checkin) => checkin.fastId === journeyId && checkin.moment === moment);

  useEffect(() => { if (focusMoment) setMoment(focusMoment); }, [focusMoment]);
  useEffect(() => {
    setWeight(saved?.weight == null ? '' : String(saved.weight));
    setUnit(saved?.unit ?? 'lb');
    setNote(saved?.note ?? '');
    setPhoto(saved?.photo ?? null);
    setFormError('');
  }, [saved, moment, journeyId]);

  async function saveCheckin(event: React.FormEvent) {
    event.preventDefault();
    if (!validWeight(weight, unit)) {
      setFormError(unit === 'lb' ? 'Enter a weight from 50 to 700 lb, or leave it blank.' : 'Enter a weight from 22 to 320 kg, or leave it blank.');
      return;
    }
    const next: CheckIn = { id: saved?.id ?? crypto.randomUUID(), fastId: journeyId, moment, at: new Date().toISOString(), weight: weight ? Number(weight) : null, unit, note: note.trim(), photo };
    const checkins = saved ? journal.checkins.map((checkin) => checkin.id === saved.id ? next : checkin) : [next, ...journal.checkins];
    if (await onSave({ ...journal, checkins })) setFormError('');
  }

  async function onPhoto(file?: File) {
    if (!file) return;
    try { setPhoto(await compressPhoto(file)); setFormError(''); }
    catch (error) { setFormError(error instanceof Error ? error.message : 'This photo could not be added.'); }
  }

  return (
    <div className="checkin-layout">
      <section className="card checkin-editor">
        <div className="card-top"><h2><Scale size={18} />Body check-in</h2><span className="subtle-tag">{fast ? (fast.end ? 'This completed fast' : 'This fast') : 'Joins your next fast'}</span></div>
        <p className="section-description">One quiet record before, on each of the three days, and after. A photo and weight are both optional.</p>
        <div className="moment-row compact">
          {moments.map((item) => {
            const entry = journal.checkins.find((checkin) => checkin.fastId === journeyId && checkin.moment === item.id);
            return (
              <button key={item.id} className={item.id === moment ? 'moment current' : 'moment'} onClick={() => setMoment(item.id)}>
                <span className="moment-photo">{entry?.photo ? <img src={entry.photo} alt="" /> : entry ? <Check size={15} /> : <Camera size={15} />}</span>
                <b>{item.label}</b>
                <small>{item.id === suggested ? 'Suggested' : item.hint}</small>
              </button>
            );
          })}
        </div>
        <form onSubmit={saveCheckin}>
          <div className="photo-frame">
            {photo ? <img src={photo} alt={`${moments.find((item) => item.id === moment)?.label} check-in`} /> : <div className="photo-empty"><Camera size={28} /><span>Add a photo</span></div>}
            <input ref={photoRef} className="photo-input" type="file" accept="image/*" aria-label="Check-in photo" onChange={(event) => { onPhoto(event.target.files?.[0]); event.target.value = ''; }} />
          </div>
          <div className="photo-actions">
            <button type="button" className="button secondary" onClick={() => photoRef.current?.click()}><Camera size={15} />{photo ? 'Replace photo' : 'Choose photo'}</button>
            {photo && <button type="button" className="button secondary" onClick={() => setPhoto(null)}>Remove photo</button>}
          </div>
          <div className="weight-row">
            <label>Weight
              <input inputMode="decimal" min="0" step="0.1" value={weight} placeholder={unit === 'lb' ? '180' : '82'} onChange={(event) => setWeight(event.target.value)} />
            </label>
            <div className="unit-toggle" role="group" aria-label="Weight unit">
              {(['lb', 'kg'] as const).map((option) => <button key={option} type="button" aria-pressed={unit === option} onClick={() => setUnit(option)}>{option}</button>)}
            </div>
          </div>
          <label>A note for this moment
            <input value={note} maxLength={300} placeholder="How your body feels" onChange={(event) => setNote(event.target.value)} />
          </label>
          {formError && <p className="safety" role="alert">{formError}</p>}
          <div className="photo-actions">
            <button className="button primary" disabled={busy}>{busy ? 'Saving…' : 'Save check-in'}</button>
            {saved && <button type="button" className="button secondary" disabled={busy} onClick={() => onSave({ ...journal, checkins: journal.checkins.filter((checkin) => checkin.id !== saved.id) })}><Trash2 size={15} />Clear</button>}
          </div>
          <p className="card-footnote">Photos stay in this profile&apos;s journal, on this device or in your cloud account.</p>
        </form>
      </section>
      <div className="checkin-side">
        {logError && <p className="safety" role="alert">{logError}</p>}
        <section className="card padded log-card">
          <h2><Moon size={18} />Sleep</h2>
          <p className="section-description">A night&apos;s rest, kept beside the fast.</p>
          <form onSubmit={async (event) => {
            event.preventDefault();
            const hoursSlept = Number(sleepHours);
            if (!Number.isFinite(hoursSlept) || hoursSlept <= 0 || hoursSlept > 24) { setLogError('Enter sleep from a little over 0 to 24 hours.'); return; }
            const entry = { id: crypto.randomUUID(), at: new Date(`${sleepNight}T12:00:00`).toISOString(), hours: hoursSlept, quality: sleepQuality, note: sleepNote.trim() };
            if (await onSave({ ...journal, sleep: [entry, ...journal.sleep] })) { setSleepNote(''); setLogError(''); }
          }}>
            <div className="log-fields">
              <label>Night of<input type="date" required value={sleepNight} onChange={(event) => setSleepNight(event.target.value)} /></label>
              <label>Hours<input inputMode="decimal" required min="0.5" max="24" step="0.5" value={sleepHours} onChange={(event) => setSleepHours(event.target.value)} /></label>
            </div>
            <div className="mood-options">{qualities.map((quality) => <button type="button" key={quality} className={quality === sleepQuality ? 'active' : ''} onClick={() => setSleepQuality(quality)}>{quality}</button>)}</div>
            <label>Optional note<input value={sleepNote} maxLength={300} placeholder="Woke rested, or a short night" onChange={(event) => setSleepNote(event.target.value)} /></label>
            <button className="button primary" disabled={busy}>Log sleep</button>
          </form>
          <div className="log-list">
            {journal.sleep.length === 0 ? <p className="empty-text">No sleep logged yet.</p> : journal.sleep.slice(0, 6).map((entry) => (
              <div className="activity-row" key={entry.id}><span className="round-icon"><Moon size={16} /></span><div><b>{entry.hours} hours · {entry.quality}</b><small>{entry.note || formatWhen(entry.at)}</small></div><button aria-label="Delete sleep entry" disabled={busy} onClick={() => onSave({ ...journal, sleep: journal.sleep.filter((item) => item.id !== entry.id) })}><Trash2 size={15} /></button></div>
            ))}
          </div>
        </section>
        <section className="card padded log-card">
          <h2><Dumbbell size={18} />Workouts</h2>
          <p className="section-description">Keep movement easy during a long fast, and stop if you feel unwell.</p>
          <form onSubmit={async (event) => {
            event.preventDefault();
            const minutes = Number(workoutMinutes);
            if (!Number.isFinite(minutes) || minutes < 1 || minutes > 300) { setLogError('Enter a workout from 1 to 300 minutes.'); return; }
            const entry = { id: crypto.randomUUID(), at: new Date(workoutAt).toISOString(), kind: workoutKind, minutes, note: workoutNote.trim() };
            if (await onSave({ ...journal, workouts: [entry, ...journal.workouts] })) { setWorkoutNote(''); setLogError(''); }
          }}>
            <div className="log-fields">
              <label>When<input type="datetime-local" required value={workoutAt} onChange={(event) => setWorkoutAt(event.target.value)} /></label>
              <label>Minutes<input inputMode="numeric" required min="1" max="300" step="1" value={workoutMinutes} onChange={(event) => setWorkoutMinutes(event.target.value)} /></label>
            </div>
            <div className="mood-options">{workoutKinds.map((kind) => <button type="button" key={kind} className={kind === workoutKind ? 'active' : ''} onClick={() => setWorkoutKind(kind)}>{kind}</button>)}</div>
            <label>Optional note<input value={workoutNote} maxLength={300} placeholder="A walk outside, or a short session" onChange={(event) => setWorkoutNote(event.target.value)} /></label>
            <button className="button primary" disabled={busy}>Log workout</button>
          </form>
          <div className="log-list">
            {journal.workouts.length === 0 ? <p className="empty-text">No workouts logged yet.</p> : journal.workouts.slice(0, 6).map((entry) => (
              <div className="activity-row" key={entry.id}><span className="round-icon"><Dumbbell size={16} /></span><div><b>{entry.kind} · {entry.minutes} min</b><small>{entry.note || formatWhen(entry.at)}</small></div><button aria-label="Delete workout" disabled={busy} onClick={() => onSave({ ...journal, workouts: journal.workouts.filter((item) => item.id !== entry.id) })}><Trash2 size={15} /></button></div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

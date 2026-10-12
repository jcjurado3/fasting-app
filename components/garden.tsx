'use client';

import { useEffect, useState } from 'react';
import { Bonsai } from '@/components/bonsai';
import { growthState } from '@/lib/bonsai';
import { gardenStatus, resolveGardenFast, type GardenFast } from '@/lib/garden';
import { normalizeJournal, people, supabase, type Journal, type Person } from '@/lib/store';

function fastOf(journal: Journal): GardenFast | null {
  const fast = journal.fasts[0];
  if (!fast?.start) return null;
  return fast.end ? { start: fast.start, end: fast.end } : { start: fast.start };
}

function readLocalFast(name: Person): GardenFast | null {
  try {
    const saved = localStorage.getItem(`still:${name}`);
    if (!saved) return null;
    return fastOf(normalizeJournal(JSON.parse(saved)));
  } catch {
    return null;
  }
}

export function Garden({ you, journal, now, signedIn }: { you: Person; journal: Journal; now: number; signedIn: boolean }) {
  const [local, setLocal] = useState<Partial<Record<Person, GardenFast | null>>>({});
  const [shared, setShared] = useState<Partial<Record<Person, GardenFast | null>> | null>(null);

  useEffect(() => {
    function load() {
      const next: Partial<Record<Person, GardenFast | null>> = {};
      for (const name of people) {
        if (name !== you) next[name] = readLocalFast(name);
      }
      setLocal(next);
    }
    load();
    window.addEventListener('storage', load);
    return () => window.removeEventListener('storage', load);
  }, [you]);

  useEffect(() => {
    if (!signedIn || !supabase) return;
    let dead = false;
    async function load() {
      const { data, error } = await supabase!.from('garden_progress').select('name, fast_start, fast_end');
      if (dead) return;
      if (error || !data) {
        setShared(null);
        return;
      }
      const rows: Partial<Record<Person, GardenFast | null>> = {};
      for (const row of data) {
        if (!people.includes(row.name as Person)) continue;
        const name = row.name as Person;
        rows[name] = row.fast_start ? { start: row.fast_start, end: row.fast_end ?? undefined } : null;
      }
      setShared(rows);
    }
    void load();
    const timer = window.setInterval(() => void load(), 30000);
    return () => {
      dead = true;
      window.clearInterval(timer);
    };
  }, [signedIn]);

  const useShared = Boolean(signedIn && shared);
  const current = fastOf(journal);
  const plots = people.map((name) => {
    const fast = resolveGardenFast({
      yours: name === you,
      current,
      shared: shared && name in shared ? shared[name] ?? null : undefined,
      local: local[name] ?? null,
      useShared,
    });
    const status = gardenStatus(fast, now || Date.now());
    return { name, status, stage: growthState(status.hours).stage.title, yours: name === you };
  });
  const note = !signedIn
    ? 'Each tree follows that profile’s journal on this browser.'
    : shared
      ? 'Your tree follows your cloud journal. Shared trees follow the fast each person has published. A profile that has not shared yet uses the journal on this browser.'
      : 'Your tree follows your cloud journal. The others follow the journals on this browser.';

  return (
    <section className="garden" aria-label="Garden">
      <div className="garden-grid">
        {plots.map((plot) => (
          <article key={plot.name} className={plot.yours ? 'garden-plot yours' : 'garden-plot'} aria-label={`${plot.name}, ${plot.stage}, ${plot.status.label}`}>
            <div className="card-top">
              <h2>{plot.name}{plot.yours && <span className="garden-you">You</span>}</h2>
              <span className={`status ${plot.status.active ? 'live' : ''}`}><i />{plot.status.active ? 'In progress' : plot.status.ended ? 'Ended' : 'Quiet'}</span>
            </div>
            <Bonsai hours={plot.status.hours} live={plot.status.active && plot.status.hours < 72} />
            <p className="garden-stage">{plot.stage}</p>
            <p className="garden-status">{plot.status.label}</p>
          </article>
        ))}
      </div>
      <p className="card-footnote garden-note">{note} The drawing follows elapsed time.</p>
    </section>
  );
}

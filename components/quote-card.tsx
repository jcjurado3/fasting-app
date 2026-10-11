'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { fetchStoicQuotes, offlineQuote, type StoicQuote } from '@/lib/quotes';

export function QuoteCard() {
  const [quotes, setQuotes] = useState<StoicQuote[]>([]);
  const [index, setIndex] = useState(0);
  const [pending, setPending] = useState(true);
  const request = useRef(0);
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true;
    const controller = new AbortController();
    const id = ++request.current;
    fetchStoicQuotes(12, controller.signal).then((next) => {
      if (!alive.current || id !== request.current) return;
      setQuotes(next);
      setIndex(0);
      setPending(false);
    }).catch((error: unknown) => {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      if (!alive.current || id !== request.current) return;
      setQuotes([offlineQuote]);
      setPending(false);
    });
    return () => {
      alive.current = false;
      controller.abort();
    };
  }, []);

  const quote = quotes[index];

  async function another() {
    if (pending) return;
    if (index + 1 < quotes.length) {
      setIndex(index + 1);
      return;
    }
    const id = ++request.current;
    setPending(true);
    try {
      const more = await fetchStoicQuotes(8);
      if (!alive.current || id !== request.current) return;
      const seen = new Set(quotes.map((item) => item.text));
      const fresh = more.filter((item) => !seen.has(item.text));
      if (fresh.length) {
        setQuotes([...quotes, ...fresh]);
        setIndex(quotes.length);
      } else if (quotes.length > 1) {
        setIndex(0);
      }
    } catch {
      if (!alive.current || id !== request.current) return;
      if (quotes.length > 1) setIndex(0);
      else setQuotes([offlineQuote]);
    } finally {
      if (alive.current && id === request.current) setPending(false);
    }
  }

  return (
    <section className="quote-card quote-lead" aria-busy={pending}>
      <span className="quote-mark">“</span>
      <span className="eyebrow">A MOMENT OF STILLNESS</span>
      <blockquote className={quote ? undefined : 'pending'} aria-live="polite">{quote?.text ?? 'A quiet line is on its way.'}</blockquote>
      <div>
        <span>{quote?.author ?? ''}</span>
        <button type="button" aria-label="Another reflection" disabled={pending} onClick={another}><ArrowRight size={17} /></button>
      </div>
    </section>
  );
}

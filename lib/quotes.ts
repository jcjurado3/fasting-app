export type StoicQuote = { text: string; author: string };

// The documented host redirects to www, which is a different origin. Call www directly so the browser can read the response.
export const STOIC_QUOTES_URL = 'https://www.stoic-quotes.com/api/quotes';

export const offlineQuote: StoicQuote = {
  text: 'No great thing is created suddenly.',
  author: 'Epictetus',
};

export function quotesUrl(count: number) {
  const num = Math.min(100, Math.max(1, Math.round(Number(count)) || 1));
  return `${STOIC_QUOTES_URL}?num=${num}`;
}

export function parseQuotes(payload: unknown): StoicQuote[] {
  const rows = Array.isArray(payload) ? payload : [payload];
  const quotes: StoicQuote[] = [];
  for (const row of rows) {
    if (!row || typeof row !== 'object') continue;
    const record = row as Record<string, unknown>;
    const text = typeof record.text === 'string' ? record.text.replace(/\s+/g, ' ').trim() : '';
    const author = typeof record.author === 'string' ? record.author.replace(/\s+/g, ' ').trim() : '';
    if (!text || !author || text.length > 900 || author.length > 80) continue;
    if (quotes.some((quote) => quote.text === text)) continue;
    quotes.push({ text, author });
  }
  return quotes;
}

export async function fetchStoicQuotes(count = 12, signal?: AbortSignal): Promise<StoicQuote[]> {
  const response = await fetch(quotesUrl(count), { signal, headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error('Could not load a reflection.');
  const quotes = parseQuotes(await response.json());
  if (!quotes.length) throw new Error('Could not load a reflection.');
  return quotes;
}

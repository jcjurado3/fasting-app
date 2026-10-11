'use client';

import { useState } from 'react';
import { ArrowRight } from 'lucide-react';

export function SignInForm({ busy, autoFocus = false, onSubmit }: { busy: boolean; autoFocus?: boolean; onSubmit: (email: string) => Promise<boolean> }) {
  const [email, setEmail] = useState('');
  const [sentTo, setSentTo] = useState('');

  if (sentTo) {
    return (
      <div className="sign-in-sent" role="status">
        <p>Check <b>{sentTo}</b> for a sign-in link. Open it on this device to reach your journal.</p>
      </div>
    );
  }

  return (
    <form onSubmit={async (event) => {
      event.preventDefault();
      const address = email.trim().toLowerCase();
      if (await onSubmit(address)) setSentTo(address);
    }}>
      <label>Email reserved for you
        <input type="email" inputMode="email" autoComplete="email" autoCapitalize="none" autoCorrect="off" enterKeyHint="go" autoFocus={autoFocus} required value={email} placeholder="you@email.com" onChange={(event) => setEmail(event.target.value)} />
      </label>
      <p className="muted">We’ll email a link. There is no password to remember.</p>
      <button className="button primary full" disabled={busy}>{busy ? 'Sending…' : <>Email a sign-in link <ArrowRight size={16} /></>}</button>
    </form>
  );
}

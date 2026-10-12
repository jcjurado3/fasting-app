'use client';

import { useState } from 'react';
import { ArrowRight } from 'lucide-react';

export function SignInForm({ busy, autoFocus = false, onPassword, onLink }: {
  busy: boolean;
  autoFocus?: boolean;
  onPassword: (email: string, password: string) => Promise<boolean>;
  onLink: (email: string) => Promise<boolean>;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [sentTo, setSentTo] = useState('');

  if (sentTo) {
    return (
      <div className="sign-in-sent" role="status">
        <p>Check <b>{sentTo}</b> for a sign-in link. Open it on this device to reach your journal.</p>
      </div>
    );
  }

  const address = email.trim().toLowerCase();

  return (
    <form onSubmit={async (event) => {
      event.preventDefault();
      await onPassword(address, password);
    }}>
      <label>Email reserved for you
        <input type="email" inputMode="email" autoComplete="username" autoCapitalize="none" autoCorrect="off" enterKeyHint="next" autoFocus={autoFocus} required value={email} placeholder="you@email.com" onChange={(event) => setEmail(event.target.value)} />
      </label>
      <label>Password
        <input type="password" autoComplete="current-password" enterKeyHint="go" required minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} />
      </label>
      <p className="muted">Sign in with a password if you have one. An email link is still there when you need it.</p>
      <div className="sign-in-actions">
        <button className="button primary full" disabled={busy}>{busy ? 'Please wait…' : <>Sign in <ArrowRight size={16} /></>}</button>
        <button type="button" className="button secondary full" disabled={busy || !address} onClick={async () => { if (await onLink(address)) setSentTo(address); }}>Email a sign-in link</button>
      </div>
    </form>
  );
}

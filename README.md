# Still — a mindful fasting companion

Next.js App Router, React, TypeScript, and Supabase. Designed for Jimmy and Juan.

## Run

`npm install` then `npm run dev`. Open http://localhost:3000.

`npm run build` checks TypeScript and creates a static production build in `out/`. Deploy that folder to static hosting; Supabase provides the backend. `npm test` verifies timer and date-boundary behavior.

Without Supabase environment variables, the app uses clearly labeled local browser storage, with separate Jimmy and Juan journals. Local profiles are a convenience, not an authentication boundary. No fast or health record is prepopulated.

## Enable private Supabase storage

1. Create/connect a Supabase project and run `supabase/schema.sql` in the SQL editor.
2. Invite the two users in Supabase Authentication using their real email addresses. Add their Auth UUIDs to the commented profile insert at the bottom of the migration and run it. The unique name restriction reserves one account each for Jimmy and Juan.
3. Copy `.env.example` to `.env.local`, setting the project URL and public anon/publishable key. Never use a service-role key in the browser.
4. Add the app origin to Supabase Auth's Site URL and allowed redirect URLs (http://localhost:3000 for development).
5. Restart the server. Go to Settings & storage and request an email sign-in link. Only invited accounts can sign in. Cloud profiles are fixed to the authenticated identity; row-level security isolates data.

Local journals are not automatically uploaded or merged into cloud accounts. Export local records using Settings before moving devices. Cloud saving is acknowledged only after the database accepts the write. This initial implementation stores each user's journal in one JSONB row, so simultaneous writes from multiple tabs/devices can overwrite each other; use one active editing session per account.

## Features

- Start/backdate/edit/end 72-hour fasts; record last meal and finish time
- Live elapsed timer, milestone timeline, growing SVG bonsai
- Water/electrolyte water totals reset by local calendar date; editable reference target
- Tea, coffee, broth and other intake logs, with deletion
- Daily care checklist, mood journal, completed fast history, JSON export
- Randomized Stoic reflections on visits
- Mobile layout and reduced-motion support

## Guidance

Content references https://www.bodyspec.com/blog/post/72hour_fast_autophagy_guide and https://my.clevelandclinic.org/health/articles/24058-autophagy. The app tracks time, not autophagy. Its hydration target is an editable reference, not a prescription. Medical guidance should be individualized. The bonsai is a visual metaphor, not a health measurement.

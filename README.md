# Still — a mindful fasting companion

Next.js App Router, React, TypeScript, and Supabase. Designed for Jimmy, Juan, and Bre.

## Run

`npm install` then `npm run dev`. Open http://localhost:3000.

`npm run build` checks TypeScript and creates a static production build in `out/`. Deploy that folder to static hosting; Supabase provides the backend. `npm test` verifies timer and date-boundary behavior.

Without Supabase environment variables, the app uses clearly labeled local browser storage, with separate Jimmy, Juan, and Bre journals. Local profiles are a convenience, not an authentication boundary. No fast or health record is prepopulated.

## Connected Supabase project

The app connects to `fasting-app` (`cdclkwasoxuemtxiosvg`). The ignored `.env.local` contains the project URL and public publishable key. Next.js embeds these public values at build time; rebuild after changing them. Never use a service-role key in the client.

The schema in `supabase/schema.sql` defines the current database. `private.members` reserves Jimmy, Juan, and Bre by their supplied email addresses. Its rows are inaccessible to browser clients. An internal auth trigger rejects unreserved signups and creates each allowed account's profile and empty journal. Names are never assigned from user-editable metadata. Accounts are created when their owners request a sign-in link; a verified session is required to access records.

For an existing project created before Bre was added, apply `supabase/add-bre.sql` in the Supabase SQL editor. It extends both name allowlists and reserves Bre's email in `private.members`.

In the app, select **Settings & storage → Email a sign-in link**. Supabase's Site URL points to the deployed app and `http://localhost:3000` is an allowed local redirect.

### Remaining email-delivery setup

Custom SMTP is not configured yet. Supabase's default sender only delivers to addresses belonging to the Supabase organization team. Configure a verified email provider before relying on another member's sign-in delivery. Do not grant database organization access merely to enable email delivery.

- Supabase SMTP: https://supabase.com/dashboard/project/cdclkwasoxuemtxiosvg/auth/smtp
- Resend setup: https://resend.com/docs/send-with-supabase-smtp

The Sites deployment remains owner-private; sharing deployment access is separate from Supabase authentication and must be configured for each member.

### Storage behavior and verification

Local journals are not automatically uploaded or merged into cloud accounts. Export local records using Settings before moving devices. Cloud writes are acknowledged only after the database accepts them. Revision checks reject stale writes from another session instead of silently overwriting data. Reload before retrying a rejected change.

Database assertions verified signup allowlisting, automatic profile creation, per-user reads, cross-user write denial, successful own writes, private email protection, and stale revision rejection. All test fixtures were rolled back. Supabase security advisors returned no findings after internal function grants were restricted.

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

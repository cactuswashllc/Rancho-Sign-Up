# Rancho Solano PTO Sign-Ups

A mobile-friendly sign-up site for Rancho Solano Preparatory School events. PTO organizers post an
event (photos, a holiday theme, the items needed, and an Amazon list link), and parents choose how many
of each item they'll bring.

- **Parents** don't need an account. They enter their name, email, student's name, and grade, then get a
  confirmation email with a private link to change or cancel.
- **Organizers** sign in with a one-time emailed link (no passwords). Admins manage the organizer list.
- **No over-claiming:** sign-ups lock the item rows in a transaction, so two parents can never both take
  the last one.
- **Privacy:** the public page shows counts only. Parent names and emails are visible only to organizers.
- **15 built-in themes** (Halloween, Thanksgiving, Winter Holidays, Hanukkah, Lunar New Year, Valentine's,
  St. Patrick's, Spring, Teacher Appreciation, Field Day, Graduation, and more) on a navy-and-white base.

## Stack (all free tiers)

| Piece    | Service                                       | Free tier                   |
| -------- | --------------------------------------------- | --------------------------- |
| Hosting  | Vercel (Hobby)                                | Plenty for a school site    |
| Database | Neon Postgres (Vercel Marketplace)            | 0.5 GB, no auto-delete      |
| Photos   | Vercel Blob                                   | 1 GB storage                |
| Email    | Resend                                        | 3,000 emails/month, 100/day |
| App      | Next.js 16 · React 19 · Tailwind 4 · Prisma 7 |                             |

## Deploy to Vercel

1. **Import the repo** in Vercel (Framework: Next.js). The `vercel-build` script runs
   `prisma migrate deploy && next build`, so the database schema is applied on every deploy.
2. **Storage → Create → Neon (Postgres)** and connect it to the project. This sets `DATABASE_URL` and
   `DATABASE_URL_UNPOOLED`.
   _Tip:_ enable Neon's "create a branch for each preview deployment" option so preview deploys never
   migrate the production database.
3. **Storage → Create → Blob** and connect it. This sets `BLOB_READ_WRITE_TOKEN`.
4. **Resend:** the sending domain is `mail.ranchosignup.com` (DKIM TXT `resend._domainkey.mail`, SPF CNAMEs
   `send.mail` and `rsend.mail`, plus `_dmarc` on the apex, all in Cloudflare). Create an API key once it
   shows "Verified".
5. **Environment variables** (Project → Settings → Environment Variables):
   - `RESEND_API_KEY`: from Resend
   - `EMAIL_FROM`: `Rancho Solano PTO <signups@mail.ranchosignup.com>`
   - `ADMIN_EMAILS`: your email (comma-separate several)
   - `APP_URL`: `https://ranchosignup.com`
   - `RATE_LIMIT_SALT`: any long random string
6. **Domain:** in Vercel, Project → Settings → Domains → add `ranchosignup.com` (and `www.ranchosignup.com`
   redirecting to it). In Cloudflare DNS, add the records Vercel shows (normally `A @ 76.76.21.21` and
   `CNAME www cname.vercel-dns.com`) with the proxy **off** (grey cloud), so Vercel can issue the certificate.
7. Deploy, go to `/organizer`, enter an `ADMIN_EMAILS` address, and click the emailed link. Add other PTO
   members under **Organizers**.

> Without a verified domain, Resend only delivers to your own account's email address, so parents
> would not get confirmations.

## Local development

Requires Node 22+, pnpm, and a local Postgres.

```bash
pnpm install
cp .env.example .env            # set DATABASE_URL and ADMIN_EMAILS
pnpm db:migrate                 # create tables
pnpm db:seed                    # optional demo events (admin@example.com)
pnpm dev
```

Without `RESEND_API_KEY`, emails (including sign-in links) are printed to the terminal. Photo upload needs
a `BLOB_READ_WRITE_TOKEN` (`vercel env pull` fetches it once the project is linked).

## Tests

```bash
createdb signups_test && DATABASE_URL=postgresql://…/signups_test pnpm db:deploy
pnpm test                       # unit + DB integration (incl. concurrent over-claim test)

createdb signups_e2e && pnpm build
pnpm test:e2e                   # Playwright, Pixel 7 + desktop Chrome
```

`pnpm lint`, `pnpm typecheck`, and `pnpm format:check` match CI (`.github/workflows/ci.yml`).

## Customizing

- **Crest:** `src/components/Crest.tsx` (and `src/app/icon.svg`) is an original placeholder shield. Swap
  in the school's official mark once the PTO has permission to use it.
- **Themes:** `src/lib/themes.ts`. Add an entry with an accent color and one of the motifs in
  `src/components/Motif.tsx`.
- **Grades:** `src/lib/grades.ts`.
- **Time zone:** "upcoming events" uses `America/Phoenix` (`src/lib/dates.ts`).

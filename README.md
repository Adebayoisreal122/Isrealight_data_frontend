# Isrealight Data Hub: frontend (Next.js 14 + TypeScript + Tailwind, PWA)

Customer app (register, login, fund wallet, buy airtime/data/cable/electricity, history) and an
admin panel (overview, transactions, plans & pricing, users). Light theme by default, dark mode toggle,
blue / yellow / gold palette.

## Run it
1. Start the backend first (see the backend README). Set `CLIENT_URL=http://localhost:3000` in its `.env`.
2. `npm install`
3. Copy `.env.example` to `.env.local` (`NEXT_PUBLIC_API_URL=http://localhost:5000/api`).
4. `npm run dev` then open http://localhost:3000

Admin: run `npm run seed:admin` in the backend, log in with that account and you land on `/admin`.
First-time setup in admin: **Plans > pick a service > Sync from VTpass**, then set your prices.

## Your logo
- Replace `public/logo.svg` (used in the header, landing page and offline page). If yours is a PNG, change the
  `src` in `src/components/Logo.tsx` and in `public/offline.html`.
- Replace the app icons in `public/icons/`: `icon-192.png`, `icon-512.png`, `maskable-512.png` (logo centered with
  generous padding, it gets cropped into circles/squircles) and `apple-touch-icon.png` (180x180).
  Tools such as https://www.pwabuilder.com/imageGenerator can generate the set from one image.
- The current logo and icons are placeholders (a gold bolt on blue).

## Colors
Brand colors live in `tailwind.config.ts` (`brand` = blue, `sun` = yellow, `gold`). Light/dark surfaces are the CSS
variables at the top of `src/app/globals.css`.

## PWA
- `public/manifest.json`: name, icons, standalone display, shortcuts (Buy Data / Airtime / Fund Wallet).
- `public/sw.js`: caches the offline page and static assets. It deliberately never touches API calls, so balances
  and purchases are never served from cache.
- The service worker only registers in production: use `npm run build && npm start` to test, then Chrome DevTools >
  Application > Manifest / Service Workers. The "Install app" button appears when the browser allows installing
  (iPhone: Share > Add to Home Screen).
- PWAs need **HTTPS** in production (localhost is exempt).

## Going live
- Frontend: Vercel (or any Node host). Set `NEXT_PUBLIC_API_URL` to your live API URL.
- Backend: any Node host + MongoDB Atlas. Set `CLIENT_URL` to your live site URL (CORS).
- Paystack dashboard: callback URL `https://YOUR-SITE/wallet/verify` (also `PAYSTACK_CALLBACK_URL` in the backend
  `.env`) and webhook `https://YOUR-API/api/webhooks/paystack`.
- VTpass dashboard: webhook `https://YOUR-API/api/webhooks/vtpass`; switch `VTPASS_BASE_URL` to the live URL.

## Known limits / next hardening
- The login token is kept in `localStorage`. For a money app, moving it to an httpOnly cookie is safer (needs a small
  backend change).
- No transaction PIN, email/phone verification or password reset yet.
- Admin actions are not audit-logged beyond wallet adjustments (those are in the ledger).

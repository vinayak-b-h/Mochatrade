# MochaTrade — Prototype

A compliance-first fintech demo built around one shared, real backend — not
disconnected mockups. Navy/gold theme.

## Surfaces

- **`/order-ticket`** — trader Velocity Ladder, with a market selector. Rungs
  lock/unlock live based on that market's config-flag leverage cap and halt
  status, set from Ops.
- **`/regulator`** — read-only, auto-refreshing telemetry dashboard: live flow
  chart, per-market leverage caps, searchable market table, shared audit log.
- **`/ops`** — per-market kill switch *and* a max-leverage config-flag dial
  (1x/2x/5x/10x/20x). Changing either writes straight to the shared store.
- **`/orders`** — full order book across every market with aggregate stats
  (total remitted, total exposure, average 365d loss-rate).
- **`/architecture`** — hub-and-spoke system diagram.

The nav bar's **Reset Demo** button restores all markets, caps, and orders to
their seed state — use it between pitch run-throughs.

## What's live end-to-end

1. Ops lowers India's cap to 2x → the trader ticket's 5x/10x/20x rungs for
   India lock within ~5s, with the reason shown inline.
2. Ops halts Philippines → confirming an order there is rejected server-side
   (`422`), not just hidden in the UI — the API validates it too.
3. Any confirmed order shows up in the regulator's audit log, the order book,
   and nudges that market's live flow chart — all within a few seconds.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000, then open `/order-ticket`, `/ops`, and
`/regulator` in separate tabs to see it sync live.

## Project structure

```
app/
  page.tsx                landing page
  order-ticket/page.tsx    trader surface
  regulator/page.tsx       regulator surface
  ops/page.tsx              ops surface
  orders/page.tsx           order book
  architecture/page.tsx     hub-and-spoke diagram
  api/
    state/route.ts           GET full shared state
    orders/route.ts           GET/POST orders (server-validates cap + halt)
    kill-switch/route.ts      POST toggle a market
    markets/route.ts          PATCH a market's max-leverage config-flag
    reset/route.ts            POST restore seed demo data
lib/store.ts               shared in-memory store + business logic
components/
  NavBar.tsx                nav + Reset Demo
  LineChart.tsx              lightweight SVG line chart
```

## Deploy

Push to GitHub, then import the repo at https://vercel.com/new — no config
needed, Vercel auto-detects Next.js.

**Note on the in-memory store:** state lives in server memory, so it resets
on redeploy and (on Vercel's serverless runtime) can occasionally diverge
across cold-started instances under heavy concurrent traffic. Fine for a live
demo. For real persistence, swap `lib/store.ts` for Vercel KV or Upstash
Redis.

# MochaTrade — Prototype

Three live surfaces from the Marketsphere Hackathon deck, all backed by **one
shared, real backend** — not three disconnected mockups:

- **`/order-ticket`** — trader-facing Velocity Ladder with live loss-rate disclosure before confirm
- **`/regulator`** — read-only, auto-refreshing supervisory telemetry dashboard with a live flow chart
- **`/ops`** — market-scoped kill-switch console
- **`/architecture`** — hub-and-spoke system diagram

Confirm an order or flip a kill switch on one tab and it shows up on another
within a few seconds (the regulator dashboard polls every 3s, ops every 4s) —
because they all read/write the same in-memory store through three API routes.

Built with Next.js 14 (App Router) + TypeScript + Tailwind CSS. No external
chart library — the flow chart is a hand-rolled SVG component.

## Project structure

```
app/
  page.tsx              landing page
  order-ticket/page.tsx trader surface (POSTs to /api/orders)
  regulator/page.tsx    regulator surface (polls /api/state)
  ops/page.tsx           ops surface (polls /api/state, POSTs to /api/kill-switch)
  architecture/page.tsx  hub-and-spoke diagram
  api/
    state/route.ts        GET full shared state
    orders/route.ts        GET/POST orders
    kill-switch/route.ts   POST toggle a market
lib/store.ts             shared in-memory store + business logic
components/
  NavBar.tsx
  LineChart.tsx           lightweight SVG line chart
```

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000, then open `/order-ticket`, `/regulator`, and
`/ops` in separate tabs to see the live sync.

## Deploy

Push to GitHub, then import the repo at https://vercel.com/new — no config
needed, Vercel auto-detects Next.js.

**Note on the in-memory store:** state lives in server memory, so it resets
on redeploy and (on Vercel's serverless runtime) can occasionally diverge
across cold-started instances under heavy concurrent traffic. That's fine for
a live demo. For real persistence, swap `lib/store.ts` for Vercel KV or
Upstash Redis — happy to wire that up if you want it before judging.

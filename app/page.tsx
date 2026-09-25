import Link from "next/link";

const painPoints = [
  { id: "01", text: "93% of India's retail F&O traders lost money over FY22–24 (SEBI); avg. loss ~₹2 lakh." },
  { id: "02", text: "Local-currency deposits converted to USD positions look like capital flight to regulators." },
  { id: "03", text: "Post-2024 enforcement makes country-manager liability personal, not just corporate." },
];

const differentiators = [
  { tag: "SMART", text: "Velocity Ladder gates leverage on behaviour + literacy — not a paid tier." },
  { tag: "TRUSTED", text: "Supervisory Telemetry gives regulators a live, read-only harm dashboard." },
  { tag: "LOCAL", text: "Config-flag compliance per market: India, Indonesia, Brazil, Philippines, UAE." },
  { tag: "SCALABLE", text: "Hub-and-spoke: one engine, 5 markets in 18 months, no forked codebase." },
];

const surfaces = [
  { href: "/order-ticket", title: "Trader Order Ticket", desc: "Velocity Ladder + live loss-rate shown before confirm." },
  { href: "/regulator", title: "Regulator Dashboard", desc: "Live, read-only harm & FX-flow telemetry." },
  { href: "/ops", title: "Ops Kill-Switch Console", desc: "~29ms propagation to halt leverage by market." },
  { href: "/architecture", title: "Architecture", desc: "How one hub serves five market spokes." },
];

export default function Home() {
  return (
    <div className="space-y-12">
      <section className="space-y-4">
        <p className="text-mocha text-sm font-medium tracking-wide">FINOVATORS · MARKETSPHERE HACKATHON</p>
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight max-w-2xl">
          Turn remittances into ownership. Leverage is earned, never sold.
        </h1>
        <p className="text-[#9FB0C9] max-w-2xl">
          Compliance-first fintech infrastructure connecting emerging-market retail to global markets —
          without the leverage harm.
        </p>
        <p className="text-xs text-[#7E8CA6] max-w-2xl">
          All three surfaces below run on one shared live backend — confirm an order or flip a kill
          switch and watch it show up across tabs in real time.
        </p>
        <div className="flex flex-wrap gap-3 pt-2">
          {surfaces.map((s) => (
            <Link key={s.href} href={s.href} className="card px-4 py-3 hover:border-mocha transition-colors">
              <div className="text-sm font-medium">{s.title}</div>
              <div className="text-xs text-[#7E8CA6] mt-1">{s.desc}</div>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid sm:grid-cols-3 gap-4">
        {painPoints.map((p) => (
          <div key={p.id} className="card p-4">
            <div className="text-xs text-mocha font-mono mb-2">PAIN POINT {p.id}</div>
            <div className="text-sm text-[#B9C4D6]">{p.text}</div>
          </div>
        ))}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">What makes it different</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {differentiators.map((d) => (
            <div key={d.tag} className="card p-4 flex gap-3">
              <span className="text-xs font-mono text-mocha shrink-0 pt-0.5">{d.tag}</span>
              <span className="text-sm text-[#B9C4D6]">{d.text}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="grid sm:grid-cols-2 gap-4">
        <div className="card p-5">
          <div className="text-xs text-[#7E8CA6] mb-1">METRIC 01 · PROFITABLE USERS (365D)</div>
          <div className="text-2xl font-semibold">
            36% <span className="text-[#5E6B85] text-base font-normal">vs 18% baseline</span>
          </div>
        </div>
        <div className="card p-5">
          <div className="text-xs text-[#7E8CA6] mb-1">METRIC 02 · KILL-SWITCH PROPAGATION</div>
          <div className="text-2xl font-semibold">~29 ms</div>
        </div>
      </section>
    </div>
  );
}

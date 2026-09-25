const HUB = { cx: 400, cy: 225, r: 76 };
const SPOKE_R = 46;

const spokes = [
  { code: "IN", name: "India", cx: 150, cy: 95 },
  { code: "ID", name: "Indonesia", cx: 650, cy: 95 },
  { code: "BR", name: "Brazil", cx: 150, cy: 355 },
  { code: "PH", name: "Philippines", cx: 650, cy: 355 },
  { code: "AE", name: "UAE", cx: 400, cy: 430 },
];

// Trims each connector so it starts at the hub's edge and ends at the
// spoke's edge, instead of running straight through the center labels.
function clippedLine(x1: number, y1: number, r1: number, x2: number, y2: number, r2: number) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dist = Math.sqrt(dx * dx + dy * dy) || 1;
  const ux = dx / dist;
  const uy = dy / dist;
  return {
    x1: x1 + ux * r1,
    y1: y1 + uy * r1,
    x2: x2 - ux * r2,
    y2: y2 - uy * r2,
  };
}

export default function Architecture() {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-mocha text-sm font-medium">SCALABLE BY DESIGN</p>
        <h1 className="text-2xl font-semibold mt-1">Hub-and-spoke architecture</h1>
        <p className="text-sm text-[#9FB0C9] mt-2 max-w-2xl">
          One engine, five markets in 18 months, no forked codebase. Compliance rules live as
          config-flags on each spoke, not as branches of the core.
        </p>
      </div>

      <div className="card p-6">
        <svg viewBox="0 0 800 500" className="w-full h-auto">
          {spokes.map((m) => {
            const l = clippedLine(HUB.cx, HUB.cy, HUB.r, m.cx, m.cy, SPOKE_R);
            return (
              <line
                key={`line-${m.code}`}
                x1={l.x1}
                y1={l.y1}
                x2={l.x2}
                y2={l.y2}
                stroke="#1E2A45"
                strokeWidth="2"
              />
            );
          })}

          <circle cx={HUB.cx} cy={HUB.cy} r={HUB.r} fill="#10192E" stroke="#D8B067" strokeWidth="2" />
          <text x={HUB.cx} y={HUB.cy - 5} textAnchor="middle" fill="#E7ECF5" fontSize="15" fontWeight="600">
            MochaTrade
          </text>
          <text x={HUB.cx} y={HUB.cy + 14} textAnchor="middle" fill="#9FB0C9" fontSize="11">
            Core Engine
          </text>

          {spokes.map((m) => (
            <g key={m.code}>
              <circle cx={m.cx} cy={m.cy} r={SPOKE_R} fill="#0A1120" stroke="#1E2A45" strokeWidth="2" />
              <text
                x={m.cx}
                y={m.cy - 4}
                textAnchor="middle"
                fill="#D8B067"
                fontSize="12"
                fontFamily="ui-monospace, monospace"
                fontWeight="600"
              >
                {m.code}
              </text>
              <text x={m.cx} y={m.cy + 13} textAnchor="middle" fill="#9FB0C9" fontSize="10.5">
                {m.name}
              </text>
            </g>
          ))}
        </svg>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="card p-4">
          <div className="text-sm font-medium mb-2">What the hub owns</div>
          <ul className="text-sm text-[#9FB0C9] space-y-1.5 list-disc list-inside">
            <li>Velocity Ladder logic — behaviour + literacy gating</li>
            <li>Order execution and exposure calculation</li>
            <li>Supervisory Telemetry event log</li>
          </ul>
        </div>
        <div className="card p-4">
          <div className="text-sm font-medium mb-2">What each spoke configures</div>
          <ul className="text-sm text-[#9FB0C9] space-y-1.5 list-disc list-inside">
            <li>Max leverage per jurisdiction</li>
            <li>KYC / AML thresholds</li>
            <li>Kill-switch default state</li>
          </ul>
        </div>
      </div>

      <div className="card p-4">
        <div className="text-sm font-medium mb-2">In this prototype</div>
        <p className="text-sm text-[#9FB0C9]">
          The three surfaces you clicked through — trader order ticket, regulator dashboard, ops
          console — all read and write a single shared store (
          <code className="text-mocha text-xs">lib/store.ts</code>, exposed via{" "}
          <code className="text-mocha text-xs">/api/state</code>,{" "}
          <code className="text-mocha text-xs">/api/orders</code>, and{" "}
          <code className="text-mocha text-xs">/api/kill-switch</code>). That's the hub-and-spoke
          principle in miniature: one source of truth, three views with different permissions.
        </p>
      </div>
    </div>
  );
}

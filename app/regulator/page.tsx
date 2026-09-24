"use client";

import { useEffect, useState } from "react";

const markets = [
  { code: "IN", name: "India", flowUSD: 182, leverageUsers: 41200, killSwitch: false },
  { code: "ID", name: "Indonesia", flowUSD: 96, leverageUsers: 18400, killSwitch: false },
  { code: "BR", name: "Brazil", flowUSD: 74, leverageUsers: 12100, killSwitch: false },
  { code: "PH", name: "Philippines", flowUSD: 61, leverageUsers: 9800, killSwitch: true },
  { code: "AE", name: "UAE", flowUSD: 33, leverageUsers: 4100, killSwitch: false },
];

export default function RegulatorDashboard() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 2200);
    return () => clearInterval(id);
  }, []);

  const jitter = (base: number, spread: number) =>
    Math.round(base + Math.sin(tick + base) * spread);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-mocha text-sm font-medium">SUPERVISORY TELEMETRY · READ-ONLY</p>
        <h1 className="text-2xl font-semibold mt-1">Regulator Dashboard</h1>
        <p className="text-sm text-[#9FB0C3] mt-2 max-w-2xl">
          Live view of remittance-linked flow and leverage exposure per jurisdiction. No trade
          execution access — visibility only, per config-flag compliance.
        </p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div className="card p-4">
          <div className="text-xs text-[#7C8CA0]">Global remittance flow tracked</div>
          <div className="text-2xl font-semibold mt-1">$685B/yr</div>
          <div className="text-xs text-[#5C6B7A] mt-1">~6% avg. cost vs 3% UN target</div>
        </div>
        <div className="card p-4">
          <div className="text-xs text-[#7C8CA0]">Profitable users (365d)</div>
          <div className="text-2xl font-semibold mt-1 text-good">36%</div>
          <div className="text-xs text-[#5C6B7A] mt-1">vs 18% industry baseline</div>
        </div>
        <div className="card p-4">
          <div className="text-xs text-[#7C8CA0]">Kill-switch propagation</div>
          <div className="text-2xl font-semibold mt-1">~29 ms</div>
          <div className="text-xs text-[#5C6B7A] mt-1">market-scoped, auditable</div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-[#7C8CA0] border-b border-line">
              <th className="px-4 py-3 font-normal">Market</th>
              <th className="px-4 py-3 font-normal">Live inbound flow (USD, live)</th>
              <th className="px-4 py-3 font-normal">Leveraged accounts</th>
              <th className="px-4 py-3 font-normal">Status</th>
            </tr>
          </thead>
          <tbody>
            {markets.map((m) => (
              <tr key={m.code} className="border-b border-line last:border-0">
                <td className="px-4 py-3">
                  <span className="font-mono text-xs text-mocha mr-2">{m.code}</span>
                  {m.name}
                </td>
                <td className="px-4 py-3 font-mono">${jitter(m.flowUSD, 3)}M</td>
                <td className="px-4 py-3 font-mono">{jitter(m.leverageUsers, 40).toLocaleString()}</td>
                <td className="px-4 py-3">
                  {m.killSwitch ? (
                    <span className="text-bad text-xs bg-bad/10 border border-bad/30 rounded-full px-2 py-0.5">
                      Leverage halted
                    </span>
                  ) : (
                    <span className="text-good text-xs bg-good/10 border border-good/30 rounded-full px-2 py-0.5">
                      Active
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import LineChart from "@/components/LineChart";

type Market = { code: string; name: string; halted: boolean; flowUSD: number; leverageUsers: number };
type LogEntry = { id: string; time: string; text: string; kind: string };
type Snapshot = { t: number; totalFlow: number };
type StoreState = { markets: Market[]; log: LogEntry[]; history: Snapshot[] };

export default function RegulatorDashboard() {
  const [state, setState] = useState<StoreState | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const res = await fetch("/api/state", { cache: "no-store" });
        const data = await res.json();
        if (active) setState(data);
      } catch {
        // keep showing last-known state on transient fetch failures
      }
    };
    load();
    const id = setInterval(load, 3000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);

  const totalFlow = state?.markets.reduce((s, m) => s + m.flowUSD, 0) ?? 0;
  const haltedCount = state?.markets.filter((m) => m.halted).length ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-mocha text-sm font-medium">SUPERVISORY TELEMETRY · READ-ONLY · LIVE</p>
        <h1 className="text-2xl font-semibold mt-1">Regulator Dashboard</h1>
        <p className="text-sm text-[#5B6472] mt-2 max-w-2xl">
          Live view of remittance-linked flow and leverage exposure per jurisdiction, fed by the same
          backend the ops console and trader ticket write to. No trade execution access — visibility
          only, per config-flag compliance.
        </p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div className="card p-4">
          <div className="text-xs text-[#7A8494]">Tracked inbound flow (live)</div>
          <div className="text-2xl font-semibold mt-1">${totalFlow.toFixed(1)}M</div>
          <div className="text-xs text-[#94A0AD] mt-1">across {state?.markets.length ?? 5} markets</div>
        </div>
        <div className="card p-4">
          <div className="text-xs text-[#7A8494]">Profitable users (365d)</div>
          <div className="text-2xl font-semibold mt-1 text-good">36%</div>
          <div className="text-xs text-[#94A0AD] mt-1">vs 18% industry baseline</div>
        </div>
        <div className="card p-4">
          <div className="text-xs text-[#7A8494]">Markets under kill-switch</div>
          <div className={["text-2xl font-semibold mt-1", haltedCount > 0 ? "text-bad" : "text-good"].join(" ")}>
            {haltedCount} / {state?.markets.length ?? 5}
          </div>
          <div className="text-xs text-[#94A0AD] mt-1">~29ms propagation from ops</div>
        </div>
      </div>

      <div className="card p-5">
        <div className="text-xs text-[#7A8494] mb-3">TOTAL TRACKED FLOW (LIVE)</div>
        <LineChart data={state?.history ?? []} />
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-[#7A8494] border-b border-line">
              <th className="px-4 py-3 font-normal">Market</th>
              <th className="px-4 py-3 font-normal">Inbound flow (USD)</th>
              <th className="px-4 py-3 font-normal">Leveraged accounts</th>
              <th className="px-4 py-3 font-normal">Status</th>
            </tr>
          </thead>
          <tbody>
            {(state?.markets ?? []).map((m) => (
              <tr key={m.code} className="border-b border-line last:border-0">
                <td className="px-4 py-3">
                  <span className="font-mono text-xs text-mocha mr-2">{m.code}</span>
                  {m.name}
                </td>
                <td className="px-4 py-3 font-mono">${m.flowUSD.toFixed(1)}M</td>
                <td className="px-4 py-3 font-mono">{m.leverageUsers.toLocaleString()}</td>
                <td className="px-4 py-3">
                  {m.halted ? (
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

      <div className="card p-4">
        <div className="text-xs text-[#7A8494] mb-3">LIVE SUPERVISORY LOG</div>
        <div className="space-y-2 max-h-56 overflow-y-auto font-mono text-xs">
          {(state?.log ?? []).map((entry) => (
            <div key={entry.id} className="flex gap-3 text-[#5B6472]">
              <span className="text-[#94A0AD] shrink-0">{new Date(entry.time).toLocaleTimeString()}</span>
              <span>{entry.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

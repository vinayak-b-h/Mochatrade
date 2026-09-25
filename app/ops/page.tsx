"use client";

import { useEffect, useState } from "react";

const leverageOptions = [1, 2, 5, 10, 20];

type Market = {
  code: string;
  name: string;
  halted: boolean;
  flowUSD: number;
  leverageUsers: number;
  maxLeverage: number;
};
type LogEntry = { id: string; time: string; text: string; kind: string };
type StoreState = { markets: Market[]; log: LogEntry[] };

export default function OpsConsole() {
  const [state, setState] = useState<StoreState | null>(null);
  const [pendingHalt, setPendingHalt] = useState<string | null>(null);
  const [pendingCap, setPendingCap] = useState<string | null>(null);

  const load = async () => {
    try {
      const res = await fetch("/api/state", { cache: "no-store" });
      setState(await res.json());
    } catch {
      // keep last-known state on transient fetch failures
    }
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 4000);
    return () => clearInterval(id);
  }, []);

  const toggleHalt = async (code: string) => {
    setPendingHalt(code);
    try {
      const res = await fetch("/api/kill-switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      setState(await res.json());
    } finally {
      setPendingHalt(null);
    }
  };

  const setCap = async (code: string, maxLeverage: number) => {
    setPendingCap(code);
    try {
      const res = await fetch("/api/markets", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, maxLeverage }),
      });
      setState(await res.json());
    } finally {
      setPendingCap(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-mocha text-sm font-medium">OPS KILL-SWITCH CONSOLE</p>
        <h1 className="text-2xl font-semibold mt-1">Market-scoped leverage controls</h1>
        <p className="text-sm text-[#9FB0C9] mt-2 max-w-2xl">
          Halt leverage entirely, or dial a market&apos;s max Velocity Ladder rung up or down — both
          write to the same backend the trader ticket and regulator dashboard read live.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {(state?.markets ?? []).map((m) => (
          <div key={m.code} className="card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">
                  <span className="font-mono text-xs text-mocha mr-2">{m.code}</span>
                  {m.name}
                </div>
                <div className="text-xs text-[#7E8CA6] mt-1">
                  {m.halted ? "Leverage halted" : "Leverage active"}
                </div>
              </div>
              <button
                onClick={() => toggleHalt(m.code)}
                disabled={pendingHalt === m.code}
                className={[
                  "text-xs font-medium rounded-full px-3 py-1.5 border transition-colors shrink-0",
                  m.halted
                    ? "border-good/40 text-good hover:bg-good/10"
                    : "border-bad/40 text-bad hover:bg-bad/10",
                  pendingHalt === m.code ? "opacity-50 cursor-wait" : "",
                ].join(" ")}
              >
                {pendingHalt === m.code ? "Propagating…" : m.halted ? "Resume" : "Halt"}
              </button>
            </div>

            <div className="border-t border-line pt-3">
              <div className="text-xs text-[#7E8CA6] mb-1.5">Max leverage cap</div>
              <div className="flex gap-1.5">
                {leverageOptions.map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setCap(m.code, lvl)}
                    disabled={pendingCap === m.code}
                    className={[
                      "flex-1 text-xs font-mono rounded-md border px-2 py-1.5 transition-colors",
                      lvl === m.maxLeverage
                        ? "border-mocha bg-[#182544] text-mocha"
                        : "border-line text-[#7E8CA6] hover:border-mocha/50",
                    ].join(" ")}
                  >
                    {lvl}x
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card p-4">
        <div className="text-xs text-[#7E8CA6] mb-3">SHARED AUDIT LOG (also visible to regulator)</div>
        <div className="space-y-2 max-h-64 overflow-y-auto font-mono text-xs">
          {(state?.log ?? []).map((entry) => (
            <div key={entry.id} className="flex gap-3 text-[#9FB0C9]">
              <span className="text-[#5E6B85] shrink-0">{new Date(entry.time).toLocaleTimeString()}</span>
              <span>{entry.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

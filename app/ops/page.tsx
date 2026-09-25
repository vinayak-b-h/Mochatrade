"use client";

import { useEffect, useState } from "react";

type Market = { code: string; name: string; halted: boolean; flowUSD: number; leverageUsers: number };
type LogEntry = { id: string; time: string; text: string; kind: string };
type StoreState = { markets: Market[]; log: LogEntry[] };

export default function OpsConsole() {
  const [state, setState] = useState<StoreState | null>(null);
  const [pending, setPending] = useState<string | null>(null);

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

  const toggle = async (code: string) => {
    setPending(code);
    try {
      const res = await fetch("/api/kill-switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      setState(data);
    } finally {
      setPending(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-mocha text-sm font-medium">OPS KILL-SWITCH CONSOLE</p>
        <h1 className="text-2xl font-semibold mt-1">Market-scoped leverage kill-switch</h1>
        <p className="text-sm text-[#5B6472] mt-2 max-w-2xl">
          Halts new leveraged positions in a single jurisdiction without touching the other four —
          hub-and-spoke, no forked codebase. Changes here write to the same backend the regulator
          dashboard polls, so a flip shows up there within seconds.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {(state?.markets ?? []).map((m) => (
          <div key={m.code} className="card p-4 flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">
                <span className="font-mono text-xs text-mocha mr-2">{m.code}</span>
                {m.name}
              </div>
              <div className="text-xs text-[#7A8494] mt-1">
                {m.halted ? "Leverage halted" : "Leverage active"}
              </div>
            </div>
            <button
              onClick={() => toggle(m.code)}
              disabled={pending === m.code}
              className={[
                "text-xs font-medium rounded-full px-3 py-1.5 border transition-colors",
                m.halted
                  ? "border-good/40 text-good hover:bg-good/10"
                  : "border-bad/40 text-bad hover:bg-bad/10",
                pending === m.code ? "opacity-50 cursor-wait" : "",
              ].join(" ")}
            >
              {pending === m.code ? "Propagating…" : m.halted ? "Resume" : "Halt"}
            </button>
          </div>
        ))}
      </div>

      <div className="card p-4">
        <div className="text-xs text-[#7A8494] mb-3">SHARED AUDIT LOG (also visible to regulator)</div>
        <div className="space-y-2 max-h-64 overflow-y-auto font-mono text-xs">
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

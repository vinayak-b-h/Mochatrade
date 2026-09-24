"use client";

import { useState } from "react";

const initialMarkets = [
  { code: "IN", name: "India", halted: false },
  { code: "ID", name: "Indonesia", halted: false },
  { code: "BR", name: "Brazil", halted: false },
  { code: "PH", name: "Philippines", halted: true },
  { code: "AE", name: "UAE", halted: false },
];

type LogEntry = { time: string; text: string };

export default function OpsConsole() {
  const [markets, setMarkets] = useState(initialMarkets);
  const [log, setLog] = useState<LogEntry[]>([
    { time: "T-00:00", text: "Console initialized. Baseline state loaded from config-flag registry." },
  ]);
  const [pending, setPending] = useState<string | null>(null);

  const toggle = (code: string) => {
    setPending(code);
    setTimeout(() => {
      setMarkets((prev) =>
        prev.map((m) => (m.code === code ? { ...m, halted: !m.halted } : m))
      );
      setPending(null);
      setLog((prev) => {
        const m = markets.find((x) => x.code === code)!;
        const action = m.halted ? "resumed" : "halted";
        const stamp = new Date().toLocaleTimeString();
        return [
          { time: stamp, text: `Leverage ${action} in ${m.name} (${code}) — propagated in 29ms.` },
          ...prev,
        ];
      });
    }, 290);
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-mocha text-sm font-medium">OPS KILL-SWITCH CONSOLE</p>
        <h1 className="text-2xl font-semibold mt-1">Market-scoped leverage kill-switch</h1>
        <p className="text-sm text-[#9FB0C3] mt-2 max-w-2xl">
          Halts new leveraged positions in a single jurisdiction without touching the other four —
          hub-and-spoke, no forked codebase.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {markets.map((m) => (
          <div key={m.code} className="card p-4 flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">
                <span className="font-mono text-xs text-mocha mr-2">{m.code}</span>
                {m.name}
              </div>
              <div className="text-xs text-[#7C8CA0] mt-1">
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
        <div className="text-xs text-[#7C8CA0] mb-3">AUDIT LOG</div>
        <div className="space-y-2 max-h-64 overflow-y-auto font-mono text-xs">
          {log.map((entry, i) => (
            <div key={i} className="flex gap-3 text-[#9FB0C3]">
              <span className="text-[#5C6B7A] shrink-0">{entry.time}</span>
              <span>{entry.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";

const rungs = [
  { level: 1, label: "1x — Unlevered", lossRate: 6, unlocked: true },
  { level: 2, label: "2x — Starter", lossRate: 14, unlocked: true },
  { level: 3, label: "5x — Intermediate", lossRate: 38, unlocked: true },
  { level: 4, label: "10x — Advanced", lossRate: 61, unlocked: false },
  { level: 5, label: "20x — Pro (locked)", lossRate: 82, unlocked: false },
];

type Status = "idle" | "submitting" | "confirmed" | "error";

export default function OrderTicket() {
  const [rungIndex, setRungIndex] = useState(1);
  const [amount, setAmount] = useState(250);
  const [status, setStatus] = useState<Status>("idle");

  const rung = rungs[rungIndex];
  const exposure = useMemo(() => amount * rung.level, [amount, rung.level]);

  const submit = async () => {
    setStatus("submitting");
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          rungLevel: rung.level,
          rungLabel: rung.label,
          lossRate: rung.lossRate,
        }),
      });
      if (!res.ok) throw new Error("request failed");
      setStatus("confirmed");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <p className="text-mocha text-sm font-medium">MOCHATRADE ORDER TICKET</p>
        <h1 className="text-2xl font-semibold mt-1">Velocity Ladder + live loss-rate before confirm</h1>
        <p className="text-sm text-[#5B6472] mt-2">
          Leverage is gated by behaviour and literacy, not a paid tier. Confirming here writes to the
          same backend the regulator dashboard reads live — open both tabs side by side to see it.
        </p>
      </div>

      <div className="card p-5 space-y-5">
        <div>
          <label className="text-xs text-[#7A8494]">Remittance amount (USD)</label>
          <input
            type="number"
            min={10}
            value={amount}
            onChange={(e) => {
              setAmount(Number(e.target.value) || 0);
              setStatus("idle");
            }}
            className="mt-1 w-full bg-[#F1ECE3] border border-line rounded-lg px-3 py-2 text-sm text-[#1E2329] focus:outline-none focus:border-mocha"
          />
        </div>

        <div>
          <label className="text-xs text-[#7A8494]">Velocity Ladder rung</label>
          <div className="mt-2 space-y-2">
            {rungs.map((r, i) => (
              <button
                key={r.level}
                disabled={!r.unlocked}
                onClick={() => {
                  setRungIndex(i);
                  setStatus("idle");
                }}
                className={[
                  "w-full flex items-center justify-between rounded-lg border px-3 py-2 text-sm text-left transition-colors",
                  i === rungIndex ? "border-mocha bg-[#FBF1E4]" : "border-line",
                  !r.unlocked ? "opacity-40 cursor-not-allowed" : "hover:border-mocha/60",
                ].join(" ")}
              >
                <span>{r.label}</span>
                <span
                  className={[
                    "text-xs font-mono",
                    r.lossRate >= 50 ? "text-bad" : r.lossRate >= 25 ? "text-warn" : "text-good",
                  ].join(" ")}
                >
                  {r.lossRate}% 365d loss-rate
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-line pt-4 flex items-center justify-between text-sm">
          <span className="text-[#7A8494]">Total market exposure</span>
          <span className="font-mono">${exposure.toLocaleString()}</span>
        </div>

        {rung.lossRate >= 50 && (
          <div className="text-xs text-bad bg-bad/10 border border-bad/30 rounded-lg px-3 py-2">
            This rung has a historical 365-day loss rate of {rung.lossRate}%. Confirming logs an
            explicit risk acknowledgement to Supervisory Telemetry.
          </div>
        )}

        <button
          onClick={submit}
          disabled={status === "submitting"}
          className="w-full bg-mocha text-white font-medium rounded-lg py-2.5 text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {status === "submitting" ? "Submitting…" : `Confirm order at ${rung.label}`}
        </button>

        {status === "confirmed" && (
          <div className="text-xs text-good bg-good/10 border border-good/30 rounded-lg px-3 py-2">
            Order confirmed. Loss-rate disclosure + rung selection logged to Supervisory Telemetry —
            check the regulator dashboard.
          </div>
        )}
        {status === "error" && (
          <div className="text-xs text-bad bg-bad/10 border border-bad/30 rounded-lg px-3 py-2">
            Couldn't reach the backend. Make sure the dev server is running.
          </div>
        )}
      </div>
    </div>
  );
}

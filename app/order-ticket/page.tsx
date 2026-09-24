"use client";

import { useMemo, useState } from "react";

const rungs = [
  { level: 1, label: "1x — Unlevered", lossRate: 6, unlocked: true },
  { level: 2, label: "2x — Starter", lossRate: 14, unlocked: true },
  { level: 3, label: "5x — Intermediate", lossRate: 38, unlocked: true },
  { level: 4, label: "10x — Advanced", lossRate: 61, unlocked: false },
  { level: 5, label: "20x — Pro (locked)", lossRate: 82, unlocked: false },
];

export default function OrderTicket() {
  const [rungIndex, setRungIndex] = useState(1);
  const [amount, setAmount] = useState(250);
  const [confirmed, setConfirmed] = useState(false);

  const rung = rungs[rungIndex];
  const exposure = useMemo(() => amount * rung.level, [amount, rung.level]);

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <p className="text-mocha text-sm font-medium">MOCHATRADE ORDER TICKET</p>
        <h1 className="text-2xl font-semibold mt-1">Velocity Ladder + live loss-rate before confirm</h1>
        <p className="text-sm text-[#9FB0C3] mt-2">
          Leverage is gated by behaviour and literacy, not a paid tier. Higher rungs stay locked until
          earned.
        </p>
      </div>

      <div className="card p-5 space-y-5">
        <div>
          <label className="text-xs text-[#7C8CA0]">Remittance amount (USD)</label>
          <input
            type="number"
            min={10}
            value={amount}
            onChange={(e) => {
              setAmount(Number(e.target.value) || 0);
              setConfirmed(false);
            }}
            className="mt-1 w-full bg-[#0B0F14] border border-line rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-mocha"
          />
        </div>

        <div>
          <label className="text-xs text-[#7C8CA0]">Velocity Ladder rung</label>
          <div className="mt-2 space-y-2">
            {rungs.map((r, i) => (
              <button
                key={r.level}
                disabled={!r.unlocked}
                onClick={() => {
                  setRungIndex(i);
                  setConfirmed(false);
                }}
                className={[
                  "w-full flex items-center justify-between rounded-lg border px-3 py-2 text-sm text-left transition-colors",
                  i === rungIndex ? "border-mocha bg-[#1a1510]" : "border-line",
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
          <span className="text-[#7C8CA0]">Total market exposure</span>
          <span className="font-mono">${exposure.toLocaleString()}</span>
        </div>

        {rung.lossRate >= 50 && (
          <div className="text-xs text-bad bg-bad/10 border border-bad/30 rounded-lg px-3 py-2">
            This rung has a historical 365-day loss rate of {rung.lossRate}%. Confirming logs an
            explicit risk acknowledgement to Supervisory Telemetry.
          </div>
        )}

        <button
          onClick={() => setConfirmed(true)}
          className="w-full bg-mocha text-ink font-medium rounded-lg py-2.5 text-sm hover:opacity-90 transition-opacity"
        >
          Confirm order at {rung.label}
        </button>

        {confirmed && (
          <div className="text-xs text-good bg-good/10 border border-good/30 rounded-lg px-3 py-2">
            Order confirmed. Loss-rate disclosure + rung selection logged for regulator telemetry.
          </div>
        )}
      </div>
    </div>
  );
}

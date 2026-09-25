"use client";

import { useEffect, useMemo, useState } from "react";

const rungs = [
  { level: 1, label: "1x — Unlevered", lossRate: 6 },
  { level: 2, label: "2x — Starter", lossRate: 14 },
  { level: 5, label: "5x — Intermediate", lossRate: 38 },
  { level: 10, label: "10x — Advanced", lossRate: 61 },
  { level: 20, label: "20x — Pro", lossRate: 82 },
];

type Market = {
  code: string;
  name: string;
  halted: boolean;
  maxLeverage: number;
};

type Order = {
  id: string;
  marketCode: string;
  amount: number;
  rungLabel: string;
  lossRate: number;
  exposure: number;
  time: string;
};

type Status = "idle" | "submitting" | "confirmed" | "error";

export default function OrderTicket() {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [marketCode, setMarketCode] = useState<string>("IN");
  const [rungIndex, setRungIndex] = useState(1);
  const [amount, setAmount] = useState(250);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);

  const loadMarkets = async () => {
    try {
      const res = await fetch("/api/state", { cache: "no-store" });
      const data = await res.json();
      setMarkets(data.markets ?? []);
      setRecentOrders((data.orders ?? []).slice(0, 5));
    } catch {
      // keep last-known state on transient fetch failures
    }
  };

  useEffect(() => {
    loadMarkets();
    const id = setInterval(loadMarkets, 5000);
    return () => clearInterval(id);
  }, []);

  const market = markets.find((m) => m.code === marketCode);
  const rung = rungs[rungIndex];
  const exposure = useMemo(() => amount * rung.level, [amount, rung.level]);

  const submit = async () => {
    setStatus("submitting");
    setErrorMsg("");
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          marketCode,
          amount,
          rungLevel: rung.level,
          rungLabel: rung.label,
          lossRate: rung.lossRate,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error ?? "Order rejected.");
        setStatus("error");
        loadMarkets();
        return;
      }
      setStatus("confirmed");
      loadMarkets();
    } catch {
      setErrorMsg("Couldn't reach the backend. Make sure the dev server is running.");
      setStatus("error");
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <p className="text-mocha text-sm font-medium">MOCHATRADE ORDER TICKET</p>
        <h1 className="text-2xl font-semibold mt-1">Velocity Ladder + live loss-rate before confirm</h1>
        <p className="text-sm text-[#9FB0C9] mt-2">
          Leverage is gated by behaviour, literacy, and each market&apos;s live config-flag — not a
          paid tier. Change the cap in Ops and this ticket updates within seconds.
        </p>
      </div>

      <div className="card p-5 space-y-5">
        <div>
          <label className="text-xs text-[#7E8CA6]">Market</label>
          <div className="mt-1 grid grid-cols-5 gap-1.5">
            {markets.map((m) => (
              <button
                key={m.code}
                onClick={() => {
                  setMarketCode(m.code);
                  setStatus("idle");
                }}
                className={[
                  "rounded-lg border px-2 py-1.5 text-xs font-mono transition-colors",
                  m.code === marketCode ? "border-mocha bg-[#182544]" : "border-line hover:border-mocha/50",
                  m.halted ? "opacity-50" : "",
                ].join(" ")}
              >
                {m.code}
              </button>
            ))}
          </div>
          {market && (
            <div className="text-xs text-[#7E8CA6] mt-1.5">
              {market.name} — cap {market.maxLeverage}x
              {market.halted && <span className="text-bad"> · leverage halted</span>}
            </div>
          )}
        </div>

        <div>
          <label className="text-xs text-[#7E8CA6]">Remittance amount (USD)</label>
          <input
            type="number"
            min={10}
            value={amount}
            onChange={(e) => {
              setAmount(Number(e.target.value) || 0);
              setStatus("idle");
            }}
            className="mt-1 w-full bg-[#0D1526] border border-line rounded-lg px-3 py-2 text-sm text-[#E7ECF5] focus:outline-none focus:border-mocha"
          />
        </div>

        <div>
          <label className="text-xs text-[#7E8CA6]">Velocity Ladder rung</label>
          <div className="mt-2 space-y-2">
            {rungs.map((r, i) => {
              const unlocked = !!market && r.level <= market.maxLeverage && !market.halted;
              return (
                <button
                  key={r.level}
                  disabled={!unlocked}
                  onClick={() => {
                    setRungIndex(i);
                    setStatus("idle");
                  }}
                  className={[
                    "w-full flex items-center justify-between rounded-lg border px-3 py-2 text-sm text-left transition-colors",
                    i === rungIndex ? "border-mocha bg-[#182544]" : "border-line",
                    !unlocked ? "opacity-40 cursor-not-allowed" : "hover:border-mocha/60",
                  ].join(" ")}
                >
                  <span>
                    {r.label}
                    {!unlocked && market && !market.halted && (
                      <span className="text-[#5E6B85]"> · above {market.maxLeverage}x cap</span>
                    )}
                  </span>
                  <span
                    className={[
                      "text-xs font-mono",
                      r.lossRate >= 50 ? "text-bad" : r.lossRate >= 25 ? "text-warn" : "text-good",
                    ].join(" ")}
                  >
                    {r.lossRate}% 365d loss-rate
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="border-t border-line pt-4 flex items-center justify-between text-sm">
          <span className="text-[#7E8CA6]">Total market exposure</span>
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
          disabled={status === "submitting" || !market || market.halted || rung.level > (market?.maxLeverage ?? 0)}
          className="w-full bg-mocha text-ink font-medium rounded-lg py-2.5 text-sm hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {status === "submitting" ? "Submitting…" : `Confirm order at ${rung.label}`}
        </button>

        {status === "confirmed" && (
          <div className="text-xs text-good bg-good/10 border border-good/30 rounded-lg px-3 py-2">
            Order confirmed. Loss-rate disclosure + rung selection logged to Supervisory Telemetry —
            check the regulator dashboard or the Orders page.
          </div>
        )}
        {status === "error" && (
          <div className="text-xs text-bad bg-bad/10 border border-bad/30 rounded-lg px-3 py-2">
            {errorMsg}
          </div>
        )}
      </div>

      {recentOrders.length > 0 && (
        <div className="card p-4">
          <div className="text-xs text-[#7E8CA6] mb-3">YOUR RECENT ORDERS</div>
          <div className="space-y-2 text-xs font-mono">
            {recentOrders.map((o) => (
              <div key={o.id} className="flex justify-between text-[#9FB0C9]">
                <span>
                  {o.marketCode} · ${o.amount.toLocaleString()} · {o.rungLabel.split(" — ")[0]}
                </span>
                <span>{new Date(o.time).toLocaleTimeString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

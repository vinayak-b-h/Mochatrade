"use client";

import { useEffect, useMemo, useState } from "react";

type Order = {
  id: string;
  marketCode: string;
  amount: number;
  rungLevel: number;
  rungLabel: string;
  lossRate: number;
  exposure: number;
  time: string;
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const res = await fetch("/api/orders", { cache: "no-store" });
        const data = await res.json();
        if (active) setOrders(data);
      } catch {
        // keep last-known orders on transient fetch failures
      }
    };
    load();
    const id = setInterval(load, 4000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);

  const stats = useMemo(() => {
    const totalExposure = orders.reduce((s, o) => s + o.exposure, 0);
    const totalAmount = orders.reduce((s, o) => s + o.amount, 0);
    const avgLossRate = orders.length
      ? Math.round(orders.reduce((s, o) => s + o.lossRate, 0) / orders.length)
      : 0;
    return { totalExposure, totalAmount, avgLossRate, count: orders.length };
  }, [orders]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-mocha text-sm font-medium">ORDER BOOK</p>
        <h1 className="text-2xl font-semibold mt-1">All confirmed orders (live)</h1>
        <p className="text-sm text-[#9FB0C9] mt-2 max-w-2xl">
          Every order confirmed on the trader ticket, across every market, in one feed — the same
          data the regulator&apos;s log summarizes.
        </p>
      </div>

      <div className="grid sm:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="text-xs text-[#7E8CA6]">Orders confirmed</div>
          <div className="text-2xl font-semibold mt-1">{stats.count}</div>
        </div>
        <div className="card p-4">
          <div className="text-xs text-[#7E8CA6]">Total remitted</div>
          <div className="text-2xl font-semibold mt-1">${stats.totalAmount.toLocaleString()}</div>
        </div>
        <div className="card p-4">
          <div className="text-xs text-[#7E8CA6]">Total exposure</div>
          <div className="text-2xl font-semibold mt-1">${stats.totalExposure.toLocaleString()}</div>
        </div>
        <div className="card p-4">
          <div className="text-xs text-[#7E8CA6]">Avg. 365d loss-rate</div>
          <div
            className={[
              "text-2xl font-semibold mt-1",
              stats.avgLossRate >= 50 ? "text-bad" : stats.avgLossRate >= 25 ? "text-warn" : "text-good",
            ].join(" ")}
          >
            {stats.count ? `${stats.avgLossRate}%` : "—"}
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-[#7E8CA6] border-b border-line">
              <th className="px-4 py-3 font-normal">Time</th>
              <th className="px-4 py-3 font-normal">Market</th>
              <th className="px-4 py-3 font-normal">Amount</th>
              <th className="px-4 py-3 font-normal">Rung</th>
              <th className="px-4 py-3 font-normal">365d loss-rate</th>
              <th className="px-4 py-3 font-normal">Exposure</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b border-line last:border-0">
                <td className="px-4 py-3 font-mono text-xs text-[#7E8CA6]">
                  {new Date(o.time).toLocaleTimeString()}
                </td>
                <td className="px-4 py-3">
                  <span className="font-mono text-xs text-mocha">{o.marketCode}</span>
                </td>
                <td className="px-4 py-3 font-mono">${o.amount.toLocaleString()}</td>
                <td className="px-4 py-3">{o.rungLabel}</td>
                <td className="px-4 py-3">
                  <span
                    className={[
                      "font-mono text-xs",
                      o.lossRate >= 50 ? "text-bad" : o.lossRate >= 25 ? "text-warn" : "text-good",
                    ].join(" ")}
                  >
                    {o.lossRate}%
                  </span>
                </td>
                <td className="px-4 py-3 font-mono">${o.exposure.toLocaleString()}</td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-xs text-[#5E6B85]">
                  No orders yet — confirm one on the trader ticket to see it here.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

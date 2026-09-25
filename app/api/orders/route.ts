import { NextResponse } from "next/server";
import { addOrder, getStore } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(getStore().orders);
}

export async function POST(req: Request) {
  let body: { amount?: number; rungLevel?: number; rungLabel?: string; lossRate?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }

  const { amount, rungLevel, rungLabel, lossRate } = body;
  if (!amount || !rungLevel || !rungLabel || typeof lossRate !== "number") {
    return NextResponse.json({ error: "amount, rungLevel, rungLabel and lossRate are required" }, { status: 400 });
  }

  const state = addOrder({ amount, rungLevel, rungLabel, lossRate });
  return NextResponse.json(state);
}

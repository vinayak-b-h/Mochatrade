import { NextResponse } from "next/server";
import { addOrder, getStore } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(getStore().orders);
}

export async function POST(req: Request) {
  let body: {
    marketCode?: string;
    amount?: number;
    rungLevel?: number;
    rungLabel?: string;
    lossRate?: number;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }

  const { marketCode, amount, rungLevel, rungLabel, lossRate } = body;
  if (!marketCode || !amount || !rungLevel || !rungLabel || typeof lossRate !== "number") {
    return NextResponse.json(
      { error: "marketCode, amount, rungLevel, rungLabel and lossRate are required" },
      { status: 400 }
    );
  }

  const result = addOrder({ marketCode, amount, rungLevel, rungLabel, lossRate });
  if (!result.ok) {
    return NextResponse.json({ error: result.error, state: result.state }, { status: 422 });
  }
  return NextResponse.json(result.state);
}

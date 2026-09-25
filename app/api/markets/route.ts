import { NextResponse } from "next/server";
import { setMaxLeverage } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function PATCH(req: Request) {
  let body: { code?: string; maxLeverage?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }

  const { code, maxLeverage } = body;
  if (!code || typeof maxLeverage !== "number") {
    return NextResponse.json({ error: "code and maxLeverage are required" }, { status: 400 });
  }

  const state = setMaxLeverage(code, maxLeverage);
  return NextResponse.json(state);
}

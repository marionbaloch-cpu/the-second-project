import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  console.log("[QuantumCore] Analysis initiated:", body);
  return NextResponse.json({ status: "initiated" });
}

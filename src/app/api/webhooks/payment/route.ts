import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ message: "Payment webhook — not implemented" }, { status: 501 });
}

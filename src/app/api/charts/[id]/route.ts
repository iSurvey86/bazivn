import { getChartById } from "@/lib/charts/repository";
import { NextResponse } from "next/server";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const chart = await getChartById(id);

  if (!chart) {
    return NextResponse.json({ error: "Không tìm thấy lá số." }, { status: 404 });
  }

  return NextResponse.json(chart);
}

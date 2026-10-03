import { calculateBaZi } from "@/lib/astrology-engine";
import { getChartById, updateChartBaziData } from "@/lib/charts/repository";
import { baziRecalculateSchema } from "@/lib/bazi-schema";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

type RouteContext = { params: Promise<{ id: string }> };

/**
 * Đổi quy ước (vd. dayBoundaryMode) → recalculate toàn bộ từ input gốc trên chart.
 * Không patch từng field.
 */
export async function POST(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const input = baziRecalculateSchema.parse(body);

    const existing = await getChartById(id);
    if (!existing) {
      return NextResponse.json({ error: "Không tìm thấy lá số." }, { status: 404 });
    }

    const prev = existing.baziData;
    const solar = prev.solar;
    if (!solar?.year || !solar?.month || !solar?.day) {
      return NextResponse.json(
        { error: "Lá số thiếu dữ liệu sinh gốc để tính lại." },
        { status: 400 },
      );
    }

    const chart = calculateBaZi({
      gender: prev.gender,
      timezone: prev.timezone,
      local: {
        year: solar.year,
        month: solar.month,
        day: solar.day,
        hour: solar.hour ?? 0,
        minute: solar.minute ?? 0,
        second: solar.second ?? 0,
      },
      conventions: {
        ...prev.conventions,
        dayBoundaryMode: input.dayBoundaryMode,
      },
    });

    const saved = await updateChartBaziData(id, chart);
    if (!saved) {
      return NextResponse.json({ error: "Không cập nhật được lá số." }, { status: 500 });
    }

    return NextResponse.json({
      chartId: saved.id,
      chart: saved.baziData,
      fullName: saved.fullName,
      birthPlace: saved.birthPlace,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Dữ liệu không hợp lệ", details: error.flatten() },
        { status: 400 },
      );
    }
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Không thể tính lại lá số." },
      { status: 500 },
    );
  }
}

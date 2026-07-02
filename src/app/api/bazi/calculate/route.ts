import { calculateBaZi } from "@/lib/astrology-engine";
import { saveChart } from "@/lib/charts/repository";
import { baziCalculateSchema } from "@/lib/bazi-schema";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = baziCalculateSchema.parse(body);
    const chart = calculateBaZi({
      gender: input.gender,
      timezone: input.timezone,
      local: {
        year: input.year,
        month: input.month,
        day: input.day,
        hour: input.hour,
        minute: input.minute,
        second: input.second,
      },
    });

    let chartId: string | null = null;
    if (input.save) {
      const saved = await saveChart({
        fullName: input.fullName ?? null,
        birthPlace: input.birthPlace ?? null,
        gender: input.gender,
        chart,
      });
      chartId = saved.id;
    }

    return NextResponse.json({
      chartId,
      fullName: input.fullName ?? null,
      birthPlace: input.birthPlace ?? null,
      chart,
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
      { error: "Không thể tính lá số Bát Tự." },
      { status: 500 },
    );
  }
}

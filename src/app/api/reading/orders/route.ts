import { getChartById } from "@/lib/charts/repository";
import {
  buildLockedSnapshot,
  createReadingOrder,
} from "@/lib/reading/repository";
import type { ReadingSchool, ReadingSource } from "@/lib/reading/types";
import { NextResponse } from "next/server";
import { z } from "zod";

const bodySchema = z.object({
  source: z.enum(["existing_chart", "new_chart"]),
  school: z.enum(["traditional", "manh_phai"]),
  chartId: z.string().uuid().optional().nullable(),
});

export async function POST(request: Request) {
  try {
    const body = bodySchema.parse(await request.json());
    let source: ReadingSource = body.source;
    let school: ReadingSchool = body.school;
    let chartId: string | null = body.chartId ?? null;
    let lockedSnapshot = null;

    if (source === "existing_chart") {
      if (!chartId) {
        // Chưa có chart hoàn chỉnh → coi là lá số mới
        source = "new_chart";
      } else {
        const record = await getChartById(chartId);
        if (!record) {
          source = "new_chart";
          chartId = null;
        } else {
          lockedSnapshot = buildLockedSnapshot({
            chart: record.baziData,
            fullName: record.fullName,
            birthPlace: record.birthPlace,
            unknownHour: record.unknownHour ?? false,
          });
        }
      }
    }

    const order = await createReadingOrder({
      source,
      school,
      chartId,
      lockedSnapshot,
    });

    return NextResponse.json({ order });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dữ liệu không hợp lệ", details: error.flatten() },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: "Không tạo được đơn đăng ký luận giải." },
      { status: 500 },
    );
  }
}

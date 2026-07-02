import type { BaZiChartResult } from "@/lib/astrology-engine";
import type { ReadingType } from "@/lib/ai-prompts";
import { buildSystemPrompt, buildUserPrompt } from "@/lib/ai-prompts";
import { getChartById } from "@/lib/charts/repository";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { NextResponse } from "next/server";
import { z } from "zod";

const bodySchema = z.object({
  chartId: z.string().uuid(),
  readingType: z.enum(["personality", "career", "relationships"]).default("personality"),
});

export async function POST(request: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        {
          content:
            "Đinh Hỏa — ngọn đuốc trong đêm. Bạn có tâm hồn tinh tế, nhạy cảm và khả năng truyền cảm hứng cho người khác. (Chế độ demo — cấu hình OPENAI_API_KEY để bật AI thật.)",
          demo: true,
        },
        { status: 200 },
      );
    }

    const body = bodySchema.parse(await request.json());
    const record = await getChartById(body.chartId);

    if (!record) {
      return NextResponse.json({ error: "Không tìm thấy lá số." }, { status: 404 });
    }

    if (!record.isPremium) {
      return NextResponse.json(
        { error: "Cần mở khóa Premium để xem luận giải AI." },
        { status: 403 },
      );
    }

    const chart = record.baziData as BaZiChartResult;
    const readingType = body.readingType as ReadingType;

    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      system: buildSystemPrompt("vn", readingType, {
        dayMaster: chart.dayMasterVi,
        gender: chart.genderLabel,
        pillars: `${chart.pillars.year.ganZhiVi} | ${chart.pillars.month.ganZhiVi} | ${chart.pillars.day.ganZhiVi} | ${chart.pillars.hour.ganZhiVi}`,
      }),
      prompt: buildUserPrompt(readingType, chart),
    });

    return NextResponse.json({ content: text });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "AI stream failed." }, { status: 500 });
  }
}

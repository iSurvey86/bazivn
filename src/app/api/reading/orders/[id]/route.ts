import { calculateBaZi } from "@/lib/astrology-engine";
import { saveChart, getChartById } from "@/lib/charts/repository";
import { baziCalculateSchema } from "@/lib/bazi-schema";
import {
  attachChartToOrder,
  getReadingOrder,
  markReadingOrderPaid,
  saveIntake,
  savePostPay,
  updateReadingOrder,
} from "@/lib/reading/repository";
import type {
  CertaintyLevel,
  ReadingIntake,
  ReadingMethod,
  ReadingPostPay,
  ReadingRectifyPayload,
  ReadingVerifiedPayload,
} from "@/lib/reading/types";
import { NextResponse } from "next/server";
import { z } from "zod";

type RouteContext = { params: Promise<{ id: string }> };

const certaintySchema = z.enum([
  "very_sure",
  "quite_sure",
  "uncertain",
  "unknown_hour",
]);

const intakeSchema = z.object({
  method: z.enum(["independent", "verified", "rectify_hour"]),
  unknownHour: z.boolean().optional().default(false),
  notes: z.string().trim().max(2000).optional().default(""),
});

const fieldIdSchema = z.enum([
  "career",
  "marriage",
  "education",
  "children",
  "finance",
  "health",
  "relocation",
  "family",
]);

const interestTopicSchema = z.enum([
  "overview",
  "education",
  "career",
  "cooperation",
  "finance",
  "marriage",
  "children",
  "health",
  "family",
  "dayun",
  "fengshui",
  "other",
]);

const verifiedPayloadSchema = z.object({
  selectedFields: z.array(fieldIdSchema).min(1).max(8),
  fields: z.array(
    z.object({
      fieldId: fieldIdSchema,
      events: z.array(
        z.object({
          day: z.number().int().min(1).max(31).nullable(),
          month: z.number().int().min(1).max(12).nullable(),
          year: z.number().int().min(1900).max(2100).nullable(),
          content: z.string().trim().max(500),
        }),
      ),
    }),
  ),
  anchorMilestone: z.string().trim().max(1000),
  uncertainNotes: z.string().trim().max(1000),
  knownFuture: z.string().trim().max(2000),
  interestTopics: z.array(interestTopicSchema).max(12),
  mainQuestion: z.string().trim().min(1).max(1000),
  extraQuestions: z.string().trim().max(2000),
  dataCommitment: z.literal(true),
});

const rectifyPayloadSchema = z.object({
  timeRange: z.string().trim().min(1).max(200),
  timeSource: z.enum([
    "documents",
    "family",
    "approx_range",
    "previously_rectified",
    "unknown",
  ]),
  landmarks: z
    .array(
      z.object({
        day: z.number().int().min(1).max(31).nullable(),
        month: z.number().int().min(1).max(12).nullable(),
        year: z.number().int().min(1900).max(2100).nullable(),
        group: z
          .enum([
            "education",
            "marriage",
            "career",
            "children",
            "finance",
            "health",
            "relocation",
            "family",
            "funeral",
            "other",
          ])
          .nullable(),
        detail: z.string().trim().max(500),
      }),
    )
    .min(8)
    .max(20),
  uncertainNotes: z.string().trim().max(1000),
  knownFuture: z.string().trim().max(2000),
  interestTopics: z.array(interestTopicSchema).max(12),
  mainQuestion: z.string().trim().min(1).max(1000),
  extraQuestions: z.string().trim().max(2000),
  dataCommitment: z.literal(true),
});

const postPaySchema = z.object({
  method: z.enum(["independent", "verified", "rectify_hour"]),
  verified: verifiedPayloadSchema.nullable(),
  rectify: rectifyPayloadSchema.nullable(),
  submittedAt: z.string().nullable().optional(),
});

const patchSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("confirm_review"),
    unknownHour: z.boolean().optional().default(false),
    certainty: certaintySchema.optional().default("very_sure"),
  }),
  z.object({ action: z.literal("mark_paid") }),
  z.object({
    action: z.literal("save_basic"),
    basic: baziCalculateSchema.omit({ save: true }),
    unknownHour: z.boolean().optional().default(false),
    certainty: certaintySchema.optional().default("very_sure"),
  }),
  z.object({
    action: z.literal("save_intake"),
    intake: intakeSchema,
  }),
  z.object({
    action: z.literal("save_post_pay"),
    submit: z.boolean().optional().default(true),
    postPay: postPaySchema,
  }),
]);

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const order = await getReadingOrder(id);
  if (!order) {
    return NextResponse.json({ error: "Không tìm thấy đơn." }, { status: 404 });
  }
  let chart = null;
  if (order.chartId) {
    const record = await getChartById(order.chartId);
    chart = record
      ? {
          id: record.id,
          fullName: record.fullName,
          birthPlace: record.birthPlace,
          baziData: record.baziData,
        }
      : null;
  }
  return NextResponse.json({ order, chart });
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const order = await getReadingOrder(id);
    if (!order) {
      return NextResponse.json({ error: "Không tìm thấy đơn." }, { status: 404 });
    }

    const body = patchSchema.parse(await request.json());

    if (body.action === "confirm_review") {
      if (!order.lockedSnapshot) {
        return NextResponse.json(
          { error: "Chưa có dữ liệu lá số để khóa kiểm tra." },
          { status: 400 },
        );
      }
      const lockedSnapshot = {
        ...order.lockedSnapshot,
        unknownHour: body.unknownHour,
        certainty: body.certainty,
      };
      const updated = await updateReadingOrder(id, {
        lockedSnapshot,
        status: "intake",
      });
      return NextResponse.json({ order: updated });
    }

    if (body.action === "mark_paid") {
      const updated = await markReadingOrderPaid(id);
      return NextResponse.json({ order: updated });
    }

    if (body.action === "save_post_pay") {
      if (!order.code) {
        return NextResponse.json(
          { error: "Chưa thanh toán — chưa có Mã mệnh thư." },
          { status: 400 },
        );
      }
      const postPay: ReadingPostPay = {
        method: body.postPay.method,
        verified: body.postPay.verified as ReadingVerifiedPayload | null,
        rectify: (body.postPay.rectify as ReadingRectifyPayload | null) ?? null,
        submittedAt: body.postPay.submittedAt ?? null,
      };
      if (body.postPay.method === "verified" && body.submit) {
        if (!body.postPay.verified) {
          return NextResponse.json(
            { error: "Thiếu dữ liệu nghiệm chứng." },
            { status: 400 },
          );
        }
      }
      if (body.postPay.method === "rectify_hour" && body.submit) {
        if (!body.postPay.rectify) {
          return NextResponse.json(
            { error: "Thiếu dữ liệu hiệu chỉnh giờ sinh." },
            { status: 400 },
          );
        }
      }
      const updated = await savePostPay(id, postPay, body.submit);
      return NextResponse.json({ order: updated });
    }

    if (body.action === "save_intake") {
      const snap = order.lockedSnapshot;
      if (!snap) {
        return NextResponse.json(
          { error: "Chưa khóa thông tin cơ bản." },
          { status: 400 },
        );
      }
      const pad = (n: number) => String(n).padStart(2, "0");
      const unknownHour = body.intake.unknownHour;
      const requested = body.intake.method as ReadingMethod;
      const method: ReadingMethod = unknownHour
        ? "rectify_hour"
        : requested === "rectify_hour"
          ? "independent"
          : requested;
      const intake: ReadingIntake = {
        aliasOrName: snap.fullName?.trim() || "Khách",
        gender: snap.gender,
        solarDate: `${snap.solar.year}-${pad(snap.solar.month)}-${pad(snap.solar.day)}`,
        birthPlace: snap.birthPlace ?? "",
        birthTime: `${pad(snap.solar.hour)}:${pad(snap.solar.minute)}`,
        unknownHour,
        certainty: unknownHour
          ? "unknown_hour"
          : ((snap.certainty ?? "very_sure") as CertaintyLevel),
        method,
        notes: body.intake.notes ?? "",
      };
      const lockedSnapshot = {
        ...snap,
        unknownHour,
        certainty: intake.certainty,
      };
      const updated = await updateReadingOrder(id, {
        intake,
        lockedSnapshot,
        status: "awaiting_payment",
      });
      return NextResponse.json({ order: updated });
    }

    // save_basic
    const input = body.basic;
    const chart = calculateBaZi({
      gender: input.gender,
      timezone: input.timezone,
      local: {
        year: input.year,
        month: input.month,
        day: input.day,
        hour: input.hour,
        minute: input.minute,
        second: input.second ?? 0,
      },
      conventions: {
        dayBoundaryMode: input.dayBoundaryMode,
      },
    });
    const saved = await saveChart({
      fullName: input.fullName ?? null,
      birthPlace: input.birthPlace ?? null,
      gender: input.gender,
      chart,
      unknownHour: body.unknownHour,
    });
    const updated = await attachChartToOrder({
      orderId: id,
      chartId: saved.id,
      chart: saved.baziData,
      fullName: saved.fullName,
      birthPlace: saved.birthPlace,
      gender: saved.gender,
      unknownHour: body.unknownHour,
      certainty: body.unknownHour ? "unknown_hour" : body.certainty,
    });
    return NextResponse.json({ order: updated, chartId: saved.id });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dữ liệu không hợp lệ", details: error.flatten() },
        { status: 400 },
      );
    }
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Không cập nhật được đơn đăng ký." },
      { status: 500 },
    );
  }
}

import type { BaZiChartResult } from "@/lib/astrology-engine";
import type { Gender } from "@/lib/bazi-schema";
import { randomUUID } from "crypto";
import { mkdir, readdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { generateUniqueReadingCode } from "./code";
import { isValidReadingCode, normalizeReadingCode } from "./code-format";
import type {
  ReadingIntake,
  ReadingLockedSnapshot,
  ReadingOrder,
  ReadingPostPay,
  ReadingSchool,
  ReadingSource,
} from "./types";

const STORE_DIR = path.join(process.cwd(), ".data", "reading-orders");

export function buildLockedSnapshot(params: {
  chart: BaZiChartResult;
  fullName: string | null;
  birthPlace: string | null;
  unknownHour?: boolean;
}): ReadingLockedSnapshot {
  const { chart, fullName, birthPlace } = params;
  const unknownHour = params.unknownHour ?? false;
  return {
    fullName,
    birthPlace,
    gender: chart.gender,
    timezone: chart.timezone,
    solar: { ...chart.solar },
    dayBoundaryMode: chart.conventions?.dayBoundaryMode ?? "midnight_00",
    pillarsSummary: {
      year: chart.pillars.year.ganZhiVi,
      month: chart.pillars.month.ganZhiVi,
      day: chart.pillars.day.ganZhiVi,
      hour: chart.pillars.hour.ganZhiVi,
    },
    dayMasterVi: chart.dayMasterVi,
    unknownHour,
    certainty: unknownHour ? "unknown_hour" : "very_sure",
  };
}

async function ensureDir() {
  await mkdir(STORE_DIR, { recursive: true });
}

async function writeOrder(order: ReadingOrder) {
  await ensureDir();
  await writeFile(
    path.join(STORE_DIR, `${order.id}.json`),
    JSON.stringify(order, null, 2),
    "utf-8",
  );
}

export async function getReadingOrder(
  id: string,
): Promise<ReadingOrder | null> {
  try {
    const raw = await readFile(path.join(STORE_DIR, `${id}.json`), "utf-8");
    return JSON.parse(raw) as ReadingOrder;
  } catch {
    return null;
  }
}

/**
 * Tra cứu theo mã: chữ thường → hoa; phải đúng 8 ký tự alphabet an toàn
 * (không `-`, khoảng trắng, 0/O/1/I).
 */
export async function findReadingOrderByCode(
  rawCode: string,
): Promise<ReadingOrder | null> {
  const needle = normalizeReadingCode(rawCode);
  if (!isValidReadingCode(needle)) return null;
  try {
    const files = await readdir(STORE_DIR);
    for (const f of files) {
      if (!f.endsWith(".json")) continue;
      try {
        const raw = await readFile(path.join(STORE_DIR, f), "utf-8");
        const order = JSON.parse(raw) as ReadingOrder;
        if (
          order.code &&
          normalizeReadingCode(order.code) === needle
        ) {
          return order;
        }
      } catch {
        /* skip */
      }
    }
  } catch {
    return null;
  }
  return null;
}

export async function createReadingOrder(params: {
  source: ReadingSource;
  school: ReadingSchool;
  chartId?: string | null;
  lockedSnapshot?: ReadingLockedSnapshot | null;
}): Promise<ReadingOrder> {
  const id = randomUUID();
  const now = new Date().toISOString();
  const hasSnapshot = Boolean(params.lockedSnapshot);
  const order: ReadingOrder = {
    id,
    code: null, // cấp + khóa khi thanh toán
    source: params.source,
    school: params.school,
    status: hasSnapshot ? "locked_review" : "draft",
    chartId: params.chartId ?? null,
    lockedSnapshot: params.lockedSnapshot ?? null,
    intake: null,
    postPay: null,
    createdAt: now,
    updatedAt: now,
  };
  await writeOrder(order);
  return order;
}

export async function updateReadingOrder(
  id: string,
  patch: Partial<
    Pick<
      ReadingOrder,
      | "status"
      | "chartId"
      | "lockedSnapshot"
      | "intake"
      | "school"
      | "source"
      | "code"
      | "postPay"
    >
  >,
): Promise<ReadingOrder | null> {
  const current = await getReadingOrder(id);
  if (!current) return null;
  const next: ReadingOrder = {
    ...current,
    ...patch,
    // đơn cũ thiếu postPay
    postPay: patch.postPay !== undefined ? patch.postPay : (current.postPay ?? null),
    updatedAt: new Date().toISOString(),
  };
  await writeOrder(next);
  return next;
}

/**
 * Khóa Mã mệnh thư khi thanh toán: sinh mã một lần, rồi sang thu thập (collecting).
 */
export async function markReadingOrderPaid(
  id: string,
): Promise<ReadingOrder | null> {
  const current = await getReadingOrder(id);
  if (!current) return null;
  if (current.status === "submitted" && current.code) return current;
  if (current.status === "collecting" && current.code && current.postPay) {
    return current;
  }

  const code = current.code ?? (await generateUniqueReadingCode());
  const unknownHour =
    current.intake?.unknownHour || current.lockedSnapshot?.unknownHour;
  const raw = current.intake?.method ?? "independent";
  const method = unknownHour
    ? "rectify_hour"
    : raw === "rectify_hour"
      ? "independent"
      : raw;
  const postPay: ReadingPostPay = current.postPay ?? {
    method,
    verified: null,
    rectify: null,
    submittedAt: null,
  };
  return updateReadingOrder(id, {
    status: "collecting",
    code,
    postPay: { ...postPay, method },
  });
}

export async function savePostPay(
  orderId: string,
  postPay: ReadingPostPay,
  submit: boolean,
): Promise<ReadingOrder | null> {
  const current = await getReadingOrder(orderId);
  if (!current?.code) return null;
  const next: ReadingPostPay = {
    ...postPay,
    submittedAt: submit ? new Date().toISOString() : postPay.submittedAt,
  };
  return updateReadingOrder(orderId, {
    postPay: next,
    status: submit ? "submitted" : "collecting",
  });
}

export async function attachChartToOrder(params: {
  orderId: string;
  chartId: string;
  chart: BaZiChartResult;
  fullName: string | null;
  birthPlace: string | null;
  gender: Gender;
  unknownHour?: boolean;
  certainty?: import("./types").CertaintyLevel;
}): Promise<ReadingOrder | null> {
  const snapshot = buildLockedSnapshot({
    chart: params.chart,
    fullName: params.fullName,
    birthPlace: params.birthPlace,
  });
  snapshot.gender = params.gender;
  snapshot.unknownHour = params.unknownHour ?? false;
  snapshot.certainty = params.certainty ?? "very_sure";
  return updateReadingOrder(params.orderId, {
    chartId: params.chartId,
    lockedSnapshot: snapshot,
    status: "locked_review",
  });
}

export async function saveIntake(
  orderId: string,
  intake: ReadingIntake,
): Promise<ReadingOrder | null> {
  return updateReadingOrder(orderId, {
    intake,
    status: "awaiting_payment",
  });
}

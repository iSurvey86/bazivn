import { readdir, readFile } from "fs/promises";
import path from "path";
import { getChartById } from "@/lib/charts/repository";
import type { ReadingOrder } from "@/lib/reading/types";
import { DEMO_ACCOUNT_PROFILE } from "./demo-data";
import type { AccountProfile } from "./types";

const READING_DIR = path.join(process.cwd(), ".data", "reading-orders");

async function latestReadingOrder(): Promise<ReadingOrder | null> {
  try {
    const files = (await readdir(READING_DIR)).filter((f) => f.endsWith(".json"));
    if (!files.length) return null;
    const orders = await Promise.all(
      files.map(async (f) => {
        try {
          const raw = await readFile(path.join(READING_DIR, f), "utf-8");
          return JSON.parse(raw) as ReadingOrder;
        } catch {
          return null;
        }
      }),
    );
    const list = orders.filter(Boolean) as ReadingOrder[];
    list.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
    return list[0] ?? null;
  } catch {
    return null;
  }
}

/** Ghép demo + đơn/chart thật gần nhất (nếu có). */
export async function getAccountProfile(): Promise<AccountProfile> {
  const profile: AccountProfile = { ...DEMO_ACCOUNT_PROFILE };
  const order = await latestReadingOrder();
  if (order?.code) {
    profile.code = order.code;
    profile.displayName =
      order.lockedSnapshot?.fullName?.trim() ||
      order.intake?.aliasOrName ||
      profile.displayName;
    if (order.status === "submitted" || order.status === "collecting") {
      profile.statusLabel =
        order.status === "submitted" ? "Đã nhận đủ thông tin" : "Đang thu thập";
      profile.statusTone =
        order.status === "submitted" ? "ready" : "processing";
    }
    if (order.chartId) {
      profile.chartId = order.chartId;
      const chart = await getChartById(order.chartId);
      if (chart) {
        const p = chart.baziData.pillars;
        profile.pillars = {
          year: {
            gan: p.year.ganVi,
            zhi: p.year.zhiVi,
            note: p.year.ganZhiVi,
          },
          month: {
            gan: p.month.ganVi,
            zhi: p.month.zhiVi,
            note: p.month.ganZhiVi,
          },
          day: {
            gan: p.day.ganVi,
            zhi: p.day.zhiVi,
            note: p.day.ganZhiVi,
          },
          hour: {
            gan: p.hour.ganVi,
            zhi: p.hour.zhiVi,
            note: p.hour.ganZhiVi,
          },
        };
      }
    }
  }
  return profile;
}

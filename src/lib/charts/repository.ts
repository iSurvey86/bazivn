import type { BaZiChartResult } from "@/lib/astrology-engine";
import { normalizeBaZiChart } from "@/lib/astrology-engine";
import type { Gender } from "@/lib/bazi-schema";
import { createServerClient } from "@/lib/supabase/server";
import { randomUUID } from "crypto";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

export interface SavedChartRecord {
  id: string;
  fullName: string | null;
  birthPlace: string | null;
  gender: Gender;
  timezone: string;
  birthTimeUtc: string;
  baziData: BaZiChartResult;
  isPremium: boolean;
  createdAt: string;
}

const LOCAL_STORE_DIR = path.join(process.cwd(), ".data", "charts");

function hasSupabaseConfig() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      (process.env.SUPABASE_SERVICE_ROLE_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
  );
}

function getTimezoneOffsetHours(timezone: string, date = new Date()): number {
  const utc = new Date(date.toLocaleString("en-US", { timeZone: "UTC" }));
  const tz = new Date(date.toLocaleString("en-US", { timeZone: timezone }));
  return (tz.getTime() - utc.getTime()) / 3_600_000;
}

function toBirthTimeUtc(chart: BaZiChartResult): string {
  const { solar, timezone } = chart;
  const offset = getTimezoneOffsetHours(timezone);
  return new Date(
    Date.UTC(
      solar.year,
      solar.month - 1,
      solar.day,
      solar.hour - offset,
      solar.minute,
      solar.second,
    ),
  ).toISOString();
}

async function saveChartLocal(record: SavedChartRecord) {
  await mkdir(LOCAL_STORE_DIR, { recursive: true });
  await writeFile(
    path.join(LOCAL_STORE_DIR, `${record.id}.json`),
    JSON.stringify(record, null, 2),
    "utf-8",
  );
}

async function getChartLocal(id: string): Promise<SavedChartRecord | null> {
  try {
    const raw = await readFile(path.join(LOCAL_STORE_DIR, `${id}.json`), "utf-8");
    const record = JSON.parse(raw) as SavedChartRecord;
    return {
      ...record,
      birthPlace: record.birthPlace ?? null,
      baziData: normalizeBaZiChart(record.baziData),
    };
  } catch {
    return null;
  }
}

export async function saveChart(params: {
  fullName: string | null;
  birthPlace?: string | null;
  gender: Gender;
  chart: BaZiChartResult;
}): Promise<SavedChartRecord> {
  const id = randomUUID();
  const record: SavedChartRecord = {
    id,
    fullName: params.fullName,
    birthPlace: params.birthPlace ?? null,
    gender: params.gender,
    timezone: params.chart.timezone,
    birthTimeUtc: toBirthTimeUtc(params.chart),
    baziData: params.chart,
    isPremium: false,
    createdAt: new Date().toISOString(),
  };

  if (hasSupabaseConfig()) {
    const supabase = createServerClient();
    const { error } = await supabase.from("user_charts").insert({
      id: record.id,
      full_name: record.fullName ?? "Khách",
      birth_time_utc: record.birthTimeUtc,
      bazi_data: record.baziData,
      is_premium: false,
    });

    if (error) {
      throw new Error(`Supabase save failed: ${error.message}`);
    }
    return record;
  }

  await saveChartLocal(record);
  return record;
}

export async function getChartById(id: string): Promise<SavedChartRecord | null> {
  if (hasSupabaseConfig()) {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("user_charts")
      .select("id, full_name, birth_time_utc, bazi_data, is_premium, created_at")
      .eq("id", id)
      .maybeSingle();

    if (error || !data) return null;

    return {
      id: data.id,
      fullName: data.full_name,
      birthPlace: null,
      gender: (data.bazi_data as BaZiChartResult).gender,
      timezone: (data.bazi_data as BaZiChartResult).timezone,
      birthTimeUtc: data.birth_time_utc,
      baziData: normalizeBaZiChart(data.bazi_data as BaZiChartResult),
      isPremium: data.is_premium ?? false,
      createdAt: data.created_at ?? new Date().toISOString(),
    };
  }

  return getChartLocal(id);
}

export async function setChartPremium(id: string, isPremium: boolean) {
  if (hasSupabaseConfig()) {
    const supabase = createServerClient();
    await supabase.from("user_charts").update({ is_premium: isPremium }).eq("id", id);
    return;
  }

  const record = await getChartLocal(id);
  if (record) {
    record.isPremium = isPremium;
    await saveChartLocal(record);
  }
}

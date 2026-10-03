"use client";

import type { BaZiChartResult } from "@/lib/astrology-engine";
import { calculateBaZi } from "@/lib/astrology-engine";
import {
  dayBoundaryOptionHint,
  dayBoundaryOptionLabel,
  isDayBoundarySensitiveHour,
  type DayBoundaryMode,
} from "@/lib/core/conventions";
import { useMemo, useState } from "react";

type Props = {
  chartId: string;
  chart: BaZiChartResult;
  onChartUpdated: (chart: BaZiChartResult) => void;
};

function previewPair(chart: BaZiChartResult) {
  const solar = chart.solar;
  const local = {
    year: solar.year,
    month: solar.month,
    day: solar.day,
    hour: solar.hour,
    minute: solar.minute,
    second: solar.second ?? 0,
  };
  const mid = calculateBaZi({
    gender: chart.gender,
    timezone: chart.timezone,
    local,
    conventions: { ...chart.conventions, dayBoundaryMode: "midnight_00" },
  });
  const zi = calculateBaZi({
    gender: chart.gender,
    timezone: chart.timezone,
    local,
    conventions: { ...chart.conventions, dayBoundaryMode: "zi_start_23" },
  });
  return {
    midnight_00: {
      day: mid.pillars.day.ganZhiVi,
      hour: mid.pillars.hour.ganZhiVi,
    },
    zi_start_23: {
      day: zi.pillars.day.ganZhiVi,
      hour: zi.pillars.hour.ganZhiVi,
    },
  };
}

/**
 * Chỉ hiện với lá số giờ 23:xx — cho phép đảo nhanh giữa 2 quy ước
 * (recalculate toàn bộ, không patch Nhật trụ).
 */
export function BaziDayBoundaryPanel({ chartId, chart, onChartUpdated }: Props) {
  const mode = chart.conventions?.dayBoundaryMode ?? "midnight_00";
  const sensitive = isDayBoundarySensitiveHour(chart.solar.hour);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const preview = useMemo(() => {
    if (!sensitive) return null;
    try {
      return previewPair(chart);
    } catch {
      return null;
    }
  }, [chart, sensitive]);

  if (!sensitive) return null;

  async function applyMode(next: DayBoundaryMode) {
    if (next === mode) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/bazi/charts/${chartId}/recalculate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dayBoundaryMode: next }),
      });
      const data = (await res.json()) as {
        chart?: BaZiChartResult;
        error?: string;
      };
      if (!res.ok || !data.chart) {
        throw new Error(data.error ?? "Không tính lại được lá số.");
      }
      onChartUpdated(data.chart);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Lỗi không xác định.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mb-4 rounded-lg border border-accent/40 bg-accent-light/50 px-3 py-3">
      <p className="text-sm font-bold text-accent">Lá số nhạy Dạ Tý</p>

      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {(["midnight_00", "zi_start_23"] as const).map((m) => {
          const p = preview?.[m];
          const active = mode === m;
          return (
            <button
              key={m}
              type="button"
              disabled={busy}
              onClick={() => void applyMode(m)}
              className={`rounded-md border px-3 py-2.5 text-left text-sm transition disabled:opacity-60 ${
                active
                  ? "border-accent bg-surface shadow-sm ring-1 ring-accent/30"
                  : "border-border bg-surface/80 hover:border-border-strong"
              }`}
            >
              <span className="flex items-center gap-2">
                <span
                  className={`inline-block h-2.5 w-2.5 rounded-full ${
                    active ? "bg-accent" : "bg-border-strong"
                  }`}
                />
                <span className="font-bold text-foreground">
                  {dayBoundaryOptionLabel(m)}
                </span>
                {active ? (
                  <span className="text-[11px] font-bold text-accent">
                    · đang xem
                  </span>
                ) : null}
              </span>
              <span className="mt-0.5 block pl-5 text-xs text-muted">
                {dayBoundaryOptionHint(m)}
              </span>
              {p ? (
                <span className="mt-1 block pl-5 text-xs font-semibold text-foreground">
                  {p.day} – {p.hour}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {error ? (
        <p className="mt-2 text-xs font-bold text-red-600">{error}</p>
      ) : null}
    </div>
  );
}

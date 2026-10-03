/**
 * Versioned school conventions — never hard-code a single school as absolute truth.
 */

import type { MonthCommandMode } from "./month-command";
import type { TimeBasisMode } from "./time-basis";

export const ENGINE_VERSION = "0.3.2-core";
export const RULE_SET_VERSION = "bazi-core-2026-10-03-lock-rc";

/** Day pillar boundary during Rat hour. */
export type DayBoundaryMode = "midnight_00" | "zi_start_23";

/**
 * Ren (羊刃) mapping mode.
 * - ziPingYangRenOnly: only yang stems have Yang Ren (classic 子平)
 * - yinRenExtended: also map Yin Ren for yin stems (school-dependent)
 */
export type RenMode = "ziPingYangRenOnly" | "yinRenExtended";

export interface BaziConventions {
  dayBoundaryMode: DayBoundaryMode;
  /** lunar-typescript Yun minute sect (2 = minute-accurate). */
  yunSect: 1 | 2;
  renMode: RenMode;
  hiddenStemSchool: "lunar-typescript-ZHI_HIDE_GAN";
  /** Nhân nguyên tư lệnh rule-set (single default; do not mix tables). */
  monthCommandSchool: MonthCommandMode;
  /**
   * Time basis:
   * - omit → instant_consistent (DoD-B′ hybrid, default mọi TZ kể cả VN)
   * - vn_civil chỉ khi explicit Legacy override
   */
  timeBasisMode?: TimeBasisMode;
  trueSolarTimeEnabled: boolean;
}

export const DEFAULT_CONVENTIONS: BaziConventions = {
  dayBoundaryMode: "midnight_00",
  yunSect: 2,
  renMode: "ziPingYangRenOnly",
  hiddenStemSchool: "lunar-typescript-ZHI_HIDE_GAN",
  monthCommandSchool: "ziPingZhenQuan_v1",
  trueSolarTimeEnabled: false,
};

/** Map day-boundary mode → lunar-typescript EightChar.setSect value. */
export function dayBoundaryToSect(mode: DayBoundaryMode): 1 | 2 {
  return mode === "zi_start_23" ? 1 : 2;
}

export function dayBoundaryLabel(mode: DayBoundaryMode): string {
  return mode === "zi_start_23"
    ? "Quy ước Giờ Tý: Đổi ngày từ 23:00 (Giờ Tý thuộc ngày mới)"
    : "Quy ước Giờ Tý: Đổi ngày lúc 00:00 (phân Dạ Tý – Tảo Tý)";
}

/** Nhãn ngắn cho form / radio (không phán “đúng/sai”). */
export function dayBoundaryOptionLabel(mode: DayBoundaryMode): string {
  return mode === "zi_start_23"
    ? "Đổi ngày từ 23:00"
    : "Đổi ngày lúc 00:00";
}

export function dayBoundaryOptionHint(mode: DayBoundaryMode): string {
  return mode === "zi_start_23"
    ? "Giờ Tý thuộc ngày mới"
    : "phân Dạ Tý – Tảo Tý";
}

/** Giờ 23:00–23:59: Nhật trụ có thể đổi theo quy ước. */
export function isDayBoundarySensitiveHour(hour: number): boolean {
  return hour === 23;
}

export function resolveConventions(
  partial?: Partial<BaziConventions>,
): BaziConventions {
  return { ...DEFAULT_CONVENTIONS, ...partial };
}

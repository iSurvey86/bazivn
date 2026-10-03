/**
 * JieQi boundary helpers for Fact Graph + UI warnings.
 */

import { Solar, type Lunar } from "lunar-typescript";

export interface JieQiPoint {
  name: string;
  solar: {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    second: number;
  };
  ymdHms: string;
}

function toPoint(
  jq: { getName: () => string; getSolar: () => Solar } | null | undefined,
): JieQiPoint | null {
  if (!jq) return null;
  const s = jq.getSolar();
  return {
    name: jq.getName(),
    solar: {
      year: s.getYear(),
      month: s.getMonth(),
      day: s.getDay(),
      hour: s.getHour(),
      minute: s.getMinute(),
      second: s.getSecond(),
    },
    ymdHms: s.toYmdHms(),
  };
}

export function collectJieQi(lunar: Lunar): {
  prevJie: JieQiPoint | null;
  currentJieQi: JieQiPoint | null;
  nextJie: JieQiPoint | null;
  prevQi: JieQiPoint | null;
  nextQi: JieQiPoint | null;
} {
  return {
    prevJie: toPoint(lunar.getPrevJie()),
    currentJieQi: toPoint(lunar.getCurrentJieQi()),
    nextJie: toPoint(lunar.getNextJie()),
    prevQi: toPoint(lunar.getPrevQi()),
    nextQi: toPoint(lunar.getNextQi()),
  };
}

/** Minutes from birth solar to a JieQi solar point (signed). */
export function minutesToPoint(
  birth: Solar,
  point: JieQiPoint | null,
): number | null {
  if (!point) return null;
  const p = Solar.fromYmdHms(
    point.solar.year,
    point.solar.month,
    point.solar.day,
    point.solar.hour,
    point.solar.minute,
    point.solar.second,
  );
  return p.subtractMinute(birth);
}

export function isNearBoundaryMinutes(
  minutes: number | null,
  windowMinutes = 120,
): boolean {
  if (minutes === null) return false;
  return Math.abs(minutes) <= windowMinutes;
}

export interface BoundaryFlags {
  /**
   * Tight window (±10′) around 23:00 and 00:00 — day-boundary sensitive.
   * Not the legacy “cả giờ Tý rộng”.
   */
  nearZiBoundary: boolean;
  /**
   * Wide late-rat / early-rat civil window 22:00–00:59 for UI hints only
   * (Dạ Tý product messaging). Does NOT feed timezoneSensitive.
   */
  nearZiWindowWide: boolean;
  nearHourBoundary: boolean;
  nearJieBoundary: boolean;
  nearLiChunBoundary: boolean;
  timezoneSensitive: boolean;
}

/** Circular minute distance on a 24h clock (0..1439). */
export function circularMinuteDistance(a: number, b: number): number {
  const diff = Math.abs(a - b) % 1440;
  return Math.min(diff, 1440 - diff);
}

export function computeBoundaryFlags(params: {
  hour: number;
  minute: number;
  minutesToPrevJie: number | null;
  minutesToNextJie: number | null;
  minutesToLiChun: number | null;
  /** @deprecated Ignored — sensitivity is boundary-distance based. */
  timezone?: string;
}): BoundaryFlags {
  const { hour, minute } = params;
  const minuteOfDay = hour * 60 + minute;

  // Legacy wide window — UI / late-rat messaging only.
  const nearZiWindowWide =
    (hour === 22 && minute >= 0) ||
    hour === 23 ||
    (hour === 0 && minute <= 59);

  // Tight Zi / midnight day-boundary (±10′ around 23:00 and 00:00).
  const nearZiBoundary =
    circularMinuteDistance(minuteOfDay, 23 * 60) <= 10 ||
    circularMinuteDistance(minuteOfDay, 0) <= 10;

  // Earthly-branch hour starts: 23,1,3,...,21
  const hourBoundaries = [23, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21].map(
    (h) => h * 60,
  );
  const nearHour = hourBoundaries.some(
    (b) => circularMinuteDistance(minuteOfDay, b) <= 5,
  );

  const nearJie =
    isNearBoundaryMinutes(params.minutesToPrevJie) ||
    isNearBoundaryMinutes(params.minutesToNextJie);

  const nearLiChun = isNearBoundaryMinutes(params.minutesToLiChun);

  return {
    nearZiBoundary,
    nearZiWindowWide,
    nearHourBoundary: nearHour,
    nearJieBoundary: nearJie,
    nearLiChunBoundary: nearLiChun,
    timezoneSensitive: nearJie || nearLiChun || nearHour || nearZiBoundary,
  };
}

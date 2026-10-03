/**
 * Time basis adapter — separates birth civil clock from library term clock.
 *
 * lunar-typescript / 6tail Solar is timezone-naive: YmdHms is a civil wall clock
 * used for ephemeris-style JieQi & Yun math (ecosystem convention ≈ Beijing civil).
 *
 * Default product: DoD-B′ instant_consistent (hybrid) for all timezones including VN.
 * Legacy (vn_civil): birth civil numbers fed to the library as-is — compatibility only.
 */

export type TimeBasisMode = "vn_civil" | "instant_consistent";

/** Documented library term zone for instant_consistent projection (IANA, not hard-coded offset). */
export const LIBRARY_TERM_TIMEZONE = "Asia/Shanghai";

export interface CivilDateTime {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

export interface TimeBasis {
  mode: TimeBasisMode;
  birthTimezone: string;
  localCivil: CivilDateTime;
  /** Absolute instant (UTC ISO). */
  birthAbsoluteIso: string;
  /** Civil components passed into Solar.fromYmdHms. */
  libraryTermClock: CivilDateTime;
  libraryTermTimezone: string;
  note: string;
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function formatCivil(c: CivilDateTime): string {
  return `${c.year}-${pad(c.month)}-${pad(c.day)} ${pad(c.hour)}:${pad(c.minute)}:${pad(c.second)}`;
}

/** Resolve IANA offset (ms) at a UTC instant — DST/history via Intl. */
export function getTimeZoneOffsetMs(utc: Date, timeZone: string): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });
  const parts = dtf.formatToParts(utc);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((p) => p.type === type)?.value);
  // Construct "as if" UTC from zoned parts, then compare to real UTC.
  const asUtc = Date.UTC(
    get("year"),
    get("month") - 1,
    get("day"),
    get("hour"),
    get("minute"),
    get("second"),
  );
  return asUtc - utc.getTime();
}

/** Civil local in `timeZone` → UTC Date (absolute instant). */
export function civilToUtc(civil: CivilDateTime, timeZone: string): Date {
  // Guess: treat civil as UTC, then correct by zone offset at that guess; iterate once.
  let utc = new Date(
    Date.UTC(
      civil.year,
      civil.month - 1,
      civil.day,
      civil.hour,
      civil.minute,
      civil.second,
    ),
  );
  const offset = getTimeZoneOffsetMs(utc, timeZone);
  utc = new Date(utc.getTime() - offset);
  // Second pass for DST boundaries
  const offset2 = getTimeZoneOffsetMs(utc, timeZone);
  if (offset2 !== offset) {
    utc = new Date(
      Date.UTC(
        civil.year,
        civil.month - 1,
        civil.day,
        civil.hour,
        civil.minute,
        civil.second,
      ) - offset2,
    );
  }
  return utc;
}

/** Absolute UTC → civil components in `timeZone`. */
export function utcToCivil(utc: Date, timeZone: string): CivilDateTime {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hourCycle: "h23",
  });
  const parts = dtf.formatToParts(utc);
  const get = (type: Intl.DateTimeFormatPartTypes) => {
    const v = parts.find((p) => p.type === type)?.value;
    if (v === undefined) throw new Error(`Cannot resolve ${type} in ${timeZone}`);
    return Number(v);
  };
  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),
    hour: get("hour") % 24,
    minute: get("minute"),
    second: get("second"),
  };
}

/**
 * Convert a library-clock civil datetime (e.g. Yun start from lunar-typescript)
 * into birth-timezone civil for display.
 */
export function libraryCivilToBirthCivil(
  libraryCivil: CivilDateTime,
  libraryTermTimezone: string,
  birthTimezone: string,
): CivilDateTime {
  if (libraryTermTimezone === birthTimezone) return { ...libraryCivil };
  const utc = civilToUtc(libraryCivil, libraryTermTimezone);
  return utcToCivil(utc, birthTimezone);
}

export function resolveTimeBasisMode(
  _birthTimezone: string,
  explicit?: TimeBasisMode,
): TimeBasisMode {
  if (explicit) return explicit;
  // Product default: Hybrid instant_consistent (VN included).
  // vn_civil chỉ khi caller truyền explicit Legacy override.
  return "instant_consistent";
}

export function resolveTimeBasis(params: {
  localCivil: CivilDateTime;
  birthTimezone: string;
  mode?: TimeBasisMode;
}): TimeBasis {
  const mode = resolveTimeBasisMode(params.birthTimezone, params.mode);
  const localCivil = { ...params.localCivil };
  const birthAbsolute = civilToUtc(localCivil, params.birthTimezone);

  if (mode === "vn_civil") {
    return {
      mode,
      birthTimezone: params.birthTimezone,
      localCivil,
      birthAbsoluteIso: birthAbsolute.toISOString(),
      libraryTermClock: { ...localCivil },
      libraryTermTimezone: params.birthTimezone,
      note:
        "vn_civil = LEGACY compatibility mode (lunar-typescript TZ-naive / ≈6tail GMT+8). NOT astronomical vô khuyết. Explicit override only — not product default.",
    };
  }

  const libraryTermClock = utcToCivil(birthAbsolute, LIBRARY_TERM_TIMEZONE);
  return {
    mode,
    birthTimezone: params.birthTimezone,
    localCivil,
    birthAbsoluteIso: birthAbsolute.toISOString(),
    libraryTermClock,
    libraryTermTimezone: LIBRARY_TERM_TIMEZONE,
    note:
      "instant_consistent (DoD-B′ hybrid): libraryTermClock = Asia/Shanghai civil of birth absolute — used for Year/Month/Jie/Yun. Day/Hour still from localCivil + Dạ Tý (see calculateBaZi).",
  };
}

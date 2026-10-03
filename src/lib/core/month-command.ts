/**
 * 人元司令 (Nhân nguyên tư lệnh) — which hidden stem commands the month
 * based on days elapsed since the month Jie (节).
 *
 * Default rule-set: ziPingZhenQuan_v1 (single curated table — not a mix of schools).
 */

export type MonthCommandMode = "ziPingZhenQuan_v1";

export type MonthCommandPhase = {
  stem: string;
  days: number;
  label: string;
};

export interface MonthCommandRuleSet {
  mode: MonthCommandMode;
  sourceId: string;
  sourceTitle: string;
  tableVersion: string;
  method: "days_elapsed_from_month_jie";
  schedule: Record<string, MonthCommandPhase[]>;
}

/**
 * Schedule body for ziPingZhenQuan_v1.
 * Classical day-split after Jie (not fixed 60/30/10 force weights).
 * Curated single table — do not merge alternate school day-counts into this mode.
 */
const SCHEDULE_ZI_PING_ZHEN_QUAN_V1: Record<string, MonthCommandPhase[]> = {
  寅: [
    { stem: "戊", days: 7, label: "Mậu Thổ tư lệnh" },
    { stem: "丙", days: 7, label: "Bính Hỏa tư lệnh" },
    { stem: "甲", days: 16, label: "Giáp Mộc tư lệnh" },
  ],
  卯: [
    { stem: "甲", days: 10, label: "Giáp Mộc tư lệnh" },
    { stem: "乙", days: 20, label: "Ất Mộc tư lệnh" },
  ],
  辰: [
    { stem: "乙", days: 9, label: "Ất Mộc tư lệnh" },
    { stem: "癸", days: 3, label: "Quý Thủy tư lệnh" },
    { stem: "戊", days: 18, label: "Mậu Thổ tư lệnh" },
  ],
  巳: [
    { stem: "戊", days: 5, label: "Mậu Thổ tư lệnh" },
    { stem: "庚", days: 9, label: "Canh Kim tư lệnh" },
    { stem: "丙", days: 16, label: "Bính Hỏa tư lệnh" },
  ],
  午: [
    { stem: "丙", days: 10, label: "Bính Hỏa tư lệnh" },
    { stem: "己", days: 9, label: "Kỷ Thổ tư lệnh" },
    { stem: "丁", days: 11, label: "Đinh Hỏa tư lệnh" },
  ],
  未: [
    { stem: "丁", days: 9, label: "Đinh Hỏa tư lệnh" },
    { stem: "乙", days: 3, label: "Ất Mộc tư lệnh" },
    { stem: "己", days: 18, label: "Kỷ Thổ tư lệnh" },
  ],
  申: [
    { stem: "戊", days: 7, label: "Mậu Thổ tư lệnh" },
    { stem: "壬", days: 7, label: "Nhâm Thủy tư lệnh" },
    { stem: "庚", days: 16, label: "Canh Kim tư lệnh" },
  ],
  酉: [
    { stem: "庚", days: 10, label: "Canh Kim tư lệnh" },
    { stem: "辛", days: 20, label: "Tân Kim tư lệnh" },
  ],
  戌: [
    { stem: "辛", days: 9, label: "Tân Kim tư lệnh" },
    { stem: "丁", days: 3, label: "Đinh Hỏa tư lệnh" },
    { stem: "戊", days: 18, label: "Mậu Thổ tư lệnh" },
  ],
  亥: [
    { stem: "戊", days: 7, label: "Mậu Thổ tư lệnh" },
    { stem: "甲", days: 7, label: "Giáp Mộc tư lệnh" },
    { stem: "壬", days: 16, label: "Nhâm Thủy tư lệnh" },
  ],
  子: [
    { stem: "壬", days: 10, label: "Nhâm Thủy tư lệnh" },
    { stem: "癸", days: 20, label: "Quý Thủy tư lệnh" },
  ],
  丑: [
    { stem: "癸", days: 9, label: "Quý Thủy tư lệnh" },
    { stem: "辛", days: 3, label: "Tân Kim tư lệnh" },
    { stem: "己", days: 18, label: "Kỷ Thổ tư lệnh" },
  ],
};

export const MONTH_COMMAND_RULESETS: Record<
  MonthCommandMode,
  MonthCommandRuleSet
> = {
  ziPingZhenQuan_v1: {
    mode: "ziPingZhenQuan_v1",
    sourceId: "monthCommand.ziPingZhenQuan.v1",
    sourceTitle:
      "人元司令时段表 · 子平真诠系统 (沈孝瞻《子平真诠》人元司令传统表 — BaziVN curated single table ziPingZhenQuan_v1; không pha bảng phái khác)",
    tableVersion: "1.0.0",
    method: "days_elapsed_from_month_jie",
    schedule: SCHEDULE_ZI_PING_ZHEN_QUAN_V1,
  },
};

export const DEFAULT_MONTH_COMMAND_MODE: MonthCommandMode = "ziPingZhenQuan_v1";

/** @deprecated Use MONTH_COMMAND_RULESETS[mode].schedule */
export const REN_YUAN_SI_LING_V1 = SCHEDULE_ZI_PING_ZHEN_QUAN_V1;

export const MONTH_COMMAND_SOURCE =
  MONTH_COMMAND_RULESETS.ziPingZhenQuan_v1.sourceId;

export interface MonthCommandResult {
  branch: string;
  daysFromJie: number | null;
  commandingStem: string | null;
  phase: string;
  phaseIndex: number | null;
  mode: MonthCommandMode;
  ruleSet: string;
  sourceId: string;
  sourceTitle: string;
  tableVersion: string;
  method: "days_elapsed_from_month_jie";
  schedule: MonthCommandPhase[];
  note: string;
}

/**
 * @param minutesFromPrevJie elapsed minutes since the month Jie (节), ≥ 0.
 *   Pass `birth − prevJie` in minutes on the same clock — not `prevJie − birth`.
 */
export function computeMonthCommand(params: {
  monthBranch: string;
  minutesFromPrevJie: number | null;
  mode?: MonthCommandMode;
}): MonthCommandResult {
  const mode = params.mode ?? DEFAULT_MONTH_COMMAND_MODE;
  const rule = MONTH_COMMAND_RULESETS[mode];
  const schedule = rule.schedule[params.monthBranch] ?? [];
  const daysFromJie =
    params.minutesFromPrevJie === null
      ? null
      : Math.max(0, params.minutesFromPrevJie / 1440);

  const baseMeta = {
    mode: rule.mode,
    ruleSet: rule.sourceId,
    sourceId: rule.sourceId,
    sourceTitle: rule.sourceTitle,
    tableVersion: rule.tableVersion,
    method: rule.method,
    schedule,
  } as const;

  if (daysFromJie === null || schedule.length === 0) {
    return {
      branch: params.monthBranch,
      daysFromJie,
      commandingStem: null,
      phase: "unknown",
      phaseIndex: null,
      ...baseMeta,
      note: "Thiếu khoảng cách tới Jie hoặc không có lịch tư lệnh cho tháng chi.",
    };
  }

  let cursor = 0;
  for (let i = 0; i < schedule.length; i++) {
    const phase = schedule[i]!;
    const end = cursor + phase.days;
    if (daysFromJie < end || i === schedule.length - 1) {
      return {
        branch: params.monthBranch,
        daysFromJie: Math.round(daysFromJie * 100) / 100,
        commandingStem: phase.stem,
        phase: phase.label,
        phaseIndex: i,
        ...baseMeta,
        note: `Sau giao Jie ~${daysFromJie.toFixed(2)} ngày → ${phase.label}.`,
      };
    }
    cursor = end;
  }

  const last = schedule[schedule.length - 1]!;
  return {
    branch: params.monthBranch,
    daysFromJie: Math.round(daysFromJie * 100) / 100,
    commandingStem: last.stem,
    phase: last.label,
    phaseIndex: schedule.length - 1,
    ...baseMeta,
    note: `Cuối tháng tiết → ${last.label}.`,
  };
}

/**
 * Fact Graph JSON for Core Calculator → LLM / Reasoning.
 * No useful-god / good-bad directions in this layer.
 */

import type { BoundaryFlags, JieQiPoint } from "./jieqi-boundaries";
import type { BaziConventions } from "./conventions";
import type { DayMasterQiStates } from "./daymaster-qi";
import type { HiddenStemRole } from "./hidden-stems";
import type { MonthCommandResult } from "./month-command";
import type { StemBranchRelation } from "./relations";
import type { TimeBasis } from "./time-basis";
import type { ShenShaItem } from "../bazi-shen-sha";

export interface FactSolarDateTime {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  ymdHms?: string;
}

export interface FactPillar {
  ganZhi: string;
  gan: string;
  zhi: string;
  tenGodGan: string;
  hideGan: Array<{
    gan: string;
    role: HiddenStemRole;
    tenGod: string;
  }>;
  diShi: string;
  xun: string;
  xunKong: string;
}

export interface FactDaYun {
  index: number;
  ganZhi: string;
  startYear: number;
  endYear: number;
  startAge: number;
  endAge: number;
  startSolar: FactSolarDateTime | null;
  endSolar: FactSolarDateTime | null;
  liuNian: Array<{
    calendarYear: number;
    ageXu: number;
    ganZhi: string;
    note: string;
  }>;
}

export interface BaziFacts {
  meta: {
    engineVersion: string;
    ruleSetVersion: string;
    generatedAt: string;
    lunarTypescriptNote: string;
  };
  birth: {
    localDateTime: string;
    timezone: string;
    trueSolarTimeEnabled: boolean;
    trueSolarDateTime: string | null;
    timeBasis: TimeBasis;
  };
  conventions: BaziConventions;
  boundaries: BoundaryFlags;
  pillars: {
    year: FactPillar;
    month: FactPillar;
    day: FactPillar;
    hour: FactPillar;
  };
  jieQi: {
    prevJie: JieQiPoint | null;
    currentJieQi: JieQiPoint | null;
    nextJie: JieQiPoint | null;
  };
  monthCommand: MonthCommandResult;
  dayMasterQiStates: DayMasterQiStates;
  relations: StemBranchRelation[];
  xunKong: {
    dayXunKong: string[];
    yearXunKong: string[];
    auxiliary: Array<{ pillar: string; xunKong: string }>;
  };
  yun: {
    forward: boolean;
    startSolar: FactSolarDateTime | null;
    startSolarLibrary: FactSolarDateTime | null;
    startAge: { years: number; months: number; days: number; hours?: number };
    startAgeXu: number | null;
    yunSect: 1 | 2;
    daYun: FactDaYun[];
  };
  shenSha: {
    auxiliaryOnly: ShenShaItem[];
    byPillar: {
      year: ShenShaItem[];
      month: ShenShaItem[];
      day: ShenShaItem[];
      hour: ShenShaItem[];
    };
  };
  visualization: {
    fiveElementPercent: Record<string, number>;
    warning: string;
    elementDirections: {
      byElement: Record<string, string[]>;
      warning: string;
    };
  };
  reasoning: {
    usefulGod: null;
    directionsGoodBad: null;
    status: "not_run";
    note: string;
  };
}

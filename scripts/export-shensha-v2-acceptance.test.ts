/**
 * Export Shen Sha Catalog v2.0 acceptance artifact (JSON).
 * Run: npx vitest run --config scripts/vitest.acceptance.config.ts scripts/export-shensha-v2-acceptance.test.ts
 * Or: npx vite-node --config vitest.config.ts scripts/export-shensha-v2-acceptance.ts
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { calculateBaZi } from "@/lib/astrology-engine";
import { ENGINE_VERSION } from "@/lib/core/conventions";
import {
  buildShenShaCatalogJson,
  SHEN_SHA_CATALOG_VERSION,
} from "@/lib/shen-sha";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const outDir = join(root, "public", "bcao");

function casePack(
  label: string,
  chart: ReturnType<typeof calculateBaZi>,
) {
  return {
    label,
    engineVersion: chart.meta.engineVersion,
    shenShaCatalogVersion: chart.shenShaCatalogVersion,
    dayBoundaryMode: chart.conventions.dayBoundaryMode,
    pillars: {
      year: chart.pillars.year.ganZhi,
      month: chart.pillars.month.ganZhi,
      day: chart.pillars.day.ganZhi,
      hour: chart.pillars.hour.ganZhi,
    },
    shenShaByPillar: {
      year: chart.pillars.year.shenSha,
      month: chart.pillars.month.shenSha,
      day: chart.pillars.day.shenSha,
      hour: chart.pillars.hour.shenSha,
    },
    shenShaSummary: chart.shenSha,
    specialDayMarkers: chart.specialDayMarkers,
    dayMasterQiStates: chart.dayMasterQiStates,
    xunKong: {
      day: chart.pillars.day.xunKong,
      year: chart.pillars.year.xunKong,
    },
    usefulGod: chart.usefulGod,
    directions: chart.directions,
  };
}

describe("export Shen Sha v2 acceptance", () => {
  it("writes catalog JSON + 3-case acceptance pack", () => {
    const catalog = buildShenShaCatalogJson();
    mkdirSync(outDir, { recursive: true });
    const catalogPath = join(outDir, "BAZIVN-shensha-catalog-v2.json");
    writeFileSync(catalogPath, JSON.stringify(catalog, null, 2), "utf8");

    const caseA = casePack(
      "Case A — nam 12/11/1986 17:45 HCM",
      calculateBaZi({
        timezone: "Asia/Ho_Chi_Minh",
        gender: "male",
        local: {
          year: 1986,
          month: 11,
          day: 12,
          hour: 17,
          minute: 45,
          second: 0,
        },
      }),
    );

    const caseBMid = casePack(
      "Case B — nữ 05/05/2026 23:46 midnight_00",
      calculateBaZi({
        timezone: "Asia/Ho_Chi_Minh",
        gender: "female",
        local: {
          year: 2026,
          month: 5,
          day: 5,
          hour: 23,
          minute: 46,
          second: 0,
        },
        conventions: { dayBoundaryMode: "midnight_00" },
      }),
    );

    const caseBZi = casePack(
      "Case B — nữ 05/05/2026 23:46 zi_start_23",
      calculateBaZi({
        timezone: "Asia/Ho_Chi_Minh",
        gender: "female",
        local: {
          year: 2026,
          month: 5,
          day: 5,
          hour: 23,
          minute: 46,
          second: 0,
        },
        conventions: { dayBoundaryMode: "zi_start_23" },
      }),
    );

    const pack = {
      exportedAt: new Date().toISOString(),
      purpose: "Acceptance Shen Sha Catalog v2.0 (auxiliary) — Core calculator unchanged",
      engineVersion: ENGINE_VERSION,
      shenShaCatalogVersion: SHEN_SHA_CATALOG_VERSION,
      changelog: {
        from: "13 legacy natal entities",
        to: "20 catalog groups (13 legacy + 7 new) + 4 specialDayMarkers = 24",
        newGroups: [
          "Thiên Đức",
          "Nguyệt Đức",
          "Học Đường",
          "Từ Quán",
          "Kim Dư",
          "Nguyên Thần",
          "Thiên La / Địa Võng",
        ],
        specialDayMarkers: [
          "Khôi Cương",
          "Âm Dương Sai Thác",
          "Tứ Phế",
          "Thập Ác Đại Bại",
        ],
        notInDefault: [
          "Hồng Diễm",
          "Bạch Hổ riêng",
          "Thiên Y",
          "Quốc Ấn",
          "Phúc Tinh Quý Nhân",
          "Thái Cực Quý Nhân",
          "Thiên Trù",
          "Lục Ách",
          "Câu Giảo",
          "Tang Môn",
          "Điếu Khách",
        ],
      },
      caseA,
      caseBMidnight00: caseBMid,
      caseBZiStart23: caseBZi,
    };

    const packPath = join(outDir, "BAZIVN-shensha-v2-acceptance.json");
    writeFileSync(packPath, JSON.stringify(pack, null, 2), "utf8");

    // eslint-disable-next-line no-console
    console.log("Wrote", catalogPath);
    // eslint-disable-next-line no-console
    console.log("Wrote", packPath);

    expect(caseA.usefulGod).toBeNull();
    expect(caseBMid.usefulGod).toBeNull();
    expect(caseBZi.directions).toBeNull();
    expect(caseA.shenShaCatalogVersion).toBe("2.0.0");
    expect(catalog.totalGroups).toBe(24);
    expect(caseBMid.pillars.day).not.toBe(caseBZi.pillars.day);
  });
});

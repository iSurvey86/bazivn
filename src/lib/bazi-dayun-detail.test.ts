import { describe, expect, it } from "vitest";
import { calculateBaZi } from "@/lib/astrology-engine";
import { pillarFromGanZhi } from "@/lib/bazi-pillar-from-ganzhi";
import { ensureDaYunDetail } from "@/lib/bazi-dayun-detail";

describe("Đại vận TenGodCan / TenGodChiMain", () => {
  it("TenGodChiMain uses Bản khí only (辰 → 戊)", () => {
    // Nhật chủ 庚, ĐV 壬辰
    const p = pillarFromGanZhi("壬辰", "庚");
    expect(p.tenGodGanVi).toBe("Thực Thần");
    const ban = p.hideGan.find((h) => h.role === "ban");
    expect(ban?.gan).toBe("戊");
    expect(ban?.tenGodVi).toBe("Thiên Ấn");
    expect(p.hideGan.some((h) => h.role === "trung")).toBe(true);
  });

  it("chart daYun exposes export fields", () => {
    const chart = calculateBaZi({
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
    });
    expect(chart.yun.daYun.length).toBeGreaterThan(0);
    for (const raw of chart.yun.daYun) {
      const d = ensureDaYunDetail(raw, chart.dayMaster);
      expect(d.gan).toHaveLength(1);
      expect(d.zhi).toHaveLength(1);
      expect(d.tenGodGanVi).toBeTruthy();
      expect(d.tenGodChiMainVi).toBeTruthy();
      expect(d.hideGan.some((h) => h.role === "ban")).toBe(true);
      const ban = d.hideGan.find((h) => h.role === "ban")!;
      expect(d.tenGodChiMainVi).toBe(ban.tenGodVi);
    }
  });
});

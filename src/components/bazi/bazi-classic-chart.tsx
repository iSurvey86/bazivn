"use client";

import { forwardRef, type ReactNode } from "react";
import type { BaZiChartResult } from "@/lib/astrology-engine";
import type { ShenShaItem } from "@/lib/bazi-shen-sha";
import {
  branchClassicLabel,
  branchElement,
  formatTimezoneLabel,
  stemClassicLabel,
  stemElement,
  tenGodAbbrVi,
} from "@/lib/bazi-terminology";
import {
  ELEMENT_THEME,
  elementTheme,
  PILLAR_ORDER,
  type PillarKey,
} from "@/lib/bazi-theme";

import { BaziCloudDecor } from "./bazi-chart-decor";

const SHEN_SHA_TEXT = { cat: "#2d5a40", hung: "#a83828" } as const;

const C = {
  border: "#d4cdc3",
  labelBg: "#ebe6de",
  headerBg: "#e2ebe6",
  sectionBg: "#f0ebe4",
  surface: "#fffcf8",
  highlight: "#f3e8d4",
  footerBg: "#f5f1ea",
  muted: "#5c534a",
  titleAccent: "#9a3412",
  downloadBg: "#9a3412",
  downloadHover: "#7c2d12",
} as const;

const PILLAR_HEADERS: Record<PillarKey, string> = {
  year: "NĂM",
  month: "THÁNG",
  day: "NGÀY",
  hour: "GIỜ",
};

const YUAN_JU_LABELS = [
  { key: "nien" as const, label: "Niên thần" },
  { key: "nguyet" as const, label: "Nguyệt thần" },
  { key: "nhat" as const, label: "Nhật thần" },
  { key: "thoi" as const, label: "Thời thần" },
];

type BaziClassicChartProps = {
  chart: BaZiChartResult;
  fullName?: string | null;
  birthPlace?: string | null;
  referenceYear: number;
  yearOptions: number[];
  onReferenceYearChange: (year: number) => void;
  onDownload: () => void;
  exporting?: boolean;
};

function Cell({
  children,
  className = "",
  highlight = false,
}: {
  children: ReactNode;
  className?: string;
  highlight?: boolean;
}) {
  return (
    <td
      className={`border px-3 py-1.5 text-center align-middle text-sm text-[#0a0a0a] ${className}`}
      style={{
        borderColor: C.border,
        backgroundColor: highlight ? C.highlight : C.surface,
      }}
    >
      {children}
    </td>
  );
}

function LabelCell({ children }: { children: ReactNode }) {
  return (
    <th
      className="bazi-label-col w-28 border px-3 py-1.5 text-left text-xs font-medium uppercase text-[#0a0a0a]"
      style={{ borderColor: C.border, backgroundColor: C.labelBg }}
    >
      {children}
    </th>
  );
}

function ColoredChar({
  text,
  element,
  size = "lg",
}: {
  text: string;
  element: string;
  size?: "lg" | "sm";
}) {
  const color = elementTheme(element).color;
  return (
    <span
      className={`bazi-pillar-char inline-block leading-tight ${size === "lg" ? "text-xl" : "text-sm"}`}
      style={{ color }}
    >
      {text}
    </span>
  );
}

function ShenShaText({ stars }: { stars: ShenShaItem[] }) {
  if (stars.length === 0) return <span className="text-[#999]">—</span>;
  return (
    <div className="inline-flex flex-col items-center gap-0.5">
      {stars.map((s) => (
        <span
          key={s.key}
          className="text-xs"
          style={{ color: SHEN_SHA_TEXT[s.type] }}
        >
          {s.name}
        </span>
      ))}
    </div>
  );
}

function solarCellText(chart: BaZiChartResult, key: PillarKey) {
  const { solar } = chart;
  if (key === "year") return String(solar.year);
  if (key === "month") return String(solar.month);
  if (key === "day") return String(solar.day);
  return `${solar.hour}:${String(solar.minute).padStart(2, "0")}`;
}

function khoiVanText(chart: BaZiChartResult) {
  const d = chart.yun.startSolarDate;
  if (d) {
    return `${d.day}/${d.month}/${d.year}`;
  }
  return String(chart.yun.startSolarYear);
}

export const BaziClassicChart = forwardRef<HTMLDivElement, BaziClassicChartProps>(
  function BaziClassicChart(
    {
      chart,
      fullName,
      birthPlace,
      referenceYear,
      yearOptions,
      onReferenceYearChange,
      onDownload,
      exporting = false,
    },
    ref,
  ) {
    const activeDaYun = chart.yun.daYun.find(
      (p) => referenceYear >= p.startYear && referenceYear <= p.endYear,
    );
    const liuNianYears = activeDaYun?.liuNian ?? chart.yun.daYun[0]?.liuNian ?? [];
    const row1 = liuNianYears.slice(0, 10);
    const row2 = liuNianYears.slice(10, 20);
    const refLiuNian = liuNianYears.find((ln) => ln.year === referenceYear);
    const yuanJu = chart.shenShaYuanJu ?? {
      nien: chart.pillars.year.shenSha ?? [],
      nguyet: chart.pillars.month.shenSha ?? [],
      nhat: chart.pillars.day.shenSha ?? [],
      thoi: chart.pillars.hour.shenSha ?? [],
    };
    const tzLabel = formatTimezoneLabel(chart.timezone);

    return (
      <div
        ref={ref}
        className="bazi-chart-crisp bazi-chart-export overflow-hidden border text-[#0a0a0a]"
        style={{ borderColor: C.border, backgroundColor: C.surface }}
      >
        <div
          className="relative border-b px-4 py-4"
          style={{ borderColor: C.border, backgroundColor: "#faf8f4" }}
        >
          <BaziCloudDecor />
          <div className="relative flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs tracking-widest" style={{ color: C.muted }}>
                BaziVN
              </p>
              <h1 className="text-xl font-medium tracking-tight">
                BẢN ĐỒ{" "}
                <span style={{ color: C.titleAccent }}>BÁT TỰ</span>
              </h1>
              <div className="mt-2 flex items-center gap-2">
                <label
                  htmlFor="chart-reference-year"
                  className="text-xs font-medium"
                  style={{ color: C.muted }}
                >
                  Năm tính:
                </label>
                <select
                  id="chart-reference-year"
                  value={referenceYear}
                  onChange={(e) => onReferenceYearChange(Number(e.target.value))}
                  className="rounded border px-2 py-0.5 text-xs outline-none focus:ring-1"
                  style={{
                    borderColor: C.border,
                    backgroundColor: C.surface,
                    color: "#0a0a0a",
                  }}
                >
                  {yearOptions.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <dl className="space-y-0.5 text-sm">
              <div className="flex gap-2">
                <dt style={{ color: C.muted }}>Họ tên:</dt>
                <dd>{fullName?.trim() || "—"}</dd>
              </div>
              {birthPlace?.trim() ? (
                <div className="flex gap-2">
                  <dt style={{ color: C.muted }}>Nơi sinh:</dt>
                  <dd>{birthPlace.trim()}</dd>
                </div>
              ) : null}
              <div className="flex gap-2">
                <dt style={{ color: C.muted }}>Giới tính:</dt>
                <dd>{chart.genderLabel}</dd>
              </div>
              <div className="flex gap-2">
                <dt style={{ color: C.muted }}>Dương lịch:</dt>
                <dd>
                  {chart.solar.day}/{chart.solar.month}/{chart.solar.year}{" "}
                  {String(chart.solar.hour).padStart(2, "0")}:
                  {String(chart.solar.minute).padStart(2, "0")}{" "}
                  <span className="text-xs" style={{ color: C.muted }}>
                    ({tzLabel})
                  </span>
                </dd>
              </div>
              <div className="flex gap-2">
                <dt style={{ color: C.muted }}>Âm lịch:</dt>
                <dd>
                  {chart.lunar.day}/{chart.lunar.month}/{chart.lunar.year}
                </dd>
              </div>
              {chart.currentSolarTermVi ? (
                <div className="flex gap-2">
                  <dt style={{ color: C.muted }}>Tiết khí:</dt>
                  <dd>
                    {chart.currentSolarTermVi}
                    {chart.monthCommandVi ? (
                      <span className="text-xs" style={{ color: C.muted }}>
                        {" "}
                        · nguyệt lệnh {chart.monthCommandVi}
                      </span>
                    ) : null}
                  </dd>
                </div>
              ) : null}
              <div className="flex gap-2">
                <dt style={{ color: C.muted }}>Khởi vận:</dt>
                <dd>{khoiVanText(chart)}</dd>
              </div>
              {chart.isLateRatHour ? (
                <div className="flex gap-2">
                  <dt style={{ color: C.muted }}>Ghi chú:</dt>
                  <dd style={{ color: C.titleAccent }}>Giờ Dạ Tý</dd>
                </div>
              ) : null}
            </dl>
          </div>
        </div>

        <div className="bazi-scroll-x overflow-x-auto">
          <table className="w-full min-w-[600px] border-collapse text-sm text-[#111]">
            <thead>
              <tr>
                <th
                  className="border px-3 py-2 text-left"
                  style={{ borderColor: C.border, backgroundColor: C.headerBg }}
                />
                {PILLAR_ORDER.map((key) => (
                  <th
                    key={key}
                    className="border px-3 py-2 text-center text-sm font-medium uppercase text-[#0a0a0a]"
                    style={{ borderColor: C.border, backgroundColor: C.headerBg }}
                  >
                    {PILLAR_HEADERS[key]}
                    {key === "day" ? (
                      <span
                        className="bazi-day-master mt-0.5 block text-xs"
                        style={{ color: C.titleAccent }}
                      >
                        NHẬT CHỦ
                      </span>
                    ) : null}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <LabelCell>Dương lịch</LabelCell>
                {PILLAR_ORDER.map((key) => (
                  <Cell key={key}>{solarCellText(chart, key)}</Cell>
                ))}
              </tr>
              <tr>
                <LabelCell>Chủ tinh</LabelCell>
                {PILLAR_ORDER.map((key) => (
                  <Cell key={key}>{chart.pillars[key].tenGodGanVi}</Cell>
                ))}
              </tr>
              <tr>
                <LabelCell>Thiên can</LabelCell>
                {PILLAR_ORDER.map((key) => {
                  const p = chart.pillars[key];
                  return (
                    <Cell key={key}>
                      <ColoredChar
                        text={stemClassicLabel(p.gan)}
                        element={stemElement(p.gan)}
                        size="lg"
                      />
                    </Cell>
                  );
                })}
              </tr>
              <tr>
                <LabelCell>Địa chi</LabelCell>
                {PILLAR_ORDER.map((key) => {
                  const p = chart.pillars[key];
                  return (
                    <Cell key={key}>
                      <ColoredChar
                        text={branchClassicLabel(p.zhi)}
                        element={branchElement(p.zhi)}
                        size="lg"
                      />
                    </Cell>
                  );
                })}
              </tr>
              <tr>
                <LabelCell>Tàng ẩn</LabelCell>
                {PILLAR_ORDER.map((key) => {
                  const p = chart.pillars[key];
                  return (
                    <Cell key={key}>
                      {p.hideGan.length === 0 ? (
                        <span className="text-[#999]">—</span>
                      ) : (
                        <div className="inline-flex flex-col items-center gap-0.5">
                          {p.hideGan.map((h) => (
                            <ColoredChar
                              key={h.gan}
                              text={stemClassicLabel(h.gan)}
                              element={stemElement(h.gan)}
                              size="sm"
                            />
                          ))}
                        </div>
                      )}
                    </Cell>
                  );
                })}
              </tr>
              <tr>
                <LabelCell>Phó tinh</LabelCell>
                {PILLAR_ORDER.map((key) => {
                  const p = chart.pillars[key];
                  return (
                    <Cell key={key} className="text-xs">
                      {p.hideGan.length === 0 ? (
                        <span className="text-[#999]">—</span>
                      ) : (
                        <div className="inline-flex flex-col items-center gap-0.5">
                          {p.hideGan.map((h) => (
                            <span key={h.gan} style={{ color: C.muted }}>
                              {tenGodAbbrVi(h.tenGodVi)}
                            </span>
                          ))}
                        </div>
                      )}
                    </Cell>
                  );
                })}
              </tr>
              <tr>
                <LabelCell>Trường sinh</LabelCell>
                {PILLAR_ORDER.map((key) => (
                  <Cell key={key}>{chart.pillars[key].diShiVi}</Cell>
                ))}
              </tr>
              <tr>
                <LabelCell>Nạp âm</LabelCell>
                {PILLAR_ORDER.map((key) => (
                  <Cell key={key} className="text-xs">
                    {chart.pillars[key].naYinVi}
                  </Cell>
                ))}
              </tr>
              <tr>
                <LabelCell>Tuần / Không</LabelCell>
                {PILLAR_ORDER.map((key) => (
                  <Cell key={key} className="text-xs">
                    {chart.pillars[key].xunVi} · {chart.pillars[key].xunKongVi}
                  </Cell>
                ))}
              </tr>
              <tr>
                <LabelCell>Thần sát</LabelCell>
                {PILLAR_ORDER.map((key) => (
                  <Cell key={key}>
                    <ShenShaText stars={chart.pillars[key].shenSha ?? []} />
                  </Cell>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Thần sát nguyên cục */}
        <div className="border-t" style={{ borderColor: C.border }}>
          <div
            className="px-3 py-1.5 text-left text-xs font-medium uppercase tracking-wide"
            style={{ backgroundColor: C.headerBg }}
          >
            Thần sát nguyên cục
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4">
            {YUAN_JU_LABELS.map(({ key, label }) => (
              <div
                key={key}
                className="border-r border-t px-3 py-2 last:border-r-0"
                style={{ borderColor: C.border, backgroundColor: C.surface }}
              >
                <p className="text-xs font-medium" style={{ color: C.muted }}>
                  {label}
                </p>
                <div className="mt-1 text-xs">
                  <ShenShaText stars={yuanJu[key]} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Đại vận */}
        <div className="border-t" style={{ borderColor: C.border }}>
          <div
            className="px-3 py-1.5 text-left text-xs font-medium uppercase tracking-wide"
            style={{ backgroundColor: C.headerBg }}
          >
            Đại Vận
            <span className="ml-2 font-normal normal-case" style={{ color: C.muted }}>
              ({chart.yun.isForward ? "thuận" : "nghịch"} · khởi {khoiVanText(chart)})
            </span>
          </div>
          <div className="bazi-scroll-x overflow-x-auto">
            <div className="flex min-w-max">
              {chart.yun.daYun.map((period) => {
                const active =
                  referenceYear >= period.startYear &&
                  referenceYear <= period.endYear;
                const stemEl = stemElement(period.ganZhi[0] ?? "");
                return (
                  <div
                    key={period.index}
                    className="flex min-w-[88px] flex-col items-center border-r px-2 py-2 text-center last:border-r-0"
                    style={{
                      borderColor: C.border,
                      backgroundColor: active ? C.highlight : C.surface,
                    }}
                  >
                    {active ? (
                      <span
                        className="mb-0.5 rounded px-1 text-[10px] uppercase"
                        style={{ backgroundColor: C.titleAccent, color: "#fff" }}
                      >
                        Hiện tại
                      </span>
                    ) : (
                      <span className="mb-0.5 h-4" />
                    )}
                    <span
                      className="bazi-pillar-char text-base"
                      style={{ color: elementTheme(stemEl).color }}
                    >
                      {period.ganZhiVi}
                    </span>
                    <span className="mt-0.5 text-[10px]" style={{ color: C.muted }}>
                      {period.naYinVi ?? "—"}
                    </span>
                    <span className="text-[10px]" style={{ color: C.muted }}>
                      {period.diShiVi ?? "—"}
                    </span>
                    <span className="mt-1 text-xs" style={{ color: C.muted }}>
                      {period.startAge}–{period.endAge}t
                    </span>
                    <span className="text-xs text-[#888]">{period.startYear}</span>
                    {(period.shenSha?.length ?? 0) > 0 ? (
                      <span className="mt-1 text-[10px] leading-tight" style={{ color: SHEN_SHA_TEXT.cat }}>
                        {period.shenSha!.map((s) => s.name).join(", ")}
                      </span>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Lưu niên */}
        {activeDaYun ? (
          <div className="border-t" style={{ borderColor: C.border }}>
            <div
              className="px-3 py-1.5 text-left text-xs font-medium uppercase tracking-wide"
              style={{ backgroundColor: C.headerBg }}
            >
              Lưu Niên · Đại vận {activeDaYun.ganZhiVi}
            </div>
            {[row1, row2].filter((r) => r.length > 0).map((row, ri) => (
              <div
                key={ri}
                className="bazi-scroll-x overflow-x-auto border-t"
                style={{ borderColor: C.border }}
              >
                <div className="flex min-w-max">
                  {row.map((ln) => {
                    const stemEl = stemElement(ln.ganZhi[0] ?? "");
                    const active = ln.year === referenceYear;
                    return (
                      <div
                        key={ln.year}
                        className="flex min-w-[64px] flex-col items-center border-r px-2 py-1.5 text-center last:border-r-0"
                        style={{
                          borderColor: C.border,
                          backgroundColor: active ? C.highlight : C.surface,
                        }}
                      >
                        <span
                          className="bazi-pillar-char text-sm"
                          style={{ color: elementTheme(stemEl).color }}
                        >
                          {ln.ganZhiVi}
                        </span>
                        <span className="text-xs text-[#666]">{ln.year}</span>
                        <span className="text-xs text-[#999]">{ln.age}t</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {refLiuNian ? (
              <div
                className="border-t px-3 py-2 text-sm"
                style={{ borderColor: C.border, backgroundColor: C.highlight }}
              >
                <p className="text-xs font-medium" style={{ color: C.titleAccent }}>
                  Lưu niên {referenceYear} · {refLiuNian.ganZhiVi} · {refLiuNian.age} tuổi
                </p>
                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs" style={{ color: C.muted }}>
                  <span>Nạp âm: {refLiuNian.naYinVi ?? "—"}</span>
                  <span>Trường sinh: {refLiuNian.diShiVi ?? "—"}</span>
                  <span>Tàng can: {refLiuNian.hideGanVi ?? "—"}</span>
                  {(refLiuNian.shenSha?.length ?? 0) > 0 ? (
                    <span>
                      Thần sát:{" "}
                      {refLiuNian.shenSha!.map((s) => s.name).join(", ")}
                    </span>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        {/* Dụng thần + Hướng */}
        {chart.usefulGod ? (
          <div
            className="grid border-t sm:grid-cols-2"
            style={{ borderColor: C.border }}
          >
            <div className="border-b sm:border-b-0 sm:border-r" style={{ borderColor: C.border }}>
              <div
                className="px-3 py-1.5 text-left text-xs font-medium uppercase"
                style={{ backgroundColor: C.headerBg }}
              >
                Dụng thần
              </div>
              <div className="px-4 py-3 text-sm" style={{ backgroundColor: C.surface }}>
                <p
                  className="text-lg"
                  style={{ color: elementTheme(chart.usefulGod.element).color }}
                >
                  {chart.usefulGod.label}
                </p>
                <p className="mt-1 text-xs" style={{ color: C.muted }}>
                  {chart.usefulGod.reason}
                </p>
              </div>
            </div>
            <div>
              <div
                className="px-3 py-1.5 text-left text-xs font-medium uppercase"
                style={{ backgroundColor: C.headerBg }}
              >
                Hướng tốt / Hướng xấu
              </div>
              <div className="px-4 py-3 text-sm" style={{ backgroundColor: C.surface }}>
                <p className="text-xs">
                  <span style={{ color: SHEN_SHA_TEXT.cat }}>Tốt: </span>
                  {chart.directions?.good?.join(" · ") || "—"}
                </p>
                <p className="mt-1 text-xs">
                  <span style={{ color: SHEN_SHA_TEXT.hung }}>Xấu: </span>
                  {chart.directions?.bad?.join(" · ") || "—"}
                </p>
              </div>
            </div>
          </div>
        ) : null}

        {/* Cung vị + Ngũ hành */}
        <div className="grid border-t sm:grid-cols-2" style={{ borderColor: C.border }}>
          <div className="border-b sm:border-b-0 sm:border-r" style={{ borderColor: C.border }}>
            <div
              className="px-3 py-1.5 text-left text-xs font-medium uppercase"
              style={{ backgroundColor: C.headerBg }}
            >
              Cung vị
            </div>
            <table className="w-full border-collapse text-sm">
              <tbody>
                {(
                  [
                    ["Mệnh Cung", chart.palaces.mingGong],
                    ["Thai Nguyên", chart.palaces.taiYuan],
                    ["Thân Cung", chart.palaces.shenGong],
                  ] as const
                ).map(([label, palace]) => (
                  <tr key={label} className="border-t" style={{ borderColor: C.border }}>
                    <td
                      className="bazi-label-col w-28 border-r px-3 py-2 text-left text-xs font-medium"
                      style={{ borderColor: C.border, backgroundColor: C.labelBg }}
                    >
                      {label}
                    </td>
                    <td className="px-3 py-2 text-center">{palace.ganZhiVi}</td>
                    <td className="px-3 py-2 text-center text-xs text-[#444]">
                      {palace.naYinVi}
                    </td>
                  </tr>
                ))}
                <tr className="border-t" style={{ borderColor: C.border }}>
                  <td
                    className="bazi-label-col border-r px-3 py-2 text-left text-xs font-medium"
                    style={{ borderColor: C.border, backgroundColor: C.labelBg }}
                  >
                    Niên Không
                  </td>
                  <td colSpan={2} className="px-3 py-2 text-center text-xs">
                    {chart.nienKhongVi ?? chart.pillars.year.xunKongVi}
                  </td>
                </tr>
                <tr className="border-t" style={{ borderColor: C.border }}>
                  <td
                    className="bazi-label-col border-r px-3 py-2 text-left text-xs font-medium"
                    style={{ borderColor: C.border, backgroundColor: C.labelBg }}
                  >
                    Nhật Không
                  </td>
                  <td colSpan={2} className="px-3 py-2 text-center text-xs">
                    {chart.nhatKhongVi ?? chart.pillars.day.xunKongVi}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div>
            <div
              className="px-3 py-1.5 text-left text-xs font-medium uppercase"
              style={{ backgroundColor: C.headerBg }}
            >
              Ngũ Hành
            </div>
            <div className="space-y-2 px-4 py-3" style={{ backgroundColor: C.surface }}>
              {(["Mộc", "Hỏa", "Thổ", "Kim", "Thủy"] as const).map((el) => {
                const val = chart.wuXingBalance[el];
                const pct =
                  Math.round((val / chart.wuXingBalance.total) * 100) || 0;
                const theme = elementTheme(el);
                return (
                  <div key={el} className="flex items-center gap-2 text-xs">
                    <span className="w-8" style={{ color: theme.color }}>
                      {el}
                    </span>
                    <div
                      className="h-2 flex-1 overflow-hidden rounded-sm"
                      style={{ backgroundColor: C.sectionBg }}
                    >
                      <div
                        className="h-full"
                        style={{ width: `${pct}%`, backgroundColor: theme.color }}
                      />
                    </div>
                    <span className="w-10 text-right tabular-nums text-[#666]">
                      {pct}%
                    </span>
                  </div>
                );
              })}
              <p className="text-xs text-[#888]">
                Hành mạnh:{" "}
                <span style={{ color: elementTheme(chart.wuXingBalance.dominant).color }}>
                  {chart.wuXingBalance.dominant}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Chân trang + nút tải ảnh */}
        <div
          className="border-t px-4 py-3"
          style={{ borderColor: C.border, backgroundColor: C.footerBg }}
        >
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs">
            <span style={{ color: C.muted }}>Ngũ hành:</span>
            {(["Kim", "Mộc", "Thủy", "Hỏa", "Thổ"] as const).map((el) => (
              <span key={el} className="flex items-center gap-1">
                <span
                  className="inline-block h-3 w-3 rounded-sm"
                  style={{ backgroundColor: ELEMENT_THEME[el].color }}
                />
                <span style={{ color: ELEMENT_THEME[el].color }}>{el}</span>
              </span>
            ))}
            <span style={{ color: C.border }}>|</span>
            <span>
              Thần sát:{" "}
              <span style={{ color: SHEN_SHA_TEXT.cat }}>cát</span>,{" "}
              <span style={{ color: SHEN_SHA_TEXT.hung }}>hung</span>
            </span>
            <span style={{ color: C.border }}>|</span>
            <span className="hidden sm:inline" style={{ color: C.muted }}>
              Phó tinh: CA Chính Ấn · TA Thiên Ấn · CQ Chính Quan · TS Thất Sát ·
              TK Tỷ Kiên · KT Kiếp Tài · CT Chính Tài · TT Thiên Tài · TQ Thương
              Quan · TH Thực Thần
            </span>
          </div>
          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={onDownload}
              disabled={exporting}
              className="inline-flex items-center gap-2 rounded-md px-5 py-2 text-sm font-medium text-white shadow-md transition hover:opacity-95 disabled:opacity-50"
              style={{
                backgroundColor: exporting ? C.muted : C.downloadBg,
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-4 w-4"
                aria-hidden
              >
                <path d="M10.75 2.75a.75.75 0 0 0-1.5 0v8.614L6.295 8.235a.75.75 0 1 0-1.09 1.03l4.25 4.5a.75.75 0 0 0 1.09 0l4.25-4.5a.75.75 0 1 0-1.09-1.03l-2.955 3.129V2.75Z" />
                <path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z" />
              </svg>
              {exporting ? "Đang tải ảnh…" : "Tải ảnh lá số"}
            </button>
          </div>
        </div>
      </div>
    );
  },
);

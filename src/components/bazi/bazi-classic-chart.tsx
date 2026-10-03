"use client";

import { forwardRef, useState, type ReactNode } from "react";
import type { BaZiChartResult, DaYunDetail } from "@/lib/astrology-engine";
import type { ShenShaItem } from "@/lib/bazi-shen-sha";
import { ensureDaYunDetail } from "@/lib/bazi-dayun-detail";
import {
  branchClassicLabel,
  branchElement,
  formatTimezoneLabel,
  naYinElement,
  stemClassicLabel,
  stemElement,
} from "@/lib/bazi-terminology";
import {
  ELEMENT_THEME,
  elementTheme,
  PILLAR_ORDER,
  type PillarKey,
} from "@/lib/bazi-theme";
import { BaziCloudDecor } from "./bazi-chart-decor";
import { BaziDayunDetailPanel } from "./bazi-dayun-detail-panel";
import { ReadingRegisterModal } from "@/components/reading/reading-register-modal";

const SHEN_SHA_TEXT = {
  cat: "#2d5a40",
  hung: "#a83828",
  auxiliary: "#5c4a3a",
} as const;

const C = {
  border: "#dcc4a8",
  labelBg: "#fbf3ea",
  headerBg: "#f3e0cb",
  sectionBg: "#f8ebe0",
  surface: "#fffdf9",
  highlight: "#fff1e6",
  footerBg: "#fbf3ea",
  muted: "#7a5c4a",
  titleAccent: "#c45c26",
  downloadBg: "#c45c26",
  downloadHover: "#a34a1c",
  readingBg: "#2f6f5e",
  readingHover: "#255a4c",
  ink: "#000000",
} as const;

/** Màu tiêu đề từng khung — ấm, nhẹ, dễ phân biệt */
const SECTION = {
  info: { bg: "#f6d7a8", text: "#7a3f0f" },
  dayun: { bg: "#e8d4a8", text: "#6b4e12" },
  liunian: { bg: "#d9e4b8", text: "#4d5e1f" },
  palaces: { bg: "#e4d2f0", text: "#5a3a6e" },
  wuxing: { bg: "#f0d9a0", text: "#7a5210" },
} as const;

const PILLAR_HEADERS: Record<PillarKey, string> = {
  year: "NĂM",
  month: "THÁNG",
  day: "NGÀY",
  hour: "GIỜ",
};

type BaziClassicChartProps = {
  chart: BaZiChartResult;
  chartId?: string | null;
  fullName?: string | null;
  birthPlace?: string | null;
  referenceYear: number;
  onDownload: () => void;
  exporting?: boolean;
};

function Cell({
  children,
  className = "",
  highlight = false,
  bg,
}: {
  children: ReactNode;
  className?: string;
  highlight?: boolean;
  bg?: string;
}) {
  return (
    <td
      className={`border px-2 py-1.5 text-center align-middle text-sm font-semibold ${className}`}
      style={{
        borderColor: C.border,
        backgroundColor: highlight ? C.highlight : bg ?? C.surface,
        color: C.ink,
      }}
    >
      {children}
    </td>
  );
}

function LabelCell({ children }: { children: ReactNode }) {
  return (
    <th
      className="bazi-label-col w-36 min-w-[8.5rem] border px-2 py-1.5 text-left align-middle text-xs font-bold uppercase leading-snug"
      style={{
        borderColor: C.border,
        backgroundColor: C.surface,
        color: C.ink,
      }}
    >
      {children}
    </th>
  );
}

function SectionTitle({
  children,
  tone,
  center = true,
}: {
  children: ReactNode;
  tone: keyof typeof SECTION;
  center?: boolean;
}) {
  const colors = SECTION[tone];
  return (
    <div
      className={`px-3 py-2 text-xs font-bold uppercase tracking-wide ${
        center ? "text-center" : "text-left"
      }`}
      style={{ backgroundColor: colors.bg, color: colors.text }}
    >
      {children}
    </div>
  );
}

function ColoredChar({
  text,
  element,
  size = "lg",
  className = "",
}: {
  text: string;
  element: string;
  size?: "lg" | "sm" | "xs";
  className?: string;
}) {
  const color = elementTheme(element).color;
  const sizeClass =
    size === "lg" ? "text-xl" : size === "sm" ? "text-sm" : "text-[10px]";
  return (
    <span
      className={`bazi-pillar-char font-semibold ${sizeClass} ${className}`}
      style={{ color, lineHeight: 1.15, display: "inline-block" }}
    >
      {text}
    </span>
  );
}

/** "Bính +Hỏa" → tên đen, ngũ hành nhỏ hơn + đúng màu hành */
function ClassicNameElement({
  name,
  polarity,
  element,
  size = "lg",
}: {
  name: string;
  polarity: "+" | "-";
  element: string;
  size?: "lg" | "sm" | "xs";
}) {
  const nameSize =
    size === "lg" ? "text-xl" : size === "sm" ? "text-sm" : "text-[11px]";
  const elSize =
    size === "lg" ? "text-sm" : size === "sm" ? "text-[10px]" : "text-[9px]";
  return (
    <span
      className="inline-flex items-baseline justify-center gap-x-1 whitespace-nowrap"
      style={{ lineHeight: 1.15 }}
    >
      <span
        className={`bazi-pillar-char font-semibold ${nameSize}`}
        style={{ color: C.ink }}
      >
        {name}
      </span>
      <span
        className={`bazi-pillar-char font-semibold ${elSize}`}
        style={{ color: elementTheme(element).color }}
      >
        {polarity}
        {element}
      </span>
    </span>
  );
}

function ClassicStemLabel({
  gan,
  size = "lg",
}: {
  gan: string;
  size?: "lg" | "sm" | "xs";
}) {
  const label = stemClassicLabel(gan);
  const [name, rest] = label.split(/\s+/);
  const polarity = (rest?.[0] === "-" ? "-" : "+") as "+" | "-";
  const element = rest?.slice(1) || stemElement(gan);
  return (
    <ClassicNameElement
      name={name ?? gan}
      polarity={polarity}
      element={element}
      size={size}
    />
  );
}

function ClassicBranchLabel({
  zhi,
  size = "lg",
}: {
  zhi: string;
  size?: "lg" | "sm" | "xs";
}) {
  const label = branchClassicLabel(zhi);
  const [name, rest] = label.split(/\s+/);
  const polarity = (rest?.[0] === "-" ? "-" : "+") as "+" | "-";
  const element = rest?.slice(1) || branchElement(zhi);
  return (
    <ClassicNameElement
      name={name ?? zhi}
      polarity={polarity}
      element={element}
      size={size}
    />
  );
}

/**
 * Can · Chi mỗi chữ một màu.
 * - inline: một hàng (bảng trụ / cung)
 * - stack: Can trên Chi dưới — cột hẹp Đại vận/Lưu niên, tránh chồng chữ khi xuất PNG
 */
function ColoredGanZhi({
  ganZhi,
  ganZhiVi,
  size = "sm",
  layout = "inline",
}: {
  ganZhi: string;
  ganZhiVi: string;
  size?: "lg" | "sm" | "xs";
  layout?: "inline" | "stack";
}) {
  const parts = ganZhiVi.trim().split(/\s+/);
  const ganLabel = parts[0] ?? ganZhiVi;
  const zhiLabel = parts.slice(1).join(" ") || "";
  if (layout === "stack") {
    return (
      <span
        className="flex flex-col items-center justify-center"
        style={{ lineHeight: 1.15, gap: 1 }}
      >
        <ColoredChar
          text={ganLabel}
          element={stemElement(ganZhi[0] ?? "")}
          size={size}
        />
        {zhiLabel ? (
          <ColoredChar
            text={zhiLabel}
            element={branchElement(ganZhi[1] ?? "")}
            size={size}
          />
        ) : null}
      </span>
    );
  }
  return (
    <span
      className="bazi-ganzhi-inline inline-flex max-w-full flex-nowrap items-center justify-center gap-x-0.5 whitespace-nowrap"
      style={{ lineHeight: 1.15 }}
    >
      <ColoredChar text={ganLabel} element={stemElement(ganZhi[0] ?? "")} size={size} />
      {zhiLabel ? (
        <ColoredChar
          text={zhiLabel}
          element={branchElement(ganZhi[1] ?? "")}
          size={size}
        />
      ) : null}
    </span>
  );
}

function shenShaTone(star: ShenShaItem): keyof typeof SHEN_SHA_TEXT {
  if (star.type === "hung") return "hung";
  if (star.type === "auxiliary") return "auxiliary";
  return "cat";
}

function ShenShaText({ stars }: { stars: ShenShaItem[] }) {
  if (stars.length === 0) return <span className="text-[#999]">—</span>;
  return (
    <span
      className="text-xs leading-snug"
      title="Thần Sát là phụ chứng, không dùng độc lập để kết luận."
    >
      {stars.map((s, i) => (
        <span key={s.key}>
          {i > 0 ? ", " : ""}
          <span style={{ color: SHEN_SHA_TEXT[shenShaTone(s)] }}>{s.name}</span>
        </span>
      ))}
    </span>
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
  const exact = chart.yun.startSolarExact;
  if (exact) {
    const hh = String(exact.hour).padStart(2, "0");
    const mm = String(exact.minute).padStart(2, "0");
    return `${exact.day}/${exact.month}/${exact.year} ${hh}:${mm}`;
  }
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
      chartId = null,
      fullName,
      birthPlace,
      referenceYear,
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
    const tzLabel = formatTimezoneLabel(chart.timezone);
    const [selectedDaYunIndex, setSelectedDaYunIndex] = useState<number | null>(
      null,
    );
    const [readingOpen, setReadingOpen] = useState(false);
    const selectedDaYun: DaYunDetail | null =
      selectedDaYunIndex == null
        ? null
        : (chart.yun.daYun.find((d) => d.index === selectedDaYunIndex) ?? null);

    return (
      <>
      <div
        ref={ref}
        className="bazi-chart-crisp bazi-chart-export overflow-hidden border"
        style={{ borderColor: C.border, backgroundColor: C.surface, color: C.ink }}
      >
        <div
          className="relative border-b px-4 py-4"
          style={{ borderColor: C.border, backgroundColor: C.labelBg }}
        >
          <BaziCloudDecor />
          <div className="relative flex flex-col items-center space-y-3">
            <div className="text-center">
              <p className="text-xs tracking-widest" style={{ color: C.muted }}>
                BaziVN
              </p>
              <h1 className="text-xl font-bold tracking-tight">
                BẢN ĐỒ{" "}
                <span style={{ color: C.titleAccent }}>BÁT TỰ</span>
              </h1>
            </div>
            <dl className="mx-auto grid w-fit max-w-full grid-cols-1 gap-x-10 gap-y-0.5 text-sm sm:grid-cols-2">
              <div className="flex items-baseline gap-2">
                <dt style={{ color: C.muted }}>Họ tên:</dt>
                <dd>{fullName?.trim() || "—"}</dd>
              </div>
              <div className="flex items-baseline gap-2">
                <dt style={{ color: C.muted }}>Nơi sinh:</dt>
                <dd>{birthPlace?.trim() || "—"}</dd>
              </div>
              <div className="flex items-baseline gap-2">
                <dt style={{ color: C.muted }}>Giới tính:</dt>
                <dd>{chart.genderLabel}</dd>
              </div>
              <div className="flex items-baseline gap-2">
                <dt style={{ color: C.muted }}>Năm xem:</dt>
                <dd>{referenceYear}</dd>
              </div>
              <div className="flex items-baseline gap-2">
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
              <div className="flex items-baseline gap-2">
                <dt style={{ color: C.muted }}>Âm lịch:</dt>
                <dd>
                  {chart.lunar.day}/{chart.lunar.month}/{chart.lunar.year}
                </dd>
              </div>
              <div className="space-y-0.5">
                <div className="flex items-baseline gap-2">
                  <dt style={{ color: C.muted }}>
                    Khởi vận · {chart.yun.isForward ? "thuận" : "nghịch"}:
                  </dt>
                  <dd>{khoiVanText(chart)}</dd>
                </div>
                {chart.monthCommand?.commandingStem ? (
                  <div className="flex items-baseline gap-2">
                    <dt className="shrink-0" style={{ color: C.muted }}>
                      Nhân nguyên:
                    </dt>
                    <dd>
                      {chart.monthCommand.phase}
                      {chart.monthCommand.daysFromJie != null
                        ? ` · ~${chart.monthCommand.daysFromJie} ngày sau Jie`
                        : ""}
                    </dd>
                  </div>
                ) : null}
              </div>
              <div className="space-y-0.5">
                {chart.currentSolarTermVi ? (
                  <div className="flex items-baseline gap-2">
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
                <div className="flex flex-col gap-0.5 text-xs font-medium">
                  <p style={{ color: C.ink }}>
                    Quy ước Giờ Tý:{" "}
                    {chart.conventions.dayBoundaryMode === "zi_start_23" ? (
                      <>
                        Đổi ngày từ{" "}
                        <strong className="font-bold" style={{ color: C.titleAccent }}>
                          23:00
                        </strong>{" "}
                        (Giờ Tý thuộc ngày mới)
                      </>
                    ) : (
                      <>
                        Đổi ngày lúc{" "}
                        <strong className="font-bold" style={{ color: C.titleAccent }}>
                          00:00
                        </strong>{" "}
                        (phân Dạ Tý – Tảo Tý)
                      </>
                    )}
                  </p>
                  <p className="text-[11px]" style={{ color: C.muted }}>
                    *Lưu ý: Tuổi hiển thị trên lá số là tuổi mụ.
                  </p>
                </div>
              </div>
            </dl>
          </div>
        </div>

        <div>
          <table className="w-full table-fixed border-collapse text-sm" style={{ color: C.ink }}>
            <colgroup>
              <col className="w-[9.5rem]" />
              <col />
              <col />
              <col />
              <col />
            </colgroup>
            <thead>
              <tr>
                <th
                  className="border px-2 py-2 text-center text-xs font-bold uppercase"
                  style={{
                    borderColor: C.border,
                    backgroundColor: SECTION.info.bg,
                    color: SECTION.info.text,
                  }}
                >
                  Thông tin
                </th>
                {PILLAR_ORDER.map((key) => (
                  <th
                    key={key}
                    className="border px-2 py-2 text-center text-sm font-bold uppercase"
                    style={{
                      borderColor: C.border,
                      backgroundColor: SECTION.info.bg,
                      color: SECTION.info.text,
                    }}
                  >
                    {PILLAR_HEADERS[key]}
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
                {PILLAR_ORDER.map((key) => {
                  const p = chart.pillars[key];
                  return (
                    <Cell key={key}>
                      <span
                        className="bazi-pillar-char text-sm font-semibold"
                        style={{ color: C.ink, lineHeight: 1.15 }}
                      >
                        {p.tenGodGanVi}
                      </span>
                    </Cell>
                  );
                })}
              </tr>
              <tr>
                <LabelCell>Thiên can</LabelCell>
                {PILLAR_ORDER.map((key) => {
                  const p = chart.pillars[key];
                  return (
                    <Cell key={key}>
                      <ClassicStemLabel gan={p.gan} size="lg" />
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
                      <ClassicBranchLabel zhi={p.zhi} size="lg" />
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
                        <span style={{ color: C.muted }}>—</span>
                      ) : (
                        <div className="inline-flex flex-col items-center gap-0.5">
                          {p.hideGan.map((h) => (
                            <ClassicStemLabel key={h.gan} gan={h.gan} size="sm" />
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
                    <Cell key={key} className="text-[11px] leading-snug">
                      {p.hideGan.length === 0 ? (
                        <span style={{ color: C.muted }}>—</span>
                      ) : (
                        <div className="inline-flex flex-col items-center gap-0.5">
                          {p.hideGan.map((h) => (
                            <ColoredChar
                              key={h.gan}
                              text={h.tenGodVi}
                              element={stemElement(h.gan)}
                              size="xs"
                            />
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
                <LabelCell>Lộc · Nhận</LabelCell>
                {PILLAR_ORDER.map((key) => {
                  const zhi = chart.pillars[key].zhi;
                  const qi = chart.dayMasterQiStates;
                  const tags: string[] = [];
                  if (qi?.lu?.branch && qi.lu.branch === zhi) tags.push("Lộc");
                  if (qi?.ren?.branch && qi.ren.branch === zhi) {
                    tags.push(
                      qi.ren.kind === "yinRen" ? "Âm Nhận" : "Dương Nhận",
                    );
                  }
                  return (
                    <Cell key={key} className="text-[11px] font-semibold">
                      {tags.length > 0 ? (
                        <span style={{ color: C.titleAccent }}>
                          {tags.join(" · ")}
                        </span>
                      ) : (
                        <span style={{ color: C.muted }}>—</span>
                      )}
                    </Cell>
                  );
                })}
              </tr>
              <tr>
                <LabelCell>Nạp âm</LabelCell>
                {PILLAR_ORDER.map((key) => {
                  const p = chart.pillars[key];
                  return (
                    <Cell key={key} className="text-xs">
                      <ColoredChar
                        text={p.naYinVi}
                        element={naYinElement(p.naYin || p.naYinVi)}
                        size="xs"
                      />
                    </Cell>
                  );
                })}
              </tr>
              <tr>
                <LabelCell>Tuần / Không</LabelCell>
                {PILLAR_ORDER.map((key) => (
                  <Cell key={key} className="whitespace-nowrap text-xs">
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

        {/* Đại vận — cột đều: CanChi + 2 dòng phó tinh + Trường sinh + tuổi + năm; Web: click mở panel */}
        <div className="border-t" style={{ borderColor: C.border }}>
          <SectionTitle tone="dayun">Đại Vận</SectionTitle>
          <div
            className="grid border-t"
            style={{
              borderColor: C.border,
              gridTemplateColumns: `repeat(${Math.max(1, chart.yun.daYun.length)}, minmax(0, 1fr))`,
            }}
          >
            {chart.yun.daYun.map((raw) => {
              const period = ensureDaYunDetail(raw, chart.dayMaster);
              const active =
                referenceYear >= period.startYear &&
                referenceYear <= period.endYear;
              const selected = selectedDaYunIndex === period.index;
              return (
                <button
                  key={period.index}
                  type="button"
                  onClick={() =>
                    setSelectedDaYunIndex((cur) =>
                      cur === period.index ? null : period.index,
                    )
                  }
                  className="bazi-compact-pillar flex h-full min-w-0 flex-col items-center gap-0.5 border-r px-1 py-1.5 text-center font-inherit last:border-r-0"
                  style={{
                    borderColor: C.border,
                    backgroundColor:
                      selected || active ? C.highlight : C.surface,
                    cursor: "pointer",
                    font: "inherit",
                    color: "inherit",
                  }}
                  title="Xem chi tiết Đại vận (không xuất vào ảnh)"
                >
                  <ColoredGanZhi
                    ganZhi={period.ganZhi}
                    ganZhiVi={period.ganZhiVi}
                    size="xs"
                    layout="inline"
                  />
                  {/* Phó tinh cố định 2 dòng — tránh cột nhấp nhổm khi tên dài */}
                  <span
                    className="grid h-[2.4em] w-full content-center text-[9px] font-semibold leading-tight"
                    style={{ color: C.ink }}
                  >
                    <span className="block truncate">
                      {period.tenGodGanVi || "—"}
                    </span>
                    <span className="block truncate">
                      {period.tenGodChiMainVi || "—"}
                    </span>
                  </span>
                  <span
                    className="block w-full text-[9px] font-medium"
                    style={{ color: C.muted, lineHeight: 1.25 }}
                  >
                    {period.diShiVi || "—"}
                  </span>
                  <span
                    className="block w-full text-[10px] font-semibold"
                    style={{ color: C.ink, lineHeight: 1.25 }}
                  >
                    {period.startAge}–{period.endAge}t
                  </span>
                  <span
                    className="block w-full text-[9px] font-medium"
                    style={{ color: C.muted, lineHeight: 1.25 }}
                  >
                    {period.startYear}–{period.endYear}
                  </span>
                </button>
              );
            })}
          </div>
          {selectedDaYun ? (
            <BaziDayunDetailPanel
              chart={chart}
              period={selectedDaYun}
              onClose={() => setSelectedDaYunIndex(null)}
            />
          ) : null}
        </div>

        {/* Lưu niên */}
        {activeDaYun ? (
          <div className="border-t" style={{ borderColor: C.border }}>
            <SectionTitle tone="liunian">
              Lưu Niên · Đại vận {activeDaYun.ganZhiVi}
            </SectionTitle>
            {[row1, row2].filter((r) => r.length > 0).map((row, ri) => (
              <div
                key={ri}
                className="grid border-t"
                style={{
                  borderColor: C.border,
                  gridTemplateColumns: `repeat(${row.length}, minmax(0, 1fr))`,
                }}
              >
                {row.map((ln) => {
                  const active = ln.year === referenceYear;
                  return (
                    <div
                      key={ln.year}
                      className="bazi-compact-pillar flex min-w-0 flex-col items-center gap-0.5 border-r px-1 py-1.5 text-center last:border-r-0"
                      style={{
                        borderColor: C.border,
                        backgroundColor: active ? C.highlight : C.surface,
                      }}
                    >
                      <ColoredGanZhi
                        ganZhi={ln.ganZhi}
                        ganZhiVi={ln.ganZhiVi}
                        size="xs"
                        layout="inline"
                      />
                      <span
                        className="block w-full text-[10px] font-semibold"
                        style={{ color: C.muted, lineHeight: 1.25 }}
                      >
                        {ln.year}
                      </span>
                      <span
                        className="block w-full text-[10px] font-semibold"
                        style={{ color: C.muted, lineHeight: 1.25 }}
                      >
                        {ln.ageXu ?? ln.age}t
                      </span>
                    </div>
                  );
                })}
              </div>
            ))}

            {refLiuNian ? (
              <div
                className="border-t px-3 py-2 text-xs leading-relaxed"
                style={{ borderColor: C.border, backgroundColor: C.highlight }}
              >
                <p className="font-medium" style={{ color: C.titleAccent }}>
                  Lưu niên {referenceYear} · {refLiuNian.ganZhiVi} ·{" "}
                  {refLiuNian.ageXu ?? refLiuNian.age}t
                </p>
                <div
                  className="mt-1 grid gap-x-4 gap-y-0.5 sm:grid-cols-2"
                  style={{ color: C.muted }}
                >
                  <p>
                    Nạp âm:{" "}
                    <span
                      className="font-medium"
                      style={{
                        color: elementTheme(
                          naYinElement(refLiuNian.naYinVi ?? ""),
                        ).color,
                      }}
                    >
                      {refLiuNian.naYinVi ?? "—"}
                    </span>
                  </p>
                  <p>
                    Trường sinh:{" "}
                    <span style={{ color: C.ink }}>
                      {refLiuNian.diShiVi ?? "—"}
                    </span>
                  </p>
                  <p>
                    Tàng can:{" "}
                    {refLiuNian.hideGan?.length ? (
                      refLiuNian.hideGan.map((h, i) => {
                        const stemName = h.ganVi?.split(/\s+/)[0] ?? h.gan;
                        return (
                          <span key={`${h.gan}-${h.role}-${i}`}>
                            {i > 0 ? ", " : ""}
                            <span
                              className="font-medium"
                              style={{ color: elementTheme(stemElement(h.gan)).color }}
                            >
                              {stemName}
                            </span>
                            <span>
                              {" "}
                              · {h.tenGodVi || "—"}
                            </span>
                          </span>
                        );
                      })
                    ) : (
                      <span style={{ color: C.ink }}>
                        {refLiuNian.hideGanVi ?? "—"}
                      </span>
                    )}
                  </p>
                  {(refLiuNian.shenSha?.length ?? 0) > 0 ? (
                    <p>
                      Thần sát:{" "}
                      {refLiuNian.shenSha!.map((s, i) => (
                        <span key={s.key}>
                          {i > 0 ? ", " : ""}
                          <span
                            className="font-medium"
                            style={{ color: SHEN_SHA_TEXT[shenShaTone(s)] }}
                          >
                            {s.name}
                          </span>
                        </span>
                      ))}
                    </p>
                  ) : (
                    <p>Thần sát: —</p>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        {/* Cung vị + Ngũ hành */}
        <div className="grid border-t sm:grid-cols-2" style={{ borderColor: C.border }}>
          <div className="border-b sm:border-b-0 sm:border-r" style={{ borderColor: C.border }}>
            <SectionTitle tone="palaces">Cung vị</SectionTitle>
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
                      className="bazi-label-col w-28 border-r px-3 py-2 text-center text-xs font-bold"
                      style={{
                        borderColor: C.border,
                        backgroundColor: C.surface,
                        color: C.ink,
                      }}
                    >
                      {label}
                    </td>
                    <td className="px-3 py-2 text-center font-semibold">
                      <ColoredGanZhi
                        ganZhi={palace.ganZhi}
                        ganZhiVi={palace.ganZhiVi}
                        size="sm"
                      />
                    </td>
                    <td className="px-3 py-2 text-center text-xs font-semibold">
                      <ColoredChar
                        text={palace.naYinVi}
                        element={naYinElement(palace.naYin || palace.naYinVi)}
                        size="xs"
                      />
                    </td>
                  </tr>
                ))}
                <tr className="border-t" style={{ borderColor: C.border }}>
                  <td
                    className="bazi-label-col border-r px-3 py-2 text-center text-xs font-bold"
                    style={{
                      borderColor: C.border,
                      backgroundColor: C.surface,
                      color: C.ink,
                    }}
                  >
                    Niên Không
                  </td>
                  <td colSpan={2} className="px-3 py-2 text-center text-xs font-semibold">
                    {chart.nienKhongVi ?? chart.pillars.year.xunKongVi}
                  </td>
                </tr>
                <tr className="border-t" style={{ borderColor: C.border }}>
                  <td
                    className="bazi-label-col border-r px-3 py-2 text-center text-xs font-bold"
                    style={{
                      borderColor: C.border,
                      backgroundColor: C.surface,
                      color: C.ink,
                    }}
                  >
                    Nhật Không
                  </td>
                  <td colSpan={2} className="px-3 py-2 text-center text-xs font-semibold">
                    {chart.nhatKhongVi ?? chart.pillars.day.xunKongVi}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div>
            <SectionTitle tone="wuxing">Ngũ Hành</SectionTitle>
            <div className="space-y-2 px-4 py-3" style={{ backgroundColor: C.surface }}>
              {(["Mộc", "Hỏa", "Thổ", "Kim", "Thủy"] as const).map((el) => {
                const val = chart.wuXingBalance[el];
                const pct =
                  Math.round((val / chart.wuXingBalance.total) * 100) || 0;
                const theme = elementTheme(el);
                return (
                  <div key={el} className="flex items-center gap-2 text-xs font-semibold">
                    <span className="w-8 text-center" style={{ color: theme.color }}>
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
                    <span
                      className="w-10 text-center tabular-nums font-semibold"
                      style={{ color: C.muted }}
                    >
                      {pct}%
                    </span>
                  </div>
                );
              })}
              <p
                className="pt-1 text-[10px] font-medium leading-snug"
                style={{ color: C.muted }}
              >
                Biểu đồ phân bố ngũ hành chỉ mang tính trực quan, không dùng trực
                tiếp để xác định thân vượng/nhược hoặc Dụng thần.
              </p>
            </div>
          </div>
        </div>

        {/* Chân trang + nút tải ảnh */}
        <div
          className="border-t px-4 py-3"
          style={{ borderColor: C.border, backgroundColor: C.footerBg }}
        >
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs font-semibold">
            {(["Kim", "Mộc", "Thủy", "Hỏa", "Thổ"] as const).map((el) => (
              <span key={el} className="flex items-center gap-1">
                <span
                  className="inline-block h-3 w-3 rounded-sm"
                  style={{ backgroundColor: ELEMENT_THEME[el].color }}
                />
                <span style={{ color: ELEMENT_THEME[el].color }}>{el}</span>
              </span>
            ))}
          </div>
          <div className="bazi-no-export mt-3 flex flex-wrap items-center justify-center gap-3">
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
            <button
              type="button"
              onClick={() => setReadingOpen(true)}
              className="inline-flex items-center gap-2 rounded-md px-5 py-2 text-sm font-medium text-white shadow-md transition hover:opacity-95"
              style={{ backgroundColor: C.readingBg }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-4 w-4"
                aria-hidden
              >
                <path d="M2.5 4.5A1.5 1.5 0 0 1 4 3h7.5a.75.75 0 0 1 0 1.5H4a.5.5 0 0 0-.5.5v10a.5.5 0 0 0 .5.5h7.25a.75.75 0 0 1 0 1.5H4A1.5 1.5 0 0 1 2.5 14.5v-10Z" />
                <path d="M6 6.75A.75.75 0 0 1 6.75 6h2.5a.75.75 0 0 1 0 1.5h-2.5A.75.75 0 0 1 6 6.75ZM6.75 9a.75.75 0 0 0 0 1.5h1.5a.75.75 0 0 0 0-1.5h-1.5Z" />
                <path d="M12.22 5.72a.75.75 0 0 1 1.06 0l3 3a.75.75 0 0 1 0 1.06l-5.25 5.25a.75.75 0 0 1-.335.195l-2.5.625a.75.75 0 0 1-.91-.91l.625-2.5a.75.75 0 0 1 .195-.335l5.25-5.25Zm.53 1.59L15.19 9.75l-.97.97-2.44-2.44.97-.97Zm-1.5 1.5 2.44 2.44-3.03 3.03-.53-2.12 1.12-1.12.53-2.13Z" />
              </svg>
              Đăng ký luận giải
            </button>
          </div>
        </div>
      </div>
      <ReadingRegisterModal
        open={readingOpen}
        onClose={() => setReadingOpen(false)}
        chartId={chartId}
      />
    </>
    );
  },
);

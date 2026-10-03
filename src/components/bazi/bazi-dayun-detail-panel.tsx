"use client";

import type { ReactNode } from "react";
import type { BaZiChartResult, DaYunDetail } from "@/lib/astrology-engine";
import {
  ensureDaYunDetail,
  formatSolarRange,
  relationLabelVi,
  relationsDaYunToNatal,
  structuralFactsDaYun,
} from "@/lib/bazi-dayun-detail";
import { hiddenStemRoleLabel } from "@/lib/core/hidden-stems";
import {
  branchToVi,
  stemElement,
  stemToVi,
} from "@/lib/bazi-terminology";
import { elementTheme } from "@/lib/bazi-theme";
import type { ShenShaItem } from "@/lib/bazi-shen-sha";

type Props = {
  chart: BaZiChartResult;
  period: DaYunDetail;
  onClose: () => void;
};

const C = {
  ink: "#3d2c1e",
  muted: "#8a6b55",
  border: "#e2d0bc",
  surface: "#fffaf4",
  card: "#fffdf9",
  header: "#f6e6d4",
  accent: "#b85a2a",
  soft: "#f3ebe2",
} as const;

const SHEN = {
  cat: "#2d5a40",
  hung: "#a83828",
  auxiliary: "#5c4a3a",
} as const;

function Block({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section
      className="rounded-md border px-3 py-2.5"
      style={{ borderColor: C.border, backgroundColor: C.card }}
    >
      <h4
        className="mb-1.5 text-[11px] font-bold uppercase tracking-wide"
        style={{ color: C.accent }}
      >
        {title}
      </h4>
      <div className="space-y-1 text-[12px] leading-snug" style={{ color: C.ink }}>
        {children}
      </div>
    </section>
  );
}

function shenTone(s: ShenShaItem): keyof typeof SHEN {
  if (s.type === "hung") return "hung";
  if (s.type === "auxiliary") return "auxiliary";
  return "cat";
}

function transformStatusVi(status?: string | null): string {
  if (status === "combineOnly") return "chỉ hợp";
  if (status === "transformCandidate") return "ứng viên hóa";
  if (status === "transformed") return "đã hóa";
  return "";
}

export function BaziDayunDetailPanel({ chart, period, onClose }: Props) {
  const dy = ensureDaYunDetail(period, chart.dayMaster);
  const rels = relationsDaYunToNatal(chart, dy);
  const structural = structuralFactsDaYun(chart, dy);
  const ganInfo = stemToVi(dy.gan);
  const ganEl = stemElement(dy.gan);
  const ganTheme = ganEl ? elementTheme(ganEl) : null;
  const zhiLabel = branchToVi(dy.zhi).label;

  return (
    <div
      className="bazi-no-export border-t px-3 py-3 sm:px-4"
      style={{ borderColor: C.border, backgroundColor: C.surface }}
      role="dialog"
      aria-label={`Chi tiết Đại vận ${dy.ganZhiVi}`}
    >
      {/* Header */}
      <div
        className="mb-3 flex items-start justify-between gap-3 rounded-md px-3 py-2.5"
        style={{ backgroundColor: C.header }}
      >
        <div className="min-w-0">
          <p className="text-sm font-bold" style={{ color: C.accent }}>
            Đại vận {dy.ganZhiVi}
          </p>
          <p className="text-[11px] font-medium" style={{ color: C.muted }}>
            Tuổi {dy.startAge}–{dy.endAge}t · {dy.startYear}–{dy.endYear} ·{" "}
            {chart.yun.isForward ? "Thuận" : "Nghịch"}
          </p>
          <p className="text-[11px]" style={{ color: C.muted }}>
            Thời gian: {formatSolarRange(dy.startSolarExact, dy.endSolarExact)}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 rounded-md px-2.5 py-1 text-[11px] font-semibold transition hover:opacity-80"
          style={{
            color: C.accent,
            backgroundColor: C.card,
            border: `1px solid ${C.border}`,
          }}
        >
          Đóng
        </button>
      </div>

      {/* 2 cột */}
      <div className="grid gap-3 sm:grid-cols-2">
        {/* Cột trái — Can Chi / Tàng can / Trường Sinh */}
        <div className="space-y-3">
          <Block title="Thiên Can Đại vận">
            <p className="font-semibold">
              <span style={{ color: ganTheme?.color ?? C.ink }}>
                {ganInfo.shortLabel ?? ganInfo.label}
              </span>
              {ganInfo.polarity ? (
                <span style={{ color: C.muted }}>
                  {" "}
                  · {ganInfo.polarity === "+" ? "Dương" : "Âm"} {ganEl}
                </span>
              ) : null}
            </p>
            <p>
              Thập thần:{" "}
              <span className="font-semibold">{dy.tenGodGanVi || "—"}</span>
            </p>
          </Block>

          <Block title="Địa Chi · Tàng can">
            <p className="mb-1 font-semibold">Chi {zhiLabel}</p>
            {(dy.hideGan ?? []).length === 0 ? (
              <p style={{ color: C.muted }}>—</p>
            ) : (
              <ul className="space-y-1">
                {dy.hideGan.map((h) => {
                  const el = stemElement(h.gan);
                  const theme = el ? elementTheme(el) : null;
                  const name = stemToVi(h.gan).shortLabel ?? h.gan;
                  return (
                    <li
                      key={`${h.gan}-${h.role}`}
                      className="flex flex-wrap items-baseline gap-x-1"
                    >
                      <span
                        className="font-semibold"
                        style={{ color: theme?.color ?? C.ink }}
                      >
                        {name}
                      </span>
                      <span style={{ color: C.muted }}>—</span>
                      <span>{h.tenGodVi || "—"}</span>
                      <span style={{ color: C.muted }}>
                        — {hiddenStemRoleLabel(h.role)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </Block>

          <Block title="Trường Sinh">
            <p className="font-semibold">{dy.diShiVi || "—"}</p>
          </Block>
        </div>

        {/* Cột phải — Quan hệ / Cấu trúc / Thần sát / Nạp âm */}
        <div className="space-y-3">
          <Block title="Tác động vào nguyên cục">
            {rels.length === 0 ? (
              <p style={{ color: C.muted }}>Không có quan hệ cấu trúc nổi bật.</p>
            ) : (
              <ul className="space-y-1">
                {rels.slice(0, 12).map((r) => {
                  const status = transformStatusVi(r.transformStatus);
                  return (
                    <li key={`${r.type}-${r.name}-${r.evidence}`}>
                      {relationLabelVi(r.nameVi, r.name)}
                      {status ? (
                        <span style={{ color: C.muted }}> · {status}</span>
                      ) : null}
                      {r.contested ? (
                        <span style={{ color: C.muted }}> · tranh hợp</span>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            )}
          </Block>

          {(structural.muKho.length > 0 ||
            structural.luRen.length > 0 ||
            structural.daoVi.length > 0) && (
            <Block title="Khí trạng / cấu trúc đặc biệt">
              <ul className="space-y-1">
                {structural.luRen.map((x) => (
                  <li key={x}>{x}</li>
                ))}
                {structural.daoVi.map((x) => (
                  <li key={x}>Đáo vị: {x}</li>
                ))}
                {structural.muKho.map((x) => (
                  <li key={x}>Mộ Khố: {x}</li>
                ))}
              </ul>
            </Block>
          )}

          <Block title="Thần sát phụ trợ">
            {(dy.shenSha ?? []).length === 0 ? (
              <p style={{ color: C.muted }}>—</p>
            ) : (
              <p className="leading-relaxed">
                {(dy.shenSha ?? []).map((s, i) => (
                  <span key={s.key}>
                    {i > 0 ? ", " : ""}
                    <span
                      className="font-semibold"
                      style={{ color: SHEN[shenTone(s)] }}
                    >
                      {s.name}
                    </span>
                  </span>
                ))}
              </p>
            )}
          </Block>

          <Block title="Dữ liệu tham khảo">
            <p style={{ color: C.muted }}>Nạp âm: {dy.naYinVi || "—"}</p>
          </Block>
        </div>
      </div>
    </div>
  );
}

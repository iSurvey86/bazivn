"use client";

import { Link, useRouter } from "@/i18n/navigation";
import type { ReadingOrder } from "@/lib/reading/types";
import { useState } from "react";
import { READING_UI } from "./reading-ui-theme";

type Props = {
  order: ReadingOrder;
};

function SoftField({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="rounded-xl px-3 py-2.5"
      style={{
        backgroundColor: READING_UI.surfaceMuted,
        border: `1px solid ${READING_UI.borderSoft}`,
      }}
    >
      <dt
        className="text-[11px] font-bold uppercase tracking-wide"
        style={{ color: READING_UI.muted }}
      >
        {label}
      </dt>
      <dd
        className="mt-0.5 text-sm font-semibold"
        style={{ color: READING_UI.ink }}
      >
        {value}
      </dd>
    </div>
  );
}

export function ReadingReviewClient({ order }: Props) {
  const router = useRouter();
  const snap = order.lockedSnapshot;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!snap) {
    return (
      <div
        className="rounded-xl px-4 py-3 text-sm"
        style={{
          backgroundColor: "#fff8eb",
          border: `1px solid ${READING_UI.code.border}`,
          color: READING_UI.ink,
        }}
      >
        Chưa có dữ liệu lá số khóa.{" "}
        <Link
          href={`/reading/${order.id}/basic`}
          className="font-bold underline"
          style={{ color: READING_UI.confirm.bg }}
        >
          Nhập thông tin cơ bản
        </Link>
      </div>
    );
  }

  async function confirm() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/reading/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "confirm_review" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Không xác nhận được.");
      router.push(`/reading/${order.id}/intake`);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Lỗi không xác định.");
    } finally {
      setLoading(false);
    }
  }

  const solar = snap.solar;
  const fields = [
    ["Họ tên", snap.fullName || "—"],
    ["Nơi sinh", snap.birthPlace || "—"],
    ["Giới tính", snap.gender === "male" ? "Nam" : "Nữ"],
    [
      "Ngày giờ dương",
      `${String(solar.day).padStart(2, "0")}/${String(solar.month).padStart(2, "0")}/${solar.year} ${String(solar.hour).padStart(2, "0")}:${String(solar.minute).padStart(2, "0")}`,
    ],
    ["Múi giờ", snap.timezone],
    ["Nhật chủ", snap.dayMasterVi],
    ["Niên trụ", snap.pillarsSummary.year],
    ["Nguyệt trụ", snap.pillarsSummary.month],
    ["Nhật trụ", snap.pillarsSummary.day],
    ["Thời trụ", snap.pillarsSummary.hour],
  ] as const;

  const btnBase =
    "inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-center text-sm font-bold shadow-sm transition";

  return (
    <div className="space-y-5">
      <dl className="grid gap-2.5 sm:grid-cols-2">
        {fields.map(([label, value]) => (
          <SoftField key={label} label={label} value={value} />
        ))}
      </dl>

      {error ? (
        <p className="text-sm font-medium text-red-600">{error}</p>
      ) : null}

      <div
        className={`grid gap-2.5 ${
          order.chartId ? "sm:grid-cols-3" : "sm:grid-cols-2"
        }`}
      >
        {order.chartId ? (
          <Link
            href={`/chart/${order.chartId}`}
            className={btnBase}
            style={{
              backgroundColor: READING_UI.view.bg,
              border: `1px solid ${READING_UI.view.border}`,
              color: READING_UI.view.text,
            }}
          >
            Xem lại lá số
          </Link>
        ) : null}
        <Link
          href={`/reading/${order.id}/edit`}
          className={btnBase}
          style={{
            backgroundColor: READING_UI.edit.bg,
            border: `1px solid ${READING_UI.edit.border}`,
            color: READING_UI.edit.text,
          }}
        >
          Sửa thông tin
        </Link>
        <button
          type="button"
          onClick={confirm}
          disabled={loading}
          className={`${btnBase} disabled:opacity-50`}
          style={{
            backgroundColor: READING_UI.confirm.bg,
            border: `1px solid ${READING_UI.confirm.border}`,
            color: READING_UI.confirm.text,
          }}
        >
          {loading ? "Đang xử lý…" : "Xác nhận"}
        </button>
      </div>
    </div>
  );
}

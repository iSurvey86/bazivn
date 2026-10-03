"use client";

import { useRouter } from "@/i18n/navigation";
import {
  SCHOOL_BLURB,
  SCHOOL_LABEL,
  SOURCE_LABEL,
  type ReadingSchool,
  type ReadingSource,
} from "@/lib/reading/types";
import { useState } from "react";
import { READING_UI } from "./reading-ui-theme";

type Props = {
  open: boolean;
  onClose: () => void;
  /** Có chart đã lưu → cho chọn «lá số đang xem» */
  chartId?: string | null;
};

export function ReadingRegisterModal({ open, onClose, chartId }: Props) {
  const router = useRouter();
  const hasChart = Boolean(chartId);
  const [step, setStep] = useState<1 | 2>(1);
  const [source, setSource] = useState<ReadingSource>(
    hasChart ? "existing_chart" : "new_chart",
  );
  const [school, setSchool] = useState<ReadingSchool>("traditional");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  async function submit() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/reading/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: hasChart ? source : "new_chart",
          school,
          chartId: hasChart && source === "existing_chart" ? chartId : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Không tạo được đơn.");
      const order = data.order as { id: string; status: string };
      onClose();
      if (order.status === "locked_review") {
        router.push(`/reading/${order.id}/review`);
      } else {
        router.push(`/reading/${order.id}/basic`);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Lỗi không xác định.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal
      aria-label="Đăng ký luận giải"
    >
      <div className="w-full max-w-md rounded-xl border border-border bg-surface p-5 shadow-xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-foreground">
              Đăng ký luận giải
            </h2>
            <p className="mt-1 text-xs text-muted">
              Bước {step}/2 — chọn nguồn lá số và trường phái mệnh thư.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-2 py-1 text-sm text-muted hover:bg-surface-muted"
          >
            Đóng
          </button>
        </div>

        {step === 1 ? (
          <div className="mt-4 space-y-3">
            <p className="text-sm font-semibold text-foreground">
              Bạn đăng ký cho lá số nào?
            </p>
            {(
              [
                ["existing_chart", !hasChart],
                ["new_chart", false],
              ] as const
            ).map(([value, disabled]) => (
              <label
                key={value}
                className={`flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2.5 ${
                  source === value
                    ? "border-accent bg-accent/5"
                    : "border-border"
                } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
              >
                <input
                  type="radio"
                  name="reading-source"
                  className="mt-1"
                  disabled={disabled}
                  checked={source === value}
                  onChange={() => setSource(value)}
                />
                <span>
                  <span className="block text-sm font-bold text-foreground">
                    {SOURCE_LABEL[value]}
                  </span>
                  <span className="mt-0.5 block text-xs text-muted">
                    {value === "existing_chart"
                      ? hasChart
                        ? "Lấy toàn bộ thông tin lá số hiện tại, khóa để kiểm tra lại."
                        : "Chưa có lá số hoàn chỉnh — hãy chọn Lá số mới."
                      : "Nhập tay thông tin cơ bản rồi lập lá số mới."}
                  </span>
                </span>
              </label>
            ))}
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            <p className="text-sm font-semibold text-foreground">
              Chọn trường phái mệnh thư
            </p>
            {(["traditional", "manh_phai"] as const).map((value) => (
              <label
                key={value}
                className={`flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2.5 ${
                  school === value
                    ? "border-accent bg-accent/5"
                    : "border-border"
                }`}
              >
                <input
                  type="radio"
                  name="reading-school"
                  className="mt-1"
                  checked={school === value}
                  onChange={() => setSchool(value)}
                />
                <span>
                  <span className="block text-sm font-bold text-foreground">
                    {SCHOOL_LABEL[value]}
                  </span>
                  <span
                    className="mt-1 block text-xs font-medium italic leading-relaxed text-justify"
                    style={{ color: READING_UI.schoolBlurb }}
                  >
                    {SCHOOL_BLURB[value]}
                  </span>
                </span>
              </label>
            ))}
          </div>
        )}

        {error ? (
          <p className="mt-3 text-sm font-medium text-red-600">{error}</p>
        ) : null}

        <div className="mt-5 flex justify-end gap-2">
          {step === 2 ? (
            <button
              type="button"
              onClick={() => setStep(1)}
              className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-surface-muted"
            >
              Quay lại
            </button>
          ) : null}
          {step === 1 ? (
            <button
              type="button"
              onClick={() => setStep(2)}
              disabled={source === "existing_chart" && !hasChart}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-bold text-white hover:bg-accent-hover disabled:opacity-50"
            >
              Tiếp tục
            </button>
          ) : (
            <button
              type="button"
              onClick={submit}
              disabled={loading}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-bold text-white hover:bg-accent-hover disabled:opacity-50"
            >
              {loading ? "Đang tạo…" : "Tiếp tục"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

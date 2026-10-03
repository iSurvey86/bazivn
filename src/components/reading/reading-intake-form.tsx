"use client";

import {
  METHOD_LABEL,
  type ReadingIntake,
  type ReadingLockedSnapshot,
  type ReadingMethod,
} from "@/lib/reading/types";
import { useRouter } from "@/i18n/navigation";
import { useState } from "react";
import { READING_UI } from "./reading-ui-theme";

type Props = {
  orderId: string;
  snapshot: ReadingLockedSnapshot;
  initial?: ReadingIntake | null;
};

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function ReadingIntakeForm({ orderId, snapshot, initial }: Props) {
  const router = useRouter();
  const solar = snapshot.solar;
  const [method, setMethod] = useState<ReadingMethod>(
    initial?.unknownHour
      ? "rectify_hour"
      : initial?.method || "independent",
  );
  const [unknownHour, setUnknownHour] = useState(
    Boolean(initial?.unknownHour || snapshot.unknownHour),
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const solarDate = `${pad(solar.day)}/${pad(solar.month)}/${solar.year}`;
  const birthTime = `${pad(solar.hour)}:${pad(solar.minute)}`;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/reading/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save_intake",
          intake: {
            method: unknownHour ? "rectify_hour" : method,
            unknownHour,
            notes: "",
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Không lưu được form.");
      router.push(`/reading/${orderId}/checkout`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi không xác định.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <section>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-xs font-bold uppercase tracking-wide text-accent">
            1. Thông tin cơ bản
          </h3>
          <span className="rounded-full bg-surface-muted px-2.5 py-0.5 text-[11px] font-semibold text-muted">
            Đã khóa
          </span>
        </div>
        <dl className="grid gap-3 sm:grid-cols-2">
          {(
            [
              ["Họ tên hoặc bí danh", snapshot.fullName || "—"],
              ["Giới tính", snapshot.gender === "male" ? "Nam" : "Nữ"],
              ["Ngày sinh dương lịch", solarDate],
              ["Nơi sinh", snapshot.birthPlace || "—"],
              ["Giờ sinh", birthTime],
            ] as const
          ).map(([label, value]) => (
            <div
              key={label}
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
          ))}
        </dl>
        <label
          className="mt-3 flex cursor-pointer items-start gap-2 rounded-xl px-3 py-2.5 text-sm"
          style={{
            backgroundColor: unknownHour
              ? READING_UI.code.bg
              : READING_UI.surface,
            border: `1px solid ${
              unknownHour ? READING_UI.code.border : READING_UI.border
            }`,
          }}
        >
          <input
            type="checkbox"
            className="mt-0.5"
            checked={unknownHour}
            onChange={(e) => {
              const on = e.target.checked;
              setUnknownHour(on);
              setMethod(on ? "rectify_hour" : "independent");
            }}
          />
          <span>
            <span className="font-semibold text-foreground">
              Không rõ giờ sinh
            </span>
            <span className="mt-0.5 block text-xs text-muted">
              Tích ô này sẽ hiện phương thức C - hiệu chỉnh, tìm giờ sinh
            </span>
          </span>
        </label>
      </section>

      <section>
        <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-accent">
          2. Phương thức lập mệnh thư
        </h3>
        <div className="space-y-2">
          {(
            (unknownHour
              ? (["rectify_hour"] as const)
              : (["independent", "verified"] as const)) as ReadingMethod[]
          ).map((k) => {
            const letter =
              k === "independent" ? "A" : k === "verified" ? "B" : "C";
            return (
              <label
                key={k}
                className="flex cursor-pointer items-start gap-3 rounded-xl px-3 py-2.5"
                style={
                  method === k
                    ? {
                        backgroundColor: READING_UI.code.bg,
                        border: `1px solid ${READING_UI.code.border}`,
                      }
                    : {
                        backgroundColor: READING_UI.surface,
                        border: `1px solid ${READING_UI.border}`,
                      }
                }
              >
                <input
                  type="radio"
                  name="reading-method"
                  className="mt-1"
                  checked={method === k}
                  onChange={() => setMethod(k)}
                />
                <span className="text-sm font-medium text-foreground">
                  {letter}. {METHOD_LABEL[k]}
                </span>
              </label>
            );
          })}
        </div>
      </section>

      {error ? (
        <p className="text-sm font-medium text-red-600">{error}</p>
      ) : null}

      <div className="grid gap-2.5 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => router.push(`/reading/${orderId}/review`)}
          className="inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-bold transition"
          style={{
            backgroundColor: READING_UI.view.bg,
            border: `1px solid ${READING_UI.view.border}`,
            color: READING_UI.view.text,
          }}
        >
          Quay lại kiểm tra
        </button>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-bold text-white transition disabled:opacity-50"
          style={{
            backgroundColor: READING_UI.confirm.bg,
            border: `1px solid ${READING_UI.confirm.border}`,
          }}
        >
          {loading ? "Đang gửi…" : "Tiếp tục → Thanh toán"}
        </button>
      </div>
    </form>
  );
}

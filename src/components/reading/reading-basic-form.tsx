"use client";

import { BaziButton, BaziField, BaziInput, BaziSelect } from "@/components/bazi/bazi-ui";
import type { Gender } from "@/lib/bazi-schema";
import type { ReadingLockedSnapshot } from "@/lib/reading/types";
import { useRouter } from "@/i18n/navigation";
import { useMemo, useState } from "react";

const TIMEZONE_OPTIONS = [
  { value: "Asia/Ho_Chi_Minh", label: "(GMT+07:00) Hà Nội" },
  { value: "Asia/Shanghai", label: "(GMT+08:00) Bắc Kinh" },
  { value: "Asia/Seoul", label: "(GMT+09:00) Seoul" },
  { value: "UTC", label: "(GMT+00:00) UTC" },
] as const;

function daysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

type Props = {
  orderId: string;
  mode: "create" | "edit";
  initial?: ReadingLockedSnapshot | null;
};

export function ReadingBasicForm({ orderId, mode, initial }: Props) {
  const router = useRouter();
  const now = new Date();
  const [fullName, setFullName] = useState(initial?.fullName ?? "");
  const [birthPlace, setBirthPlace] = useState(initial?.birthPlace ?? "");
  const [day, setDay] = useState(initial?.solar.day ?? 1);
  const [month, setMonth] = useState(initial?.solar.month ?? 1);
  const [year, setYear] = useState(initial?.solar.year ?? 1990);
  const [hour, setHour] = useState(initial?.solar.hour ?? 12);
  const [minute, setMinute] = useState(initial?.solar.minute ?? 0);
  const [unknownHour, setUnknownHour] = useState(
    Boolean(initial?.unknownHour),
  );
  const [gender, setGender] = useState<Gender>(initial?.gender ?? "male");
  const [timezone, setTimezone] = useState(
    initial?.timezone ?? "Asia/Ho_Chi_Minh",
  );
  const [dayBoundaryMode, setDayBoundaryMode] = useState(
    initial?.dayBoundaryMode === "zi_start_23" ? "zi_start_23" : "midnight_00",
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const maxDay = useMemo(() => daysInMonth(year, month), [year, month]);
  const years = useMemo(() => {
    const list: number[] = [];
    for (let y = now.getFullYear(); y >= 1920; y--) list.push(y);
    return list;
  }, [now]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/reading/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save_basic",
          unknownHour,
          certainty: unknownHour ? "unknown_hour" : "very_sure",
          basic: {
            fullName: fullName.trim() || undefined,
            birthPlace: birthPlace.trim() || undefined,
            gender,
            year,
            month,
            day: Math.min(day, maxDay),
            hour: unknownHour ? 12 : hour,
            minute: unknownHour ? 0 : minute,
            second: 0,
            timezone,
            dayBoundaryMode,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Không lưu được.");
      router.push(`/reading/${orderId}/review`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi không xác định.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <BaziField label="Họ và tên" htmlFor="rb-name">
          <BaziInput
            id="rb-name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Ví dụ: Nguyễn Văn A"
          />
        </BaziField>
        <BaziField label="Nơi sinh" htmlFor="rb-place">
          <BaziInput
            id="rb-place"
            value={birthPlace}
            onChange={(e) => setBirthPlace(e.target.value)}
            placeholder="Tỉnh / Thành phố"
          />
        </BaziField>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <BaziField label="Ngày" htmlFor="rb-day">
          <BaziSelect
            id="rb-day"
            value={day}
            onChange={(e) => setDay(Number(e.target.value))}
          >
            {Array.from({ length: maxDay }, (_, i) => i + 1).map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </BaziSelect>
        </BaziField>
        <BaziField label="Tháng" htmlFor="rb-month">
          <BaziSelect
            id="rb-month"
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </BaziSelect>
        </BaziField>
        <BaziField label="Năm sinh" htmlFor="rb-year">
          <BaziSelect
            id="rb-year"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </BaziSelect>
        </BaziField>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <BaziField label="Giờ" htmlFor="rb-hour">
          <BaziSelect
            id="rb-hour"
            value={hour}
            disabled={unknownHour}
            onChange={(e) => setHour(Number(e.target.value))}
          >
            {Array.from({ length: 24 }, (_, i) => i).map((h) => (
              <option key={h} value={h}>
                {String(h).padStart(2, "0")}
              </option>
            ))}
          </BaziSelect>
        </BaziField>
        <BaziField label="Phút" htmlFor="rb-minute">
          <BaziSelect
            id="rb-minute"
            value={minute}
            disabled={unknownHour}
            onChange={(e) => setMinute(Number(e.target.value))}
          >
            {Array.from({ length: 60 }, (_, i) => i).map((m) => (
              <option key={m} value={m}>
                {String(m).padStart(2, "0")}
              </option>
            ))}
          </BaziSelect>
        </BaziField>
        <BaziField label="Giới tính" htmlFor="rb-gender">
          <BaziSelect
            id="rb-gender"
            value={gender}
            onChange={(e) => setGender(e.target.value as Gender)}
          >
            <option value="male">Nam</option>
            <option value="female">Nữ</option>
          </BaziSelect>
        </BaziField>
      </div>

      <label className="flex cursor-pointer items-start gap-2 rounded-xl border border-border bg-surface-muted px-3 py-2.5 text-sm">
        <input
          type="checkbox"
          className="mt-0.5"
          checked={unknownHour}
          onChange={(e) => {
            const on = e.target.checked;
            setUnknownHour(on);
            if (on) {
              setHour(12);
              setMinute(0);
            }
          }}
        />
        <span>
          <span className="font-semibold text-foreground">
            Không rõ giờ sinh
          </span>
          <span className="mt-0.5 block text-xs text-muted">
            Dùng tạm 12:00 để lập lá số; khi đăng ký luận giải sẽ mở phương
            thức - hiệu chỉnh, tìm giờ sinh.
          </span>
        </span>
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <BaziField label="Múi giờ nơi sinh" htmlFor="rb-tz">
          <BaziSelect
            id="rb-tz"
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
          >
            {TIMEZONE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </BaziSelect>
        </BaziField>
        <BaziField label="Quy ước Giờ Tý" htmlFor="rb-boundary">
          <BaziSelect
            id="rb-boundary"
            value={dayBoundaryMode}
            onChange={(e) => setDayBoundaryMode(e.target.value)}
          >
            <option value="midnight_00">Nửa đêm 00:00</option>
            <option value="zi_start_23">Giờ Tý từ 23:00</option>
          </BaziSelect>
        </BaziField>
      </div>

      {error ? (
        <p className="text-sm font-medium text-red-600">{error}</p>
      ) : null}

      <div className="flex flex-wrap gap-2 pt-2">
        <BaziButton type="submit" disabled={loading} className="!w-auto">
          {loading
            ? "Đang lưu…"
            : mode === "edit"
              ? "Lưu và khóa lại"
              : "Lập lá số và tiếp tục"}
        </BaziButton>
        {mode === "edit" ? (
          <button
            type="button"
            onClick={() => router.push(`/reading/${orderId}/review`)}
            className="rounded-lg border border-border px-4 py-2 text-sm font-semibold"
          >
            Hủy
          </button>
        ) : null}
      </div>
    </form>
  );
}

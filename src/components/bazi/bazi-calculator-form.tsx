"use client";

import type { Gender } from "@/lib/bazi-schema";
import { calculateBaZi } from "@/lib/astrology-engine";
import {
  dayBoundaryOptionHint,
  dayBoundaryOptionLabel,
  isDayBoundarySensitiveHour,
  type DayBoundaryMode,
} from "@/lib/core/conventions";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { BaziButton, BaziCard, BaziField, BaziInput, BaziSelect } from "./bazi-ui";
import { ReadingRegisterModal } from "@/components/reading/reading-register-modal";

const TIMEZONE_OPTIONS = [
  { value: "Asia/Ho_Chi_Minh", label: "(GMT+07:00) Bangkok, Hanoi, Jakarta" },
  { value: "Asia/Shanghai", label: "(GMT+08:00) Bắc Kinh, Singapore" },
  { value: "Asia/Seoul", label: "(GMT+09:00) Seoul, Tokyo" },
  { value: "Asia/Tokyo", label: "(GMT+09:00) Tokyo" },
  { value: "America/New_York", label: "(GMT-05:00) New York" },
  { value: "America/Los_Angeles", label: "(GMT-08:00) Los Angeles" },
  { value: "Europe/London", label: "(GMT+00:00) London" },
  { value: "UTC", label: "(GMT+00:00) UTC" },
] as const;

function daysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

type CalculateResponse = {
  chartId: string | null;
  fullName: string | null;
};

export function BaziCalculatorForm() {
  const t = useTranslations("bazi");
  const router = useRouter();
  const now = new Date();
  const currentYear = now.getFullYear();

  const [fullName, setFullName] = useState("");
  const [birthPlace, setBirthPlace] = useState("");
  const [day, setDay] = useState(1);
  const [month, setMonth] = useState(1);
  const [year, setYear] = useState(1990);
  const [hour, setHour] = useState(12);
  const [minute, setMinute] = useState(0);
  const [unknownHour, setUnknownHour] = useState(false);
  const [gender, setGender] = useState<Gender>("male");
  const [timezone, setTimezone] = useState("Asia/Ho_Chi_Minh");
  const [referenceYear, setReferenceYear] = useState(currentYear);
  const [dayBoundaryMode, setDayBoundaryMode] =
    useState<DayBoundaryMode>("midnight_00");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [readingOpen, setReadingOpen] = useState(false);

  const maxDay = useMemo(() => daysInMonth(year, month), [year, month]);
  const effectiveHour = unknownHour ? 12 : hour;
  const effectiveMinute = unknownHour ? 0 : minute;
  const sensitiveHour =
    !unknownHour && isDayBoundarySensitiveHour(effectiveHour);

  useEffect(() => {
    if (!sensitiveHour) setDayBoundaryMode("midnight_00");
  }, [sensitiveHour]);

  const birthYears = useMemo(() => {
    const list: number[] = [];
    for (let y = currentYear; y >= 1920; y--) list.push(y);
    return list;
  }, [currentYear]);

  const viewYears = useMemo(() => {
    const list: number[] = [];
    for (let y = currentYear + 5; y >= 1920; y--) list.push(y);
    return list;
  }, [currentYear]);

  const boundaryPreview = useMemo(() => {
    if (!sensitiveHour) return null;
    try {
      const local = {
        year,
        month,
        day: Math.min(day, maxDay),
        hour: effectiveHour,
        minute: effectiveMinute,
        second: 0,
      };
      const mid = calculateBaZi({
        gender,
        timezone,
        local,
        conventions: { dayBoundaryMode: "midnight_00" },
      });
      const zi = calculateBaZi({
        gender,
        timezone,
        local,
        conventions: { dayBoundaryMode: "zi_start_23" },
      });
      return {
        midnight_00: {
          day: mid.pillars.day.ganZhiVi,
          hour: mid.pillars.hour.ganZhiVi,
        },
        zi_start_23: {
          day: zi.pillars.day.ganZhiVi,
          hour: zi.pillars.hour.ganZhiVi,
        },
      };
    } catch {
      return null;
    }
  }, [
    sensitiveHour,
    year,
    month,
    day,
    maxDay,
    effectiveHour,
    effectiveMinute,
    gender,
    timezone,
  ]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/bazi/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim() || undefined,
          birthPlace: birthPlace.trim() || undefined,
          gender,
          year,
          month,
          day: Math.min(day, maxDay),
          hour: effectiveHour,
          minute: effectiveMinute,
          second: 0,
          timezone,
          dayBoundaryMode: sensitiveHour ? dayBoundaryMode : "midnight_00",
          unknownHour,
          save: true,
        }),
      });

      const data = (await response.json()) as CalculateResponse & {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error ?? t("errors.generic"));
      }

      if (data.chartId) {
        router.push(`/chart/${data.chartId}?year=${referenceYear}`);
        return;
      }

      throw new Error(t("errors.saveFailed"));
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : t("errors.generic"),
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <BaziCard elevated className="overflow-hidden border-gray-200">
      <div className="border-b border-gray-200 px-6 py-5">
        <h2 className="text-lg font-black tracking-tight text-foreground">
          Lập lá số <span className="text-accent">Tứ Trụ</span>
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 p-6">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <BaziField label={t("form.fullName")} htmlFor="fullName">
            <BaziInput
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={t("form.fullNamePlaceholder")}
            />
          </BaziField>
          <BaziField label="Nơi sinh" htmlFor="birthPlace">
            <BaziInput
              id="birthPlace"
              value={birthPlace}
              onChange={(e) => setBirthPlace(e.target.value)}
              placeholder="Ví dụ: Hà Nội"
            />
          </BaziField>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <BaziField label="Ngày" htmlFor="day">
            <BaziSelect
              id="day"
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
          <BaziField label="Tháng" htmlFor="month">
            <BaziSelect
              id="month"
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
          <BaziField label="Năm sinh" htmlFor="year">
            <BaziSelect
              id="year"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
            >
              {birthYears.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </BaziSelect>
          </BaziField>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <BaziField label="Giờ" htmlFor="hour">
            <BaziSelect
              id="hour"
              value={hour}
              disabled={unknownHour}
              onChange={(e) => setHour(Number(e.target.value))}
            >
              {Array.from({ length: 24 }, (_, i) => i).map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </BaziSelect>
          </BaziField>
          <BaziField label="Phút" htmlFor="minute">
            <BaziSelect
              id="minute"
              value={minute}
              disabled={unknownHour}
              onChange={(e) => setMinute(Number(e.target.value))}
            >
              {Array.from({ length: 60 }, (_, i) => i).map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </BaziSelect>
          </BaziField>
          <BaziField label="Loại lịch" htmlFor="calendarType">
            <BaziSelect id="calendarType" value="solar" disabled>
              <option value="solar">Dương lịch</option>
            </BaziSelect>
          </BaziField>
        </div>

        <label className="flex cursor-pointer items-start gap-2 rounded-lg border border-border bg-surface-muted px-3 py-2.5 text-sm">
          <input
            type="checkbox"
            className="mt-0.5 accent-[var(--accent)]"
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

        {/* Giới tính · Múi giờ · Năm xem — 1 hàng */}
        <div className="grid grid-cols-[minmax(5.5rem,7rem)_minmax(0,1fr)_minmax(6.5rem,8rem)] gap-3">
          <BaziField label={t("form.gender")} htmlFor="gender">
            <BaziSelect
              id="gender"
              value={gender}
              onChange={(e) => setGender(e.target.value as Gender)}
            >
              <option value="male">{t("form.male")}</option>
              <option value="female">{t("form.female")}</option>
            </BaziSelect>
          </BaziField>
          <BaziField label={t("form.timezone")} htmlFor="timezone">
            <BaziSelect
              id="timezone"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
            >
              {TIMEZONE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </BaziSelect>
          </BaziField>
          <BaziField label="Năm xem" htmlFor="referenceYear">
            <BaziSelect
              id="referenceYear"
              value={referenceYear}
              onChange={(e) => setReferenceYear(Number(e.target.value))}
            >
              {viewYears.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </BaziSelect>
          </BaziField>
        </div>

        {/* Chỉ hiện khi giờ 23:00–23:59 */}
        {sensitiveHour ? (
          <div className="rounded-lg border border-accent/40 bg-accent-light/60 px-3 py-3">
            <fieldset>
              <legend className="text-sm font-bold text-foreground">
                Quy ước Giờ Tý
              </legend>
              <p className="mt-1.5 text-[13px] font-semibold leading-snug text-accent">
                Giờ sinh bạn vừa nhập nằm trong khoảng nhạy với quy ước đổi ngày.
                Vui lòng chọn quy ước Giờ Tý phù hợp với trường phái sử dụng.
              </p>
              <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {(["midnight_00", "zi_start_23"] as const).map((mode) => {
                  const preview = boundaryPreview?.[mode];
                  return (
                    <label
                      key={mode}
                      className={`flex cursor-pointer items-start gap-2.5 rounded-md border px-3 py-2.5 text-sm transition ${
                        dayBoundaryMode === mode
                          ? "border-accent bg-surface shadow-sm"
                          : "border-border bg-surface hover:border-border-strong"
                      }`}
                    >
                      <input
                        type="radio"
                        name="dayBoundaryMode"
                        className="mt-1 accent-[var(--accent)]"
                        checked={dayBoundaryMode === mode}
                        onChange={() => setDayBoundaryMode(mode)}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="font-bold text-foreground">
                          {dayBoundaryOptionLabel(mode)}
                        </span>
                        <span className="block text-xs text-muted">
                          {dayBoundaryOptionHint(mode)}
                        </span>
                        {preview ? (
                          <span className="mt-1 block text-xs font-semibold text-foreground">
                            Nhật: {preview.day}
                            <br />
                            Thời: {preview.hour}
                          </span>
                        ) : null}
                      </span>
                    </label>
                  );
                })}
              </div>
            </fieldset>
          </div>
        ) : null}

        <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
          <BaziButton type="submit" disabled={isLoading}>
            {isLoading ? t("form.calculating") : t("form.submit")}
          </BaziButton>
          <button
            type="button"
            onClick={() => setReadingOpen(true)}
            className="inline-flex min-w-[8.5rem] items-center justify-center gap-2 rounded-lg bg-[#2f6f5e] px-6 py-3 text-sm font-bold uppercase tracking-wide text-white shadow-lg transition hover:opacity-95"
          >
            Đăng ký luận giải
          </button>
        </div>
      </form>

      {error ? (
        <div className="mx-6 mb-6 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-[13px] font-bold text-red-600">
          {error}
        </div>
      ) : null}

      <ReadingRegisterModal
        open={readingOpen}
        onClose={() => setReadingOpen(false)}
        chartId={null}
      />
    </BaziCard>
  );
}

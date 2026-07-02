"use client";

import type { Gender } from "@/lib/bazi-schema";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { BaziButton, BaziCard, BaziField, BaziInput, BaziSelect } from "./bazi-ui";

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

  const [fullName, setFullName] = useState("");
  const [birthPlace, setBirthPlace] = useState("");
  const [day, setDay] = useState(1);
  const [month, setMonth] = useState(1);
  const [year, setYear] = useState(1990);
  const [hour, setHour] = useState(12);
  const [minute, setMinute] = useState(0);
  const [gender, setGender] = useState<Gender>("male");
  const [timezone, setTimezone] = useState("Asia/Ho_Chi_Minh");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const maxDay = useMemo(() => daysInMonth(year, month), [year, month]);

  const years = useMemo(() => {
    const list: number[] = [];
    for (let y = now.getFullYear(); y >= 1920; y--) list.push(y);
    return list;
  }, [now]);

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
          hour,
          minute,
          second: 0,
          timezone,
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
        router.push(`/chart/${data.chartId}`);
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
    <BaziCard className="overflow-hidden border-[#ccc] shadow-sm">
      <div className="border-b border-[#ddd] px-6 py-4">
        <h2 className="text-lg font-bold text-[#222]">
          Lập lá số <span className="text-[#c0392b]">Tứ Trụ</span>
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 p-6">
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

          <BaziField label="Năm" htmlFor="year">
            <BaziSelect
              id="year"
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

        <div className="grid grid-cols-3 gap-3">
          <BaziField label="Giờ" htmlFor="hour">
            <BaziSelect
              id="hour"
              value={hour}
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

        <div className="grid grid-cols-2 gap-3">
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
        </div>

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

        <div className="pt-2">
          <BaziButton
            type="submit"
            disabled={isLoading}
            className="w-auto px-8"
            variant="secondary"
          >
            {isLoading ? t("form.calculating") : "Tạo lá số"}
          </BaziButton>
        </div>
      </form>

      {error ? (
        <div className="mx-6 mb-6 border border-[#ddb8b0] bg-[#faf0ee] px-4 py-3 text-sm font-medium text-[#a83828]">
          {error}
        </div>
      ) : null}
    </BaziCard>
  );
}

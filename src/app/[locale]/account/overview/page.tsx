import { AccountPageFrame } from "@/components/account/account-page-frame";
import { AccountPanel, AccountSection } from "@/components/account/account-panel";
import { AccountProgressTimeline } from "@/components/account/account-progress";
import { getAccountProfile } from "@/lib/account/get-account-context";
import { Link } from "@/i18n/navigation";
import { READING_UI } from "@/components/reading/reading-ui-theme";
import { setRequestLocale } from "next-intl/server";

type Props = { params: Promise<{ locale: string }> };

export default async function AccountOverviewPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const profile = await getAccountProfile();
  const p = profile.pillars;

  return (
    <AccountPageFrame active="overview">
      <AccountPanel
        title="Tổng quan Mệnh cục"
        action={
          <p className="text-[11px] font-semibold text-muted">
            Cập nhật lúc: {profile.updatedAtLabel}
          </p>
        }
      >
        <p className="text-sm font-semibold text-foreground">
          Tiến độ luận giải:{" "}
          <span className="text-accent">Đang phân tích chuyên sâu</span>
        </p>
        <div className="mt-3">
          <AccountProgressTimeline
            percent={profile.progressPercent}
            steps={profile.progressSteps}
            compact
          />
        </div>

        <AccountSection title="Phân tích Tứ trụ (bản mệnh)">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {(
              [
                ["Năm", p.year],
                ["Tháng", p.month],
                ["Ngày", p.day],
                ["Giờ", p.hour],
              ] as const
            ).map(([label, cell]) => (
              <div
                key={label}
                className="rounded-xl px-3 py-3 text-center"
                style={{
                  backgroundColor: READING_UI.surfaceMuted,
                  border: `1px solid ${READING_UI.borderSoft}`,
                }}
              >
                <p className="text-[11px] font-bold uppercase text-muted">
                  {label}
                </p>
                <p className="mt-1 text-lg font-black text-foreground">
                  {cell.gan}
                </p>
                <p className="text-base font-bold text-accent">{cell.zhi}</p>
                <p className="mt-1 text-[11px] text-muted">{cell.note}</p>
              </div>
            ))}
          </div>
          {profile.chartId ? (
            <p className="mt-2 text-xs">
              <Link
                href={`/chart/${profile.chartId}`}
                className="font-bold text-accent hover:underline"
              >
                Mở lá số đầy đủ →
              </Link>
            </p>
          ) : null}
        </AccountSection>

        <AccountSection title="Cấu trúc ngũ hành & Dụng thần">
          <div className="grid gap-3 sm:grid-cols-2">
            <div
              className="rounded-xl px-4 py-3 text-sm"
              style={{
                backgroundColor: READING_UI.view.bg,
                border: `1px solid ${READING_UI.view.border}`,
              }}
            >
              <p className="font-bold" style={{ color: READING_UI.view.text }}>
                Biểu đồ ngũ hành (tóm tắt)
              </p>
              <p className="mt-2 text-muted">
                Kim 30% · Thủy 40% · Mộc 10% (suy) · Hỏa 10% (suy) · Thổ 10%
              </p>
              <p className="mt-1 text-xs text-muted">
                * Bản demo — sẽ tính từ engine khi nối luận giải.
              </p>
            </div>
            <div
              className="rounded-xl px-4 py-3 text-sm"
              style={{
                backgroundColor: READING_UI.code.bg,
                border: `1px solid ${READING_UI.code.border}`,
              }}
            >
              <p className="font-bold text-foreground">
                🎯 Dụng thần: {profile.usefulGod.yong}
              </p>
              <p className="mt-1 text-muted">Hỷ: {profile.usefulGod.xi}</p>
              <p className="text-muted">Kỵ: {profile.usefulGod.ji}</p>
              <p className="text-muted">Cừu: {profile.usefulGod.chou}</p>
              <p className="mt-2 text-xs text-muted">{profile.usefulGod.note}</p>
            </div>
          </div>
        </AccountSection>

        <AccountSection title="Đánh giá nhanh năm nay (2026)">
          <ul className="space-y-1.5 text-sm text-foreground">
            <li>🔹 Công việc: {profile.yearQuick.work}</li>
            <li>🔹 Tài lộc: {profile.yearQuick.wealth}</li>
            <li>🔹 Lời khuyên: {profile.yearQuick.advice}</li>
          </ul>
        </AccountSection>
      </AccountPanel>
    </AccountPageFrame>
  );
}

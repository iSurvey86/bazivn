import { AccountPageFrame } from "@/components/account/account-page-frame";
import { AccountPanel, AccountSection } from "@/components/account/account-panel";
import { getAccountProfile } from "@/lib/account/get-account-context";
import { READING_UI } from "@/components/reading/reading-ui-theme";
import { setRequestLocale } from "next-intl/server";

type Props = { params: Promise<{ locale: string }> };

export default async function AccountDayunPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const profile = await getAccountProfile();

  return (
    <AccountPageFrame active="dayun">
      <AccountPanel title="Bản đồ Đại vận (chu kỳ 10 năm)">
        <p className="text-sm text-muted">{profile.dayunSummary}</p>

        <AccountSection title="Khởi vận · các kỳ">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {profile.dayunPeriods.map((d) => (
              <div
                key={d.range}
                className="min-w-[7.5rem] shrink-0 rounded-xl px-3 py-3 text-center"
                style={{
                  backgroundColor: d.current
                    ? READING_UI.code.bg
                    : READING_UI.surfaceMuted,
                  border: `1px solid ${
                    d.current ? READING_UI.confirm.bg : READING_UI.borderSoft
                  }`,
                }}
              >
                {d.current ? (
                  <p className="text-[10px] font-bold text-accent">▼ Hiện tại</p>
                ) : (
                  <p className="text-[10px] text-transparent">.</p>
                )}
                <p className="text-[11px] font-semibold text-muted">{d.range}</p>
                <p className="mt-1 text-sm font-black text-foreground">
                  {d.ganZhi}
                </p>
                <p className="mt-0.5 text-xs font-bold text-accent">{d.tone}</p>
              </div>
            ))}
          </div>
        </AccountSection>

        <AccountSection title="Chi tiết đại vận hiện tại">
          <ul className="space-y-1.5 text-sm text-foreground">
            {profile.currentDayunDetail.map((line) => (
              <li key={line}>• {line}</li>
            ))}
          </ul>
        </AccountSection>

        <AccountSection title="Phân tích lưu niên">
          <ul className="space-y-2">
            {profile.liuNian.map((ln) => (
              <li
                key={ln.year}
                className="rounded-xl px-3 py-2.5 text-sm"
                style={{
                  backgroundColor: ln.highlight
                    ? READING_UI.code.bg
                    : READING_UI.surfaceMuted,
                  border: `1px solid ${
                    ln.highlight ? READING_UI.code.border : READING_UI.borderSoft
                  }`,
                }}
              >
                <span className="font-bold text-foreground">{ln.year}</span>
                {ln.highlight ? (
                  <span className="ml-2 text-xs font-bold text-accent">
                    Năm nay
                  </span>
                ) : null}
                <p className="mt-0.5 text-muted">{ln.note}</p>
              </li>
            ))}
          </ul>
        </AccountSection>
      </AccountPanel>
    </AccountPageFrame>
  );
}

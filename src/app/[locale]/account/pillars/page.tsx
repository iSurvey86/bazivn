import { AccountPageFrame } from "@/components/account/account-page-frame";
import { AccountPanel, AccountSection } from "@/components/account/account-panel";
import { getAccountProfile } from "@/lib/account/get-account-context";
import { READING_UI } from "@/components/reading/reading-ui-theme";
import { setRequestLocale } from "next-intl/server";

type Props = { params: Promise<{ locale: string }> };

export default async function AccountPillarsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const profile = await getAccountProfile();
  const p = profile.pillars;
  const houses = [
    { title: "Cung Tử tức (Giờ)", cell: p.hour },
    { title: "Cung Phu thê (Ngày)", cell: p.day },
    { title: "Cung Huynh đệ (Tháng)", cell: p.month },
    { title: "Cung Phụ mẫu (Năm)", cell: p.year },
  ];

  return (
    <AccountPageFrame active="pillars">
      <AccountPanel title="Chi tiết Tứ Trụ & mối quan hệ cung vị">
        <AccountSection title="Bản đồ can chi">
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {houses.map((h) => (
              <div
                key={h.title}
                className="rounded-xl px-3 py-3"
                style={{
                  backgroundColor: READING_UI.surfaceMuted,
                  border: `1px solid ${READING_UI.borderSoft}`,
                }}
              >
                <p className="text-[11px] font-bold uppercase text-muted">
                  {h.title}
                </p>
                <p className="mt-2 text-center text-xl font-black text-foreground">
                  {h.cell.gan}
                </p>
                <p className="text-center text-lg font-bold text-accent">
                  {h.cell.zhi}
                </p>
              </div>
            ))}
          </div>
        </AccountSection>

        <AccountSection title="Phân tích tương tác (hình · xung · khắc · hợp)">
          <ol className="list-decimal space-y-2 pl-5 text-sm text-foreground">
            {profile.relations.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ol>
        </AccountSection>

        <AccountSection title="Thần sát chủ đạo">
          <ul className="space-y-2 text-sm text-foreground">
            {profile.shenSha.map((s) => (
              <li key={s}>✦ {s}</li>
            ))}
          </ul>
        </AccountSection>
      </AccountPanel>
    </AccountPageFrame>
  );
}

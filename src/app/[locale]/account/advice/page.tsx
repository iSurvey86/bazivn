import { AccountPageFrame } from "@/components/account/account-page-frame";
import { AccountPanel, AccountSection } from "@/components/account/account-panel";
import { getAccountProfile } from "@/lib/account/get-account-context";
import { READING_UI } from "@/components/reading/reading-ui-theme";
import { setRequestLocale } from "next-intl/server";

type Props = { params: Promise<{ locale: string }> };

export default async function AccountAdvicePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const profile = await getAccountProfile();

  return (
    <AccountPageFrame active="advice">
      <AccountPanel title="Khuyến nghị cải vận & giải đáp câu hỏi">
        <AccountSection title="I. Ứng dụng dụng thần">
          <ul className="space-y-1.5 text-sm text-foreground">
            <li>🎨 Màu sắc may mắn: {profile.colors}</li>
            <li>🧭 Phương hướng: {profile.directions}</li>
            <li>💼 Lĩnh vực: {profile.careers}</li>
            <li>
              🎯 Dụng thần: {profile.usefulGod.yong} · Hỷ {profile.usefulGod.xi} ·
              Kỵ {profile.usefulGod.ji}
            </li>
          </ul>
        </AccountSection>

        <AccountSection title="II. Trả lời câu hỏi từ đương số">
          <div className="space-y-3">
            {profile.qa.map((item, i) => (
              <div
                key={item.question}
                className="rounded-xl px-4 py-3"
                style={{
                  backgroundColor: READING_UI.surfaceMuted,
                  border: `1px solid ${READING_UI.borderSoft}`,
                }}
              >
                <p className="text-sm font-bold text-foreground">
                  ❓ Câu {i + 1}: {item.question}
                </p>
                <p className="mt-2 text-sm text-muted">
                  💡 Luận giải: {item.answer}
                </p>
              </div>
            ))}
          </div>
        </AccountSection>
      </AccountPanel>
    </AccountPageFrame>
  );
}

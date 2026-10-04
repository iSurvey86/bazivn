import { AccountJournalClient } from "@/components/account/account-journal-client";
import { AccountPageFrame } from "@/components/account/account-page-frame";
import { AccountPanel } from "@/components/account/account-panel";
import { getAccountProfile } from "@/lib/account/get-account-context";
import { setRequestLocale } from "next-intl/server";

type Props = { params: Promise<{ locale: string }> };

export default async function AccountJournalPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const profile = await getAccountProfile();

  return (
    <AccountPageFrame active="journal">
      <AccountPanel title="Nhật ký nghiệm chứng và theo dõi vận trình">
        <p className="mb-4 text-sm text-muted">
          Dữ liệu bạn ghi chép giúp tối ưu hóa và tinh chỉnh ứng kỳ trong tương
          lai.
        </p>
        <AccountJournalClient initial={profile.journal} />
      </AccountPanel>
    </AccountPageFrame>
  );
}

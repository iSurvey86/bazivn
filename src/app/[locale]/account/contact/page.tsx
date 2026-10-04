import { AccountPageFrame } from "@/components/account/account-page-frame";
import { AccountPanel } from "@/components/account/account-panel";
import { READING_UI } from "@/components/reading/reading-ui-theme";
import { setRequestLocale } from "next-intl/server";

type Props = { params: Promise<{ locale: string }> };

export default async function AccountContactPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <AccountPageFrame active="contact">
      <AccountPanel title="Liên hệ chuyên gia">
        <p className="text-sm text-muted">
          Khi cần hỏi thêm về mệnh thư đang luận, gửi tin nhắn cho chuyên gia phụ
          trách hồ sơ của bạn.
        </p>
        <div
          className="mt-4 rounded-xl px-4 py-4 text-sm"
          style={{
            backgroundColor: READING_UI.surfaceMuted,
            border: `1px solid ${READING_UI.borderSoft}`,
          }}
        >
          <p className="font-bold text-foreground">Kênh hỗ trợ demo</p>
          <p className="mt-2 text-muted">Email: cskh@bazivn.local</p>
          <p className="text-muted">
            Ghi rõ Mã mệnh thư trong tiêu đề để đối soát hồ sơ.
          </p>
          <a
            href="mailto:cskh@bazivn.local?subject=Lien%20he%20chuyen%20gia%20menh%20thu"
            className="mt-4 inline-flex rounded-xl px-4 py-2.5 text-sm font-bold text-white"
            style={{ backgroundColor: READING_UI.confirm.bg }}
          >
            Mở email liên hệ
          </a>
        </div>
      </AccountPanel>
    </AccountPageFrame>
  );
}

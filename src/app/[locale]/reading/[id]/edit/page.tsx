import { BaziCard, BaziShell } from "@/components/bazi/bazi-ui";
import { ReadingBasicForm } from "@/components/reading/reading-basic-form";
import { ReadingCodeBanner } from "@/components/reading/reading-code-banner";
import { getReadingOrder } from "@/lib/reading/repository";
import { Link } from "@/i18n/navigation";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export default async function ReadingEditPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const order = await getReadingOrder(id);
  if (!order) notFound();

  return (
    <BaziShell>
      <main className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6">
        <Link
          href={`/reading/${order.id}/review`}
          className="text-sm font-bold text-muted transition hover:text-accent"
        >
          ← Quay lại kiểm tra
        </Link>
        <BaziCard className="mt-6 p-6" elevated>
          <ReadingCodeBanner order={order} subtitle="Sửa thông tin" />
          <h1 className="text-xl font-bold text-foreground">
            Sửa thông tin lá số
          </h1>
          <p className="mt-1 text-sm text-muted">
            Sau khi lưu, dữ liệu sẽ được khóa lại để kiểm tra.
          </p>
          <div className="mt-6">
            <ReadingBasicForm
              orderId={order.id}
              mode="edit"
              initial={order.lockedSnapshot}
            />
          </div>
        </BaziCard>
      </main>
    </BaziShell>
  );
}

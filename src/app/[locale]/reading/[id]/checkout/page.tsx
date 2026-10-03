import { BaziCard, BaziShell } from "@/components/bazi/bazi-ui";
import { ReadingCheckoutClient } from "@/components/reading/reading-checkout-client";
import { getReadingOrder } from "@/lib/reading/repository";
import { Link } from "@/i18n/navigation";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export default async function ReadingCheckoutPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const order = await getReadingOrder(id);
  if (!order) notFound();

  return (
    <BaziShell>
      <main className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6">
        <Link
          href={`/reading/${order.id}/intake`}
          className="text-sm font-bold text-muted transition hover:text-accent"
        >
          ← Quay lại form
        </Link>
        <BaziCard className="mt-6 p-6" elevated>
          <ReadingCheckoutClient order={order} />
        </BaziCard>
      </main>
    </BaziShell>
  );
}

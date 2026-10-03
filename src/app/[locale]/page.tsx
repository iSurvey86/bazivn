import { BaziShell } from "@/components/bazi/bazi-ui";
import { Link } from "@/i18n/navigation";
import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";

type HomePageProps = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("home");
  const tCommon = await getTranslations("common");

  return (
    <BaziShell>
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-[440px] rounded-2xl border border-gray-200/80 bg-white p-8 shadow-2xl">
          <p className="text-center text-[10px] font-extrabold tracking-[0.25em] text-warm">
            BAZIVN
          </p>
          <h1 className="mt-2 text-center font-black tracking-tight">
            <span className="block text-2xl uppercase text-accent">
              {t("titleLine1")}
            </span>
            <span className="mt-1 block text-xl uppercase tracking-wide text-warm">
              {t("titleLine2")}
            </span>
          </h1>
          <div className="mt-8 flex justify-center">
            <Link
              href="/bazi"
              className="inline-flex min-w-[15rem] items-center justify-center rounded-lg bg-accent px-10 py-3 text-sm font-bold uppercase tracking-wide text-white shadow-lg transition hover:bg-accent-hover"
            >
              {tCommon("homeCta")}
            </Link>
          </div>
        </div>
      </main>
    </BaziShell>
  );
}

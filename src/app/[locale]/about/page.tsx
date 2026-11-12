import { pageMeta } from "@/lib/seo";
import { Boxes, ShieldCheck, Zap } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return pageMeta(locale, "/about", { ns: "about", desc: "intro" });
}
export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("about");

  const values = [
    { icon: ShieldCheck, title: t("v1Title"), text: t("v1Text") },
    { icon: Boxes, title: t("v2Title"), text: t("v2Text") },
    { icon: Zap, title: t("v3Title"), text: t("v3Text") },
  ];

  return (
    <>
      <section className="bg-linear-to-b from-brand-50 to-white">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:py-24">
          <h1 className="text-4xl font-extrabold text-brand-900 sm:text-5xl">
            {t("title")}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-600">
            {t("intro")}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-5 md:grid-cols-3">
          {values.map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="rounded-3xl border border-brand-100 bg-white p-7 shadow-sm"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-100 text-brand-700">
                <Icon size={24} />
              </div>
              <h2 className="text-lg font-bold text-brand-900">{title}</h2>
              <p className="mt-2 text-slate-600">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20">
        <div className="rounded-3xl bg-linear-to-br from-brand-600 to-brand-500 px-6 py-12 text-center text-white sm:px-12">
          <h2 className="text-2xl font-extrabold sm:text-3xl">
            {t("ctaTitle")}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-brand-50">{t("ctaText")}</p>
          <Link
            href="/catalogue"
            className="mt-7 inline-block rounded-full bg-accent-600 px-8 py-3 font-bold text-white transition-colors hover:bg-accent-700"
          >
            {t("ctaButton")}
          </Link>
        </div>
      </section>
    </>
  );
}
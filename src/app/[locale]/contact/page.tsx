import { pageMeta } from "@/lib/seo";
import { Mail, MapPin, Phone } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { site, whatsappUrl } from "@/lib/site";
import WhatsAppIcon from "@/components/WhatsAppIcon";

function InfoCard({
  icon,
  label,
  children,
  tile = "bg-brand-100 text-brand-700",
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
  tile?: string;
}) {
  return (
    <div className="flex w-full flex-col items-center rounded-3xl border border-brand-100 bg-white p-6 text-center shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-brand-100 sm:w-72 lg:w-64">
      <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl ${tile}`}>
        {icon}
      </div>
      <h2 className="font-bold text-brand-900">{label}</h2>
      <div className="mt-3 flex w-full flex-1 flex-col items-center gap-4 text-slate-600">{children}</div>
    </div>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return pageMeta(locale, "/contact", { ns: "contact", desc: "subtitle" });
}
export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("contact");

  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-3xl font-extrabold text-brand-900 sm:text-4xl">
        {t("title")}
      </h1>
      <p className="mt-2 text-slate-600">{t("subtitle")}</p>

      <div className="mt-10 flex flex-wrap justify-center gap-5">
        {site.whatsapp && (
          <InfoCard
            icon={<WhatsAppIcon size={26} />}
            tile="bg-[#25D366] text-white"
            label={t("whatsapp")}
          >
            <p>{t("whatsappText")}</p>
            <a
              href={whatsappUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-auto inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#1fb957]"
            >
              <WhatsAppIcon size={18} />
              {t("whatsappCta")}
            </a>
          </InfoCard>
        )}

        {site.phone && (
          <InfoCard icon={<Phone size={24} />} label={t("phone")}>
            <a
              href={`tel:${site.phone.replace(/\s/g, "")}`}
              dir="ltr"
              className="mt-auto inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-700"
            >
              <Phone size={16} />{site.phone}
            </a>
          </InfoCard>
        )}

        {site.email && (
          <InfoCard icon={<Mail size={24} />} label={t("email")}>
            <a
              href={`mailto:${site.email}`}
              dir="ltr"
              className="font-semibold text-brand-700 hover:underline"
            >
              {site.email}
            </a>
          </InfoCard>
        )}

        {site.address && (
          <InfoCard icon={<MapPin size={24} />} label={t("address")}>
            <p>{site.address}</p>
          </InfoCard>
        )}
      </div>

      <div className="mt-10 rounded-3xl bg-brand-50 p-8 text-center">
        <h2 className="text-xl font-extrabold text-brand-900">
          {t("quoteTitle")}
        </h2>
        <Link
          href="/cart"
          className="mt-5 inline-block rounded-full bg-brand-600 px-7 py-3 font-semibold text-white transition-colors hover:bg-brand-700"
        >
          {t("quoteCta")}
        </Link>
      </div>
    </section>
  );
}
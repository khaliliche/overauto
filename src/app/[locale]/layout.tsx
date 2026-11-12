import CartBubble from "@/components/CartBubble";
import JsonLd from "@/components/JsonLd";
import { googleVerification, siteJsonLd, siteUrl } from "@/lib/seo";
import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Cairo } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CartProvider } from "@/lib/cart";
import "../globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  display: "swap",
});

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    metadataBase: new URL(siteUrl),
    title: { default: t("title"), template: "%s | Sile Chemicals" },
    description: t("description"),
    applicationName: "Sile Chemicals",
    verification: googleVerification
      ? { google: googleVerification }
      : undefined,
  };
}
export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  return (
    <html
      lang={locale}
      dir={locale === "ar" ? "rtl" : "ltr"}
      className={`${jakarta.variable} ${cairo.variable}`}
    >
      <body className="flex min-h-screen flex-col bg-white text-slate-800 antialiased">
        <JsonLd data={siteJsonLd(locale)} />
        <NextIntlClientProvider><CartProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <CartBubble />
        </CartProvider></NextIntlClientProvider>
      </body>
    </html>
  );
}
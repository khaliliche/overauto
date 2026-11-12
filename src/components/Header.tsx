"use client";

import { useState } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Menu, X, ClipboardList } from "lucide-react";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { useCart } from "@/lib/cart";

const links = [
  { href: "/", key: "home" },
  { href: "/catalogue", key: "catalogue" },
  { href: "/about", key: "about" },
  { href: "/contact", key: "contact" },
] as const;

const labels: Record<string, string> = { fr: "FR", ar: "عربي", en: "EN" };

export default function Header() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { count } = useCart();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 border-b border-brand-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4">
        <Link href="/" aria-label="Sile Chemicals" className="flex items-center">
          <Image
            src="/logo.png"
            alt="Sile Chemicals"
            width={800}
            height={192}
            priority
            className="h-9 w-auto sm:h-11"
          />
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {links.map((l) => (
            <Link
              key={l.key}
              href={l.href}
              className={`text-sm font-semibold transition-colors hover:text-brand-600 ${
                isActive(l.href) ? "text-brand-600" : "text-slate-600"
              }`}
            >
              {t(l.key)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div className="flex overflow-hidden rounded-full border border-brand-200 text-xs font-bold">
            {routing.locales.map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => router.replace(pathname, { locale: l })}
                className={`px-3 py-1.5 transition-colors ${
                  locale === l
                    ? "bg-brand-600 text-white"
                    : "text-slate-600 hover:bg-brand-50"
                }`}
              >
                {labels[l]}
              </button>
            ))}
          </div>

          <Link
            href="/cart"
            className="flex items-center gap-1.5 rounded-full bg-accent-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-accent-700"
          >
            <ClipboardList size={16} />
            <span className="hidden sm:inline">{t("quote")}</span>{count > 0 && <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-600 px-1 text-[11px] font-bold text-white">{count}</span>}
          </Link>

          <button
            type="button"
            aria-label={t("menu")}
            onClick={() => setOpen((v) => !v)}
            className="rounded-full p-2 text-slate-700 hover:bg-brand-50 md:hidden"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-brand-100 bg-white px-4 py-3 md:hidden">
          {links.map((l) => (
            <Link
              key={l.key}
              href={l.href}
              onClick={() => setOpen(false)}
              className={`block rounded-lg px-3 py-3 text-sm font-semibold ${
                isActive(l.href)
                  ? "bg-brand-50 text-brand-600"
                  : "text-slate-700"
              }`}
            >
              {t(l.key)}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
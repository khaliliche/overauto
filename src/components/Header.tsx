"use client";

import { useState } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Menu, Search, ShoppingCart, X } from "lucide-react";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/money";
import TriStripe from "./TriStripe";

const links = [
  { href: "/", key: "home" },
  { href: "/catalogue", key: "catalogue" },
  { href: "/about", key: "about" },
  { href: "/contact", key: "contact" },
] as const;

const labels: Record<string, string> = { fr: "FR", ar: "عربي", en: "EN" };

export default function Header() {
  const t = useTranslations("nav");
  const tb = useTranslations("topbar");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const { count, subtotal } = useCart();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  function onSearch(e: React.FormEvent) {
    e.preventDefault();
    const s = q.trim();
    setOpen(false);
    router.push(s ? `/catalogue?q=${encodeURIComponent(s)}` : "/catalogue");
  }

  const searchBox = (
    <form onSubmit={onSearch} className="relative w-full">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={t("search")}
        className="w-full rounded-sm border border-zinc-300 bg-zinc-50 py-2.5 pe-11 ps-4 text-sm outline-none focus:border-brand-600 focus:bg-white"
      />
      <button
        type="submit"
        aria-label={t("search")}
        className="absolute end-0 top-0 flex h-full w-10 items-center justify-center text-zinc-500 hover:text-brand-600"
      >
        <Search size={18} />
      </button>
    </form>
  );

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="bg-accent-700 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-6 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wide sm:justify-between">
          <span>{tb("a")}</span>
          <span className="hidden sm:inline">{tb("b")}</span>
          <span className="hidden md:inline">{tb("c")}</span>
        </div>
      </div>

      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4">
        <Link href="/" aria-label="Over Auto" className="flex shrink-0 items-center">
          <Image
            src="/logo.png"
            alt="Over Auto"
            width={800}
            height={403}
            priority
            className="h-11 w-auto"
          />
        </Link>

        <nav className="ms-4 hidden items-center gap-6 lg:flex">
          {links.map((l) => (
            <Link
              key={l.key}
              href={l.href}
              className={`font-display text-[15px] font-bold uppercase tracking-wide transition-colors hover:text-brand-600 ${
                isActive(l.href) ? "text-brand-600" : "text-zinc-800"
              }`}
            >
              {t(l.key)}
            </Link>
          ))}
        </nav>

        <div className="mx-2 hidden max-w-md flex-1 md:block">{searchBox}</div>

        <div className="ms-auto flex items-center gap-2 md:ms-0">
          <div className="hidden overflow-hidden rounded-sm border border-zinc-300 text-xs font-bold sm:flex">
            {routing.locales.map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => router.replace(pathname, { locale: l })}
                className={`px-2.5 py-1.5 transition-colors ${
                  locale === l
                    ? "bg-accent-700 text-white"
                    : "text-zinc-600 hover:bg-zinc-100"
                }`}
              >
                {labels[l]}
              </button>
            ))}
          </div>

          <Link
            href="/cart"
            className="flex items-center gap-2 rounded-sm bg-brand-600 px-3.5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-700"
          >
            <span className="relative">
              <ShoppingCart size={20} />
              {count > 0 && (
                <span className="absolute -end-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-white px-1 text-[10px] font-extrabold text-brand-700">
                  {count}
                </span>
              )}
            </span>
            <span className="hidden sm:inline">
              {count > 0 ? formatPrice(subtotal, locale) : t("cart")}
            </span>
          </Link>

          <button
            type="button"
            aria-label={t("menu")}
            onClick={() => setOpen((v) => !v)}
            className="rounded-sm p-2 text-zinc-800 hover:bg-zinc-100 lg:hidden"
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-zinc-200 bg-white px-4 py-3 lg:hidden">
          <div className="mb-3 md:hidden">{searchBox}</div>
          {links.map((l) => (
            <Link
              key={l.key}
              href={l.href}
              onClick={() => setOpen(false)}
              className={`block rounded-sm px-3 py-3 font-display text-base font-bold uppercase tracking-wide ${
                isActive(l.href)
                  ? "bg-brand-50 text-brand-600"
                  : "text-zinc-800"
              }`}
            >
              {t(l.key)}
            </Link>
          ))}
          <div className="mt-3 flex gap-2 sm:hidden">
            {routing.locales.map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => {
                  setOpen(false);
                  router.replace(pathname, { locale: l });
                }}
                className={`flex-1 rounded-sm border py-2 text-xs font-bold ${
                  locale === l
                    ? "border-accent-700 bg-accent-700 text-white"
                    : "border-zinc-300 text-zinc-600"
                }`}
              >
                {labels[l]}
              </button>
            ))}
          </div>
        </nav>
      )}
      <TriStripe />
    </header>
  );
}

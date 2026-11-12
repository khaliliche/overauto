"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import ProductCard from "./ProductCard";
import { loc, type Category, type Product } from "@/lib/types";

export default function CatalogueGrid({
  products,
  categories,
}: {
  products: Product[];
  categories: Category[];
}) {
  const t = useTranslations("catalogue");
  const locale = useLocale();
  const [q, setQ] = useState("");
  const searchParams = useSearchParams();

  // The active category lives in the URL: /catalogue?category=concentre-5kg
  const param = searchParams.get("category");
  const cat =
    param && categories.some((c) => c.slug === param) ? param : "all";
  const active = categories.find((c) => c.slug === cat);

  // Arriving from a collection card: scroll down to the products.
  const gridRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!new URLSearchParams(window.location.search).get("category")) return;
    const id = requestAnimationFrame(() =>
      gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    );
    return () => cancelAnimationFrame(id);
  }, []);

  function pick(slug: string) {
    const url = new URL(window.location.href);
    if (slug === "all") url.searchParams.delete("category");
    else url.searchParams.set("category", slug);
    window.history.replaceState(null, "", url);
  }

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return products.filter((p) => {
      if (cat !== "all" && p.category?.slug !== cat) return false;
      if (!s) return true;
      return [p.title_fr, p.title_en, p.title_ar].some((x) =>
        x.toLowerCase().includes(s)
      );
    });
  }, [q, cat, products]);

  if (products.length === 0) {
    return (
      <div className="rounded-3xl border-2 border-dashed border-brand-200 bg-brand-50/50 p-14 text-center text-slate-500">
        {t("empty")}
      </div>
    );
  }

  const chip = (active: boolean) =>
    `shrink-0 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-bold transition-colors ${
      active
        ? "border-brand-600 bg-brand-600 text-white"
        : "border-brand-200 text-slate-700 hover:bg-brand-50"
    }`;

  return (
    <div ref={gridRef} className="scroll-mt-24">
      {categories.length > 0 && (
        <div className="-mx-4 mb-6 flex gap-2 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:mx-0 md:flex-wrap md:overflow-visible md:px-0">
          <button
            type="button"
            onClick={() => pick("all")}
            className={chip(cat === "all")}
          >
            {t("all")}
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => pick(c.slug)}
              className={chip(cat === c.slug)}
            >
              {loc(c, "name", locale)}
            </button>
          ))}
        </div>
      )}

      {active && (
        <h2 className="mb-6 text-2xl font-extrabold text-brand-900">
          {loc(active, "name", locale)}
        </h2>
      )}

      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-sm">
          <Search
            size={18}
            className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("search")}
            className="w-full rounded-full border border-brand-200 bg-white py-3 pe-4 ps-11 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
        </div>
        <p className="text-sm font-semibold text-slate-500">
          {t("count", { count: filtered.length })}
        </p>
      </div>

      {filtered.length === 0 ? (
        <p className="py-12 text-center text-slate-500">{t(q.trim() === "" && cat !== "all" ? "emptyCategory" : "noResults")}</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
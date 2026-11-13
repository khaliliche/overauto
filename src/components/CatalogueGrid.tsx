"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import ProductCard from "./ProductCard";
import { loc, type Category, type Product } from "@/lib/types";

type Sort = "new" | "priceAsc" | "priceDesc";

export default function CatalogueGrid({
  products,
  categories,
}: {
  products: Product[];
  categories: Category[];
}) {
  const t = useTranslations("catalogue");
  const locale = useLocale();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(searchParams.get("q") ?? "");
  const [sort, setSort] = useState<Sort>("new");

  // The active category lives in the URL: /catalogue?category=concentre-5kg
  const param = searchParams.get("category");
  const cat =
    param && categories.some((c) => c.slug === param) ? param : "all";
  const active = categories.find((c) => c.slug === cat);

  // Header search sends the visitor here with ?q=... : keep the box in sync.
  const urlQ = searchParams.get("q") ?? "";
  const [prevUrlQ, setPrevUrlQ] = useState(urlQ);
  if (urlQ !== prevUrlQ) {
    setPrevUrlQ(urlQ);
    setQ(urlQ);
  }

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
    const list = products.filter((p) => {
      if (cat !== "all" && p.category?.slug !== cat) return false;
      if (!s) return true;
      return [p.title_fr, p.title_en, p.title_ar].some((x) =>
        x.toLowerCase().includes(s)
      );
    });
    if (sort === "priceAsc") list.sort((a, b) => a.price - b.price);
    if (sort === "priceDesc") list.sort((a, b) => b.price - a.price);
    return list;
  }, [q, cat, sort, products]);

  if (products.length === 0) {
    return (
      <div className="rounded-sm border-2 border-dashed border-zinc-300 bg-zinc-50 p-14 text-center text-zinc-500">
        {t("empty")}
      </div>
    );
  }

  const chip = (isActive: boolean) =>
    `shrink-0 whitespace-nowrap rounded-sm border px-4 py-2 text-sm font-bold transition-colors ${
      isActive
        ? "border-brand-600 bg-brand-600 text-white"
        : "border-zinc-300 bg-white text-zinc-700 hover:border-zinc-900"
    }`;

  return (
    <div ref={gridRef} className="scroll-mt-32">
      {categories.length > 0 && (
        <div className="-mx-4 mb-6 flex gap-2 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:mx-0 md:flex-wrap md:overflow-visible md:px-0">
          <button type="button" onClick={() => pick("all")} className={chip(cat === "all")}>
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
        <h2 className="mb-6 font-display text-3xl font-extrabold uppercase text-zinc-900">
          {loc(active, "name", locale)}
        </h2>
      )}

      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-sm">
          <Search
            size={18}
            className="pointer-events-none absolute start-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
          />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("search")}
            className="w-full rounded-sm border border-zinc-300 bg-white py-2.5 pe-4 ps-10 text-sm outline-none focus:border-brand-600"
          />
        </div>
        <div className="flex items-center gap-4">
          <p className="text-sm font-semibold text-zinc-500">
            {t("count", { count: filtered.length })}
          </p>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            className="rounded-sm border border-zinc-300 bg-white px-3 py-2.5 text-sm font-semibold outline-none focus:border-brand-600"
          >
            <option value="new">{t("sortNew")}</option>
            <option value="priceAsc">{t("sortPriceAsc")}</option>
            <option value="priceDesc">{t("sortPriceDesc")}</option>
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="py-12 text-center text-zinc-500">
          {t(q.trim() === "" && cat !== "all" ? "emptyCategory" : "noResults")}
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}

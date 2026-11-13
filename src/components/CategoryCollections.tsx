import Image from "next/image";
import { ArrowRight, Package } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { COLLECTION_IMAGES } from "@/lib/collections";
import { loc, type Category } from "@/lib/types";

export default function CategoryCollections({
  categories,
  counts,
}: {
  categories: Category[];
  counts: Record<string, number>;
}) {
  const t = useTranslations("home");
  const tc = useTranslations("catalogue");
  const locale = useLocale();

  if (categories.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-14">
      <div className="mb-8 flex items-end justify-between gap-4">
        <h2 className="font-display text-3xl font-extrabold uppercase text-zinc-900 sm:text-4xl">
          {t("collectionsTitle")}
          <span className="mt-2 block h-1 w-16 bg-brand-600" />
        </h2>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
        {categories.map((c) => {
          const name = loc(c, "name", locale);
          const image = COLLECTION_IMAGES[c.slug];
          return (
            <Link
              key={c.id}
              href={{ pathname: "/catalogue", query: { category: c.slug } }}
              className="group relative block aspect-[4/5] overflow-hidden rounded-sm bg-accent-700"
            >
              {image ? (
                <Image
                  src={image}
                  alt={name}
                  fill
                  sizes="(min-width: 1024px) 25vw, 50vw"
                  className="object-cover opacity-80 transition duration-500 group-hover:scale-105 group-hover:opacity-100"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-zinc-600">
                  <Package size={48} />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4">
                <h3 className="font-display text-xl font-extrabold uppercase leading-tight text-white sm:text-2xl">
                  {name}
                </h3>
                <div className="mt-1 flex items-center justify-between text-sm text-zinc-300">
                  <span>{tc("count", { count: counts[c.id] ?? 0 })}</span>
                  <ArrowRight
                    size={18}
                    className="text-white transition group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1"
                  />
                </div>
              </div>
              <span className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-brand-600 transition-transform duration-300 group-hover:scale-x-100" />
            </Link>
          );
        })}
      </div>
    </section>
  );
}

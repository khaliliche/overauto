import Image from "next/image";
import { ArrowRight, Droplets } from "lucide-react";
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
    <section className="mx-auto max-w-6xl px-4 py-14">
      <h2 className="text-center text-2xl font-extrabold text-brand-900 sm:text-3xl">
        {t("collectionsTitle")}
      </h2>
      <p className="mx-auto mb-8 mt-2 max-w-xl text-center text-slate-600">
        {t("collectionsSubtitle")}
      </p>
      <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
        {categories.map((c) => {
          const name = loc(c, "name", locale);
          const image = COLLECTION_IMAGES[c.slug];
          return (
            <Link
              key={c.id}
              href={{ pathname: "/catalogue", query: { category: c.slug } }}
              className="group flex flex-col overflow-hidden rounded-3xl border border-brand-100 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-100"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-brand-50">
                {image ? (
                  <Image
                    src={image}
                    alt={name}
                    fill
                    sizes="(min-width: 1024px) 25vw, 50vw"
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-brand-200">
                    <Droplets size={48} />
                  </div>
                )}
              </div>
              <div className="flex flex-1 flex-col gap-2 p-4">
                <h3 className="line-clamp-2 font-bold text-brand-900">{name}</h3>
                <div className="mt-auto flex items-center justify-between text-sm">
                  <span className="text-slate-500">
                    {tc("count", { count: counts[c.id] ?? 0 })}
                  </span>
                  <ArrowRight
                    size={18}
                    className="text-accent-600 transition group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1"
                  />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

import Image from "next/image";
import { Droplets } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { loc, type Product } from "@/lib/types";
import AvailabilityBadge from "./AvailabilityBadge";

export default function ProductCard({ product }: { product: Product }) {
  const locale = useLocale();
  const t = useTranslations("common");
  const title = loc(product, "title", locale);
  const image = product.images?.[0];

  return (
    <Link
      href={`/catalogue/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-3xl border border-brand-100 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-100"
    >
      <div className="relative aspect-square overflow-hidden bg-brand-50">
        {image ? (
          <Image
            src={image}
            alt={title}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-brand-200">
            <Droplets size={56} />
          </div>
        )}
        <div className="absolute start-3 top-3">
          <AvailabilityBadge value={product.availability} />
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <h3 className="line-clamp-2 font-bold text-brand-900">{title}</h3>
        <div className="mt-auto flex flex-wrap gap-1.5">
          <span className="rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-bold text-brand-700">
            {t("wholesale")}
          </span>
          <span className="rounded-full bg-accent-100 px-2.5 py-1 text-[11px] font-bold text-accent-800">
            {t("pieceByPiece")}
          </span>
        </div>
      </div>
    </Link>
  );
}
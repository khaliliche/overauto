import { useTranslations } from "next-intl";

const styles: Record<string, string> = {
  in_stock: "bg-emerald-600 text-white",
  out_of_stock: "bg-zinc-800 text-white",
  on_request: "bg-amber-500 text-black",
};

export default function AvailabilityBadge({ value }: { value: string }) {
  const t = useTranslations("product.availability");
  return (
    <span
      className={`rounded-sm px-2 py-1 text-[11px] font-bold uppercase tracking-wide ${
        styles[value] ?? styles.in_stock
      }`}
    >
      {t(value as "in_stock")}
    </span>
  );
}

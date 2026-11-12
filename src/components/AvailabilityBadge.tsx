import { useTranslations } from "next-intl";

const styles: Record<string, string> = {
  in_stock: "bg-emerald-100 text-emerald-800",
  out_of_stock: "bg-red-100 text-red-700",
  on_request: "bg-amber-100 text-amber-800",
};

export default function AvailabilityBadge({ value }: { value: string }) {
  const t = useTranslations("product.availability");
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
        styles[value] ?? styles.in_stock
      }`}
    >
      {t(value as "in_stock")}
    </span>
  );
}
import { pageMeta } from "@/lib/seo";
import { setRequestLocale } from "next-intl/server";
import CartView from "@/components/CartView";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return pageMeta(locale, "/cart", { ns: "cart", desc: "subtitle", noindex: true });
}
export default async function CartPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <CartView />;
}
import { createClient } from "@/lib/supabase/server";
import OrdersList from "@/components/admin/OrdersList";
import type { Order } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(300);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-zinc-900">Commandes</h1>
      <OrdersList orders={(data ?? []) as Order[]} />
    </div>
  );
}

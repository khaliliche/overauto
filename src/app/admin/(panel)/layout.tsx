import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "@/components/admin/LogoutButton";

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-brand-100 bg-white">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4">
          <div className="flex items-center gap-6">
            <span className="font-extrabold text-brand-700">
              Over <span className="text-accent-500">Auto</span>{" "}
              <span className="text-xs font-semibold text-slate-400">
                Admin
              </span>
            </span>
            <nav className="flex gap-4 text-sm font-semibold text-slate-600">
              <Link href="/admin/products" className="hover:text-brand-600">
                Produits
              </Link>
              <Link href="/admin/orders" className="hover:text-brand-600">
                Commandes
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Link
              href="/fr"
              target="_blank"
              className="font-semibold text-brand-600 hover:underline"
            >
              Voir le site
            </Link>
            <span className="hidden text-slate-400 sm:inline">
              {user?.email}
            </span>
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
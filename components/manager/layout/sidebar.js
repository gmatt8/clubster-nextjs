"use client";

import { useRouter } from "next/navigation";
import { createBrowserSupabase } from "@/lib/supabase-browser";
import Image from "next/image";
import Link from "next/link";

export default function Sidebar() {
  const router = useRouter();
  const supabase = createBrowserSupabase();

  async function handleLogout() {
    // 1) Esegui il logout su Supabase
    await supabase.auth.signOut();
    // 2) Reindirizza alla home page (app/page.js) corrispondente a "/"
    router.push("/");
  }

  return (
    <aside className="w-64 bg-white border-r border-gray-200 p-4 flex flex-col">
      {/* Logo/Titolo */}
      <div className="relative mb-8 h-20 w-full">
        <Image
          src="/images/clubster-manager-logo-no-bg.png"
          alt="Clubster Manager Logo"
          fill
          className="object-contain"
          priority
        />
      </div>

      {/* Menu di navigazione */}
      <nav className="flex flex-col gap-1">
        <Link
          href="/dashboard/manager/dashboard"
          className="p-2 rounded text-gray-700 hover:bg-purple-50 hover:text-purple-700"
        >
          Dashboard
        </Link>
        <Link
          href="/dashboard/manager/events"
          className="p-2 rounded text-gray-700 hover:bg-purple-50 hover:text-purple-700"
        >
          Events
        </Link>
        <Link
          href="/dashboard/manager/bookings"
          className="p-2 rounded text-gray-700 hover:bg-purple-50 hover:text-purple-700"
        >
          Bookings
        </Link>
        <Link
          href="/dashboard/manager/analytics"
          className="p-2 rounded text-gray-700 hover:bg-purple-50 hover:text-purple-700"
        >
          Analytics
        </Link>
        <Link
          href="/dashboard/manager/payments"
          className="p-2 rounded text-gray-700 hover:bg-purple-50 hover:text-purple-700"
        >
          Payments
        </Link>
      </nav>

      {/* Footer: Settings e Logout */}
      <div className="mt-auto">
        <Link
          href="/dashboard/manager/settings"
          className="block p-2 mb-2 rounded text-gray-700 hover:bg-purple-50 hover:text-purple-700"
        >
          Settings
        </Link>
        <button
          onClick={handleLogout}
          className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}

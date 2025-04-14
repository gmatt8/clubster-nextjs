// component/manager/layout/sidebar.js
"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createBrowserSupabase } from "@/lib/supabase-browser";
import Image from "next/image";
import Link from "next/link";
import {
  HomeIcon,
  CalendarDaysIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  CreditCardIcon,
  Cog6ToothIcon,
  ArrowLeftOnRectangleIcon,
} from "@heroicons/react/24/outline";

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createBrowserSupabase();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/auth/manager/landing");
  }

  // Controlla quale sezione è attiva
  const isDashboard = pathname.startsWith("/manager/dashboard");
  const isEvents = pathname.startsWith("/manager/events");
  const isBookings = pathname.startsWith("/manager/bookings");
  const isAnalytics = pathname.startsWith("/manager/analytics");
  const isPayments = pathname.startsWith("/manager/payments");
  const isSettings = pathname.startsWith("/manager/settings");

  return (
    <aside className="w-64 bg-white border-r border-gray-200 p-4 flex flex-col">
      {/* Logo/Titolo */}
      <div className="relative mb-8 h-20 w-full">
        <Image
          src="/images/clubster-manager-logo.png"
          alt="Clubster Manager Logo"
          fill
          className="object-contain"
          priority
        />
      </div>

      {/* Menu di navigazione */}
      <nav className="flex flex-col gap-1">
        <Link
          href="/manager/dashboard"
          className={`p-2 rounded flex items-center space-x-2 ${
            isDashboard
              ? "bg-purple-50 text-purple-700"
              : "text-gray-700 hover:bg-purple-50 hover:text-purple-700"
          }`}
        >
          <HomeIcon className="h-5 w-5" />
          <span>Dashboard</span>
        </Link>
        <Link
          href="/manager/events"
          className={`p-2 rounded flex items-center space-x-2 ${
            isEvents
              ? "bg-purple-50 text-purple-700"
              : "text-gray-700 hover:bg-purple-50 hover:text-purple-700"
          }`}
        >
          <CalendarDaysIcon className="h-5 w-5" />
          <span>Events</span>
        </Link>
        <Link
          href="/manager/bookings"
          className={`p-2 rounded flex items-center space-x-2 ${
            isBookings
              ? "bg-purple-50 text-purple-700"
              : "text-gray-700 hover:bg-purple-50 hover:text-purple-700"
          }`}
        >
          <ClipboardDocumentListIcon className="h-5 w-5" />
          <span>Bookings</span>
        </Link>
        <Link
          href="/manager/analytics"
          className={`p-2 rounded flex items-center space-x-2 ${
            isAnalytics
              ? "bg-purple-50 text-purple-700"
              : "text-gray-700 hover:bg-purple-50 hover:text-purple-700"
          }`}
        >
          <ChartBarIcon className="h-5 w-5" />
          <span>Analytics</span>
        </Link>
        <Link
          href="/manager/payments"
          className={`p-2 rounded flex items-center space-x-2 ${
            isPayments
              ? "bg-purple-50 text-purple-700"
              : "text-gray-700 hover:bg-purple-50 hover:text-purple-700"
          }`}
        >
          <CreditCardIcon className="h-5 w-5" />
          <span>Payments</span>
        </Link>
      </nav>

      {/* Footer: Settings e Logout */}
      <div className="mt-auto">
        <Link
          href="/manager/settings"
          className={`p-2 mb-2 rounded flex items-center space-x-2 ${
            isSettings
              ? "bg-purple-50 text-purple-700"
              : "text-gray-700 hover:bg-purple-50 hover:text-purple-700"
          }`}
        >
          <Cog6ToothIcon className="h-5 w-5" />
          <span>Settings</span>
        </Link>

        <button
          onClick={handleLogout}
          className="py-2 px-4 flex items-center space-x-2 text-red-600 hover:text-red-700"
        >
          <ArrowLeftOnRectangleIcon className="h-5 w-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

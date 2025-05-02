// apps/web-customer/layout/Header.js
// Enhanced Header component with modern layout
"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabase } from "@lib/supabase-browser";
import Link from "next/link";
import {
  Bars3Icon,
  Cog6ToothIcon,
  ArrowLeftOnRectangleIcon,
  TicketIcon,
} from "@heroicons/react/24/outline";

export default function Header() {
  const router = useRouter();
  const supabase = createBrowserSupabase();
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function getSession() {
      const { data } = await supabase.auth.getSession();
      setUser(data?.session?.user || null);
    }
    getSession();
  }, [supabase]);

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function toggleMenu() {
    setMenuOpen((prev) => !prev);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    await router.push("/");
    router.refresh();
  }

  async function handleLogoClick() {
    await router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/90 backdrop-blur-lg shadow-sm">
      <div className="max-w-screen-xl mx-auto flex items-center justify-between px-4 py-4">
        <div onClick={handleLogoClick} className="cursor-pointer flex items-center">
          <img src="/images/clubster-logo.png" alt="Clubster Logo" className="h-8 w-auto" />
        </div>

        {user ? (
          <div className="relative" ref={menuRef}>
            <button
              onClick={toggleMenu}
              className="p-2 rounded-full hover:bg-gray-100 focus:outline-none"
            >
              <Bars3Icon className="h-6 w-6 text-gray-600" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-md z-50">
                <ul className="py-2 text-gray-700 text-sm">
                  <li
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
                    onClick={() => router.push("/bookings")}
                  >
                    <TicketIcon className="h-5 w-5" /> Tickets
                  </li>
                  <li
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
                    onClick={() => router.push("/settings")}
                  >
                    <Cog6ToothIcon className="h-5 w-5" /> Settings
                  </li>
                  <hr className="my-1" />
                  <li
                    onClick={handleLogout}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2 text-red-600"
                  >
                    <ArrowLeftOnRectangleIcon className="h-5 w-5" /> Log out
                  </li>
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div className="flex gap-3">
            <Link
              href="/login"
              className="px-4 py-1.5 text-sm font-medium border border-purple-600 text-purple-600 rounded-full hover:bg-purple-50 transition"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="px-4 py-1.5 text-sm font-medium bg-purple-600 text-white rounded-full hover:bg-purple-700 transition"
            >
              Sign up
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
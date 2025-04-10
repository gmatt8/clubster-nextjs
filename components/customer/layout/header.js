// app/dashboard/customer/Header.js
"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabase } from "@/lib/supabase-browser";
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

  // Stato per determinare se l'utente è autenticato
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function getSession() {
      const { data } = await supabase.auth.getSession();
      setUser(data?.session?.user || null);
    }
    getSession();
  }, [supabase]);

  // Stato per il menu (per utente loggato)
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Chiude il menu se clicchi fuori
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
    router.push("/"); // reindirizza alla home principale
  }

  return (
    <header className="w-full border-b border-gray-200 bg-white relative">
      <div className="relative flex items-center justify-center py-8">
        {/* Logo a sinistra */}
        <div
          className="absolute left-0 pl-4 cursor-pointer flex items-center"
          onClick={() => router.push("/")}
        >
          <img
            src="/images/clubster-logo.png"
            alt="Clubster Logo"
            className="h-8 w-auto"
          />
        </div>

        {/* Zona a destra: mostra hamburger se loggato, altrimenti i bottoni Login e Signup */}
        <div className="absolute right-0 pr-4">
          {user ? (
            // Utente loggato: mostra il menu hamburger
            <div ref={menuRef}>
              <button
                onClick={toggleMenu}
                className="p-2 rounded hover:bg-gray-100 focus:outline-none"
              >
                <Bars3Icon className="h-6 w-6 text-gray-600" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded shadow-md z-50">
                  <ul className="py-2 text-gray-700">
                    <li
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center space-x-2"
                      onClick={() => router.push("/dashboard/customer/bookings")}
                    >
                      <TicketIcon className="h-5 w-5" />
                      <span>Tickets</span>
                    </li>
                    <li
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center space-x-2"
                      onClick={() => router.push("/dashboard/customer/settings")}
                    >
                      <Cog6ToothIcon className="h-5 w-5" />
                      <span>Settings</span>
                    </li>
                    <hr className="my-1" />
                    <li
                      onClick={handleLogout}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center space-x-2 text-red-600"
                    >
                      <ArrowLeftOnRectangleIcon className="h-5 w-5" />
                      <span>Log out</span>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          ) : (
            // Utente non loggato: mostra i bottoni Login e Signup
            <div className="flex gap-2">
              <Link
                href="/auth/customer/login"
                className="px-4 py-2 border border-purple-600 text-purple-600 bg-transparent rounded-full hover:bg-purple-50 transition-colors"
              >
                Login
              </Link>
              <Link
                href="/auth/customer/signup"
                className="px-4 py-2 border border-purple-600 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors"
              >
                Signup
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

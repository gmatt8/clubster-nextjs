// app/dashboard/customer/Header.js
"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabase } from "@/lib/supabase-browser";
// Importa le icone da Heroicons
import { Bars3Icon, Cog6ToothIcon, ArrowLeftOnRectangleIcon, TicketIcon } from '@heroicons/react/24/outline';

export default function Header() {
  const router = useRouter();
  const supabase = createBrowserSupabase();

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
    router.push("/"); // reindirizza alla home
  }

  return (
    <header className="w-full border-b border-gray-200 bg-white relative">
      {/* Contenitore principale full-width */}
      <div className="relative flex items-center justify-center py-4">
        {/* Testo centrato */}
        <h2 className="text-base sm:text-lg font-medium text-gray-800">
          your night starts here
        </h2>

        {/* Logo posizionato a sinistra, estremo */}
        <div
          className="absolute left-0 pl-4 cursor-pointer flex items-center"
          onClick={() => router.push("/dashboard/customer/home")}
        >
          <img
            src="/images/clubster-logo.png"
            alt="Clubster Logo"
            className="h-8 w-auto"
          />
        </div>

        {/* Hamburger menu posizionato a destra, estremo */}
        <div className="absolute right-0 pr-4" ref={menuRef}>
          <button
            onClick={toggleMenu}
            className="p-2 rounded hover:bg-gray-100 focus:outline-none"
          >
            <Bars3Icon className="h-6 w-6 text-gray-600" />
          </button>

          {/* Menu a tendina */}
          {menuOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded shadow-md z-50">
              <ul className="py-2 text-gray-700">
                {/* Tickets */}
                <li
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center space-x-2"
                  onClick={() => router.push("/dashboard/customer/bookings")}
                >
                  <TicketIcon className="h-5 w-5" />
                  <span>Tickets</span>
                </li>

                {/* Settings */}
                <li
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center space-x-2"
                  onClick={() => router.push("/dashboard/customer/settings")}
                >
                  <Cog6ToothIcon className="h-5 w-5" />
                  <span>Settings</span>
                </li>

                {/* Divider */}
                <hr className="my-1" />

                {/* Log out */}
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
      </div>
    </header>
);
}

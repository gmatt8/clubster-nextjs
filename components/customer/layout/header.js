// app/dashboard/customer/Header.js
"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabase } from "@/lib/supabase-browser";

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
            {/* Icona hamburger */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          {/* Menu a tendina */}
          {menuOpen && (
            <div className="absolute right-0 top-full mt-2 w-44 bg-white border border-gray-200 rounded shadow-md z-50">
              <ul className="py-2 text-gray-700">
                {/* Tickets */}
                <li
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center space-x-2"
                  onClick={() => router.push("/dashboard/customer/bookings")}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 15l-1.5 1.5a2.121 2.121 0 01-3 0l-3-3a2.121 2.121 0 010-3L6 3h12l3 3v6"
                    />
                  </svg>
                  <span>Tickets</span>
                </li>

                {/* Settings */}
                <li
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center space-x-2"
                  onClick={() => router.push("/dashboard/customer/settings")}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M11.049 2.927c.3-.302.683-.427 1.06-.427.379 0 .762.125 1.06.427l1.285 1.286c.342.342.52.78.52 1.22 0 .437-.178.88-.52 1.221l-.751.75a5.989 5.989 0 01-.818 6.92 5.989 5.989 0 01-6.92.818l-.75.751c-.341.342-.78.52-1.221.52-.439 0-.877-.178-1.219-.52L2.927 11.05c-.342-.342-.52-.78-.52-1.22 0-.438.178-.88.52-1.22l.75-.751a5.989 5.989 0 016.92-.818 5.989 5.989 0 01.818-6.92l.751-.75z"
                    />
                  </svg>
                  <span>Settings</span>
                </li>

                {/* Divider */}
                <hr className="my-1" />

                {/* Log out */}
                <li
                  onClick={handleLogout}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center space-x-2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1m0-10V5"
                    />
                  </svg>
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

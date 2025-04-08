// components/customer/layout/Footer.js
"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { createBrowserSupabase } from "@/lib/supabase-browser";

export default function Footer() {
  const supabase = createBrowserSupabase();
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function getSession() {
      const { data } = await supabase.auth.getSession();
      setUser(data?.session?.user || null);
    }
    getSession();
  }, [supabase]);

  return (
    <footer className="bg-purple-100 mt-auto w-full">
      <div className="max-w-screen-xl mx-auto px-6 py-8">
        <div className="flex flex-wrap justify-between gap-8">
          {/* Account: viene visualizzata solo se l'utente è loggato */}
          {user && (
            <div>
              <h3 className="font-semibold mb-2 text-gray-800">Account</h3>
              <ul className="space-y-1">
                <li>
                  <Link
                    href="/dashboard/customer/bookings"
                    className="text-sm text-gray-700 hover:underline"
                  >
                    My tickets
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard/customer/settings"
                    className="text-sm text-gray-700 hover:underline"
                  >
                    Settings
                  </Link>
                </li>
              </ul>
            </div>
          )}

          {/* Support */}
          <div>
            <h3 className="font-semibold mb-2 text-gray-800">Support</h3>
            <ul className="space-y-1">
              <li>
                <Link
                  href="/dashboard/customer/support"
                  className="text-sm text-gray-700 hover:underline"
                >
                  Contact Customer Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Become a partner */}
          <div>
            <h3 className="font-semibold mb-2 text-gray-800">Become a partner</h3>
            <ul className="space-y-1">
              <li>
                <Link
                  href="/auth/manager/landing"
                  className="text-sm text-gray-700 hover:underline"
                >
                  List your club
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold mb-2 text-gray-800">Legal</h3>
            <ul className="space-y-1">
              <li>
                <Link
                  href="/dashboard/customer/terms-of-service"
                  className="text-sm text-gray-700 hover:underline"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/customer/privacy-policy"
                  className="text-sm text-gray-700 hover:underline"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center text-sm text-gray-500 mt-8">
          © 2025 clubster
        </div>
      </div>
    </footer>
  );
}

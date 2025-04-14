// components/customer/layout/Footer.js
"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { createBrowserSupabase } from "@/lib/supabase-browser";

// Importa le icone ufficiali da react-icons
import { FaInstagram } from "react-icons/fa";
import { SiTiktok } from "react-icons/si";
import { FaXTwitter } from "react-icons/fa6";

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
    <footer className="bg-gray-900 mt-auto w-full text-white">
      <div className="max-w-screen-xl mx-auto px-6 py-10">
        {/* Link informativi */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {/* Account: visualizzato solo se l'utente è loggato */}
          {user && (
            <div>
              <h3 className="font-semibold mb-2">Account</h3>
              <ul className="space-y-1">
                <li>
                  <Link
                    href="/customer/bookings"
                    className="text-sm hover:underline"
                  >
                    My tickets
                  </Link>
                </li>
                <li>
                  <Link
                    href="/customer/settings"
                    className="text-sm hover:underline"
                  >
                    Settings
                  </Link>
                </li>
              </ul>
            </div>
          )}
          {/* Support */}
          <div>
            <h3 className="font-semibold mb-2">Support</h3>
            <ul className="space-y-1">
              <li>
                <Link
                  href="/customer/support"
                  className="text-sm hover:underline"
                >
                  Contact Customer Service
                </Link>
              </li>
            </ul>
          </div>
          {/* Become a partner */}
          <div>
            <h3 className="font-semibold mb-2">Become a partner</h3>
            <ul className="space-y-1">
              <li>
                <Link
                  href="/auth/manager/landing"
                  className="text-sm hover:underline"
                >
                  List your club
                </Link>
              </li>
            </ul>
          </div>
          {/* Legal */}
          <div>
            <h3 className="font-semibold mb-2">Legal</h3>
            <ul className="space-y-1">
              <li>
                <Link
                  href="/customer/terms-of-service"
                  className="text-sm hover:underline"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/customer/privacy-policy"
                  className="text-sm hover:underline"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Sezione Social Media e Download App */}
        <div className="mt-10 border-t border-gray-800 pt-6 flex flex-col md:flex-row items-center justify-between">
          {/* Social Icons */}
          <div className="flex space-x-4">
            <Link
              href="https://www.instagram.com/clubster_app"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-400"
            >
              <FaInstagram className="w-6 h-6" />
            </Link>
            <Link
              href="https://www.tiktok.com/@clubsterapp"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-400"
            >
              <SiTiktok className="w-6 h-6" />
            </Link>
            <Link
              href="https://x.com/clubster_app"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-400"
            >
              <FaXTwitter className="w-6 h-6" />
            </Link>
          </div>

          {/* App Download Badges */}
          <div className="flex space-x-4 mt-4 md:mt-0 items-center">
            <Link
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block"
            >
              <img
                src="/images/app-store-badge.svg"
                alt="Download on the App Store"
                className="h-10"
              />
            </Link>
            <Link
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block"
            >
              <img
                src="/images/google-play-badge.png"
                alt="Get it on Google Play"
                className="h-10"
              />
            </Link>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-6 text-center text-sm text-gray-500">
          © 2025 clubster. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

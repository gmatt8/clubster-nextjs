// apps/web-customer/components/layout/footer.js
// Enhanced Footer component
"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { createBrowserSupabase } from "@lib/supabase-browser";
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
    <footer className="bg-gray-900 text-white">
      <div className="max-w-screen-xl mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          <div>
            <h3 className="font-semibold text-lg mb-3">Account</h3>
            <ul className="space-y-2 text-sm">
              {user ? (
                <>
                  <li><Link href="/bookings" className="hover:text-purple-400">My tickets</Link></li>
                  <li><Link href="/settings" className="hover:text-purple-400">Settings</Link></li>
                </>
              ) : (
                <>
                  <li><Link href="/login" className="hover:text-purple-400">Login</Link></li>
                  <li><Link href="/signup" className="hover:text-purple-400">Sign up</Link></li>
                </>
              )}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-3">Support</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/support" className="hover:text-purple-400">Contact Customer Service</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-3">Partners</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="https://www.manager.clubsterhub.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-purple-400"
                >
                  List your club
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-3">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/terms-of-service" className="hover:text-purple-400">Terms of Service</Link></li>
              <li><Link href="/privacy-policy" className="hover:text-purple-400">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col md:flex-row items-center justify-between border-t border-gray-800 pt-6">
          <div className="flex space-x-4 mb-4 md:mb-0">
            <Link href="https://www.instagram.com/clubsterhub" target="_blank" rel="noopener noreferrer" className="hover:text-purple-400">
              <FaInstagram className="w-6 h-6" />
            </Link>
            <Link href="https://www.tiktok.com/@clubsterapp" target="_blank" rel="noopener noreferrer" className="hover:text-purple-400">
              <SiTiktok className="w-6 h-6" />
            </Link>
            <Link href="https://x.com/clubsterhub" target="_blank" rel="noopener noreferrer" className="hover:text-purple-400">
              <FaXTwitter className="w-6 h-6" />
            </Link>
          </div>

          <div className="flex space-x-4 items-center">
            <Link href="#" target="_blank" rel="noopener noreferrer">
              <img src="/images/app-store-badge.svg" alt="App Store" className="h-10" />
            </Link>
            <Link href="#" target="_blank" rel="noopener noreferrer">
              <img src="/images/google-play-badge.png" alt="Google Play" className="h-10" />
            </Link>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-gray-500">© 2025 Clubster. All rights reserved.</p>
      </div>
    </footer>
  );
}
// components/manager/layout/footer.js
"use client";

import Link from "next/link";
import { FaInstagram } from "react-icons/fa";
import { SiTiktok } from "react-icons/si";
import { FaXTwitter } from "react-icons/fa6";

export default function Footer() {
  return (
    <footer className="bg-gray-900 mt-auto w-full text-white">
      <div className="max-w-screen-xl mx-auto px-6 py-10">
        {/* Grid Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {/* Account */}
          <div>
            <h3 className="font-semibold mb-2">Account</h3>
            <ul className="space-y-1">
              <li>
                <Link href="/auth/manager/login" className="text-sm hover:underline">
                  Login
                </Link>
              </li>
              <li>
                <Link href="/auth/manager/signup" className="text-sm hover:underline">
                  Sign up
                </Link>
              </li>
            </ul>
          </div>

          {/* Manage Your Club */}
          <div>
            <h3 className="font-semibold mb-2">Manage Your Club</h3>
            <ul className="space-y-1">
              <li>
                <Link href="/auth/manager/landing" className="text-sm hover:underline">
                  Clubster Manager
                </Link>
              </li>
              <li>
                <Link href="/auth/manager/signup" className="text-sm hover:underline">
                  Start now
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold mb-2">Legal</h3>
            <ul className="space-y-1">
              <li>
                <Link href="/manager/terms-of-service" className="text-sm hover:underline">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/manager/privacy-policy" className="text-sm hover:underline">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-2">Contact</h3>
            <ul className="space-y-1">
              <li>
                <a href="mailto:clubsterapp@hotmail.com" className="text-sm hover:underline">
                  clubsterapp@hotmail.com
                </a>
              </li>
              <li>
                <Link href="/manager/support" className="text-sm hover:underline">
                  Manager Support
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Social & App Badges */}
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
              href="https://www.x.com/clubster_app"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-400"
            >
              <FaXTwitter className="w-6 h-6" />
            </Link>
          </div>

          {/* App Badges */}
          <div className="flex space-x-4 mt-4 md:mt-0 items-center">
            <Link href="#" target="_blank" rel="noopener noreferrer">
              <img
                src="/images/app-store-badge.svg"
                alt="Download on the App Store"
                className="h-10"
              />
            </Link>
            <Link href="#" target="_blank" rel="noopener noreferrer">
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
          © 2025 Clubster. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

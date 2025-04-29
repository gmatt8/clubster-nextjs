// apps/web-manager/app/not-found.js

"use client";

import Link from "next/link";
import Footer from "@/components/layout/footer";

export default function NotFound() {
  return (
    <>
      <main className="w-full bg-[#f8fafc] text-gray-800">
        {/* Header */}
        <header className="w-full flex items-center justify-between px-6 py-4 bg-white shadow-md fixed top-0 left-0 z-50">
          <Link href="/landing">
            <img
              src="/images/clubster-manager-logo.png"
              alt="Clubster Manager Logo"
              className="w-36 h-auto"
            />
          </Link>
          <Link
            href="/login"
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-full shadow transition"
          >
            Login
          </Link>
        </header>

        {/* 404 Page Content */}
        <section className="relative min-h-screen flex flex-col justify-center items-center text-center px-4 pt-32 bg-gradient-to-br from-white via-indigo-50 to-white">
          <div className="max-w-2xl z-10">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              404 - Page Not Found
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-8">
              Oops! The page you are looking for does not exist.
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-full shadow-md transition"
            >
              Back to Home
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </>
  );
}

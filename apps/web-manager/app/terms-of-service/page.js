// apps/web-manager/app/terms-of-service/page.js
"use client";

import Link from "next/link";
import Footer from "@/components/layout/footer";

export default function TermsOfServicePage() {
  return (
    <>
      <main className="w-full bg-[#f8fafc] text-gray-800">
        {/* Header */}
        <header className="w-full flex items-center justify-between px-6 py-4 bg-white shadow-md fixed top-0 left-0 z-50">
          <Link href="/">
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

        {/* Page Content */}
        <section className="relative min-h-screen flex flex-col justify-center items-center px-4 pt-32 pb-20 bg-gradient-to-br from-white via-indigo-50 to-white">
          <div className="max-w-3xl mx-auto text-left px-4">
            <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">Terms of Service</h1>

            <p className="text-gray-700 mb-8 text-lg text-center">
              By accessing or using the Clubster Manager platform, you agree to be bound by these Terms of Service. Please read them carefully.
            </p>

            <div className="space-y-6 text-base leading-7 text-gray-700">
              <section>
                <h2 className="text-xl font-semibold mb-2">1. Account Registration</h2>
                <p>
                  Users must provide accurate and up-to-date information when registering. You are responsible for safeguarding your credentials and activities under your account.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-2">2. Use of Platform</h2>
                <p>
                  You agree to use the platform legally and respectfully. You may not copy, modify, distribute, or exploit the platform without written permission from Clubster.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-2">3. Payment Processing</h2>
                <p>
                  All payment transactions are securely handled through Stripe. Clubster Manager is not liable for issues related to Stripe’s service.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-2">4. Termination</h2>
                <p>
                  We reserve the right to suspend or terminate accounts for violations of these terms or any misuse of the platform.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-2">5. Changes to Terms</h2>
                <p>
                  We may update these Terms from time to time. Continued use of the platform constitutes acceptance of any changes.
                </p>
              </section>
            </div>

            <p className="text-sm text-gray-500 mt-10 text-center">Last updated: April 2025</p>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
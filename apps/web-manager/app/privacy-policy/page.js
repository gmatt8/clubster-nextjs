// apps/web-manager/app/privacy-policy/page.js
"use client";

import Link from "next/link";
import Footer from "@/components/layout/footer";

export default function PrivacyPolicyPage() {
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
            <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">Privacy Policy</h1>

            <p className="text-gray-700 mb-8 text-lg text-center">
              This policy describes how Clubster collects, uses, and protects the personal data of managers who use our platform.
            </p>

            <div className="space-y-6 text-base leading-7 text-gray-700">
              <section>
                <h2 className="text-xl font-semibold mb-2">1. Data We Collect</h2>
                <ul className="list-disc list-inside space-y-1">
                  <li>Email address and login credentials</li>
                  <li>Venue information and uploaded verification documents</li>
                  <li>Banking and tax details (handled securely by Stripe)</li>
                  <li>Event and ticket performance data</li>
                  <li>Usage analytics and platform activity</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-2">2. Purpose of Processing</h2>
                <ul className="list-disc list-inside space-y-1">
                  <li>Verify your business and venue authenticity</li>
                  <li>Comply with legal and regulatory obligations</li>
                  <li>Facilitate event payments and reporting</li>
                  <li>Prevent fraudulent behavior</li>
                  <li>Provide ongoing support and communications</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-2">3. Sharing with Third Parties</h2>
                <p>
                  We share relevant data with Stripe for financial transactions and compliance purposes. Third-party services may be used for fraud prevention and identity verification.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-2">4. Your Rights</h2>
                <ul className="list-disc list-inside space-y-1">
                  <li>Access and review your stored data</li>
                  <li>Request corrections or deletion</li>
                  <li>Export your data at any time upon request</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-2">5. Changes to This Policy</h2>
                <p>
                  We may update this Privacy Policy periodically. Continued use of the platform after updates signifies your agreement with the new terms.
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

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
        <section className="relative min-h-screen flex flex-col justify-center items-center text-center px-4 pt-32 bg-gradient-to-br from-white via-indigo-50 to-white">
          <div className="max-w-screen-md mx-auto text-left px-4">
            <h1 className="text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>

            <p className="text-gray-700 mb-6">
              This policy explains how Clubster collects, uses, and protects the data of event managers using our platform.
            </p>

            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-2">1. Data We Collect</h2>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>Email address and login credentials</li>
                <li>Venue details and documentation for verification</li>
                <li>Bank and tax information (handled by Stripe)</li>
                <li>Event performance and ticketing data</li>
                <li>Platform usage analytics</li>
              </ul>
            </section>

            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-2">2. Purpose of Processing</h2>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>To verify business legitimacy</li>
                <li>To ensure compliance with local and Swiss regulations</li>
                <li>To process event payments and reporting</li>
                <li>To prevent fraudulent activity</li>
                <li>To provide support and communication</li>
              </ul>
            </section>

            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-2">3. Sharing & Third Parties</h2>
              <p className="text-gray-700">
                We share manager data with Stripe for payment and compliance. We may use fraud detection and verification services as needed.
              </p>
            </section>

            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-2">4. Rights of Managers</h2>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>Access and review your personal data</li>
                <li>Request edits or deletion</li>
                <li>Export data upon request</li>
              </ul>
            </section>

            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-2">5. Changes to This Policy</h2>
              <p className="text-gray-700">
                Clubster may revise this policy at any time. Continued use of the platform implies acceptance of updated terms.
              </p>
            </section>

            <p className="text-sm text-gray-500">Last updated: April 2025</p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </>
  );
}

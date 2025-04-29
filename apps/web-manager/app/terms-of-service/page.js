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
        <section className="relative min-h-screen flex flex-col justify-center items-center text-center px-4 pt-32 bg-gradient-to-br from-white via-indigo-50 to-white">
          <div className="max-w-screen-md mx-auto text-left px-4">
            <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms of Service</h1>

            <p className="text-gray-700 mb-6">
              These Terms of Service govern your use of the Clubster Manager platform. By signing up or accessing the platform, you agree to these terms.
            </p>

            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-2">1. Account Registration</h2>
              <p className="text-gray-700">
                Managers must provide accurate and complete information during registration. You are responsible for maintaining the confidentiality of your login credentials.
              </p>
            </section>

            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-2">2. Use of Platform</h2>
              <p className="text-gray-700">
                You agree to use Clubster Manager in compliance with all applicable laws. Unauthorized use, duplication, or reverse engineering of the platform is prohibited.
              </p>
            </section>

            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-2">3. Payment Processing</h2>
              <p className="text-gray-700">
                Payments are processed via Stripe. Clubster Manager is not liable for issues arising from Stripe’s processing services.
              </p>
            </section>

            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-2">4. Termination</h2>
              <p className="text-gray-700">
                Clubster Manager reserves the right to suspend or terminate accounts that violate these terms or engage in harmful activities.
              </p>
            </section>

            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-2">5. Updates to Terms</h2>
              <p className="text-gray-700">
                Clubster may update these terms periodically. Continued use of the platform indicates your acceptance of any changes.
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

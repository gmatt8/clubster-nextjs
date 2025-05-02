// apps/web-customer/app/support/page.js
"use client";

import CustomerLayout from "../CustomerLayout";
import FAQ from "@components/support/FAQ";

export default function SupportPage() {
  return (
    <CustomerLayout>
      <div className="px-6 py-12 max-w-screen-md mx-auto">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-4">
          Need Help?
        </h1>
        <p className="text-center text-gray-600 mb-10">
          We're here to help. Find answers to common questions or contact us directly.
        </p>

        {/* FAQ Section */}
        <section className="mb-12 bg-white border border-gray-200 rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Frequently Asked Questions</h2>
          <FAQ />
        </section>

        {/* Contact Information Section */}
        <section className="text-center">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Still need help?</h2>
          <p className="text-gray-700">
            Reach out to us directly at{" "}
            <a
              href="mailto:clubsterapp@hotmail.com"
              className="text-purple-600 font-medium hover:underline"
            >
              clubsterapp@hotmail.com
            </a>
          </p>
        </section>
      </div>
    </CustomerLayout>
  );
}

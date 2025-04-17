// app/customer/support/page.js
"use client";

import CustomerLayout from "../CustomerLayout";
import FAQ from "@/components/customer/support/FAQ";

export default function SupportPage() {
  return (
    <CustomerLayout>
      <div className="px-6 py-8 max-w-screen-xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Customer Support</h1>
        <p className="text-gray-700 mb-6">
          Welcome to the support section. Here you can find answers to frequently asked questions.
        </p>

        {/* FAQ Section */}
        <section className="mb-12">
          <FAQ />
        </section>

        {/* Contact Information Section */}
        <section className="border-t border-gray-300 pt-6">
          <h2 className="text-xl font-semibold mb-2">For More Information</h2>
          <p className="text-gray-700">
            If you need further assistance, contact us via email at{" "}
            <a
              href="mailto:clubsterapp@hotmail.com"
              className="text-blue-600 hover:underline"
            >
              clubsterapp@hotmail.com
            </a>
          </p>
        </section>
      </div>
    </CustomerLayout>
  );
}

// app/customer/privacy-policy/page.js
"use client";

import CustomerLayout from "../CustomerLayout";

export default function PrivacyPolicyPage() {
  return (
    <CustomerLayout>
      <div className="px-6 py-12 max-w-screen-md mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Privacy Policy</h1>
        <p className="text-gray-700">
          At Clubster, we take your privacy seriously. This Privacy Policy outlines how we collect, use, and protect your data as a customer.
        </p>

        <section>
          <h2 className="text-xl font-semibold mb-2">1. Information We Collect</h2>
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            <li>Email address</li>
            <li>Device & browser information (IP, OS, language)</li>
            <li>Usage data (page views, click behavior, session info)</li>
            <li>Payment data processed via Stripe (we do not store card details)</li>
            <li>Communication preferences</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">2. How We Use Your Data</h2>
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            <li>To provide access to events and manage your bookings</li>
            <li>To communicate with you about your tickets and account</li>
            <li>To improve our services and personalize your experience</li>
            <li>To prevent fraud and comply with legal obligations</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">3. Third-Party Services</h2>
          <p className="text-gray-700">
            We share your information with Stripe for secure payment processing and may use analytics providers to enhance performance. We do not sell your personal data.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">4. Data Retention</h2>
          <p className="text-gray-700">
            We retain your data only as long as necessary to fulfill the purposes outlined in this policy or as required by law.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">5. Your Rights</h2>
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            <li>Access your data</li>
            <li>Request correction or deletion</li>
            <li>Withdraw consent where applicable</li>
            <li>Request data portability</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">6. Changes to This Policy</h2>
          <p className="text-gray-700">
            We may update this policy at any time. Changes will be posted here and communicated where appropriate. Continued use of Clubster indicates your acceptance.
          </p>
        </section>

        <p className="text-sm text-gray-500">Last updated: April 2025</p>
      </div>
    </CustomerLayout>
  );
}

// app/dashboard/customer/terms-of-service/page.js
"use client";

import CustomerLayout from "../CustomerLayout";

export default function TermsOfServicePage() {
  return (
    <CustomerLayout>
      <div className="px-6 py-12 max-w-screen-md mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Terms of Service</h1>
        <p className="text-gray-700">
          These terms govern your use of Clubster as a customer. By using our platform, you agree to comply with all terms stated herein.
        </p>

        <section>
          <h2 className="text-xl font-semibold mb-2">1. Service Overview</h2>
          <p className="text-gray-700">
            Clubster is a Swiss-based marketplace that connects users with nightlife event organizers. We facilitate ticket purchases and event discovery.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">2. Eligibility & Account Use</h2>
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            <li>You must be at least 18 years old.</li>
            <li>Use the service lawfully and responsibly.</li>
            <li>Provide accurate personal details when required.</li>
            <li>Maintain confidentiality of login credentials.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">3. Payments & Refunds</h2>
          <p className="text-gray-700">
            All payments are processed securely through Stripe Connect. Funds go directly to organizers. Orders are final; refund requests must be directed to the event organizer.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">4. Limitation of Liability</h2>
          <p className="text-gray-700">
            Clubster acts solely as an intermediary. We are not liable for cancellations, venue access issues, or quality of the event.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">5. Modification of Terms</h2>
          <p className="text-gray-700">
            These terms may be updated. Continued use after modifications constitutes acceptance. We recommend checking them regularly.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">6. Governing Law</h2>
          <p className="text-gray-700">
            These Terms are governed by Swiss law. Disputes will be handled under the jurisdiction of Clubster's legal seat.
          </p>
        </section>

        <p className="text-sm text-gray-500">Last updated: April 2025</p>
      </div>
    </CustomerLayout>
  );
}

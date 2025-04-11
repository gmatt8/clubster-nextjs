// app/dashboard/manager/settings/legal/terms-of-service/page.js
"use client";

import ManagerLayout from "../../../ManagerLayout";
import ManagerSettingsHeader from "@/components/manager/settings/SettingsHeader";

export default function ManagerTermsPage() {
  return (
    <ManagerLayout>
      <div className="px-6 py-12 max-w-screen-md mx-auto">
        {/* Breadcrumb e Titolo a sinistra */}
        <ManagerSettingsHeader 
          breadcrumbs={[
            { label: "Settings", href: "/dashboard/manager/settings" },
            { label: "Legal", href: "/dashboard/manager/settings/legal" },
            { label: "Terms of Service" },
          ]}
          title="Terms of Service"
        />

        {/* Contenuto dei Terms of Service */}
        <p className="text-gray-700">
          These terms apply to venue managers using Clubster to list and manage nightlife events.
        </p>

        <section>
          <h2 className="text-xl font-semibold mb-2">1. Manager Responsibilities</h2>
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            <li>Only legally authorized representatives may register a venue</li>
            <li>Managers must provide accurate and truthful information</li>
            <li>Events must comply with local laws and safety regulations</li>
            <li>Clubster may verify venue ownership and documentation</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">2. Event Management</h2>
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            <li>Managers are responsible for ticket validity and event updates</li>
            <li>In case of event cancellation, all tickets must be refunded</li>
            <li>Events must be removed if no longer active or canceled</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">3. Payments & Fees</h2>
          <p className="text-gray-700">
            Payments are handled via Stripe Connect. Clubster may deduct a service fee based on individual agreements. Payouts are managed directly by Stripe.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">4. Disputes & Liabilities</h2>
          <p className="text-gray-700">
            Clubster only facilitates transactions. Managers are responsible for handling customer complaints and refunds. We are not party to any dispute unless explicitly involved.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">5. Termination</h2>
          <p className="text-gray-700">
            Clubster reserves the right to suspend or terminate access for violations of these terms or any unlawful conduct.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">6. Legal Jurisdiction</h2>
          <p className="text-gray-700">
            These terms are governed by Swiss law. Legal disputes will be handled by the competent court at Clubster’s registered seat.
          </p>
        </section>

        <p className="text-sm text-gray-500">Last updated: April 2025</p>
      </div>
    </ManagerLayout>
  );
}

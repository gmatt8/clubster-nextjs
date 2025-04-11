// app/dashboard/manager/settings/legal/privacy-policy/page.js
"use client";

import ManagerLayout from "../../../ManagerLayout";
import ManagerSettingsHeader from "@/components/manager/settings/SettingsHeader";

export default function ManagerPrivacyPolicyPage() {
  return (
    <ManagerLayout>
      <div className="px-6 py-12 max-w-screen-md mx-auto">
        {/* Breadcrumb e Titolo a sinistra */}
        <ManagerSettingsHeader 
          breadcrumbs={[
            { label: "Settings", href: "/dashboard/manager/settings" },
            { label: "Legal", href: "/dashboard/manager/settings/legal" },
            { label: "Privacy Policy" },
          ]}
          title="Privacy Policy"
        />

        {/* Contenuto della Privacy Policy (testo left-aligned per facilità di lettura) */}
        <p className="text-gray-700">
          This policy explains how Clubster collects, uses, and protects the data of event managers using our platform.
        </p>

        <section>
          <h2 className="text-xl font-semibold mb-2">1. Data We Collect</h2>
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            <li>Email address and login credentials</li>
            <li>Venue details and documentation for verification</li>
            <li>Bank and tax information (handled by Stripe)</li>
            <li>Event performance and ticketing data</li>
            <li>Platform usage analytics</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">2. Purpose of Processing</h2>
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            <li>To verify business legitimacy</li>
            <li>To ensure compliance with local and Swiss regulations</li>
            <li>To process event payments and reporting</li>
            <li>To prevent fraudulent activity</li>
            <li>To provide support and communication</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">3. Sharing & Third Parties</h2>
          <p className="text-gray-700">
            We share manager data with Stripe for payment and compliance. We may use fraud detection and verification services as needed.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">4. Rights of Managers</h2>
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            <li>Access and review your personal data</li>
            <li>Request edits or deletion</li>
            <li>Export data upon request</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">5. Changes to This Policy</h2>
          <p className="text-gray-700">
            Clubster may revise this policy at any time. Continued use of the platform implies acceptance of updated terms.
          </p>
        </section>

        <p className="text-sm text-gray-500">Last updated: April 2025</p>
      </div>
    </ManagerLayout>
  );
}

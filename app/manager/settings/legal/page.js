// app/manager/settings/legal/page.js
"use client";

import Link from "next/link";
import ManagerLayout from "../../ManagerLayout";
import ManagerSettingsHeader from "@/components/manager/settings/SettingsHeader";

export default function ManagerSettingsLegalPage() {
  return (
    <ManagerLayout>
      {/* Container centrale con testo allineato a sinistra */}
      <div className="px-6 py-8 max-w-screen-xl mx-auto text-left">
        {/* Header con breadcrumb e titolo */}
        <ManagerSettingsHeader
          breadcrumbs={[
            { label: "Settings", href: "/manager/settings" },

          ]}
          title="Legal"
        />

        {/* Sezione introduttiva */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Our Legal Commitment
          </h2>
          <p className="text-gray-700">
            At Clubster, we prioritize transparency, trust, and compliance.
            We have crafted our legal documents to protect your rights and ensure
            fairness while meeting regulatory standards. Review our policies below
            to understand how we manage and safeguard our community.
          </p>
        </div>

        {/* Sezione di navigazione verso i documenti legali */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/manager/settings/legal/privacy-policy" className="no-underline w-full sm:w-auto">
            <button className="w-full sm:w-auto bg-purple-600 text-white font-semibold py-2 px-4 rounded hover:bg-purple-700 transition">
              Privacy Policy
            </button>
          </Link>
          
          <Link href="/manager/settings/legal/terms-of-service" className="no-underline w-full sm:w-auto">
            <button className="w-full sm:w-auto bg-purple-600 text-white font-semibold py-2 px-4 rounded hover:bg-purple-700 transition">
              Terms of Service
            </button>
          </Link>
        </div>
      </div>
    </ManagerLayout>
  );
}

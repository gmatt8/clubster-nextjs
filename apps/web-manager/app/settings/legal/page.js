// apps/web-manager/app/settings/legal/page.js
"use client";

import Link from "next/link";
import ManagerLayout from "../../ManagerLayout";
import ManagerSettingsHeader from "@/components/settings/SettingsHeader";

export default function ManagerSettingsLegalPage() {
  return (
    <ManagerLayout>
      <div className="px-6 py-10 max-w-4xl mx-auto text-left">
        {/* Header con breadcrumb e titolo */}
        <ManagerSettingsHeader
          breadcrumbs={[{ label: "Settings", href: "/settings" }]}
          title="Legal"
        />

        {/* Intro */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-800 mb-2">Our Legal Commitment</h2>
          <p className="text-gray-700 leading-relaxed">
            At Clubster, transparency and user protection are at the heart of our operations. Our policies
            are designed to protect your rights, clarify our obligations, and promote a trusted experience.
            We encourage you to review the documents below.
          </p>
        </section>

        {/* Legal Links */}
        <section className="grid gap-4 sm:grid-cols-2">
          <a
            href="/privacy-policy"
            target="_blank"
            rel="noopener noreferrer"
            className="block p-5 rounded-lg border border-gray-200 bg-white hover:border-purple-600 hover:shadow-md transition"
          >
            <h3 className="text-lg font-semibold text-purple-700 mb-1">Privacy Policy</h3>
            <p className="text-sm text-gray-600">
              Learn how we collect, use, and protect your personal data.
            </p>
          </a>

          <a
            href="/terms-of-service"
            target="_blank"
            rel="noopener noreferrer"
            className="block p-5 rounded-lg border border-gray-200 bg-white hover:border-purple-600 hover:shadow-md transition"
          >
            <h3 className="text-lg font-semibold text-purple-700 mb-1">Terms of Service</h3>
            <p className="text-sm text-gray-600">
              Understand the rules and conditions for using Clubster Manager.
            </p>
          </a>
        </section>
      </div>
    </ManagerLayout>
  );
}
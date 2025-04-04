// app/dashboard/manager/settings/legal/page.js
'use client';

import { createBrowserSupabase } from "@/lib/supabase-browser";
import Link from "next/link";
import ManagerLayout from '../../ManagerLayout';

export default function ManagerSettingsLegalPage() {
  return (
    <ManagerLayout>
      <h1 className="text-xl mb-4">Legal</h1>

      <div className="flex space-x-4 mt-6">
        {/* Bottone Privacy Policy */}
        <Link
          href="/dashboard/manager/settings/legal/privacy-policy"
        >
          <button className="bg-purple-600 text-white font-semibold py-2 px-4 rounded hover:bg-purple-700 transition">
            Privacy Policy
          </button>
        </Link>

        {/* Bottone Terms of Service */}
        <Link
          href="/dashboard/manager/settings/legal/terms-of-service"
        >
          <button className="bg-purple-600 text-white font-semibold py-2 px-4 rounded hover:bg-purple-700 transition">
            Terms of Service
          </button>
        </Link>
      </div>
    </ManagerLayout>
  );
}

//app/customer/settings/page.js
"use client";

import Link from "next/link";
import CustomerLayout from "../CustomerLayout";
import { LockClosedIcon } from "@heroicons/react/24/outline";

export default function CustomerSettingsPage() {
  return (
    <CustomerLayout>
      <div className="px-6 py-8 max-w-screen-xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Settings</h1>
        <div className="flex flex-wrap justify-center gap-8">
          <Link
            href="/settings/login-and-security"
            className="no-underline"
          >
            <div className="w-80 h-40 border border-gray-300 rounded-lg bg-white shadow-md flex flex-col justify-center items-center text-center text-gray-800 cursor-pointer transition-transform hover:scale-105">
              {/* Icona sopra il titolo */}
              <LockClosedIcon className="h-12 w-12 text-gray-600 mb-2" />
              <h2 className="text-xl font-semibold mb-2">Login and Security</h2>
              <p className="text-sm text-gray-600">
                Update your password and manage account security
              </p>
            </div>
          </Link>
        </div>
      </div>
    </CustomerLayout>
  );
}

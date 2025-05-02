//apps/web-customer/app/settings/page.js
// Enhanced Customer Settings Page
"use client";

import Link from "next/link";
import CustomerLayout from "../CustomerLayout";
import { LockClosedIcon } from "@heroicons/react/24/outline";

export default function CustomerSettingsPage() {
  return (
    <CustomerLayout>
      <div className="px-6 py-12 max-w-screen-md mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">Account Settings</h1>
        <p className="text-center text-gray-600 mb-10">
          Manage your account and security preferences
        </p>

        <div className="grid gap-6 sm:grid-cols-2 justify-center">
          <Link
            href="/settings/login-and-security"
            className="no-underline"
          >
            <div className="w-full h-40 border border-gray-200 rounded-xl bg-white shadow hover:shadow-md flex flex-col justify-center items-center text-center text-gray-800 transition-transform hover:scale-105">
              <LockClosedIcon className="h-10 w-10 text-purple-600 mb-3" />
              <h2 className="text-lg font-semibold mb-1">Login & Security</h2>
              <p className="text-sm text-gray-500 px-4">
                Update your password and secure your account
              </p>
            </div>
          </Link>
        </div>
      </div>
    </CustomerLayout>
  );
}
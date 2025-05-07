// apps/web-manager/app/settings/page.js
'use client';

import Link from 'next/link';
import ManagerLayout from '../ManagerLayout';
import {
  Cog6ToothIcon,
  LockClosedIcon,
  DocumentTextIcon,
  KeyIcon,
} from '@heroicons/react/24/outline';

const settingsItems = [
  {
    href: '/settings/general',
    icon: Cog6ToothIcon,
    title: 'General',
    description: 'Manage your basic information and communication preferences',
  },
  {
    href: '/settings/login-and-security',
    icon: LockClosedIcon,
    title: 'Login and Security',
    description: 'Update your password and manage account security',
  },
  {
    href: '/settings/legal',
    icon: DocumentTextIcon,
    title: 'Legal',
    description: 'Terms of Service and Privacy Policy',
  },
  {
    href: '/settings/scan-access',
    icon: KeyIcon,
    title: 'Scan Access',
    description: 'Generate and manage access codes for ticket scanning',
  },
];

export default function ManagerSettingsPage() {
  return (
    <ManagerLayout>
      <div className="px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Settings</h1>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {settingsItems.map(({ href, icon: Icon, title, description }) => (
            <Link key={href} href={href} className="group block">
              <div className="p-6 h-48 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:border-indigo-400 transition-all flex flex-col items-center justify-center text-center">
                <Icon className="h-8 w-8 text-gray-500 group-hover:text-indigo-600 mb-3 transition" />
                <h2 className="text-lg font-semibold text-gray-800 mb-1 group-hover:text-indigo-700">{title}</h2>
                <p className="text-sm text-gray-600 group-hover:text-gray-700 max-w-xs">{description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </ManagerLayout>
  );
}

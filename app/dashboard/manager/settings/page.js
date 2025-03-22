'use client';

import ManagerLayout from '../ManagerLayout';
import Link from 'next/link';

export default function ManagerSettingsPage() {
  return (
    <ManagerLayout>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Settings</h1>
      <nav style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <Link 
          href="/dashboard/manager/settings/general" 
          style={{ textDecoration: 'none', color: '#000', fontWeight: 'bold' }}
        >
          General
        </Link>
        <Link 
          href="/dashboard/manager/settings/login-and-security" 
          style={{ textDecoration: 'none', color: '#000', fontWeight: 'bold' }}
        >
          Login and Security
        </Link>
        <Link 
          href="/dashboard/manager/settings/legal" 
          style={{ textDecoration: 'none', color: '#000', fontWeight: 'bold' }}
        >
          Legal
        </Link>
      </nav>
    </ManagerLayout>
  );
}

'use client';

import Link from 'next/link';
import ManagerLayout from '../ManagerLayout';

export default function ManagerSettingsPage() {
  return (
    <ManagerLayout>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Settings</h1>
      
      {/* Contenitore dei box */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-evenly', // distribuisce in modo uniforme lo spazio
          alignItems: 'flex-start',
          gap: '2rem',
          flexWrap: 'wrap', // permette di andare a capo su schermi piccoli
          padding: '1rem 0',
        }}
      >
        {/* Box: General */}
        <Link href="/dashboard/manager/settings/general" style={{ textDecoration: 'none' }}>
          <div
            style={{
              width: '280px',
              height: '160px',
              border: '1px solid #ccc',
              borderRadius: '8px',
              backgroundColor: '#fff',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              textAlign: 'center',
              color: '#000',
              cursor: 'pointer',
              transition: 'transform 0.2s',
            }}
          >
            <h2 style={{ marginBottom: '0.5rem' }}>General</h2>
            <p style={{ fontSize: '0.9rem', color: '#666' }}>
              Manage your basic information and communication preferences
            </p>
          </div>
        </Link>

        {/* Box: Login and Security */}
        <Link href="/dashboard/manager/settings/login-and-security" style={{ textDecoration: 'none' }}>
          <div
            style={{
              width: '280px',
              height: '160px',
              border: '1px solid #ccc',
              borderRadius: '8px',
              backgroundColor: '#fff',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              textAlign: 'center',
              color: '#000',
              cursor: 'pointer',
              transition: 'transform 0.2s',
            }}
          >
            <h2 style={{ marginBottom: '0.5rem' }}>Login and Security</h2>
            <p style={{ fontSize: '0.9rem', color: '#666' }}>
              Update your password and manage account security
            </p>
          </div>
        </Link>

        {/* Box: Legal */}
        <Link href="/dashboard/manager/settings/legal" style={{ textDecoration: 'none' }}>
          <div
            style={{
              width: '280px',
              height: '160px',
              border: '1px solid #ccc',
              borderRadius: '8px',
              backgroundColor: '#fff',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              textAlign: 'center',
              color: '#000',
              cursor: 'pointer',
              transition: 'transform 0.2s',
            }}
          >
            <h2 style={{ marginBottom: '0.5rem' }}>Legal</h2>
            <p style={{ fontSize: '0.9rem', color: '#666' }}>
              Terms of Service and Privacy Policy
            </p>
          </div>
        </Link>
      </div>
    </ManagerLayout>
  );
}

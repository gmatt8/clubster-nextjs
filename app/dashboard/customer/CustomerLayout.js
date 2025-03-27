// app/dashboard/customer/CustomerLayout.js
import React from 'react';
import Link from 'next/link';

const Header = () => (
  <header style={{ padding: '1rem', background: '#f0f0f0' }}>
    <nav>
      <Link href="/dashboard/customer/home">Home</Link> |{' '}
      <Link href="/dashboard/customer/club-details">Club Details</Link>
      {/* Aggiungi altri link se necessario */}
    </nav>
  </header>
);

const Footer = () => (
  <footer style={{ padding: '1rem', background: '#f0f0f0', marginTop: 'auto' }}>
    <p>&copy; {new Date().getFullYear()} Clubster. All rights reserved.</p>
  </footer>
);

const CustomerLayout = ({ children }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <main style={{ flex: 1, padding: '1rem' }}>
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default CustomerLayout;

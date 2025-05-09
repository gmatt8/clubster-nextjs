// apps/web-manager/app/layout.js
import './globals.css';
import Script from "next/script";
import { Analytics } from "@vercel/analytics/react";

export const metadata = {
  title: 'Clubster Manager',
  description: 'Manage your bookings, events, and visibility - all in one place with Clubster Manager.',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any', type: 'image/x-icon' },
      { url: '/favicon-96x96.png', type: 'image/png' },
    ],
  },
  openGraph: {
    title: 'Clubster Manager',
    description: 'Join the nightlife revolution. Manage your bookings, events, and visibility.',
    url: 'https://www.manager.clubsterhub.com',
    siteName: 'Clubster Hub',
    images: [
      {
        url: 'https://www.manager.clubsterhub.com/images/regphoto.png',
        width: 1200,
        height: 630,
        alt: 'Clubster Manager Preview',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Clubster Manager',
    description: 'Manage your bookings, events, and visibility.',
    images: ['https://www.manager.clubsterhub.com/images/regphoto.png'],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Google Maps Places API */}
        <Script
          src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
          strategy="beforeInteractive"
        />

        {/* Favicon fallback */}
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png" />

        {/* Schema.org structured data */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: `
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Clubster Manager",
            "url": "https://www.manager.clubsterhub.com",
            "logo": "https://www.manager.clubsterhub.com/images/logo.png",
            "description": "Manage your bookings, events, and visibility with Clubster Manager.",
            "sameAs": [
              "https://www.instagram.com/clubsterhub",
              "https://www.tiktok.com/@clubsterhub",
              "https://twitter.com/clubsterhub"
            ]
          }
        `}} />
      </head>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}

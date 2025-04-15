// app/layout.js
import '../styles/globals.css';
import Script from 'next/script';
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

export const metadata = {
  title: 'Clubster',
  description:
    'Find your next party or manage your club like a pro. Clubster connects clubbers and club managers with powerful tools and vibrant events.',
  viewport: 'width=device-width, initial-scale=1',
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    title: 'Clubster',
    description: 'Your nightlife starts here. Discover events, book clubs, enjoy the night.',
    url: 'https://www.clubsterapp.com',
    siteName: 'Clubster',
    images: [
      {
        url: 'https://www.clubsterapp.com/og-cover.png',
        width: 1200,
        height: 630,
        alt: 'Clubster Open Graph Image',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Clubster',
    description:
      'The all-in-one platform for event lovers and club owners.',
    images: ['https://www.clubsterapp.com/og-cover.png'],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Script
          src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
          strategy="beforeInteractive"
        />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}

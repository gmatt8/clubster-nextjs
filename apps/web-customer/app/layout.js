// apps/web-customer/app/layout.js
import './globals.css';

export const metadata = {
  metadataBase: new URL('https://www.clubsterhub.com'),
  title: 'Clubster Hub',
  description: 'Find and book the hottest events and clubs in your city with Clubster Hub.',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any', type: 'image/x-icon' },
      { url: '/favicon-96x96.png', type: 'image/png' },
    ],
  },
  openGraph: {
    title: 'Clubster Hub',
    description: 'Join the nightlife revolution. Book top clubs and events with ease.',
    url: 'https://www.clubsterhub.com',
    siteName: 'Clubster Hub',
    images: [
      {
        url: 'https://www.clubsterhub.com/images/regphoto.png',
        width: 1200,
        height: 630,
        alt: 'Clubster Hub Preview',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Clubster Hub',
    description: 'Explore the hottest nightlife, clubs, and parties near you. Your night starts here.',
    images: ['https://www.clubsterhub.com/images/regphoto.png'],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* ✅ Caricamento Google Maps API */}
        <script
          src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
          async
          defer
        ></script>
      </head>
      <body>{children}</body>
    </html>
  );
}

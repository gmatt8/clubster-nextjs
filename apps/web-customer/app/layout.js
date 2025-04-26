// apps/web-customer/app/layout.js
import './globals.css';

export const metadata = {
  title: 'Clubster Hub',
  description: 'Find and book the hottest events and clubs in your city with Clubster Hub.',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any', type: 'image/x-icon' },
      { url: '/favicon-96x96.png', type: 'image/png' }, // opzionale, se disponibile
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
        {/* Favicon fallback */}
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png" />

        {/* Schema.org structured data */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: `
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Clubster Hub",
            "url": "https://www.clubsterhub.com",
            "logo": "https://www.clubsterhub.com/images/logo.png",
            "description": "Find and book the hottest events and clubs in your city with Clubster Hub.",
            "sameAs": [
              "https://www.instagram.com/clubsterhub",
              "https://www.tiktok.com/@clubsterhub",
              "https://twitter.com/clubsterhub"
            ]
          }
        `}} />
      </head>
      <body>{children}</body>
    </html>
  );
}

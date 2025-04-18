// app/layout.js
import '../styles/globals.css';

export const metadata = {
  title: 'Clubster Hub – Discover the best clubs & events',
  description: 'Find and book the hottest events and clubs in your city with Clubster Hub.',
  icons: {
    icon: [
      { url: '/favicon.ico' },
    ],
  },
  openGraph: {
    title: 'Clubster Hub',
    description: 'Find and book the hottest events and clubs in your city with Clubster Hub.',
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
    description: 'Find and book the hottest events and clubs in your city with Clubster Hub.',
    images: ['https://www.clubsterhub.com/images/regphoto.png'],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

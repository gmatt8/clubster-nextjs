// app/layout.js
import '../styles/globals.css';

export const metadata = {
  title: 'Clubster Hub | Discover & Book the Best Nightclubs and Events',
  description: 'Clubster Hub helps you discover, explore and book the best nightclubs and nightlife events in your city. Available in Barcelona, Madrid, Valencia and more.',
  icons: {
    icon: [
      { url: '/favicon.ico' },
    ],
  },
  openGraph: {
    title: 'Clubster Hub – Discover the Best Clubs & Events',
    description: 'Join the nightlife revolution. Book top clubs and events with ease in cities like Barcelona, Madrid, and Lisbon.',
    url: 'https://www.clubsterhub.com',
    siteName: 'Clubster Hub',
    images: [
      {
        url: 'https://www.clubsterhub.com/images/regphoto.png',
        width: 1200,
        height: 630,
        alt: 'Clubster Hub nightlife app preview',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Clubster Hub – Discover the Best Clubs & Events',
    description: 'Explore the hottest nightlife, clubs, and parties near you. Your night starts here.',
    images: ['https://www.clubsterhub.com/images/regphoto.png'],
  },
};

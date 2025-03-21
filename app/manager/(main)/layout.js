import './globals.css'
import { Inter } from 'next/font/google'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Clubster',
  description: 'Event marketplace',
}

export default function RootLayout({ children }) {
  const supabase = createClientComponentClient({ cookies })
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}

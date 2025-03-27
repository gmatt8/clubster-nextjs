// components/manager/layout/sidebar.jsx
import Link from 'next/link';

export default function Sidebar() {
  return (
    <aside className="w-64 bg-gray-900 text-white p-4 flex flex-col">
      <nav className="flex flex-col space-y-2">
        <Link href="/dashboard/manager" className="hover:bg-gray-700 p-2 rounded">Dashboard</Link>
        <Link href="/dashboard/manager/events" className="hover:bg-gray-700 p-2 rounded">Events</Link>
        <Link href="/dashboard/manager/bookings" className="hover:bg-gray-700 p-2 rounded">Bookings</Link>
        <Link href="/dashboard/manager/analytics" className="hover:bg-gray-700 p-2 rounded">Analytics</Link>
        <Link href="/dashboard/manager/payments" className="hover:bg-gray-700 p-2 rounded">Payments</Link>
        <Link href="/dashboard/manager/settings" className="hover:bg-gray-700 p-2 rounded">Settings</Link>
      </nav>
    </aside>
  );
}

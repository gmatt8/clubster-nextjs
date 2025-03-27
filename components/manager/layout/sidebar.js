// components/manager/layout/sidebar.js
import Link from "next/link";

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 p-4 flex flex-col">
      {/* Logo/Titolo */}
      <div className="mb-8">
        <div className="text-xl font-bold text-purple-700">clubster manager</div>
      </div>

      {/* Menu di navigazione */}
      <nav className="flex flex-col gap-1">
        <Link
          href="/dashboard/manager/dashboard"
          className="p-2 rounded text-gray-700 hover:bg-purple-50 hover:text-purple-700"
        >
          Dashboard
        </Link>
        <Link
          href="/dashboard/manager/events"
          className="p-2 rounded text-gray-700 hover:bg-purple-50 hover:text-purple-700"
        >
          Events
        </Link>
        <Link
          href="/dashboard/manager/bookings"
          className="p-2 rounded text-gray-700 hover:bg-purple-50 hover:text-purple-700"
        >
          Bookings
        </Link>
        <Link
          href="/dashboard/manager/analytics"
          className="p-2 rounded text-gray-700 hover:bg-purple-50 hover:text-purple-700"
        >
          Analytics
        </Link>
        <Link
          href="/dashboard/manager/payments"
          className="p-2 rounded text-gray-700 hover:bg-purple-50 hover:text-purple-700"
        >
          Payments
        </Link>
      </nav>

      {/* Footer: Settings e Logout */}
      <div className="mt-auto">
        <Link
          href="/dashboard/manager/settings"
          className="block p-2 mb-2 rounded text-gray-700 hover:bg-purple-50 hover:text-purple-700"
        >
          Settings
        </Link>
        <button className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded">
          Logout
        </button>
      </div>
    </aside>
  );
}

// apps/web-manager/components/layout/header.js
export default function Header({ clubName }) {
  return (
    <header className="h-16 bg-white border-b border-gray-100 px-6 flex items-center justify-between shadow-sm">
      {/* Search bar placeholder */}
      <div className="flex-1 max-w-md">
        <input
          type="text"
          placeholder="Search..."
          className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      <div className="text-sm sm:text-base font-medium text-gray-800 tracking-tight truncate max-w-xs text-right ml-4">
        {clubName || "Loading..."}
      </div>
    </header>
  );
}
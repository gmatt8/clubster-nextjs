// components/manager/layout/header.js
export default function Header({ clubName }) {
  return (
    <header className="h-16 bg-white border-b border-gray-100 px-6 flex items-center justify-between shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900 tracking-tight">
        Manager Panel
      </h2>
      <div className="text-base font-medium text-gray-800 tracking-tight truncate max-w-xs">
      {clubName}
      </div>

    </header>
  );
}

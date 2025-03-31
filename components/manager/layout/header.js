// components/manager/layout/header.js
export default function Header({ clubName }) {
    return (
      <header className="h-16 bg-white border-b border-gray-200 px-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold"> </h2>
        <div className="text-gray-700">{clubName}</div>
      </header>
    );
  }
  
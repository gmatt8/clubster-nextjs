// components/manager/layout/header.jsx

export default function Header({ clubName }) {
    return (
      <header className="bg-white shadow py-4 px-6 flex justify-between items-center">
        <div className="text-xl font-bold">Manager Dashboard</div>
        <div className="text-gray-600">{clubName}</div>
      </header>
    );
  }
  
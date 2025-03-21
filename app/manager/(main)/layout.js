export default function ManagerLayout({ children }) {
    return (
      <div className="flex min-h-screen">
        <aside className="w-64 bg-white shadow-md">
          <nav className="flex flex-col p-6 space-y-4">
            <a href="/manager/dashboard">Dashboard</a>
            <a href="/manager/events">Events</a>
            <a href="/manager/bookings">Bookings</a>
            <a href="/manager/analytics">Analytics</a>
            <a href="/manager/payments">Payments</a>
  
            <div className="mt-auto">
              <a href="/manager/settings">Settings</a>
              <a href="#" id="logout">Logout</a>
            </div>
          </nav>
        </aside>
  
        <main className="flex-1 p-8 bg-gray-100">
          <header className="mb-4 flex justify-between">
            <h1>Seven Club</h1>
            <span>Benvenuto, Manager</span>
          </header>
          {children}
        </main>
      </div>
    );
  }
  
"use client";
import ManagerLayout from "../ManagerLayout";

export default function ManagerDashboardPage() {
  return (
    <ManagerLayout>
      <h1 className="text-2xl font-semibold mb-4">Dashboard</h1>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white p-4 shadow rounded">
          <div className="text-sm text-gray-500">Total Customers</div>
          <div className="text-2xl font-semibold">40,689</div>
        </div>

        <div className="bg-white p-4 shadow rounded">
          <div className="text-sm text-gray-500">Total Tickets Sold</div>
          <div className="text-2xl font-semibold">10,293</div>
        </div>

        <div className="bg-white p-4 shadow rounded">
          <div className="text-sm text-gray-500">CHF</div>
          <div className="text-2xl font-semibold">89,000</div>
        </div>

        <div className="bg-white p-4 shadow rounded">
          <div className="text-sm text-gray-500">Active Events</div>
          <div className="text-2xl font-semibold">7</div>
        </div>
      </div>
    </ManagerLayout>
  );
}

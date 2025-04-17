// app/manager/dashboard/page.js
"use client";

import ManagerLayout from "../ManagerLayout";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const fakeSalesData = [
  { name: "Gen", value: 2000 },
  { name: "Feb", value: 3200 },
  { name: "Mar", value: 2800 },
  { name: "Apr", value: 5400 },
  { name: "Mag", value: 4700 },
  { name: "Giu", value: 6000 },
];

export default function ManagerDashboardPage() {
  return (
    <ManagerLayout>
      <h1 className="text-3xl font-semibold mb-6 tracking-tight">Dashboard</h1>

      {/* Top Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Customers", value: "40,689" },
          { label: "Total Tickets Sold", value: "10,293" },
          { label: "Revenue (CHF)", value: "89,000" },
          { label: "Active Events", value: "7" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="text-sm text-gray-500">{stat.label}</div>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Sales Chart */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">Ticket Revenue (last 6 months)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={fakeSalesData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#7e3af2" // viola brandizzato
              strokeWidth={3}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ManagerLayout>
  );
}

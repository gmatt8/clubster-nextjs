// apps/web-manager/app/dashboard/page.js
"use client";

import ManagerLayout from "../ManagerLayout";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const fakeSalesData = [
  { name: "Jan", value: 2000 },
  { name: "Feb", value: 3200 },
  { name: "Mar", value: 2800 },
  { name: "Apr", value: 5400 },
  { name: "May", value: 4700 },
  { name: "Jun", value: 6000 },
];

export default function ManagerDashboardPage() {
  return (
    <ManagerLayout>
      <div className="px-6 py-10 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 tracking-tight text-gray-900">Dashboard Overview</h1>

        {/* Top Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[ 
            { label: "Total Customers", value: "40,689" },
            { label: "Tickets Sold", value: "10,293" },
            { label: "Revenue (CHF)", value: "89,000" },
            { label: "Active Events", value: "7" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition"
            >
              <div className="text-sm text-gray-500 mb-1">{stat.label}</div>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Sales Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Ticket Revenue (last 6 months)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={fakeSalesData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                contentStyle={{ backgroundColor: "white", borderColor: "#ddd" }}
                labelStyle={{ color: "#6b7280" }}
                itemStyle={{ color: "#7e3af2" }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#7e3af2"
                strokeWidth={3}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </ManagerLayout>
  );
}

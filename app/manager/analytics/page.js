// app/manager/analytics/page.js
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
  PieChart,
  Pie,
  Cell,
} from "recharts";

const fakeRevenueData = [
  { name: "Gen", value: 3200 },
  { name: "Feb", value: 4000 },
  { name: "Mar", value: 3600 },
  { name: "Apr", value: 5100 },
  { name: "Mag", value: 6700 },
  { name: "Giu", value: 7200 },
];

const fakeTopEvents = [
  { name: "Techno Night", tickets: 1240, revenue: "12,400 CHF" },
  { name: "Summer Party", tickets: 970, revenue: "9,800 CHF" },
  { name: "Underground Vibes", tickets: 880, revenue: "8,700 CHF" },
];

const fakeDeviceData = [
  { name: "Mobile", value: 65 },
  { name: "Desktop", value: 30 },
  { name: "Tablet", value: 5 },
];

const COLORS = ["#7e3af2", "#a78bfa", "#ddd6fe"];

export default function ManagerAnalyticsPage() {
  return (
    <ManagerLayout>
      <div className="p-6 max-w-7xl mx-auto">
        <h1 className="text-3xl font-semibold mb-6 tracking-tight">Analytics</h1>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Revenue (30d)", value: "42,500 CHF" },
            { label: "Tickets Sold", value: "6,743" },
            { label: "Conversion Rate", value: "7.2%" },
            { label: "Top Event", value: "Techno Night" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="text-sm text-gray-500">{stat.label}</div>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Revenue Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Monthly Revenue</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={fakeRevenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
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

        {/* Top Events */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Top Events by Revenue</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-700 uppercase text-xs tracking-wider">
                <tr>
                  <th className="px-4 py-3 text-left">Event</th>
                  <th className="px-4 py-3 text-left">Tickets Sold</th>
                  <th className="px-4 py-3 text-left">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {fakeTopEvents.map((event) => (
                  <tr key={event.name} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3">{event.name}</td>
                    <td className="px-4 py-3">{event.tickets}</td>
                    <td className="px-4 py-3">{event.revenue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Device Usage */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Device Usage</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={fakeDeviceData}
                dataKey="value"
                nameKey="name"
                outerRadius={100}
                innerRadius={60}
                label
              >
                {fakeDeviceData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </ManagerLayout>
  );
}

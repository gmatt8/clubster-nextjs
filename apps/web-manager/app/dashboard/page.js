// apps/web-manager/app/dashboard/page.js
// apps/web-manager/app/dashboard/page.js
"use client";

import { useEffect, useState } from "react";
import ManagerLayout from "../ManagerLayout";
import DashboardEventHighlights from "@/components/dashboard/DashboardEventHighlights";
import LoadingSpinner from "@/components/common/LoadingSpinner";

const rangeOptions = [
  { label: "Today", value: "today" },
  { label: "Yesterday", value: "yesterday" },
  { label: "Last 7 days", value: "last_7_days" },
  { label: "Last 30 days", value: "last_30_days" },
  { label: "Last 6 months", value: "last_6_months" },
  { label: "Last year", value: "last_year" },
  { label: "Year to date", value: "year_to_date" },
  { label: "All time (since club creation)", value: "all_time" },
];

export default function ManagerDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState("last_30_days");

  useEffect(() => {
    setLoading(true);
    fetch(`/api/dashboard?range=${range}`)
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching dashboard stats:", error);
        setLoading(false);
      });
  }, [range]);

  const statsToDisplay = stats
    ? [
        { label: "Total customers", value: stats.totalCustomers },
        { label: "Tickets sold", value: stats.totalTickets },
        { label: "Revenue (CHF)", value: stats.revenue },
        { label: "Active events", value: stats.activeEvents },
      ]
    : [
        { label: "Total customers", value: "—" },
        { label: "Tickets sold", value: "—" },
        { label: "Revenue (CHF)", value: "—" },
        { label: "Active events", value: "—" },
      ];

  return (
    <ManagerLayout>
      <div className="px-6 py-10 max-w-7xl mx-auto">
        {/* Header and time range */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Dashboard overview
          </h1>
          <select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="border border-gray-300 rounded-md p-2 text-sm"
          >
            {rangeOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Stats */}
        {loading ? (
          <div className="flex justify-center items-center min-h-[200px] mb-6">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {statsToDisplay.map((stat) => (
              <div
                key={stat.label}
                className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition"
              >
                <div className="text-sm text-gray-500 mb-1">{stat.label}</div>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              </div>
            ))}
          </div>
        )}

        {/* Upcoming events section */}
        <DashboardEventHighlights />
      </div>
    </ManagerLayout>
  );
}

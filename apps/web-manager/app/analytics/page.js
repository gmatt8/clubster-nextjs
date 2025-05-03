// apps/web-customer/app/analytics/page.js
"use client";

import { useEffect, useState } from "react";
import ManagerLayout from "../ManagerLayout";

export default function ManagerAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await fetch("/api/analytics");
        const data = await res.json();
        setAnalytics(data);
      } catch (err) {
        console.error("Error loading analytics", err);
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, []);

  return (
    <ManagerLayout>
      <div className="p-6 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 tracking-tight text-gray-900">
          Analytics Overview
        </h1>

        {loading || !analytics ? (
          <p className="text-gray-500">Loading...</p>
        ) : (
          <>
            {/* KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-10">
              {[
                {
                  label: "Revenue (last 30 days)",
                  value: `${analytics.revenueLast30Days} CHF`,
                },
                { label: "Tickets sold", value: analytics.totalTickets },
                { label: "Conversion rate", value: "—" }, // Placeholder
                { label: "Top event", value: analytics.topEventName },
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

            {/* Top events table */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold mb-4 text-gray-800">
                Top Events by Revenue
              </h2>
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
                    {(analytics.topEvents || []).map((event) => (
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
          </>
        )}
      </div>
    </ManagerLayout>
  );
}

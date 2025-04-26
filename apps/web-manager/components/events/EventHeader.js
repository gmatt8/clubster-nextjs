// apps/web-manager/components/events/EventHeader.js
"use client";

import Link from "next/link";
import { FaAngleLeft } from "react-icons/fa";

export default function EventHeader({ title, backHref = "/events" }) {
  return (
    <div className="mb-6">
      {/* Breadcrumb con pulsante back */}
      <div className="flex items-center text-sm text-gray-500 space-x-1 mb-1">
        <Link href={backHref} className="flex items-center space-x-1 text-purple-600 hover:underline">
          <FaAngleLeft className="inline-block" />
          <span>Events</span>
        </Link>
        <span className="text-gray-400">/</span>
        <span>{title}</span>
      </div>
      {/* Titolo principale */}
      <h1 className="text-2xl font-bold">{title}</h1>
    </div>
  );
}

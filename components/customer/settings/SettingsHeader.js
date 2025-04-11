// app/dashboard/customer/settings/SettingsHeader.js
"use client";

import Link from "next/link";
// Se stai già usando qualche libreria di icone (ad es. react-icons) puoi importare un'icona triangolare o simile
import { FaAngleLeft } from "react-icons/fa";

export default function SettingsHeader({ title, backHref = "/dashboard/customer/settings" }) {
  return (
    <div className="mb-6">
      {/* Breadcrumb + pulsante "Back to Settings" */}
      <div className="flex items-center text-sm text-gray-500 space-x-1 mb-1">
        <Link
          href={backHref}
          className="flex items-center space-x-1 text-purple-600 hover:underline"
        >
          <FaAngleLeft className="inline-block" />
          <span>Settings</span>
        </Link>
        <span className="text-gray-400">/</span>
        <span>{title}</span>
      </div>
      {/* Titolo principale */}
      <h1 className="text-2xl font-bold">{title}</h1>
    </div>
  );
}

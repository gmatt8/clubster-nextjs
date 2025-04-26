// components/settings/SettingsHeader.js
"use client";

import Link from "next/link";
import { FaAngleLeft } from "react-icons/fa";

/**
 * Prop:
 *  - breadcrumbs: array di oggetti { label: string, href?: string }
 *    Ad esempio:
 *      [
 *        { label: "Settings", href: "/settings" },
 *        { label: "Legal", href: "/settings/legal" },
 *        { label: "Privacy Policy" }
 *      ]
 *  - title: string (il titolo principale)
 *  - backHref: string (opzionale, usato se breadcrumbs non viene passato)
 */
export default function ManagerSettingsHeader({ breadcrumbs, title, backHref = "/settings" }) {
  return (
    <div className="mb-6 text-left">
      <div className="flex items-center text-sm text-gray-500 space-x-1 mb-1">
        {breadcrumbs && breadcrumbs.length > 0 ? (
          breadcrumbs.map((crumb, index) => (
            <span key={index} className="flex items-center">
              {crumb.href ? (
                <Link href={crumb.href} className="flex items-center space-x-1 text-purple-600 hover:underline">
                  {/* Solo per il primo elemento, aggiungiamo l'icona di back */}
                  {index === 0 && <FaAngleLeft className="inline-block" />}
                  <span>{crumb.label}</span>
                </Link>
              ) : (
                <span>{crumb.label}</span>
              )}
              {index < breadcrumbs.length - 1 && (
                <span className="text-gray-400 mx-1">/</span>
              )}
            </span>
          ))
        ) : (
          <Link href={backHref} className="flex items-center space-x-1 text-purple-600 hover:underline">
            <FaAngleLeft className="inline-block" />
            <span>Settings</span>
          </Link>
        )}
      </div>
      <h1 className="text-2xl font-bold">{title}</h1>
    </div>
  );
}

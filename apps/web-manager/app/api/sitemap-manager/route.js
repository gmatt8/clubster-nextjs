// apps/web-manager/app/api/sitemap-manager/route.js
import { NextResponse } from "next/server";

export async function GET() {
  const baseUrl = "https://www.manager.clubsterhub.com";
  const today = new Date().toISOString().split("T")[0];

  const urls = [
    '/',
    '/login',
    '/signup',
  ];

  const xml = urls
    .map(
      (path) => `
    <url>
      <loc>${baseUrl}${path}</loc>
      <lastmod>${today}</lastmod>
      <priority>0.8</priority>
    </url>`
    )
    .join("");

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${xml}
  </urlset>`;

  return new NextResponse(sitemap, {
    headers: { "Content-Type": "application/xml" },
  });
}

// app/api/sitemap-customer/route.js
import { createServerSupabase } from "@lib/supabase-server";
import { NextResponse } from "next/server";

export async function GET() {
  const baseUrl = "https://www.clubsterhub.com";
  const today = new Date().toISOString().split("T")[0];

  const supabase = await createServerSupabase();
  const { data: clubs } = await supabase
    .from("clubs")
    .select("id, updated_at")
    .eq("verified", true);

  const dynamicUrls = (clubs || []).map((club) => {
    const lastmod = club.updated_at
      ? new Date(club.updated_at).toISOString().split("T")[0]
      : today;
    return `
      <url>
        <loc>${baseUrl}/customer/club-details?club_id=${club.id}</loc>
        <lastmod>${lastmod}</lastmod>
        <priority>0.7</priority>
      </url>`;
  });

  const staticUrls = [
    '/',
    '/auth/customer/signup',
    '/auth/customer/login',
  ];

  const staticXml = staticUrls
    .map(
      (path) => `
      <url>
        <loc>${baseUrl}${path}</loc>
        <lastmod>${today}</lastmod>
        <priority>0.8</priority>
      </url>`
    )
    .join("");

  const fullSitemap = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${staticXml}
    ${dynamicUrls.join("")}
  </urlset>`;

  return new NextResponse(fullSitemap, {
    headers: { "Content-Type": "application/xml" },
  });
}

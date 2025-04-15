// app/api/sitemap/route.js
import { createServerSupabase } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export async function GET() {
  const baseUrl = "https://www.clubsterapp.com";

  const staticUrls = [
    '/',
    '/auth/manager/landing',
    '/auth/manager/signup',
    '/auth/manager/login',
    '/auth/customer/signup',
    '/auth/customer/login',
  ];

  const today = new Date().toISOString().split("T")[0];

  const supabase = await createServerSupabase();

  const { data: clubs, error } = await supabase
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

  const staticXml = staticUrls
    .map(
      (path) => `
      <url>
        <loc>${baseUrl}${path}</loc>
        <lastmod>${today}</lastmod>
        <priority>${path === '/' ? '1.0' : '0.8'}</priority>
      </url>`
    )
    .join("");

  const fullSitemap = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${staticXml}
    ${dynamicUrls.join("")}
  </urlset>`;

  return new NextResponse(fullSitemap, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}

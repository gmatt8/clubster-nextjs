// app/api/popular/route.js
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Query per i club popolari
    const popularClubs = await prisma.$queryRaw`
      SELECT 
        c.id, 
        c.name, 
        c.address, 
        c.images, 
        COUNT(b.id) AS booking_count
      FROM clubs c
      JOIN events e ON c.id = e.club_id
      JOIN bookings b ON e.id = b.event_id
      GROUP BY c.id, c.name, c.address, c.images
      ORDER BY booking_count DESC
      LIMIT 5;
    `;

    // Query per gli eventi popolari: si include anche il nome del club per visualizzazione.
    const popularEvents = await prisma.$queryRaw`
      SELECT 
        e.id, 
        e.name, 
        e.image, 
        e.club_id, 
        e.start_date, 
        COUNT(b.id) AS booking_count,
        c.name AS club_name
      FROM events e
      JOIN bookings b ON e.id = b.event_id
      JOIN clubs c ON e.club_id = c.id
      GROUP BY e.id, e.name, e.image, e.club_id, e.start_date, c.name
      ORDER BY booking_count DESC
      LIMIT 5;
    `;

    // Definiamo un replacer per JSON.stringify che converte i BigInt in stringa
    const replacer = (key, value) => 
      typeof value === "bigint" ? value.toString() : value;

    return new Response(
      JSON.stringify({ popularClubs, popularEvents }, replacer),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in /api/popular:", error);
    return new Response(
      JSON.stringify({ error: error.message || "An error occurred" }),
      { status: 500 }
    );
  }
}

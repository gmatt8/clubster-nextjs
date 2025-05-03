// apps/web-manager/app/api/analytics/route.js
import { createServerSupabase } from "@lib/supabase-server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createServerSupabase();
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);

    // 1. Get user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Get manager's club
    const { data: club } = await supabase
      .from("clubs")
      .select("id")
      .eq("manager_id", user.id)
      .single();

    if (!club) {
      return NextResponse.json({ error: "Club not found" }, { status: 404 });
    }

    // 3. Get events of this club
    const { data: events } = await supabase
      .from("events")
      .select("id, name, start_date")
      .eq("club_id", club.id);

    const eventMap = {};
    const eventIds = events?.map((e) => {
      eventMap[e.id] = { name: e.name, start_date: e.start_date };
      return e.id;
    }) || [];

    // 4. Get bookings confirmed for those events
    const { data: bookings } = await supabase
      .from("bookings")
      .select("event_id, created_at, quantity")
      .eq("status", "confirmed")
      .in("event_id", eventIds);

    // 5. Get ticket categories to estimate prices
    const { data: categories } = await supabase
      .from("ticket_categories")
      .select("event_id, price")
      .in("event_id", eventIds);

    const priceMap = {};
    categories.forEach((cat) => {
      if (!priceMap[cat.event_id]) priceMap[cat.event_id] = [];
      priceMap[cat.event_id].push(cat.price);
    });

    // Helper: estimate average price per event
    const getAvgPrice = (eventId) => {
      const prices = priceMap[eventId] || [];
      if (prices.length === 0) return 0;
      return prices.reduce((sum, p) => sum + p, 0) / prices.length;
    };

    // Analytics calculations
    let revenueLast30Days = 0;
    let totalTickets = 0;
    const revenueByMonth = {};
    const eventStats = {};

    bookings.forEach((b) => {
      const date = new Date(b.created_at);
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
      const avgPrice = getAvgPrice(b.event_id);
      const revenue = avgPrice * b.quantity;

      // Total revenue last 30 days
      if (date >= thirtyDaysAgo) {
        revenueLast30Days += revenue;
      }

      totalTickets += b.quantity;

      // Monthly revenue
      if (!revenueByMonth[monthKey]) revenueByMonth[monthKey] = 0;
      revenueByMonth[monthKey] += revenue;

      // Per-event stats
      if (!eventStats[b.event_id]) {
        eventStats[b.event_id] = {
          tickets: 0,
          revenue: 0,
          name: eventMap[b.event_id]?.name || "Unknown",
        };
      }
      eventStats[b.event_id].tickets += b.quantity;
      eventStats[b.event_id].revenue += revenue;
    });

    // Format monthly revenue
    const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlyRevenue = Object.entries(revenueByMonth)
      .map(([key, value]) => {
        const [year, monthIndex] = key.split("-").map(Number);
        return {
          name: `${monthLabels[monthIndex]} ${year}`,
          value: Math.round(value),
        };
      })
      .sort((a, b) => new Date(a.name) - new Date(b.name));

    // Top events
    const topEvents = Object.values(eventStats)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    const topEvent = topEvents[0] || { name: "—" };

    return NextResponse.json({
      revenueLast30Days: Math.round(revenueLast30Days),
      totalTickets,
      topEventName: topEvent.name,
      monthlyRevenue,
      topEvents: topEvents.map((e) => ({
        name: e.name,
        tickets: e.tickets,
        revenue: `${Math.round(e.revenue)} CHF`,
      })),
    });
  } catch (error) {
    console.error("Analytics API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

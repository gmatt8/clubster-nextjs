
// apps/web-manager/app/api/dashboard/route.js

export const dynamic = "force-dynamic";
import { createServerSupabase } from "@lib/supabase-server";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const range = searchParams.get("range") || "last_30_days";

    const now = new Date();
    let fromDate = null;

    switch (range) {
      case "today":
        fromDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case "yesterday":
        fromDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
        break;
      case "last_7_days":
        fromDate = new Date(now);
        fromDate.setDate(now.getDate() - 6);
        break;
      case "last_30_days":
        fromDate = new Date(now);
        fromDate.setDate(now.getDate() - 29);
        break;
      case "last_6_months":
        fromDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
        break;
      case "last_year":
        fromDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        break;
      case "year_to_date":
        fromDate = new Date(now.getFullYear(), 0, 1);
        break;
      case "all_time":
      default:
        break;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || !profile || profile.role !== "manager") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { data: clubs } = await supabase
      .from("clubs")
      .select("id")
      .eq("manager_id", user.id);

    const clubIds = clubs?.map((c) => c.id) || [];

    const { data: events } = await supabase
      .from("events")
      .select("id, start_date, end_date")
      .in("club_id", clubIds);

    const eventIds = events?.map((e) => e.id) || [];

    // ✅ Active events: where now is between start and end
    const activeEvents = (events || []).filter((e) => {
      const start = new Date(e.start_date);
      const end = e.end_date ? new Date(e.end_date) : start;
      return start <= now && now <= end;
    });

    // Fetch confirmed bookings
    let bookingQuery = supabase
      .from("bookings")
      .select("user_id, quantity, created_at")
      .eq("status", "confirmed")
      .in("event_id", eventIds);

    if (fromDate) {
      bookingQuery = bookingQuery.gte("created_at", fromDate.toISOString());
    }

    const { data: bookings, error: bookingError } = await bookingQuery;
    if (bookingError) {
      return NextResponse.json({ error: "Error loading bookings" }, { status: 500 });
    }

    const ticketPriceCHF = 25;
    const totalTickets = bookings.reduce((sum, b) => sum + b.quantity, 0);
    const revenue = totalTickets * ticketPriceCHF;
    const uniqueCustomers = new Set(bookings.map((b) => b.user_id));

    return NextResponse.json({
      totalCustomers: uniqueCustomers.size,
      totalTickets,
      revenue,
      activeEvents: activeEvents.length,
    });
  } catch (error) {
    console.error("[Dashboard] API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

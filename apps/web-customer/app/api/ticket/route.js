export const dynamic = "force-dynamic";

// apps/web-customer/app/api/ticket/route.js
import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import puppeteer from "puppeteer";
import QRCode from "qrcode";
import { createServerSupabase } from "../../../../../lib/supabase-server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get("booking_id");
    if (!bookingId) {
      return new Response("booking_id is required", { status: 400 });
    }

    // 1. Recupera i ticket dal database
    const supabase = await createServerSupabase();
    const { data: tickets, error: ticketsError } = await supabase
      .from("tickets")
      .select("*")
      .eq("booking_id", bookingId);

    if (ticketsError || !tickets || tickets.length === 0) {
      return new Response("No tickets found for this booking", { status: 404 });
    }

    // 2. Recupera i dettagli del booking per ottenere nome evento, start date, club name e indirizzo del club
    const { data: bookingDetails, error: bookingError } = await supabase
      .from("bookings")
      .select(`
        id,
        event_id,
        events (
          name,
          start_date,
          clubs ( name, address )
        )
      `)
      .eq("id", bookingId)
      .single();

    let clubName = "Nome del Club";
    let eventName = "Nome dell'Evento";
    let eventDateFormatted = "Event Date";
    let startTimeFormatted = "Start Time";
    let clubAddress = "Indirizzo del Club";

    if (bookingError) {
      console.error("Error fetching booking details:", bookingError);
    } else if (
      bookingDetails &&
      bookingDetails.events &&
      bookingDetails.events.clubs
    ) {
      clubName = bookingDetails.events.clubs.name;
      clubAddress = bookingDetails.events.clubs.address || clubAddress;
      eventName = bookingDetails.events.name;

      // Formatta la data in formato "4 Feb 2025"
      const eventDate = new Date(bookingDetails.events.start_date);
      eventDateFormatted = eventDate.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
      // Formatta l'orario in formato "20:00"
      startTimeFormatted = eventDate.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    }

    // 3. Definisci il prezzo (se presente, altrimenti lo puoi eliminare)
    // In questo caso non usiamo il price, quindi non viene sostituito

    // 4. Genera il QR Code (utilizza il dato qr_data del primo ticket)
    const qrDataUrl = await QRCode.toDataURL(tickets[0].qr_data);

    // 5. Carica il template HTML
    const templatePath = path.join(process.cwd(), "..", "..", "shared", "templates", "ticketTemplate.html");
    let html = await fs.readFile(templatePath, "utf-8");

    // 6. Carica il logo dal file system e convertilo in base64
    const logoPath = path.join(process.cwd(), "public", "images", "clubster-logo.png");
    const logoBytes = await fs.readFile(logoPath);
    const logoBase64 = logoBytes.toString("base64");

    // 7. Sostituisci i segnaposto nel template con i valori reali
    html = html
      .replace("[[LOGO_BASE64]]", `data:image/png;base64,${logoBase64}`)
      .replace("[[EVENT_NAME]]", eventName)
      .replace("[[CLUB_NAME]]", clubName)
      .replace("[[CLUB_ADDRESS]]", clubAddress)
      .replace("[[EVENT_DATE]]", eventDateFormatted)
      .replace("[[START_TIME]]", startTimeFormatted)
      // Rimossi il prezzo: non sostituiamo [[TICKET_PRICE]]
      .replace("[[BOOKING_ID]]", bookingId)
      .replace("[[QR_CODE_DATAURL]]", qrDataUrl)
      // Per Ticket ID, usiamo il primo ticket (o adatta alla logica necessaria)
      .replace("[[TICKET_ID]]", tickets[0].id);

    // 8. Avvia Puppeteer e genera il PDF in formato A4
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "10mm", bottom: "10mm", left: "10mm", right: "10mm" },
    });
    await browser.close();

    // 9. Restituisci il PDF
    const fileName = `Clubster_tickets_${bookingId}.pdf`;
    return new Response(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (err) {
    console.error("Error generating PDF ticket:", err);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
}

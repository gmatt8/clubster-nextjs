// app/api/ticket/route.js
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import QRCode from "qrcode";
import { createServerSupabase } from "@/lib/supabase-server";
import fs from "fs/promises";
import path from "path";

export async function GET(request) {
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
  let eventStart = "Orario start";
  let clubAddress = "Indirizzo del Club";

  if (bookingError) {
    console.error("Error fetching booking details: ", bookingError);
  } else if (
    bookingDetails &&
    bookingDetails.events &&
    bookingDetails.events.clubs
  ) {
    clubName = bookingDetails.events.clubs.name;
    clubAddress = bookingDetails.events.clubs.address || clubAddress;
    eventName = bookingDetails.events.name;
    eventStart = bookingDetails.events.start_date;
    if (eventStart) {
      // Formatta la data in modo leggibile
      eventStart = new Date(eventStart).toLocaleString();
    }
  }

  // 3. Crea il PDF ed incorpora il font base
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // 4. Carica il logo dal file system (verifica che il percorso sia corretto)
  const logoPath = path.join(process.cwd(), "public", "images", "clubster-logo.png");
  const logoBytes = await fs.readFile(logoPath);
  const logoImage = await pdfDoc.embedPng(logoBytes);
  const logoOrigWidth = logoImage.width;
  const logoOrigHeight = logoImage.height;

  // 5. Imposta alcuni valori di layout
  const margin = 50;
  const headerHeight = 80;

  // 6. Genera una pagina per ogni ticket
  for (const [index, ticket] of tickets.entries()) {
    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();

    // 6a. Disegna un rettangolo come header (colore grigio molto chiaro)
    page.drawRectangle({
      x: 0,
      y: height - headerHeight,
      width: width,
      height: headerHeight,
      color: rgb(0.95, 0.95, 0.97),
    });

    // 6b. Testo "TICKET" in alto a sinistra nell'header
    page.drawText("TICKET", {
      x: margin,
      y: height - headerHeight + 25,
      size: 24,
      font,
      color: rgb(0, 0, 0),
    });

    // 6c. Logo in alto a destra con effetto ringrandito

    // Imposta la larghezza desiderata
    const desiredLogoWidth = 80;
    const aspectRatio = logoOrigWidth / logoOrigHeight;
    const desiredLogoHeight = desiredLogoWidth / aspectRatio;

    // Parametri per il "container" del logo
    const logoBgPadding = 5;
    const shadowOffset = 2;

    // Calcola le coordinate base per il logo
    const baseLogoX = width - margin - desiredLogoWidth;
    const baseLogoY = height - headerHeight + (headerHeight - desiredLogoHeight) / 2;

    // Disegna l'ombra
    page.drawRectangle({
      x: baseLogoX - logoBgPadding + shadowOffset,
      y: baseLogoY - logoBgPadding - shadowOffset,
      width: desiredLogoWidth + 2 * logoBgPadding,
      height: desiredLogoHeight + 2 * logoBgPadding,
      color: rgb(0.6, 0.6, 0.6),
    });

    // Disegna il container bianco con bordo
    page.drawRectangle({
      x: baseLogoX - logoBgPadding,
      y: baseLogoY - logoBgPadding,
      width: desiredLogoWidth + 2 * logoBgPadding,
      height: desiredLogoHeight + 2 * logoBgPadding,
      color: rgb(1, 1, 1),
      borderColor: rgb(0.8, 0.8, 0.8),
      borderWidth: 1,
    });

    // Disegna il logo
    page.drawImage(logoImage, {
      x: baseLogoX,
      y: baseLogoY,
      width: desiredLogoWidth,
      height: desiredLogoHeight,
    });

    // 6d. Sotto l'header, aggiungi i dettagli:
    // "Ticket X of Y", "Booking ID", "Club: [clubName]", "Event: [eventName]",
    // "Start: [eventStart]" e "Address: [clubAddress]"
    let detailsY = height - headerHeight - 40;
    page.drawText(`Ticket ${index + 1} of ${tickets.length}`, {
      x: margin,
      y: detailsY,
      size: 12,
      font,
      color: rgb(0, 0, 0),
    });
    detailsY -= 20;
    page.drawText(`Booking ID: ${bookingId}`, {
      x: margin,
      y: detailsY,
      size: 12,
      font,
      color: rgb(0, 0, 0),
    });
    detailsY -= 20;
    page.drawText(`Club: ${clubName}`, {
      x: margin,
      y: detailsY,
      size: 12,
      font,
      color: rgb(0, 0, 0),
    });
    detailsY -= 20;
    page.drawText(`Event: ${eventName}`, {
      x: margin,
      y: detailsY,
      size: 12,
      font,
      color: rgb(0, 0, 0),
    });
    detailsY -= 20;
    page.drawText(`Start: ${eventStart}`, {
      x: margin,
      y: detailsY,
      size: 12,
      font,
      color: rgb(0, 0, 0),
    });
    detailsY -= 20;
    page.drawText(`Address: ${clubAddress}`, {
      x: margin,
      y: detailsY,
      size: 12,
      font,
      color: rgb(0, 0, 0),
    });

    // 6e. Genera il QR code e posizionalo centrato (sotto l'header)
    const qrDataUrl = await QRCode.toDataURL(ticket.qr_data);
    const qrImageBytes = await fetch(qrDataUrl).then((res) => res.arrayBuffer());
    const qrImage = await pdfDoc.embedPng(qrImageBytes);

    const qrWidth = 150;
    const qrHeight = 150;
    const qrX = (width - qrWidth) / 2;
    const qrY = (height - headerHeight) / 2 - (qrHeight / 2);

    page.drawImage(qrImage, {
      x: qrX,
      y: qrY,
      width: qrWidth,
      height: qrHeight,
    });

    // 6f. Posiziona il Ticket ID sotto il QR code
    page.drawText(`Ticket ID: ${ticket.id}`, {
      x: qrX,
      y: qrY - 20,
      size: 12,
      font,
      color: rgb(0, 0, 0),
    });
  }

  // 7. Serializza il PDF e imposta l'header per il download
  const pdfBytes = await pdfDoc.save();
  const fileName = `Clubster_tickets_${bookingId}.pdf`;

  return new Response(pdfBytes, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${fileName}"`,
    },
  });
}

// app/api/ticket/route.js
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import QRCode from "qrcode";
import { createServerSupabase } from "@/lib/supabase-server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const bookingId = searchParams.get("bookingId");
  if (!bookingId) {
    return new Response("bookingId is required", { status: 400 });
  }

  const supabase = await createServerSupabase();
  // Recupera tutti i ticket per la booking
  const { data: tickets, error } = await supabase
    .from("tickets")
    .select("*")
    .eq("booking_id", bookingId);
  if (error || !tickets || tickets.length === 0) {
    return new Response("No tickets found for this booking", { status: 404 });
  }

  // Crea un nuovo PDF
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // Per ogni ticket, crea una pagina con il relativo QR code e il Ticket ID
  for (const [index, ticket] of tickets.entries()) {
    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();

    // Genera il QR code usando il campo qr_data del ticket
    const qrDataUrl = await QRCode.toDataURL(ticket.qr_data);

    // Aggiungi titolo e dettagli del ticket
    page.drawText("Your Ticket", {
      x: 50,
      y: height - 50,
      size: 24,
      font,
      color: rgb(0, 0, 0),
    });
    page.drawText(`Ticket ${index + 1} of ${tickets.length}`, {
      x: 50,
      y: height - 80,
      size: 12,
      font,
      color: rgb(0, 0, 0),
    });
    page.drawText(`Booking ID: ${bookingId}`, {
      x: 50,
      y: height - 100,
      size: 12,
      font,
      color: rgb(0, 0, 0),
    });

    // Embedde il QR code nel PDF
    const qrImageBytes = await fetch(qrDataUrl).then((res) => res.arrayBuffer());
    const qrImage = await pdfDoc.embedPng(qrImageBytes);
    page.drawImage(qrImage, {
      x: 50,
      y: height - 300,
      width: 150,
      height: 150,
    });

    // Aggiungi il Ticket ID sotto il QR code per sicurezza
    page.drawText(`Ticket ID: ${ticket.id}`, {
      x: 50,
      y: height - 320,
      size: 10,
      font,
      color: rgb(0, 0, 0),
    });
  }

  // Serializza il PDF
  const pdfBytes = await pdfDoc.save();

  return new Response(pdfBytes, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=tickets_${bookingId}.pdf`,
    },
  });
}

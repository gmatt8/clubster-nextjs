// apps/web-customer/app/checkout/cancel/page.js
"use client";

export default function CheckoutCancelPage() {
  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h1>Pagamento annullato</h1>
      <p>Il tuo pagamento è stato annullato. Puoi riprovare o tornare al basket.</p>
      <a href="/basket" style={{ marginTop: "1rem", display: "inline-block", color: "blue" }}>
        Torna al basket
      </a>
    </div>
  );
}

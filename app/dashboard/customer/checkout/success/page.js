// app/dashboard/customer/checkout/success/page.js
"use client";

import CustomerLayout from "../../CustomerLayout";

export default function CheckoutSuccessPage() {
  return (
    <CustomerLayout>
      <div style={{ padding: "2rem" }}>
        <div style={{ maxWidth: "600px", margin: "0 auto", textAlign: "center" }}>
          <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>Thank you!</h1>
          <p style={{ marginBottom: "1rem" }}>
            Your order was placed successfully.
          </p>
          <p style={{ marginBottom: "2rem", color: "#666" }}>
            We sent the order confirmation details to <strong>customer@email.com</strong>
          </p>

          {/* Order info */}
          <div style={{ marginBottom: "2rem" }}>
            <p style={{ margin: "0.25rem 0", fontWeight: "bold" }}>Order number #K374204</p>
            <p style={{ margin: "0.25rem 0", color: "#666" }}>Order date 15 September 2024</p>
          </div>

          {/* Big box with event details */}
          <div
            style={{
              border: "1px solid #ddd",
              borderRadius: "8px",
              padding: "1rem",
              textAlign: "left",
              marginBottom: "2rem",
            }}
          >
            <div style={{ marginBottom: "1rem" }}>
              <p style={{ fontSize: "1rem", margin: 0, color: "#666" }}>
                16 September 2024
              </p>
              <p style={{ fontSize: "1.2rem", margin: "0.25rem 0", fontWeight: "bold" }}>
                SPECIAL GUEST - DAVID GUETTA
              </p>
              <p style={{ margin: 0, color: "#666" }}>Seven Club, Lugano [Switzerland]</p>
            </div>

            {/* Azioni (Download tickets, invoice, ecc.) */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
              <button
                style={{
                  backgroundColor: "#6c63ff",
                  color: "#fff",
                  border: "none",
                  padding: "0.5rem 1rem",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Download tickets
              </button>
              <button
                style={{
                  backgroundColor: "#6c63ff",
                  color: "#fff",
                  border: "none",
                  padding: "0.5rem 1rem",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Download invoice
              </button>
            </div>
          </div>

          {/* Pulsante "View bookings" o "Go to bookings" */}
          <button
            style={{
              backgroundColor: "#6c63ff",
              color: "#fff",
              border: "none",
              padding: "0.75rem 1.5rem",
              borderRadius: "4px",
              cursor: "pointer",
              marginBottom: "2rem",
            }}
          >
            View bookings
          </button>

          <p style={{ marginBottom: "0.5rem", color: "#666" }}>
            Need help or have questions? Contact support
          </p>
        </div>
      </div>
    </CustomerLayout>
  );
}

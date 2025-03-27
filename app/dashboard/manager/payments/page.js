"use client";

import { useState, useEffect } from "react";
import { createBrowserSupabase } from "@/lib/supabase-browser";
import ManagerLayout from "../ManagerLayout";

export default function ManagerPaymentsPage() {
  const [stripeStatus, setStripeStatus] = useState("loading");
  const [stripeAccountId, setStripeAccountId] = useState("");
  const [error, setError] = useState("");

  // Crea l'istanza di supabase per il browser
  const supabase = createBrowserSupabase();

  useEffect(() => {
    async function fetchStripeStatus() {
      try {
        // Recupera l'utente loggato
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();
        if (userError || !user) {
          setError("Nessun utente loggato o errore nel recupero utente");
          setStripeStatus("none");
          return;
        }

        // Recupera i dati del club associato al manager
        const { data: club, error: clubError } = await supabase
          .from("clubs")
          .select("stripe_status, stripe_account_id")
          .eq("manager_id", user.id)
          .single();

        if (clubError) {
          setError("Errore nel recupero dati del club: " + clubError.message);
          setStripeStatus("none");
          return;
        }

        if (club && club.stripe_status) {
          setStripeStatus(club.stripe_status);
          setStripeAccountId(club.stripe_account_id);
        } else {
          setStripeStatus("none");
        }
      } catch (err) {
        console.error("Errore fetchStripeStatus:", err);
        setError("Impossibile recuperare lo stato Stripe");
        setStripeStatus("none");
      }
    }

    fetchStripeStatus();
  }, [supabase]);

  function handleConnectStripe() {
    fetch("/api/stripe/onboarding")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to get Stripe OAuth URL");
        }
        return res.json();
      })
      .then((data) => {
        window.location.href = data.url;
      })
      .catch((err) => {
        console.error("Error during Stripe onboarding:", err);
        alert("Errore durante la connessione a Stripe");
      });
  }

  function handleCompleteSetup() {
    alert("TODO: Reindirizzare a Stripe per completare la configurazione");
  }

  function handleGoToStripeDashboard() {
    window.location.href = "https://dashboard.stripe.com/";
  }

  return (
    <ManagerLayout>
      <h1 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>Payments</h1>

      {stripeStatus === "loading" && <p>Loading Stripe status...</p>}

      {stripeStatus === "none" && (
        <div
          style={{
            border: "1px solid #ccc",
            padding: "1rem",
            borderRadius: "4px",
          }}
        >
          <h2>Set Up Stripe Payment</h2>
          <p>
            To start receiving payments directly into your Stripe account,
            please connect your Stripe account now. Setup is fast, secure, and
            takes only a few minutes.
          </p>
          <button
            onClick={handleConnectStripe}
            style={{
              padding: "0.75rem 1rem",
              backgroundColor: "#007bff",
              color: "#fff",
            }}
          >
            Connect Stripe Account
          </button>
          <div style={{ marginTop: "1rem" }}>
            <h3>Steps Explanation:</h3>
            <ol>
              <li>
                Click "Connect Stripe Account": You will be redirected to Stripe
                to create or link your account.
              </li>
              <li>
                Complete the setup: Follow the on-screen instructions on Stripe.
              </li>
              <li>
                Return to the dashboard: Once completed, you'll be redirected
                back here, and your account will be ready.
              </li>
            </ol>
          </div>
        </div>
      )}

      {stripeStatus === "incomplete" && (
        <div
          style={{
            border: "2px solid orange",
            padding: "1rem",
            borderRadius: "4px",
          }}
        >
          <h2>Stripe Payment</h2>
          <p style={{ color: "orange", fontWeight: "bold" }}>
            Action required: Incomplete Stripe Setup
          </p>
          <p>
            Your Stripe account has been connected but is not yet fully activated.
            Stripe requires additional information to enable payouts and payment
            processing.
          </p>
          <button
            onClick={handleCompleteSetup}
            style={{
              padding: "0.75rem 1rem",
              backgroundColor: "orange",
              color: "#fff",
            }}
          >
            Complete Setup Now
          </button>
        </div>
      )}

      {stripeStatus === "active" && (
        <div
          style={{
            border: "1px solid #ccc",
            padding: "1rem",
            borderRadius: "4px",
          }}
        >
          <h2>Stripe Payment</h2>
          <p style={{ color: "green", fontWeight: "bold" }}>
            Stripe account connected
          </p>
          <p>
            Account ID: <strong>{stripeAccountId || "Not available"}</strong>
          </p>
          <p>Status: <strong>Active</strong></p>
          <button
            onClick={handleGoToStripeDashboard}
            style={{
              padding: "0.75rem 1rem",
              backgroundColor: "#007bff",
              color: "#fff",
            }}
          >
            Go to Stripe Dashboard
          </button>
          <p style={{ marginTop: "1rem" }}>
            Need to disconnect or change your Stripe account? Please contact our
            support team.
          </p>
        </div>
      )}

      {error && <p style={{ color: "red", marginTop: "1rem" }}>{error}</p>}
    </ManagerLayout>
  );
}

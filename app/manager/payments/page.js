// app/manager/payments/page.js
"use client";

import { useState, useEffect } from "react";
import { createBrowserSupabase } from "@/lib/supabase-browser";
import ManagerLayout from "../ManagerLayout";
import { Loader2 } from "lucide-react"; // se usi Lucide

export default function ManagerPaymentsPage() {
  const [stripeStatus, setStripeStatus] = useState("loading");
  const [stripeAccountId, setStripeAccountId] = useState("");
  const [error, setError] = useState("");

  const supabase = createBrowserSupabase();

  useEffect(() => {
    async function fetchStripeStatus() {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          setError("Nessun utente loggato.");
          setStripeStatus("none");
          return;
        }

        const { data: club, error: clubError } = await supabase
          .from("clubs")
          .select("stripe_status, stripe_account_id")
          .eq("manager_id", user.id)
          .single();

        if (clubError) {
          setError("Errore nel recupero dati del club.");
          setStripeStatus("none");
          return;
        }

        setStripeStatus(club.stripe_status || "none");
        setStripeAccountId(club.stripe_account_id || "");
      } catch (err) {
        console.error("Stripe fetch error:", err);
        setError("Errore generico durante il caricamento.");
        setStripeStatus("none");
      }
    }

    fetchStripeStatus();
  }, [supabase]);

  const handleConnectStripe = async () => {
    try {
      const res = await fetch("/api/stripe/onboarding");
      if (!res.ok) throw new Error("Errore nel recupero URL Stripe");
      const { url } = await res.json();
      window.location.href = url;
    } catch (err) {
      console.error(err);
      alert("Errore durante la connessione a Stripe");
    }
  };

  const handleGoToStripeDashboard = () => {
    window.location.href = "https://dashboard.stripe.com/";
  };

  return (
    <ManagerLayout>
      <div className="max-w-2xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold mb-6">Stripe Payments</h1>

        {stripeStatus === "loading" && (
          <div className="flex items-center gap-2 text-gray-600">
            <Loader2 className="animate-spin w-5 h-5" />
            Caricamento...
          </div>
        )}

        {stripeStatus === "none" && (
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <p className="text-gray-700 mb-2">
              🚫 <span className="font-semibold">Stripe non collegato</span>
            </p>
            <p className="text-sm text-gray-600 mb-4">
              Per ricevere pagamenti, collega il tuo account Stripe.
              Il processo è sicuro e richiede solo pochi minuti.
            </p>
            <button
              onClick={handleConnectStripe}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
            >
              Collega Stripe
            </button>

            <div className="mt-6 text-xs text-gray-500">
              Una volta completata la registrazione, tornerai automaticamente qui.
              Per assistenza, <a href="/support" className="text-blue-600 underline">contatta il supporto</a>.
            </div>
          </div>
        )}

        {stripeStatus === "incomplete" && (
          <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-6 shadow-sm">
            <p className="text-yellow-700 font-semibold mb-2">⚠️ Configurazione incompleta</p>
            <p className="text-sm text-gray-700 mb-4">
              Il tuo account Stripe è collegato ma richiede ulteriori informazioni
              prima di poter ricevere pagamenti.
            </p>
            <button
              onClick={handleConnectStripe}
              className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 text-sm"
            >
              Completa su Stripe
            </button>
          </div>
        )}

        {stripeStatus === "active" && (
          <div className="bg-green-50 border border-green-300 rounded-lg p-6 shadow-sm">
            <p className="text-green-700 font-semibold mb-2">✅ Stripe collegato correttamente</p>
            <div className="text-sm text-gray-700 mb-3">
              <p>
                <span className="font-semibold">Account ID:</span> {stripeAccountId}
              </p>
              <p>
                <span className="font-semibold">Status:</span> Active
              </p>
            </div>
            <button
              onClick={handleGoToStripeDashboard}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
            >
              Vai alla Dashboard Stripe
            </button>
            <p className="text-xs text-gray-500 mt-4">
              Per modifiche o disconnessioni, contatta il nostro team di supporto.
            </p>
          </div>
        )}

        {error && (
          <p className="text-red-600 text-sm mt-4">{error}</p>
        )}
      </div>
    </ManagerLayout>
  );
}

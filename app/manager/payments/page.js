// app/manager/payments/page.js
"use client";

import { useState, useEffect } from "react";
import { createBrowserSupabase } from "@/lib/supabase-browser";
import ManagerLayout from "../ManagerLayout";
import { Loader2 } from "lucide-react";

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

  const renderStripeStatus = () => {
    switch (stripeStatus) {
      case "loading":
        return (
          <div className="flex items-center gap-2 text-gray-600">
            <Loader2 className="animate-spin w-5 h-5" />
            Caricamento...
          </div>
        );
      case "none":
        return (
          <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Stripe non collegato</h2>
            <p className="text-sm text-gray-600 mb-4">
              Per ricevere pagamenti dagli utenti, collega il tuo account Stripe. Il processo è sicuro e richiede solo pochi minuti.
            </p>
            <button
              onClick={handleConnectStripe}
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 text-sm"
            >
              Collega Stripe
            </button>
            <p className="mt-4 text-xs text-gray-500">
              Una volta completata la registrazione, tornerai automaticamente su questa pagina. Per assistenza,{" "}
              <a href="/support" className="text-purple-600 underline">contatta il supporto</a>.
            </p>
          </div>
        );
      case "incomplete":
        return (
          <div className="bg-yellow-50 border border-yellow-300 p-6 rounded-2xl shadow-sm">
            <h2 className="text-xl font-semibold text-yellow-800 mb-2">Configurazione incompleta</h2>
            <p className="text-sm text-gray-700 mb-4">
              Il tuo account Stripe è collegato ma deve essere completato per poter ricevere pagamenti.
            </p>
            <button
              onClick={handleConnectStripe}
              className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 text-sm"
            >
              Completa configurazione
            </button>
          </div>
        );
      case "active":
        return (
          <div className="bg-green-50 border border-green-300 p-6 rounded-2xl shadow-sm">
            <h2 className="text-xl font-semibold text-green-800 mb-2">Stripe attivo ✅</h2>
            <div className="text-sm text-gray-800 mb-3">
              <p><span className="font-medium">Account ID:</span> {stripeAccountId}</p>
              <p><span className="font-medium">Status:</span> Attivo</p>
            </div>
            <button
              onClick={handleGoToStripeDashboard}
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 text-sm"
            >
              Vai alla Dashboard Stripe
            </button>
            <p className="text-xs text-gray-500 mt-4">
              Per modifiche al tuo account Stripe, contatta il supporto oppure gestiscile direttamente tramite la dashboard.
            </p>
          </div>
        );
      default:
        return (
          <p className="text-red-600 text-sm mt-4">Errore sconosciuto nello stato Stripe.</p>
        );
    }
  };

  return (
    <ManagerLayout>
      <div className="max-w-3xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-semibold mb-6 tracking-tight">Stripe Payments</h1>
        {renderStripeStatus()}
        {error && <p className="text-red-600 text-sm mt-4">{error}</p>}
      </div>
    </ManagerLayout>
  );
}

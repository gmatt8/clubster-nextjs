// apps/web-manager/app/payments/page.js
"use client";

import { useState, useEffect } from "react";
import { createBrowserSupabase } from "@lib/supabase-browser";
import ManagerLayout from "../ManagerLayout";
import { Loader2, CheckCircle } from "lucide-react";

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
          setError("No user logged in.");
          setStripeStatus("none");
          return;
        }

        const { data: club, error: clubError } = await supabase
          .from("clubs")
          .select("stripe_status, stripe_account_id")
          .eq("manager_id", user.id)
          .single();

        if (clubError) {
          setError("Error retrieving club data.");
          setStripeStatus("none");
          return;
        }

        setStripeStatus(club.stripe_status || "none");
        setStripeAccountId(club.stripe_account_id || "");
      } catch (err) {
        console.error("Stripe fetch error:", err);
        setError("Generic error during loading.");
        setStripeStatus("none");
      }
    }

    fetchStripeStatus();
  }, [supabase]);

  const handleConnectStripe = async () => {
    try {
      const res = await fetch("/api/stripe/onboarding");
      if (!res.ok) throw new Error("Error fetching Stripe URL");
      const { url } = await res.json();
      window.location.href = url;
    } catch (err) {
      console.error(err);
      alert("Error connecting to Stripe");
    }
  };

  const renderStripeStatus = () => {
    switch (stripeStatus) {
      case "loading":
        return (
          <div className="flex items-center gap-2 text-gray-600 text-sm">
            <Loader2 className="animate-spin w-5 h-5" />
            Loading Stripe status...
          </div>
        );
      case "none":
        return (
          <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm">
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">Stripe not connected</h2>
            <p className="text-sm text-gray-600 mb-4">
              To receive payments, connect your Stripe account securely. It only takes a few minutes.
            </p>
            <button
              onClick={handleConnectStripe}
              className="bg-purple-600 text-white px-5 py-2 rounded-md hover:bg-purple-700 text-sm font-medium"
            >
              Connect your Stripe account
            </button>
            <p className="mt-4 text-xs text-gray-500">
              After registration, you'll be redirected back here. For help, visit our{' '}
              <a href="/support" className="text-purple-600 underline">Support</a> page.
            </p>
          </div>
        );
      case "incomplete":
        return (
          <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-2xl shadow-sm">
            <h2 className="text-2xl font-semibold text-yellow-800 mb-3">Incomplete configuration</h2>
            <p className="text-sm text-yellow-700 mb-4">
              You've started setting up Stripe but haven't finished. Complete it now to receive payments.
            </p>
            <button
              onClick={handleConnectStripe}
              className="bg-yellow-600 text-white px-5 py-2 rounded-md hover:bg-yellow-700 text-sm font-medium"
            >
              Complete Stripe setup
            </button>
          </div>
        );
      case "active":
        return (
          <div className="bg-green-50 border border-green-200 p-6 rounded-2xl shadow-sm">
            <h2 className="text-2xl font-semibold text-green-800 mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-700" />
              Stripe connected
            </h2>
            <div className="text-sm text-gray-800 mb-4 space-y-1">
              <p><strong>Account ID:</strong> {stripeAccountId}</p>
              <p><strong>Status:</strong> Active</p>
            </div>
            <button
              onClick={() => window.open("https://dashboard.stripe.com/", "_blank")}
              className="bg-purple-600 text-white px-5 py-2 rounded-md hover:bg-purple-700 text-sm font-medium"
            >
              Go to Stripe Dashboard
            </button>
            <p className="text-xs text-gray-500 mt-4">
              You can manage your account directly in Stripe or contact our support team for assistance.
            </p>
          </div>
        );
      default:
        return (
          <p className="text-red-600 text-sm mt-4">Unknown Stripe status error.</p>
        );
    }
  };

  return (
    <ManagerLayout>
      <div className="max-w-3xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold mb-6 text-gray-900 tracking-tight">Payments</h1>
        <p className="text-sm text-gray-600 mb-8">
          Connect a Stripe account to receive automatic payouts for your events.
        </p>
        {renderStripeStatus()}
        {error && <p className="text-red-600 text-sm mt-4">{error}</p>}
      </div>
    </ManagerLayout>
  );
}
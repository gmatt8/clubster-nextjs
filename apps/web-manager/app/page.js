//apps/web-manager/app/page.js
'use client';

import { useState } from "react";
import Link from "next/link";
import Footer from "@/components/layout/footer";

export default function ManagerLandingPage() {
  const [ticketPrice, setTicketPrice] = useState(20);
  const [pays, setPays] = useState("customer");
  const commission = Math.round(ticketPrice * 0.05 * 100) / 100;

  return (
    <>
      <main className="w-full bg-[#f8fafc] text-gray-800">
        {/* Header */}
        <header className="w-full flex items-center justify-between px-6 py-4 bg-white shadow-md fixed top-0 left-0 z-50">
          <Link href="/landing">
            <img
              src="/images/clubster-manager-logo.png"
              alt="Clubster Manager Logo"
              className="w-36 h-auto"
            />
          </Link>
          <Link
            href="/login"
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-full shadow transition"
          >
            Login
          </Link>
        </header>

        {/* Hero */}
        <section className="relative min-h-screen flex flex-col justify-center items-center text-center px-4 pt-32 bg-gradient-to-br from-white via-indigo-50 to-white">
          <div className="max-w-3xl z-10">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Manage your club <span className="text-indigo-600">smarter</span><br /> with Clubster Manager
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-8">
              A powerful platform to run bookings, track guests, and grow sales — all in one dashboard.
            </p>
            <Link
              href="/auth/manager/signup"
              className="inline-block px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-full shadow-md transition"
            >
              Get Started Free
            </Link>
          </div>
        </section>

        {/* Highlights */}
        <section className="py-20">
          <div className="max-w-screen-xl mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Why managers love Clubster</h2>
            <p className="text-gray-600 mb-12 max-w-2xl mx-auto">
              We help venue owners increase their efficiency, automate operations and scale events like never before.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-6 bg-white border rounded-xl shadow-sm hover:shadow-md transition">
                <h3 className="text-xl font-semibold mb-2">Real-time Booking Insights</h3>
                <p className="text-gray-600">Understand booking patterns, peak hours, and guest flow with clarity.</p>
              </div>
              <div className="p-6 bg-white border rounded-xl shadow-sm hover:shadow-md transition">
                <h3 className="text-xl font-semibold mb-2">Event Setup in Minutes</h3>
                <p className="text-gray-600">Launch an event with tickets, tables, and guest access in under 5 minutes.</p>
              </div>
              <div className="p-6 bg-white border rounded-xl shadow-sm hover:shadow-md transition">
                <h3 className="text-xl font-semibold mb-2">Revenue Tracking</h3>
                <p className="text-gray-600">Connect Stripe. Track every euro coming in from tickets and bookings.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Commission Section */}
        <section className="py-20 bg-white">
          <div className="max-w-screen-md mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">Transparent, Flexible Commission</h2>
            <p className="text-gray-600 mb-8">
              Clubster Manager applies a fixed{" "}
              <span className="font-semibold text-indigo-600">5% commission</span> per ticket sold.
              You decide whether it's paid by <span className="underline">your customer</span> or <span className="underline">your club</span>.
            </p>

            {/* Toggle */}
            <div className="flex justify-center gap-4 mb-6">
              <button
                onClick={() => setPays("customer")}
                className={`px-4 py-2 rounded-full border ${
                  pays === "customer"
                    ? "bg-indigo-600 text-white"
                    : "bg-white text-gray-700 border-gray-300"
                } transition`}
              >
                Customer pays
              </button>
              <button
                onClick={() => setPays("club")}
                className={`px-4 py-2 rounded-full border ${
                  pays === "club"
                    ? "bg-indigo-600 text-white"
                    : "bg-white text-gray-700 border-gray-300"
                } transition`}
              >
                Club pays
              </button>
            </div>

            {/* Slider */}
            <div className="w-full max-w-sm mx-auto text-left mb-6">
              <label htmlFor="ticketSlider" className="block text-sm font-medium text-gray-700 mb-2">
                Ticket price: <span className="font-semibold text-gray-900">{ticketPrice} €</span>
              </label>
              <input
                id="ticketSlider"
                type="range"
                min={0}
                max={100}
                value={ticketPrice}
                onChange={(e) => setTicketPrice(Number(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Commission Result */}
            <div className="text-gray-800 text-lg font-medium">
              {pays === "customer" ? (
                <>
                  The customer will pay{" "}
                  <span className="text-indigo-600">{ticketPrice + commission}€</span>.<br />
                  Your club earns{" "}
                  <span className="text-green-600">{ticketPrice}€</span>.
                </>
              ) : (
                <>
                  The customer pays{" "}
                  <span className="text-indigo-600">{ticketPrice}€</span>.<br />
                  Your club receives{" "}
                  <span className="text-green-600">{ticketPrice - commission}€</span>.
                </>
              )}
            </div>

            {/* Contact */}
            <p className="text-sm text-gray-500 mt-8">
              Need a custom commission plan? Contact us at{" "}
              <a
                href="mailto:clubsterapp@hotmail.com"
                className="text-indigo-600 underline"
              >
                clubsterapp@hotmail.com
              </a>
            </p>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 bg-indigo-50">
          <div className="max-w-screen-xl mx-auto px-4 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-8">Trusted by club managers across Europe</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-md text-left">
                <p className="text-gray-700 mb-3 italic">“Before Clubster, we used spreadsheets and WhatsApp groups. Now everything is in one dashboard.”</p>
                <p className="font-semibold text-indigo-600">Mario G. – Milan</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-md text-left">
                <p className="text-gray-700 mb-3 italic">“My staff saves hours every weekend. Guest lists, payments, tables – it’s all synced.”</p>
                <p className="font-semibold text-indigo-600">Lucia B. – Barcelona</p>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 bg-white">
          <div className="max-w-screen-xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to grow your club?</h2>
            <p className="text-gray-600 mb-8 max-w-xl mx-auto">
              Get started in minutes. No credit card required.
            </p>
            <Link
              href="/auth/manager/signup"
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-full shadow transition"
            >
              Create Your Manager Account
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

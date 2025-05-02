//apps/web-manager/app/page.js
'use client';

import Link from "next/link";
import { useState } from "react";
import Footer from "@/components/layout/footer";
import { ArrowRight } from "lucide-react";

export default function ManagerLandingPage() {
  const [ticketPrice, setTicketPrice] = useState(20);
  const [pays, setPays] = useState("customer");
  const commission = Math.round(ticketPrice * 0.05 * 100) / 100;

  return (
    <>
      <main className="w-full bg-white text-gray-800 font-sans">
        {/* Navbar */}
        <header className="fixed top-0 w-full bg-white shadow-md z-50 px-6 py-4 flex justify-between items-center">
          <Link href="/">
            <img src="/images/clubster-manager-logo.png" alt="Clubster Manager Logo" className="w-36" />
          </Link>
          <nav className="space-x-4 hidden md:flex">
            <a href="#features" className="text-gray-600 hover:text-gray-900 transition">Features</a>
            <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition">Pricing</a>
            <a href="#testimonials" className="text-gray-600 hover:text-gray-900 transition">Testimonials</a>
          </nav>
          <Link
            href="/login"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2 rounded-full shadow"
          >
            Login
          </Link>
        </header>

        {/* Hero */}
        <section className="min-h-screen flex flex-col justify-center items-center text-center px-6 pt-32 bg-gradient-to-br from-white via-indigo-50 to-white">
          <div className="max-w-3xl animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight text-gray-900">
              Your Club. <span className="text-indigo-600">Fully Booked.</span> Fully Automated.
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-8">
              Launch and manage events, tickets, and guests – in minutes. All from one dashboard.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-full shadow-lg transition"
            >
              Get Started Free <ArrowRight size={16} />
            </Link>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="py-20 bg-white">
          <div className="max-w-screen-xl mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Built for Event Managers</h2>
            <p className="text-gray-600 mb-12 max-w-2xl mx-auto">
              Powerful tools to simplify your workflow and maximize your venue's potential.
            </p>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: "Real-time Booking Insights",
                  desc: "Track bookings, guests, and peak hours live."
                },
                {
                  title: "Quick Event Setup",
                  desc: "Create events and tickets in under 5 minutes."
                },
                {
                  title: "Revenue Tracking",
                  desc: "Integrated with Stripe to follow every euro earned."
                },
              ].map(({ title, desc }) => (
                <div key={title} className="p-6 border rounded-xl shadow-sm hover:shadow-lg transition">
                  <h3 className="text-xl font-semibold mb-2">{title}</h3>
                  <p className="text-gray-600">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Calculator */}
        <section id="pricing" className="py-20 bg-gray-50">
          <div className="max-w-screen-md mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">Transparent Pricing</h2>
            <p className="text-gray-600 mb-8">
              5% per ticket. You choose who pays it.
            </p>
            <div className="flex justify-center gap-4 mb-6">
              {['customer', 'club'].map((type) => (
                <button
                  key={type}
                  onClick={() => setPays(type)}
                  className={`px-4 py-2 rounded-full border font-medium transition ${
                    pays === type
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-gray-700 border-gray-300'
                  }`}
                >
                  {type === 'customer' ? 'Customer Pays' : 'Club Pays'}
                </button>
              ))}
            </div>

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

            <div className="text-lg font-medium text-gray-800">
              {pays === "customer" ? (
                <>
                  Customer pays <span className="text-indigo-600">{ticketPrice + commission}€</span><br />
                  Club receives <span className="text-green-600">{ticketPrice}€</span>
                </>
              ) : (
                <>
                  Customer pays <span className="text-indigo-600">{ticketPrice}€</span><br />
                  Club receives <span className="text-green-600">{ticketPrice - commission}€</span>
                </>
              )}
            </div>

            {/* Custom commission contact */}
            <p className="text-sm text-gray-500 mt-8">
              Need a custom commission plan? Contact us at{' '}
              <a href="mailto:clubsterapp@hotmail.com" className="text-indigo-600 underline">
                clubsterapp@hotmail.com
              </a>
            </p>
          </div>
        </section>

        {/* Testimonials */}
        <section id="testimonials" className="py-20 bg-white">
          <div className="max-w-screen-xl mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-10">Loved by Club Managers</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {[
                {
                  quote:
                    '“Before Clubster, we used spreadsheets and WhatsApp. Now everything is in one place.”',
                  name: 'Mario G. – Milan'
                },
                {
                  quote:
                    '“My staff saves hours each week. Guest lists, payments, tables – all synced.”',
                  name: 'Lucia B. – Barcelona'
                }
              ].map(({ quote, name }) => (
                <div key={name} className="bg-indigo-50 p-6 rounded-xl text-left shadow">
                  <p className="italic text-gray-700 mb-3">{quote}</p>
                  <p className="font-semibold text-indigo-700">{name}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-indigo-600 text-white text-center">
          <div className="max-w-screen-xl mx-auto px-4">
            <h2 className="text-3xl font-bold mb-4">Start managing smarter</h2>
            <p className="mb-8 text-lg">Create your free Clubster Manager account now.</p>
            <Link
              href="/signup"
              className="px-6 py-3 bg-white text-indigo-600 font-semibold text-sm rounded-full shadow hover:bg-gray-100"
            >
              Get Started
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
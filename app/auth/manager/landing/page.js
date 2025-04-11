// app/auth/manager/landing/page.js
import Link from "next/link";
import Footer from "@/components/manager/layout/footer";

export default function ManagerLandingPage() {
  return (
    <>
      <main className="w-full">
        {/* Header */}
        <header className="w-full flex items-center justify-between px-6 py-4 bg-white shadow-md fixed top-0 left-0 z-50">
          {/* Logo a sinistra */}
          <div>
            <Link href="/auth/manager/landing">
              <img
                src="/images/clubster-manager-logo.png"
                alt="Clubster Manager Logo"
                className="w-32 h-auto"
              />
            </Link>
          </div>
          {/* Pulsante Login a destra */}
          <div>
            <Link
              href="/auth/manager/login"
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded shadow"
            >
              Login
            </Link>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative flex items-center justify-center min-h-screen bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 text-center pt-20">
          <div className="relative z-10 max-w-3xl mx-auto py-10">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Grow Your Club with Clubster Manager
            </h1>
            <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto">
              Advanced tools to manage bookings, guest lists, and sales in one platform.
            </p>
            <div className="flex justify-center">
              <Link
                href="/auth/manager/signup"
                className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded shadow"
              >
                Get Started Now
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-white">
          <div className="max-w-screen-xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-8">Platform Highlights</h2>
            <p className="max-w-2xl mx-auto text-gray-600 mb-12">
              Discover how Clubster Manager can help you boost your club’s performance and revenue.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature Card 1 */}
              <div className="p-6 shadow rounded bg-gray-50 hover:shadow-md transition">
                <h3 className="text-xl font-semibold mb-4">Guest Lists</h3>
                <p className="text-gray-700 mb-4">
                  Easily manage guest lists, reservations, and VIP entries. Keep track of all your attendees in real time.
                </p>
              </div>
              {/* Feature Card 2 */}
              <div className="p-6 shadow rounded bg-gray-50 hover:shadow-md transition">
                <h3 className="text-xl font-semibold mb-4">Online Ticketing</h3>
                <p className="text-gray-700 mb-4">
                  Sell your event tickets online with dynamic pricing, multiple categories, and instant payment solutions.
                </p>
              </div>
              {/* Feature Card 3 */}
              <div className="p-6 shadow rounded bg-gray-50 hover:shadow-md transition">
                <h3 className="text-xl font-semibold mb-4">VIP Tables & Zones</h3>
                <p className="text-gray-700 mb-4">
                  Offer exclusive experiences with advanced table booking and premium packages.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-16 bg-gray-100">
          <div className="max-w-screen-xl mx-auto px-4 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">Ready to Elevate Your Club?</h2>
            <p className="text-gray-700 max-w-2xl mx-auto mb-8">
              Join hundreds of clubs worldwide already leveraging Clubster Manager for growth and efficiency.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/auth/manager/signup"
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded shadow"
              >
                Get Started Now
              </Link>
            </div>
          </div>
        </section>
      </main>
      {/* Footer */}
      <Footer />
    </>
  );
}

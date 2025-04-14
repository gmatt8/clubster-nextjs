// app/not-found.js
import CustomerLayout from "@/app/customer/CustomerLayout";
import Link from "next/link";

export default function NotFound() {
  return (
    <CustomerLayout>
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-6xl font-extrabold text-gray-900 mb-4">404</h1>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Pagina non trovata</h2>
          <p className="text-lg text-gray-600 mb-6">
            Ci dispiace, la pagina che stai cercando non esiste.
          </p>
          <Link
            href="/"
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            Torna alla Home
          </Link>
        </div>
      </div>
    </CustomerLayout>
  );
}

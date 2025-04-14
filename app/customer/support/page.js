// app/customer/support/page.js
"use client";

import CustomerLayout from "../CustomerLayout";
import FAQ from "@/components/customer/support/FAQ";

export default function SupportPage() {
  return (
    <CustomerLayout>
      <div className="px-6 py-8 max-w-screen-xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Customer Support</h1>
        <p className="text-gray-700 mb-6">
          Benvenuto nella sezione di supporto. Qui potrai trovare risposte alle domande frequenti.
        </p>

        {/* Sezione FAQ */}
        <section className="mb-12">
          <FAQ />
        </section>

        {/* Sezione informazioni di contatto */}
        <section className="border-t border-gray-300 pt-6">
          <h2 className="text-xl font-semibold mb-2">Per ulteriori informazioni</h2>
          <p className="text-gray-700">
            Se hai bisogno di ulteriore assistenza, contattaci via email all'indirizzo:{" "}
            <a
              href="mailto:clubsterapp@hotmail.com"
              className="text-blue-600 hover:underline"
            >
              clubsterapp@hotmail.com
            </a>
          </p>
        </section>
      </div>
    </CustomerLayout>
  );
}

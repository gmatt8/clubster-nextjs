// app/dashboard/customer/terms-of-service/page.js
"use client";

import CustomerLayout from "../CustomerLayout";

export default function TermsOfServicePage() {
  return (
    <CustomerLayout>
      <div className="px-6 py-8 max-w-screen-xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Terms of Service</h1>
        <p className="text-gray-700">
          Welcome to Clubster. By using our services, you agree to abide by the following terms and conditions. Please read them carefully.
        </p>
        <div className="mt-4 space-y-4 text-gray-700 text-sm">
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero.
          </p>
          <p>
            Sed cursus ante dapibus diam. Sed nisi. Nulla quis sem at nibh elementum imperdiet.
          </p>
          <p>
            Duis sagittis ipsum. Praesent mauris. Fusce nec tellus sed augue semper porta.
          </p>
          {/* Aggiungi ulteriori sezioni come necessario */}
        </div>
      </div>
    </CustomerLayout>
  );
}

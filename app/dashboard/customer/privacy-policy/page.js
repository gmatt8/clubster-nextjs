// app/dashboard/customer/privacy-policy/page.js
"use client";

import CustomerLayout from "../CustomerLayout";

export default function PrivacyPolicyPage() {
  return (
    <CustomerLayout>
      <div className="px-6 py-8 max-w-screen-xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Privacy Policy</h1>
        <p className="text-gray-700">
          At Clubster, we are committed to protecting your personal information. This privacy policy explains how we collect, use, and safeguard your data.
        </p>
        <div className="mt-4 space-y-4 text-gray-700 text-sm">
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse malesuada lacus ex,
            sit amet blandit leo lobortis eget.
          </p>
          <p>
            Curabitur at lacus ac velit ornare lobortis. Praesent blandit laoreet nibh. Fusce convallis metus id felis luctus adipiscing.
          </p>
          <p>
            Donec vitae sapien ut libero venenatis faucibus. Nullam quis ante.
          </p>
          {/* Aggiungi ulteriori dettagli o sezioni come necessario */}
        </div>
      </div>
    </CustomerLayout>
  );
}

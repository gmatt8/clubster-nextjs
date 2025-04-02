// app/dashboard/customer/support/page.js
"use client";

import CustomerLayout from "../CustomerLayout";

export default function SupportPage() {
  return (
    <CustomerLayout>
      <div className="px-6 py-8 max-w-screen-xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Customer Support</h1>
        <p className="text-gray-700">
          If you need help, please contact our customer service team. We’re here to assist you!
        </p>
        <div className="mt-4">
          <p className="text-gray-700">
            <strong>Email:</strong> clubsterapp@hotmail.com
          </p>
        </div>
      </div>
    </CustomerLayout>
  );
}

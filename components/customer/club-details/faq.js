"use client";

export default function FAQ() {
  return (
    <section className="mb-8">
      <h2 className="text-xl font-semibold mb-4">FAQ</h2>
      <div className="space-y-4">
        <div>
          <p className="font-semibold">Do I need a reservation to get in?</p>
          <p className="text-gray-700">
            Reservations are not mandatory but are highly recommended for large
            groups or to book private tables and VIP areas.
          </p>
        </div>
        <div>
          <p className="font-semibold">Is there a specific dress code?</p>
          <p className="text-gray-700">
            We recommend a smart casual attire. No flip-flops or shorts.
          </p>
        </div>
        <div>
          <p className="font-semibold">What is the minimum age to enter?</p>
          <p className="text-gray-700">
            The minimum age is 21. Please bring a valid ID.
          </p>
        </div>
      </div>
    </section>
  );
}

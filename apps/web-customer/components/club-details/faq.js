// apps/web-customer/components/club-details/faq.js
"use client";
import { useEffect, useState } from "react";

export default function FAQ({ clubId }) {
  const [faqs, setFaqs] = useState([]);

  useEffect(() => {
    async function fetchFaqs() {
      const res = await fetch(`/api/faq?club_id=${clubId}`);
      const data = await res.json();
      if (res.ok) setFaqs(data);
    }
    if (clubId) fetchFaqs();
  }, [clubId]);

  if (faqs.length === 0) return null;

  return (
    <section className="mb-8">
      <h2 className="text-xl font-semibold mb-4">FAQ</h2>
      <div className="space-y-4">
        {faqs.map((faq) => (
          <div key={faq.id}>
            <p className="font-semibold">{faq.question}</p>
            <p className="text-gray-700">{faq.answer}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

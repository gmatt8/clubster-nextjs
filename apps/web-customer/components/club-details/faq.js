// apps/web-customer/components/club-details/faq.js
"use client";
import { useEffect, useState } from "react";
import LoadingSpinner from "../common/LoadingSpinner";

export default function FAQ({ clubId }) {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openIndex, setOpenIndex] = useState(null);

  useEffect(() => {
    async function fetchFaqs() {
      setLoading(true);
      try {
        const res = await fetch(`/api/faq?club_id=${clubId}`);
        const data = await res.json();
        if (res.ok) setFaqs(data || []);
      } catch (err) {
        console.error("Error fetching FAQs:", err);
      } finally {
        setLoading(false);
      }
    }
    if (clubId) fetchFaqs();
  }, [clubId]);

  if (loading) {
    return (
      <section className="mb-8">
        <LoadingSpinner />
      </section>
    );
  }

  if (faqs.length === 0) return null;

  const toggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="mb-8">
      <h2 className="text-xl font-semibold mb-4">FAQ</h2>
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div key={faq.id} className="border border-gray-300 rounded overflow-hidden">
            <button
              onClick={() => toggle(index)}
              className="w-full text-left px-4 py-3 bg-gray-100 hover:bg-gray-200 focus:outline-none transition"
            >
              <div className="flex justify-between items-center">
                <span className="font-medium">{faq.question}</span>
                <span className="text-xl">{openIndex === index ? "−" : "+"}</span>
              </div>
            </button>
            {openIndex === index && (
              <div className="px-4 py-3 text-gray-700">{faq.answer}</div>
            )}
          </div>
        ))}
      </div>
    </section>
  );  
}

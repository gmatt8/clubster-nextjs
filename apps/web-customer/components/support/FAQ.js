// components/customer/support/FAQ.js
"use client";

import { useState } from "react";

const faqData = [
  {
    question: "How can I reset my password?",
    answer:
      "To reset your password, click on 'Forgot Password' on the login page and follow the instructions sent via email.",
  },
  {
    question: "Where can I view my purchase history?",
    answer:
      "Your purchase history can be viewed in the 'My tickets' section of your profile.",
  },
  {
    question: "How can I contact support?",
    answer:
      "For further information or support, please contact us via email at clubsterapp@hotmail.com.",
  },
  // You can add additional FAQs if needed.
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="space-y-4">
      {faqData.map((item, index) => (
        <div key={index} className="border border-gray-300 rounded overflow-hidden">
          <button
            onClick={() => toggleFAQ(index)}
            className="w-full text-left px-4 py-3 bg-gray-100 hover:bg-gray-200 focus:outline-none transition"
          >
            <div className="flex justify-between items-center">
              <span className="font-medium">{item.question}</span>
              <span className="text-xl">{openIndex === index ? "−" : "+"}</span>
            </div>
          </button>
          {openIndex === index && (
            <div className="px-4 py-3 text-gray-700">{item.answer}</div>
          )}
        </div>
      ))}
    </div>
  );
}

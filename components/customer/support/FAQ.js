// components/customer/support/FAQ.js
"use client";

import { useState } from "react";

const faqData = [
  {
    question: "Come posso reimpostare la mia password?",
    answer:
      "Per reimpostare la password, clicca su 'Password dimenticata' nella pagina di login e segui le istruzioni inviate via email.",
  },
  {
    question: "Dove posso visualizzare la mia cronologia degli acquisti?",
    answer:
      "La cronologia degli acquisti è visibile all'interno della sezione 'My tickets' del tuo profilo.",
  },
  {
    question: "Come posso contattare l'assistenza?",
    answer:
      "Per ulteriori informazioni o supporto, contattaci via email all'indirizzo clubsterapp@hotmail.com.",
  },
  // Puoi aggiungere ulteriori FAQ se necessario.
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

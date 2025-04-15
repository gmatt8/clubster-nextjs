// components/manager/settings/FAQManager.js
"use client";
import { useEffect, useState } from "react";

export default function FAQManager({ clubId }) {
  const [faqs, setFaqs] = useState([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchFaqs() {
      const res = await fetch(`/api/faq?club_id=${clubId}`);
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        setFaqs(data.filter(Boolean)); // rimuove eventuali null
      }
    }
    if (clubId) fetchFaqs();
  }, [clubId]);

  async function handleAddFaq() {
    if (!newQuestion || !newAnswer) {
      setError("Compila sia domanda che risposta.");
      return;
    }

    const res = await fetch("/api/faq", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ club_id: clubId, question: newQuestion, answer: newAnswer }),
    });

    const data = await res.json();

    if (res.ok) {
      const newFaq = Array.isArray(data) ? data[0] : data;
      if (newFaq && newFaq.id) {
        setFaqs([...faqs, newFaq]);
        setNewQuestion("");
        setNewAnswer("");
        setError("");
      } else {
        setError("Risposta non valida dal server.");
      }
    } else {
      setError(data.error || "Errore durante l'aggiunta della FAQ.");
    }
  }

  async function handleDeleteFaq(id) {
    await fetch(`/api/faq?id=${id}`, { method: "DELETE" });
    setFaqs(faqs.filter((faq) => faq && faq.id !== id));
  }

  async function handleUpdateFaq(id, question, answer) {
    await fetch("/api/faq", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, question, answer }),
    });
  }

  return (
    <div className="mt-10">
      <h2 className="text-lg font-semibold text-gray-700 mb-3">FAQs (max 5)</h2>

      {faqs.filter(Boolean).map((faq) => (
        <div key={faq.id} className="mb-4 bg-gray-50 p-4 rounded border shadow-sm">
          <input
            className="block w-full mb-2 px-3 py-2 border border-gray-300 rounded text-sm"
            value={faq.question}
            onChange={(e) => {
              const updated = { ...faq, question: e.target.value };
              setFaqs((prev) => prev.map((f) => (f.id === faq.id ? updated : f)));
              handleUpdateFaq(faq.id, e.target.value, faq.answer);
            }}
          />
          <textarea
            className="block w-full px-3 py-2 border border-gray-300 rounded text-sm"
            value={faq.answer}
            onChange={(e) => {
              const updated = { ...faq, answer: e.target.value };
              setFaqs((prev) => prev.map((f) => (f.id === faq.id ? updated : f)));
              handleUpdateFaq(faq.id, faq.question, e.target.value);
            }}
          />
          <button
            onClick={() => handleDeleteFaq(faq.id)}
            className="text-sm text-red-600 mt-2 hover:underline"
          >
            Elimina
          </button>
        </div>
      ))}

      {faqs.length < 5 && (
        <div className="bg-white p-4 border rounded mt-6">
          <input
            type="text"
            placeholder="Nuova domanda"
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            className="block w-full mb-2 px-3 py-2 border border-gray-300 rounded text-sm"
          />
          <textarea
            placeholder="Nuova risposta"
            value={newAnswer}
            onChange={(e) => setNewAnswer(e.target.value)}
            className="block w-full mb-2 px-3 py-2 border border-gray-300 rounded text-sm"
          />
          <button
            onClick={handleAddFaq}
            className="bg-black text-white px-4 py-2 rounded text-sm"
          >
            Aggiungi FAQ
          </button>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>
      )}
    </div>
  );
}

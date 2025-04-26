//apps/web-customer/app/error.js
"use client";

import { useEffect } from "react";

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="h-screen flex flex-col items-center justify-center">
      <h2 className="text-2xl font-bold">Qualcosa è andato storto!</h2>
      <button
        onClick={() => reset()}
        className="mt-4 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
      >
        Riprova
      </button>
    </div>
  );
}

//apps/web-customer/tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./app/**/*.{js,ts,jsx,tsx}",        // Tutti i file nella cartella /app
      "./components/**/*.{js,ts,jsx,tsx}", // I tuoi componenti riusabili
    ],
    theme: {
      extend: {},
    },
    plugins: [],
  };
  
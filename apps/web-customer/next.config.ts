import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone", // Essenziale per il deploy su server o Vercel
  trailingSlash: true,  // (Opzionale) Se vuoi tutte le URL tipo `/chi-siamo/` invece di `/chi-siamo`
};

export default nextConfig;

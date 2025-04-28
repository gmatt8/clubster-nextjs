import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  trailingSlash: true,
  experimental: {
    appDir: true, // Assicurati di attivare app directory se usi /app
  },
};

export default nextConfig;

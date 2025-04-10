// /api/debug-env/route.js
export default function handler(req, res) {
  console.log("DATABASE_URL:", process.env.DATABASE_URL);
  // Per sicurezza, restituisci solo un flag booleano
  res.status(200).json({ databaseURLLoaded: !!process.env.DATABASE_URL });
}

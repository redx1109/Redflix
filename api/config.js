export default function handler(req, res) {
  res.json({ tmdbKey: process.env.TMDB_KEY });
}

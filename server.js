require('dotenv').config();
const express = require('express');
const app = express();

app.use(express.static('public'));

app.get('/api/config', (req, res) => {
  res.json({ tmdbKey: process.env.TMDB_KEY });
});

app.listen(3000, () => console.log('CineStream running on port 3000 💕'));
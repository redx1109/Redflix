// anime.js: decides which ID the anime player should use.
// mode: 'tmdb' | 'anilist' | 'auto' (auto = AniList if found, else TMDB)
const ANIME_MODE_KEY = 'animeIdMode';
const _animeIdCache = new Map();

function getAnimeMode() { return localStorage.getItem(ANIME_MODE_KEY) || 'auto'; }
function setAnimeMode(m) { localStorage.setItem(ANIME_MODE_KEY, m); }

// Returns { kind: 'tmdb' | 'anilist', id, malId }
// Uses your existing getAnilistId(tmdbId, season, 'tv') from player.js.
async function resolveAnimeId(tmdbId, season = 1, mode = getAnimeMode()) {
  if (mode === 'tmdb') return { kind: 'tmdb', id: tmdbId, malId: null };

  const key = `${tmdbId}:${season}`;
  if (!_animeIdCache.has(key)) {
    _animeIdCache.set(key, getAnilistId(tmdbId, season, 'tv').catch(() => null));
  }
  const hit = await _animeIdCache.get(key);

  if (hit?.anilist_id) return { kind: 'anilist', id: hit.anilist_id, malId: hit.mal_id || null };
  return { kind: 'tmdb', id: tmdbId, malId: hit?.mal_id || null }; // fallback if no AniList match
}
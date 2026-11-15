// anime.js: decides which ID the anime player should use.
// mode: 'tmdb' | 'anilist' | 'auto' (auto = AniList if found, else TMDB)
const ANIME_MODE_KEY = 'animeIdMode';
const _animeIdCache = new Map();

function getAnimeMode() { return localStorage.getItem(ANIME_MODE_KEY) || 'auto'; }
function setAnimeMode(m) { localStorage.setItem(ANIME_MODE_KEY, m); }

// TMDB -> AniList lookup (title + year search on AniList's public GraphQL API).
// Returns { anilist_id, mal_id } or null. Note: matches by title, so later
// TMDB seasons may map to the first AniList entry.
async function getAnilistId(tmdbId, season = 1, type = 'tv') {
  const t = await (await fetch(`${TMDB_BASE}/${type}/${tmdbId}?api_key=${TMDB_KEY}`)).json();
  const title = t.original_name || t.original_title || t.name || t.title;
  if (!title) return null;
  const year = parseInt((t.first_air_date || t.release_date || '').slice(0, 4)) || null;
  const query = `query($s:String,$y:Int){Page(perPage:3){media(search:$s,type:ANIME,seasonYear:$y,sort:SEARCH_MATCH){id idMal}}}`;
  for (const y of year ? [year, null] : [null]) {
    const r = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables: { s: title, y } })
    });
    const m = (await r.json())?.data?.Page?.media?.[0];
    if (m) return { anilist_id: m.id, mal_id: m.idMal || null };
  }
  return null;
}

// Returns { kind: 'tmdb' | 'anilist', id, malId }
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

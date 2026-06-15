let TMDB_KEY = '0ae1d4da04c9c45120bf6eb56d037ad8';
const TMDB_BASE = 'https://api.themoviedb.org/3';
const IMG_BASE = 'https://image.tmdb.org/t/p/w500';
let genres = [];
let activeGenre = '';
let currentType = 'movie';
let currentUrl = '';
let currentPage = 1;

window.addEventListener('scroll', () => {
  if(window.innerHeight + window.scrollY >= document.body.offsetHeight - 300){
    currentPage++;
    fetch(currentUrl + `&page=${currentPage}`)
      .then(r => r.json())
      .then(data => {
        const el = document.getElementById('moviesGrid');
        data.results.forEach((m, i) => el.appendChild(movieCard(m, false, i)));
      });
  }
});

init()

async function init(){
  if(!TMDB_KEY) return;
  await Promise.all([loadGenres(), fetchTrending(), fetchPopular()]);
}

function switchType(type){
  currentType = type;
  activeGenre = '';
  document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
  event.target.classList.add('active');
  document.getElementById('gridTitle').textContent =
    type==='movie' ? 'Popular Movies' :
    type==='tv' ? 'Popular TV Shows' : 'Popular Anime';
  loadGenres();
  fetchTrending();
  fetchPopular();
}

async function loadGenres(){
  const endpoint = currentType === 'movie'
    ? `${TMDB_BASE}/genre/movie/list?api_key=${TMDB_KEY}`
    : `${TMDB_BASE}/genre/tv/list?api_key=${TMDB_KEY}`;
  const res = await fetch(endpoint);
  const data = await res.json();
  genres = [{id:'', name:'All'}, ...data.genres];
  renderGenres();
}

async function fetchTrending(){
  const type = currentType === 'anime' ? 'tv' : currentType;
  const res = await fetch(`${TMDB_BASE}/trending/${type}/week?api_key=${TMDB_KEY}`);
  const data = await res.json();
  renderTrending(data.results);
  updateHero(data.results[0]);
}

function switchToHome(){
  currentType = 'movie';
  document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
  event.target.classList.add('active');
  document.getElementById('gridTitle').textContent = 'Popular Movies';
  loadGenres();
  fetchTrending();
  fetchPopular();
}

async function loadMore(){
  const res = await fetch(currentUrl + '&page=2');
  const data = await res.json();
  const el = document.getElementById('moviesGrid');
  data.results.forEach((m, i) => el.appendChild(movieCard(m, false, i)));
}

function updateHero(m){
  if(!m) return;
  const backdrop = m.backdrop_path ? `https://image.tmdb.org/t/p/original${m.backdrop_path}` : '';
  const title = m.title || m.name;
  const overview = m.overview?.slice(0,150)+'...' || '';
  const hero = document.querySelector('.hero');
  if(backdrop) hero.style.backgroundImage = `linear-gradient(to bottom, rgba(10,10,15,0.3) 0%, #0a0a0f 100%), url(${backdrop})`;
  hero.style.backgroundSize = 'cover';
  hero.style.backgroundPosition = 'center';
  document.querySelector('.hero h1').innerHTML = `<span>${title}</span>`;
  document.querySelector('.hero p').textContent = overview;
  document.querySelector('.btn-primary').onclick = () => openDetail(m.id, currentType);
}

async function fetchPopular(genreId=''){
  let url;
  if(currentType === 'movie'){
    url = genreId
      ? `${TMDB_BASE}/discover/movie?api_key=${TMDB_KEY}&with_genres=${genreId}&sort_by=popularity.desc`
      : `${TMDB_BASE}/movie/popular?api_key=${TMDB_KEY}`;
  } else if(currentType === 'tv'){
    url = genreId
      ? `${TMDB_BASE}/discover/tv?api_key=${TMDB_KEY}&with_genres=${genreId}&sort_by=popularity.desc`
      : `${TMDB_BASE}/tv/popular?api_key=${TMDB_KEY}`;
  } else {
    url = genreId
      ? `${TMDB_BASE}/discover/tv?api_key=${TMDB_KEY}&with_genres=${genreId}&with_keywords=210024&sort_by=popularity.desc`
      : `${TMDB_BASE}/discover/tv?api_key=${TMDB_KEY}&with_keywords=210024&sort_by=popularity.desc`;
  }
  currentUrl = url;
  currentPage = 1;
  const res = await fetch(url);
  const data = await res.json();
  renderGrid(data.results);
}

function renderGenres(){
  const el = document.getElementById('genreTabs');
  el.innerHTML = '';
  genres.forEach(g => {
    const btn = document.createElement('button');
    btn.className = 'genre-tab' + (g.name==='All' ? ' active' : '');
    btn.textContent = g.name;
    btn.onclick = () => {
      activeGenre = g.id;
      document.querySelectorAll('.genre-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      fetchPopular(g.id);
    };
    el.appendChild(btn);
  });
}

function renderTrending(movies){
  const el = document.getElementById('trendingRow');
  el.innerHTML = '';
  movies.slice(0,8).forEach((m, i) => el.appendChild(movieCard(m, true, i)));
}

function renderGrid(movies){
  const el = document.getElementById('moviesGrid');
  el.innerHTML = '';
  movies.forEach((m, i) => el.appendChild(movieCard(m, false, i)));
}

function toggleList(e, id, title, poster){
  e.stopPropagation();
  let list = JSON.parse(localStorage.getItem('myList') || '[]');
  const exists = list.find(m => m.id === id);
  if(exists) list = list.filter(m => m.id !== id);
  else list.push({id, title, poster});
  localStorage.setItem('myList', JSON.stringify(list));
}

function movieCard(m, small=false, index=0){
  const c = document.createElement('div');
  c.className = small ? 'trending-card' : 'movie-card';
  c.style.animationDelay = `${index * 0.05}s`;
  const poster = m.poster_path
    ? `<img class="poster-img" src="${IMG_BASE}${m.poster_path}" alt="${m.title}" loading="lazy">`
    : `<div class="poster-fallback"><i class="ti ti-movie"></i><span>${m.title}</span></div>`;
  c.innerHTML = `
    <div class="movie-poster">
      ${poster}
      <div class="movie-overlay">
  <div style="display:flex;gap:6px;align-items:center;">
  <div class="play-btn"><i class="ti ti-player-play" style="font-size:14px;margin-left:2px"></i></div>
  <div class="add-btn" onclick="toggleList(event, ${m.id}, '${(m.title||m.name).replace(/'/g,"\\'")}', '${m.poster_path}')"><i class="ti ti-plus" style="font-size:14px"></i></div>
  </div>
      </div>
    </div>
    <div class="movie-info">
      <div class="movie-title">${m.title || m.name}</div>
      <div class="movie-meta">
        <span class="movie-year">${(m.release_date || m.first_air_date)?.slice(0,4)||'N/A'}</span>
        <span class="movie-rating"><i class="ti ti-star-filled" style="font-size:10px"></i>${m.vote_average?.toFixed(1)||'?'}</span>
        ${m._resultType ? `<span class="movie-genre-badge">${m._resultType}</span>` : ''}
      </div>
    </div>
  `;
  const title = m.title || m.name;
  c.onclick = () => openDetail(m.id, m._resultType ? (m._resultType === 'movie' ? 'movie' : 'tv') : currentType);
  return c;
}

function openPlayer(title, id=''){
  document.getElementById('playerTitle').textContent = title;
  document.getElementById('tmdbInput').value = id;
  document.getElementById('playerIframe').src = '';
  document.getElementById('playerModal').classList.add('open');
  const epControls = document.getElementById('episodeControls');
  const isShow = currentType !== 'movie';
  epControls.style.display = isShow ? 'flex' : 'none';
  if(isShow && id) loadEpisodes(id);
  document.getElementById('nextEpBtn').style.display = isShow ? 'block' : 'none';
  const sInput = document.getElementById('seasonInput');
  const eInput = document.getElementById('episodeInput');
  if(sInput) sInput.value = 1;
  if(eInput) eInput.value = 1;
  epControls.style.gap = '8px';
  epControls.style.alignItems = 'center';
  if(id) loadEmbed();
}

function closePlayer(){
  document.getElementById('playerIframe').src = '';
  document.getElementById('playerModal').classList.remove('open');
}

function loadEmbed(){
  const id = document.getElementById('tmdbInput').value;
  const src = document.getElementById('srcSelect').value;
  const s = parseInt(document.getElementById('seasonInput')?.value) || 1;
  const e = parseInt(document.getElementById('episodeInput')?.value) || 1;
  if(!id) return;
  let urls;
  if(currentType === 'movie'){
    urls = {
      streamvault: `https://streamvaultsrc.click/embed/movie/${id}`,
      autoembed: `https://autoembed.co/movie/tmdb/${id}`,
      apiplayer: `https://apiplayer.ru/embed/movie/${id}`,
      vidlux: `https://vidlux.xyz/embed/movie/${id}`,
      primesrc: `https://primesrc.me/embed/movie?tmdb=${id}`,
      ezvidapi: `https://ezvidapi.com/embed/movie/${id}`,
      vidapi: `https://vidapi.xyz/embed/movie/${id}`,
      vidlink: `https://vidlink.pro/movie/${id}?autoplay=true`,
      vidsrcsbs: `https://vidsrc.sbs/embed/movie?tmdb=${id}`,
      twoembed: `https://www.2embed.cc/embed/${id}`,
      twoembedskin: `https://www.2embed.skin/embed/${id}`,
    };  
  } else {
    urls = {
      streamvault: `https://streamvaultsrc.click/embed/tv/${id}/${s}/${e}`,
      autoembed: `https://autoembed.co/tv/tmdb/${id}-${s}-${e}`,
      apiplayer: `https://apiplayer.ru/embed/tv/${id}/${s}/${e}`,
      vidlux: `https://vidlux.xyz/embed/tv/${id}/${s}/${e}`,
      primesrc: `https://primesrc.me/embed/tv?tmdb=${id}&season=${s}&episode=${e}`,
      ezvidapi: `https://ezvidapi.com/embed/tv/${id}/${s}/${e}`,
      vidapi: `https://vidapi.xyz/embed/tv/${id}/${s}/${e}`,
      vidlink: `https://vidlink.pro/tv/${id}/${s}/${e}?autoplay=true`,
      vidsrcsbs: `https://vidsrc.sbs/embed/tv?tmdb=${id}&season=${s}&episode=${e}`,
      twoembed: `https://www.2embed.cc/embedtv/${id}&s=${s}&e=${e}`,
      twoembedskin: `https://www.2embed.skin/embedtv/${id}&s=${s}&e=${e}`,
    };
  }
  document.getElementById('playerIframe').src = urls[src];
}

let searchTimeout;

function handleSearch(q){
  clearTimeout(searchTimeout);
  const trendingSection = document.getElementById('trendingRow').closest('.section');
  const hero = document.querySelector('.hero');
  const genreTabs = document.querySelector('.genre-tabs');
  if(!q){
    hero.style.display = 'block';
    genreTabs.style.display = 'flex';
    trendingSection.style.display = 'block';
    document.getElementById('moviesGrid').style.minHeight = '';
    document.getElementById('app').classList.remove('search-active');
    document.getElementById('popularSection').style.display = 'block';
    return fetchPopular();
  }
  hero.style.display = 'none';
  genreTabs.style.display = 'none';
  trendingSection.style.display = 'none';
  document.getElementById('popularSection').style.display = 'block';  
  document.getElementById('moviesGrid').style.minHeight = '100vh';
  document.getElementById('app').classList.add('search-active');
  const matchedGenre = genres.find(g => g.name.toLowerCase().includes(q.toLowerCase()));
  if(matchedGenre){
    fetchPopular(matchedGenre.id);
    document.getElementById('gridTitle').textContent = `${matchedGenre.name} movies`;
    return;
  }
  searchTimeout = setTimeout(async () => {
    const [movieRes, tvRes] = await Promise.all([
        fetch(`${TMDB_BASE}/search/movie?api_key=${TMDB_KEY}&query=${encodeURIComponent(q)}`),
        fetch(`${TMDB_BASE}/search/tv?api_key=${TMDB_KEY}&query=${encodeURIComponent(q)}`)
    ]);
    const movieData = await movieRes.json();
    const tvData = await tvRes.json();

    const movies = movieData.results.map(m => ({...m, _resultType: 'movie'}));
    const tvShows = tvData.results.map(m => ({
        ...m,
        _resultType: m.genre_ids?.includes(16) ? 'anime' : 'series'
    }));

    const combined = [...movies, ...tvShows].sort((a,b) => b.popularity - a.popularity);
    renderGrid(combined);
    document.getElementById('gridTitle').textContent = `Results for "${q}"`;
  }, 400);
}

async function loadEpisodes(id, season=1){
  const res = await fetch(`${TMDB_BASE}/tv/${id}/season/${season}?api_key=${TMDB_KEY}`);
  const data = await res.json();

  // render season tabs
  const seasonsRes = await fetch(`${TMDB_BASE}/tv/${id}?api_key=${TMDB_KEY}`);
  const showData = await seasonsRes.json();
  const seasonTabs = document.getElementById('seasonTabs');
  seasonTabs.innerHTML = '';
  showData.seasons.filter(s=>s.season_number>0).forEach(s => {
    const btn = document.createElement('button');
    btn.textContent = `S${s.season_number}`;
    btn.style.cssText = `padding:4px 10px;border-radius:6px;border:0.5px solid rgba(255,255,255,0.15);background:${s.season_number==season?'#e50914':'rgba(255,255,255,0.05)'};color:#fff;font-size:12px;cursor:pointer`;
    btn.onclick = () => loadEpisodes(id, s.season_number);
    seasonTabs.appendChild(btn);
  });

  // render episode list
  const epList = document.getElementById('episodeList');
  epList.innerHTML = '';
  data.episodes?.forEach(ep => {
    const btn = document.createElement('button');
    btn.style.cssText = `background:rgba(255,255,255,0.05);border:0.5px solid rgba(255,255,255,0.1);border-radius:8px;padding:8px;color:#fff;font-size:12px;cursor:pointer;text-align:left;`;
    btn.innerHTML = `<div style="color:#e50914;font-size:11px;margin-bottom:2px">EP ${ep.episode_number}</div><div style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${ep.name}</div>`;
    btn.onclick = () => {
    document.getElementById('seasonInput').value = season;
    document.getElementById('episodeInput').value = ep.episode_number;
    loadEmbed();
    };
    epList.appendChild(btn);
  });
}

function nextEpisode(){
  const epInput = document.getElementById('episodeInput');
  epInput.value = parseInt(epInput.value) + 1;
  loadEmbed();
}

async function openDetail(id, type='movie'){
  const endpoint = type === 'movie'
    ? `${TMDB_BASE}/movie/${id}?api_key=${TMDB_KEY}&append_to_response=credits`
    : `${TMDB_BASE}/tv/${id}?api_key=${TMDB_KEY}&append_to_response=credits`;
  const res = await fetch(endpoint);
  const m = await res.json();
  const title = m.title || m.name;
  const year = (m.release_date || m.first_air_date || '').slice(0,4);
  const runtime = m.runtime ? `${m.runtime} min` : m.episode_run_time?.[0] ? `${m.episode_run_time[0]} min/ep` : '';
  const rating = m.vote_average ? `⭐ ${m.vote_average.toFixed(1)}` : '';
  const overview = m.overview || 'No description available.';
  const backdrop = m.backdrop_path ? `https://image.tmdb.org/t/p/w1280${m.backdrop_path}` : '';
  const poster = m.poster_path ? `${IMG_BASE}${m.poster_path}` : '';
  const cast = m.credits?.cast?.slice(0,8) || [];
  const genres = m.genres || [];

  document.getElementById('detailBackdrop').style.backgroundImage = backdrop ? `url(${backdrop})` : '';
  document.getElementById('detailPoster').innerHTML = poster ? `<img src="${poster}" alt="${title}">` : '';
  document.getElementById('detailTitle').textContent = title;
  document.getElementById('detailYear').textContent = year;
  document.getElementById('detailRuntime').textContent = runtime;
  document.getElementById('detailRating').textContent = rating;
  document.getElementById('detailOverview').textContent = overview;
  document.getElementById('detailGenres').innerHTML = genres.map(g=>`<span class="detail-genre-tag">${g.name}</span>`).join('');
  document.getElementById('detailCast').innerHTML = cast.map(c=>`<span class="cast-chip">${c.name}</span>`).join('');
  document.getElementById('detailPlayBtn').onclick = () => {
    closeDetail();
    openPlayer(title, id);
  };

  document.getElementById('detailModal').classList.add('open');
}

function closeDetail(){
  document.getElementById('detailModal').classList.remove('open');
}

function showMyList(){
  const list = JSON.parse(localStorage.getItem('myList') || '[]');
  document.querySelector('.hero').style.display = 'none';
  document.querySelector('.genre-tabs').style.display = 'none';
  document.getElementById('trendingRow').closest('.section').style.display = 'none';
  document.getElementById('gridTitle').textContent = '❤️ My List';
  document.getElementById('popularSection').style.display = 'block';
  renderGrid(list.map(m => ({...m, poster_path: m.poster, title: m.title})));
}

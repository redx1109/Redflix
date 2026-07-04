async function init(){
  currentType = 'explore';
  await Promise.all([loadGenres(), fetchTrending(), fetchPopular(),]);
  renderContinueRow()
  setTimeout(showContinuePopup, 1000);
}
init()

let searchTimeout;

function switchType(type){
  currentType = type;
  activeGenre = '';
  document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
  event.target.classList.add('active');
  document.getElementById('continueRow')?.closest('.section')?.remove();
  document.getElementById('gridTitle').textContent =
    type==='movie' ? 'Popular Movies' :
    type==='tv' ? 'Popular TV Shows' : 'Popular Anime';
  fetchTrending();
  fetchPopular();
  document.querySelector('.search-bar input').value = '';
  document.getElementById('app').classList.remove('search-active');
  document.getElementById('popularSection').style.display = 'block';
  loadGenres();
}

function switchToHome(){
  currentType = 'explore';
  const hero = document.querySelector('.hero');
  document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
  event.target.classList.add('active');
  document.getElementById('gridTitle').textContent = 'Explore';
  hero.style.display = 'block';
  renderContinueRow();
  loadGenres();
  fetchTrending();
  fetchPopular();
}

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
  const matchedGenre = genres.find(g => g.name.toLowerCase() === q.toLowerCase());
  if(matchedGenre){
    fetchPopular(matchedGenre.id);
    document.getElementById('gridTitle').textContent = `${matchedGenre.name} movies`;
    return;
  }
  searchTimeout = setTimeout(async () => {
    const [movieRes, tvRes, personRes] = await Promise.all([
    fetch(`${TMDB_BASE}/search/movie?api_key=${TMDB_KEY}&query=${encodeURIComponent(q)}&include_adult=${includeAdult}`),
    fetch(`${TMDB_BASE}/search/tv?api_key=${TMDB_KEY}&query=${encodeURIComponent(q)}&include_adult=${includeAdult}`),
    fetch(`${TMDB_BASE}/search/person?api_key=${TMDB_KEY}&query=${encodeURIComponent(q)}`)
  ]);
const movieData = await movieRes.json();
const tvData = await tvRes.json();
const personData = await personRes.json();

const personMovies = (personData.results?.[0]?.known_for || []).map(m => ({...m, _resultType: m.media_type === 'tv' ? 'tv' : 'movie'}));
const movies = movieData.results.map(m => ({...m, _resultType: 'movie'}));
const tvShows = tvData.results.map(m => ({...m, _resultType: m.genre_ids?.includes(16) ? 'anime' : 'tv'}));
const combined = [...movies, ...tvShows, ...personMovies]
  .filter((v,i,a) => a.findIndex(x=>x.id===v.id)===i)
  .filter(v => includeAdult ? true : !v.adult)
  .sort((a,b) => b.popularity - a.popularity);
    renderGrid(combined);
    document.getElementById('gridTitle').textContent = `Results for "${q}"`;
  }, 400);
}

async function loadMore(){
  currentPage++;
  const res = await fetch(currentUrl + `&page=${currentPage}`);
  const data = await res.json();
  const el = document.getElementById('moviesGrid');
  data.results.forEach((m, i) => {
    if(!document.querySelector(`[data-id="${m.id}"]`)) {
    const card = movieCard(m, false, i);
    card.setAttribute('data-id', m.id);
    el.appendChild(card);
    }
  });
}

window.addEventListener('scroll', () => {
  if(!currentUrl) return; 
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

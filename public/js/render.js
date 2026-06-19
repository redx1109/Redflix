function movieCard(m, small=false, index=0){
  const c = document.createElement('div');
  const inList = JSON.parse(localStorage.getItem('myList')||'[]').find(x=>x.id===m.id);
  c.className = small ? 'trending-card' : 'movie-card';
  c.style.animationDelay = `${index * 0.05}s`;
  const poster = m.poster_path
  ? `<img class="poster-img" src="${IMG_BASE}${m.poster_path}" alt="${m.title}" loading="lazy">`
  : `<div class="poster-fallback"><i class="ti ti-movie"></i><span>${m.title}</span></div>`;
  const ratingBadge = `<div class="movie-rating"><i class="ti ti-star-filled" style="font-size:10px"></i>${m.vote_average?.toFixed(1)||'?'}</div>`;
  c.innerHTML = `
    <div class="movie-poster">
      ${poster}
      ${ratingBadge}
      <div class="movie-overlay">
  <div style="display:flex;gap:6px;align-items:center;">
  <div class="play-btn" onclick="event.stopPropagation();openPlayer('${(m.title||m.name).replace(/'/g,"\\'")}', '${m.id}', '${m.media_type || (m._resultType === 'movie' ? 'movie' : m._resultType ? 'tv' : currentType)}')"><i class="ti ti-player-play" style="font-size:14px;margin-left:2px"></i></div>
  <div class="add-btn" onclick="toggleList(event, ${m.id}, '${(m.title||m.name).replace(/'/g,"\\'")}', '${m.poster_path}')"><i class="ti ti-${inList?'x':'plus'}" style="font-size:14px"></i></div>
  </div>
      </div>
    </div>
    <div class="movie-info">
      <div class="movie-title">${m.title || m.name}</div>
      <div class="movie-meta">
        <span class="movie-year">${(m.release_date || m.first_air_date)?.slice(0,4)||'N/A'}</span>
        ${m._resultType ? `<span class="movie-genre-badge">${m._resultType}</span>` : ''}
      </div>
    </div>
  `;
  const title = m.title || m.name;
  c.querySelector('.movie-poster').onclick = (e) => {
    if(!e.target.closest('.add-btn')) openDetail(m.id, m.media_type || (m._resultType === 'movie' ? 'movie' : m._resultType ? 'tv' : currentType));
  };
  return c;
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

function closeDetail(){
  document.getElementById('detailModal').classList.remove('open');
  document.body.style.overflow = '';
}

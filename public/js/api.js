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
  if(currentType === 'anime'){
    const res = await fetch(`${TMDB_BASE}/discover/tv?api_key=${TMDB_KEY}&with_keywords=210024&sort_by=popularity.desc&page=${Math.floor(Math.random()*5)+1}&include_adult=${includeAdult}`);
    const data = await res.json();
    renderTrending(data.results);
    updateHero(data.results[0]);
    return;
  }
  const type = currentType === 'explore' ? 'tv' : currentType;
  const res = await fetch(`${TMDB_BASE}/trending/${type}/week?api_key=${TMDB_KEY}&include_adult=${includeAdult}`);
  const data = await res.json();
  renderTrending(data.results);
  updateHero(data.results[0]);
}
let explorePage = 0;
async function fetchPopular(genreId=''){
  let url;
  
  const sort = document.getElementById('sortSelect')?.value || 'popularity.desc';
  if(currentType === 'explore'){
    if(!currentUrl && currentType !== 'explore') return;
    explorePage = (explorePage||0)+1;
    const [mv, tv, an] = await Promise.all([
      fetch(`${TMDB_BASE}/discover/movie?api_key=${TMDB_KEY}&sort_by=${sort}&page=${Math.floor(Math.random()*5)+1}&include_adult=${includeAdult}`).then(r=>r.json()),
      fetch(`${TMDB_BASE}/discover/tv?api_key=${TMDB_KEY}&sort_by=${sort}&page=${Math.floor(Math.random()*5)+1}&include_adult=${includeAdult}`).then(r=>r.json()),
      fetch(`${TMDB_BASE}/discover/tv?api_key=${TMDB_KEY}&with_keywords=210024&sort_by=popularity.desc&page=${Math.floor(Math.random()*5)+1}&include_adult=${includeAdult}`).then(r=>r.json())
    ]);
    const mixed = [
      ...mv.results.map(m=>({...m, media_type:'movie'})),
      ...tv.results.map(m=>({...m, media_type:'tv'})),
      ...an.results.map(m=>({...m, media_type:'tv', _resultType:'anime'}))
    ].sort(()=>Math.random()-0.5);
    currentUrl = 'exxplore';
    renderGrid(mixed);
    return;
  }

  if(currentType === 'movie'){
    url = genreId
      ? `${TMDB_BASE}/discover/movie?api_key=${TMDB_KEY}&with_genres=${genreId}&sort_by=${sort}&include_adult=${includeAdult}`
      : `${TMDB_BASE}/discover/movie?api_key=${TMDB_KEY}&sort_by=${sort}&include_adult=${includeAdult}`
  } else if(currentType === 'tv'){
    url = genreId
      ? `${TMDB_BASE}/discover/tv?api_key=${TMDB_KEY}&with_genres=${genreId}&sort_by=${sort}&include_adult=${includeAdult}`
      : `${TMDB_BASE}/discover/tv?api_key=${TMDB_KEY}&sort_by=${sort}&include_adult=${includeAdult}`
  } else {
    url = genreId
      ? `${TMDB_BASE}/discover/tv?api_key=${TMDB_KEY}&with_genres=${genreId}&with_keywords=210024&sort_by=${sort}&include_adult=${includeAdult}`
      : `${TMDB_BASE}/discover/tv?api_key=${TMDB_KEY}&with_keywords=210024&sort_by=${sort}&include_adult=${includeAdult}`;
  }
  currentUrl = url;
  currentPage = 1;  
  const res = await fetch(url);
  const data = await res.json();
  renderGrid(data.results);
}

async function openDetail(id, type='movie'){
  document.body.style.overflow = 'hidden';
  const endpoint = type === 'movie'
    ? `${TMDB_BASE}/movie/${id}?api_key=${TMDB_KEY}&append_to_response=credits,similar,videos,release_dates`
    : `${TMDB_BASE}/tv/${id}?api_key=${TMDB_KEY}&append_to_response=credits,similar,videos,content_ratings`;
  const res = await fetch(endpoint);
  const m = await res.json();
  const originalLang = m.original_language || 'en';
  const title = m.title || m.name;
  const year = (m.release_date || m.first_air_date || '').slice(0,4);
  const runtime = m.runtime ? `${m.runtime} min` : m.episode_run_time?.[0] ? `${m.episode_run_time[0]} min/ep` : '';
  const rating = m.vote_average ? `⭐ ${m.vote_average.toFixed(1)}` : '';
  const overview = m.overview || 'No description available.';
  const backdrop = m.backdrop_path ? `https://image.tmdb.org/t/p/w1280${m.backdrop_path}` : '';
  const poster = m.poster_path ? `${IMG_BASE}${m.poster_path}` : '';
  const cast = m.credits?.cast?.slice(0,8) || [];
  const director = m.credits?.crew?.find(c=>c.job==='Director')?.name || '';
  const writer = m.credits?.crew?.find(c=>['Writer','Screenplay'].includes(c.job))?.name || '';
  const trailer = m.videos?.results?.find(v=>v.type==='Trailer' && v.site==='YouTube');
  const ageRating = type === 'movie'
    ? m.release_dates?.results?.find(r=>r.iso_3166_1==='US')?.release_dates?.find(d=>d.certification)?.certification || ''
    : m.content_ratings?.results?.find(r=>r.iso_3166_1==='US')?.rating || '';
  const budget = m.budget ? `$${(m.budget/1e6).toFixed(1)}M` : '';
  const revenue = m.revenue ? `$${(m.revenue/1e6).toFixed(1)}M` : '';
  const genres = m.genres || [];

  document.getElementById('detailBackdrop').style.backgroundImage = backdrop ? `url(${backdrop})` : '';
  document.getElementById('detailPoster').innerHTML = poster ? `<img src="${poster}" alt="${title}">` : '';
  document.getElementById('detailTitle').textContent = title;
  document.getElementById('detailYear').textContent = year;
  document.getElementById('detailRuntime').textContent = runtime;
  document.getElementById('detailRating').textContent = rating;
  document.getElementById('detailAge').textContent = ageRating;
  document.getElementById('detailDirector').innerHTML = director ? `Director: ${director}` : '';
  document.getElementById('detailWriter').innerHTML = writer ? `Writer: ${writer}` : '';
  document.getElementById('detailBudget').textContent = budget ? `Budget: ${budget}` : '';
  document.getElementById('detailRevenue').textContent = revenue ? `Revenue: ${revenue}` : '';
  document.getElementById('detailTrailerBtn').style.display = trailer ? 'flex' : 'none';
  document.getElementById('detailTrailerBtn').onclick = () => {
  if(!trailer) return;
  closeDetail();
  document.getElementById('playerTitle').textContent = `${title} - Trailer`;
  document.getElementById('playerIframe').src = `https://www.youtube.com/embed/${trailer.key}?autoplay=1`;
  document.getElementById('episodeControls').style.display = 'none';
  document.getElementById('playerModal').classList.add('open');
  };
  document.getElementById('detailOverview').textContent = overview;
  document.getElementById('detailGenres').innerHTML = genres.map(g=>`<span class="detail-genre-tag">${g.name}</span>`).join('');
  document.getElementById('detailCast').innerHTML = cast.map(c=>`<span class="cast-chip">${c.name}</span>`).join('');
  document.getElementById('similarRow').innerHTML = '';
  (m.similar?.results || []).slice(0,10).forEach((s,i) => document.getElementById('similarRow').appendChild(movieCard({...s, media_type: type}, true, i)));
  document.getElementById('detailPlayBtn').onclick = () => {
    window._metaYear = year;
    window._metaRating = m.vote_average || 0;
    window._currentPoster = poster;
    window._originalLang = originalLang;
    closeDetail();
    openPlayer(title, id, type);
  };
  document.getElementById('detailModal').classList.add('open');
  document.body.style.overflow = 'hidden';
  document.getElementById('detailEpisodeControls').style.display = type === 'tv' ? 'block' : 'none';
  if(type === 'tv') loadEpisodes(id, 1, title, poster, year, originalLang);
}

async function loadEpisodes(id, season=1, title='', poster='', year='', originalLang='en'){
  const res = await fetch(`${TMDB_BASE}/tv/${id}/season/${season}?api_key=${TMDB_KEY}`);
  const data = await res.json();

  // render season tabs
  const seasonsRes = await fetch(`${TMDB_BASE}/tv/${id}?api_key=${TMDB_KEY}`);
  const showData = await seasonsRes.json();
  const seasonPoster = data.poster_path ? `https://image.tmdb.org/t/p/w300${data.poster_path}` : '';
  const seasonTabs = document.getElementById('detailSeasonTabs');
  document.getElementById('detailSeasonTabs').innerHTML = '';
  document.querySelectorAll('.season-poster-inject, .season-select-inject').forEach(e=>e.remove());
  if(seasonPoster){
    const img = document.createElement('img');
    img.src = seasonPoster;
    img.className = 'season-poster-inject';
    img.style.cssText = 'width:100%;height:100%;object-fit:cover;border-radius:8px;margin-top:8px;display:block';
    document.getElementById('detailPoster').appendChild(img);
  }
  const select = document.createElement('select');
  select.className = 'season-select-inject';
  select.style.cssText = 'width:100%;background:#1a1a1a;color:#fff;border:0.5px solid rgba(255,255,255,0.15);border-radius:6px;padding:5px 10px;font-size:12px;margin-top:8px';
  select.innerHTML = showData.seasons.filter(s=>s.season_number>0).map(s=>`<option value="${s.season_number}" ${s.season_number==season?'selected':''}>Season ${s.season_number}</option>`).join('');
  select.onchange = () => loadEpisodes(id, select.value, title, poster, year, originalLang);
  document.getElementById('detailPoster').appendChild(select);

  // render episode list
  const epList = document.getElementById('detailEpisodeList');
  epList.innerHTML = '';
  data.episodes?.forEach(ep => {
    const btn = document.createElement('button');
    btn.style.cssText = `background:rgba(255,255,255,0.05);border:0.5px solid rgba(255,255,255,0.1);border-radius:8px;padding:8px;color:#fff;font-size:12px;cursor:pointer;text-align:left;`;
    const still = ep.still_path ? `https://image.tmdb.org/t/p/w300${ep.still_path}` : '';
    btn.style.padding = '0';
    btn.style.display = 'flex';
    btn.style.gap = '10px';
    btn.innerHTML = `
        ${still ? `<img src="${still}" style="width:120px;height:70px;object-fit:cover;border-radius:8px;flex-shrink:0">` : ''}
        <div style="padding:8px 8px 8px 0">
          <div style="color:#e50914;font-size:11px;margin-bottom:2px">EP ${ep.episode_number}</div>
          <div style="font-weight:500;margin-bottom:4px">${ep.name}</div>
          <div style="font-size:11px;color:rgba(255,255,255,0.5);line-height:1.4">${ep.overview || ''}</div>
        </div>`;
    btn.onclick = () => {
      closeDetail();
      window._metaYear = year; window._metaRating = 0; window._currentPoster = poster;
      window._originalLang = originalLang;
      openPlayer(title, id, 'tv');
      setTimeout(() => {
        document.getElementById('seasonInput').value = season;
        document.getElementById('episodeInput').value = ep.episode_number;
        loadEmbed();
      }, 150);
    };
    epList.appendChild(btn);
  });
}

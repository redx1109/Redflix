function toggleList(e, id, title, poster, rating=0, year=''){
  e.stopPropagation();
  let list = JSON.parse(localStorage.getItem('myList') || '[]');
  const exists = list.find(m => m.id === id);
  if(exists) list = list.filter(m => m.id !== id);
  else list.push({id, title, poster, rating, year});
  const btn = e.currentTarget;
  btn.innerHTML = exists 
  ? '<i class="ti ti-plus" style="font-size:14px"></i>'
  : '<i class="ti ti-x" style="font-size:14px"></i>';
  localStorage.setItem('myList', JSON.stringify(list));
}

function showMyList(){
  currentUrl = '';  
  const list = JSON.parse(localStorage.getItem('myList') || '[]');
  document.querySelector('.hero').style.display = 'none';
  document.querySelector('.genre-tabs').style.display = 'none';
  document.getElementById('trendingRow').closest('.section').style.display = 'none';
  document.getElementById('gridTitle').textContent = '❤️ My List';
  document.getElementById('popularSection').style.display = 'block';
  document.getElementById('moviesGrid').innerHTML = '';
  renderGrid(list.map(m => ({...m, poster_path: m.poster, title: m.title, vote_average: parseFloat(m.rating)||0, release_date: m.year ? `${m.year}-01-01` : ''})));
}

function saveProgress(title, id, type, poster, season=null, episode=null, year='', rating=0){
  const data = { title, id, type, poster, season, episode, year, rating };
  localStorage.setItem('continueWatching', JSON.stringify(data));

  let list = JSON.parse(localStorage.getItem('continueList') || '[]');
  list = list.filter(x => x.id != id);
  list.unshift(data);
  list = list.slice(0, 10);
  localStorage.setItem('continueList', JSON.stringify(list));
}

function showContinuePopup(){
  const data = JSON.parse(localStorage.getItem('continueWatching') || 'null');
  if(!data) return;
  const popup = document.getElementById('continuePopup');
  document.getElementById('continuePopupTitle').textContent = data.title;
  document.getElementById('continuePopupPoster').src = data.poster
  ? (data.poster.startsWith('http') ? data.poster : `${IMG_BASE}${data.poster}`)
  : '';
  document.getElementById('continuePopupSub').textContent = data.season ? `Season ${data.season} • Episode ${data.episode}` : '';
  popup.style.display = 'flex';
}

function dismissPopup(){
  document.getElementById('continuePopup').style.display = 'none';
  localStorage.removeItem('continueWatching');
}

function resumeWatching(){
  const data = JSON.parse(localStorage.getItem('continueWatching') || 'null');
  if(!data) return;
  document.getElementById('continuePopup').style.display = 'none';
  openPlayer(data.title, data.id, data.type);
  if(data.season){
    setTimeout(() => {
      document.getElementById('seasonInput').value = data.season;
      document.getElementById('episodeInput').value = data.episode;
      loadEmbed();
    }, 800);
  }
}

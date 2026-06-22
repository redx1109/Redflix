const iframe = () => document.getElementById('playerIframe');

async function openPlayer(title, id='', type=currentType){
  currentType = type;
  document.getElementById('playerTitle').textContent = title;
  const posterEl = document.getElementById('detailPoster').querySelector('img');
  const posterPath = posterEl ? posterEl.src.replace(IMG_BASE, '') : '';
  saveProgress(title, id, type, posterPath, type !== 'movie' ? 1 : null, type !== 'movie' ? 1 : null); 
  document.getElementById('tmdbInput').value = id;
  document.getElementById('playerIframe').src = '';
  document.getElementById('playerModal').classList.add('open');
  const epControls = document.getElementById('episodeControls');
  const isShow = type !== 'movie';
  epControls.style.display = isShow ? 'flex' : 'none';
  if(isShow && id) loadEpisodes(id);
  document.getElementById('nextEpBtn').style.display = isShow ? 'block' : 'none';
  const sInput = document.getElementById('seasonInput');
  const eInput = document.getElementById('episodeInput');
  if(sInput) sInput.value = 1;
  if(eInput) eInput.value = 1;
  epControls.style.gap = '8px';
  epControls.style.alignItems = 'center';
  if(type === 'anime') {
  const extRes = await fetch(`${TMDB_BASE}/tv/${id}/external_ids?api_key=${TMDB_KEY}`);
  const extData = await extRes.json();
  window._malId = extData.tvdb_id; // closest we get from TMDB
  window._animeId = id;
  }
  if(id) loadEmbed();
}

function closePlayer(){
  document.getElementById('playerIframe').src = '';
  document.getElementById('playerModal').classList.remove('open');
}

function loadEmbed(){
  const lang = document.getElementById('langSelect')?.value || '';
  const langParam = lang ? `?lang=${lang}` : '';
  const id = document.getElementById('tmdbInput').value;
  const src = document.getElementById('srcSelect').value;
  const s = parseInt(document.getElementById('seasonInput')?.value) || 1;
  const e = parseInt(document.getElementById('episodeInput')?.value) || 1;
  
  if(!id) return;
  let urls;
  if(currentType === 'movie'){
    urls = {
      zxcstream: `https://zxcstream.xyz/player/movie/${id}?dubLang=hi`,
      autoembed: `https://autoembed.co/movie/tmdb/${id}`,
      apiplayer: `https://apiplayer.ru/embed/movie/${id}`,
      primesrc: `https://primesrc.me/embed/movie?tmdb=${id}`,
      vidlink: `https://vidlink.pro/movie/${id}?player=jw&multiLang=true&autoplay=true`,
      twoembed: `https://www.2embed.cc/embed/${id}`,
      twoembedskin: `https://www.2embed.skin/embed/${id}`,
      videasy: `https://player.videasy.net/movie/${id}`,
      vidfast:   `https://vidfast.pro/movie/${id}`,
      vidzee: `https://player.vidzee.wtf/embed/movie/${id}`,
      cinesrc: `https://cinesrc.st/embed/movie/${id}`,
      peachify: `https://peachify.top/embed/movie/${id}`,
      vidplus: `https://player.vidplus.to/embed/movie/${id}?autoplay=true`,
      embedmaster: `https://embedmaster.link/movie/${id}`
    };  
  } else {
    urls = {
      zxcstream: `https://zxcstream.xyz/player/tv/${id}/${s}/${e}?dubLang=hi`,
      autoembed: `https://autoembed.co/tv/tmdb/${id}-${s}-${e}`,
      apiplayer: `https://apiplayer.ru/embed/tv/${id}/${s}/${e}`,
      primesrc: `https://primesrc.me/embed/tv?tmdb=${id}&season=${s}&episode=${e}`,
      vidlink: `https://vidlink.pro/tv/${id}/${s}/${e}?player=jw&multiLang=true&autoplay=true`,
      twoembed: `https://www.2embed.cc/embedtv/${id}&s=${s}&e=${e}`,
      twoembedskin: `https://www.2embed.skin/embedtv/${id}&s=${s}&e=${e}`,
      videasy: `https://player.videasy.net/tv/${id}/${s}/${e}`,
      vidfast:   `https://vidfast.pro/tv/${id}/${s}/${e}`,
      vidzee: `https://player.vidzee.wtf/embed/tv/${id}/${s}/${e}`,
      cinesrc: `https://cinesrc.st/embed/tv/${id}?s=${s}&e=${e}`,
      peachify: `https://peachify.top/embed/tv/${id}/${s}/${e}`,
      vidplus: `https://player.vidplus.to/embed/movie/${id}/${s}/${e}?autoplay=true`,
      embedmaster: `https://embedmaster.link/movie/${id}/${s}/${e}`
    };
  }
  
  const noAds = ['zxcstream','autoembed','cinesrc','apiplayer']
  const noSandbox = ['embedmaster','peachify','vidfast','videasy','twoembed','twoembedskin','vidlink','vidapi','vidzee','primesrc'];
  const embedNote = document.getElementById('adWarning');
  if(noSandbox.includes(src)) {
    iframe().removeAttribute('sandbox');
    if(embedNote) embedNote.textContent = '⚠️ Ads possible on this source';
  } else {
    iframe().setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-presentation');
    if(embedNote) embedNote.textContent = '';
  }
  document.getElementById('playerIframe').src = urls[src];
}

iframe()?.addEventListener('load', () => {
  iframe().contentWindow.addEventListener('click', e => {
    e.stopPropagation();
  });
});

// Clean Ad Blocker
window.open = (url, target) => {
  if (target === '_blank' || !url || url === 'about:blank') return null;
  return null;
};

document.getElementById('playerIframe')?.addEventListener('load', () => {
  try {
    const iw = document.getElementById('playerIframe').contentWindow;
    iw.open = () => null;
    iw.alert = () => null;
    iw.confirm = () => null;
  } catch(e) {}
});

window.addEventListener('beforeunload', e => {
  e.preventDefault();
  e.returnValue = '';
});
function nextEpisode(){
  const epInput = document.getElementById('episodeInput');
  epInput.value = parseInt(epInput.value) + 1;
  loadEmbed();
}

const iframe = () => document.getElementById('playerIframe');

async function openPlayer(title, id='', type=currentType){
  const origSelect = document.getElementById('langSelect');
  if(origSelect && window._originalLang){
    const langNames = {en:'English', hi:'Hindi', es:'Spanish', fr:'French', ja:'Japanese', ko:'Korean', te:'Telugu', ta:'Tamil'};
    let exists = [...origSelect.options].some(o => o.value === window._originalLang);
    if(!exists){
      const opt = document.createElement('option');
      opt.value = window._originalLang;
      opt.textContent = langNames[window._originalLang] || window._originalLang;
      origSelect.appendChild(opt);
    }
    origSelect.value = window._originalLang;
    [...origSelect.options].forEach(o => {
      o.textContent = o.textContent.replace(' (Original)', '');
      if(o.value === window._originalLang) o.textContent += ' (Original)';
    });
  }
  if(window._resumeLang){
    origSelect.value = window._resumeLang;
    window._resumeLang = null;
  }
  if(!window._resumeSrc){
    document.getElementById('srcSelect').selectedIndex = 0;
  }
  filterSourcesByLang();
  if(window._resumeSrc){
    document.getElementById('srcSelect').value = window._resumeSrc;
    window._resumeSrc = null;
  }
  currentType = type;
  document.getElementById('playerTitle').textContent = title;
  const posterEl = document.getElementById('detailPoster').querySelector('img');
  const posterPath = posterEl?.src || window._currentPoster || '';
  console.log('posterEl.src:', posterEl?.src);
  console.log('posterPath saved:', posterPath);
  const metaYear = window._metaYear || '';
  const metaRating = window._metaRating || 0;saveProgress(title, id, type, posterPath, type !== 'movie' ? 1 : null, type !== 'movie' ? 1 : null, metaYear, metaRating, document.getElementById('langSelect')?.value, document.getElementById('srcSelect')?.value);
  document.getElementById('tmdbInput').value = id;
  document.getElementById('playerIframe').src = '';
  document.getElementById('playerModal').classList.add('open');
  const isShow = type !== 'movie';
  document.getElementById('nextEpBtn').style.display = isShow ? 'block' : 'none';
  const sInput = document.getElementById('seasonInput');
  const eInput = document.getElementById('episodeInput');
  if(sInput && !sInput.value) sInput.value = 1;
  if(eInput && !eInput.value) eInput.value = 1;
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

async function loadEmbed(){
  const lang = document.getElementById('langSelect')?.value || 'en';
  const id = document.getElementById('tmdbInput').value;
  const src = document.getElementById('srcSelect').value;
  const s = parseInt(document.getElementById('seasonInput')?.value) || 1;
  const e = parseInt(document.getElementById('episodeInput')?.value) || 1;
  
  if(!id) return;
  let imdbId = id;
  if(src === 'dub'){
    const extRes = await fetch(`${TMDB_BASE}/${currentType === 'movie' ? 'movie' : 'tv'}/${id}/external_ids?api_key=${TMDB_KEY}`);
    imdbId = (await extRes.json()).imdb_id || id;
  }
  let urls;
  console.log('Loading embed for', currentType, id, s, e, src, imdbId);
  if(currentType === 'movie'){
    urls = {
      zxcstream: `https://zxcstream.xyz/player/movie/${id}?dubLang=${lang}?autoPlay=true`,
      autoembed: `https://autoembed.co/movie/tmdb/${id}?autoPlay=true`,
      apiplayer: `https://apiplayer.ru/embed/movie/${id}?autoPlay=true`,
      primesrc: `https://primesrc.me/embed/movie?tmdb=${id}?autoPlay=true`,
      vidlink: `https://vidlink.pro/movie/${id}?player=jw&multiLang=true&autoplay=true?autoPlay=true`,
      twoembed: `https://www.2embed.cc/embed/${id}?autoPlay=true`,
      twoembedskin: `https://www.lookmovie2.skin/embed/player/${id}?autoPlay=true`,
      videasy: `https://player.videasy.net/movie/${id}?nextEpisode=true&autoplayNextEpisode=true&episodeSelector=true&overlay=true&color=8B5CF6x`,
      vidfast: `https://vidfast.vc/movie/${id}?autoPlay=true`,
      vidzee: `https://player.vidzee.wtf/embed/movie/${id}?autoPlay=true`,
      cinesrc: `https://cinesrc.st/embed/movie/${id}?autoPlay=true`,
      peachify: `https://peachify.top/embed/movie/${id}?autoPlay=true`,
      embedmaster: `https://embedmaster.link/movie/${id}?autoPlay=true`,
      filmu: `https://embed.filmu.in/movie/${id}?autoPlay=true`,
      vidnest: `https://vidnest.fun/movie/${id}?autoPlay=true`,
      mapplee: `https://mapplee.com/watch/movie/${id}?autoPlay=true`,
      vidking: `https://www.vidking.net/embed/movie/${id}?autoPlay=true`,
      movie: `https://111movies.net/movie/${id}?autoPlay=true`,
      vidcore: `https://vidcore.org/embed/movie/${id}?autoPlay=true`,
      xpass: `https://play.xpass.top/e/movie/${id}?autoPlay=true`,
      vidup: `https://vidup.to/movie/${id}?autoPlay=true`,
      cinemaos: `https://cinemaos.tech/player/${id}?autoPlay=true`,
      nhd: `https://nhdapi.com/embed/movie/${id}`,
      vidplus: `https://player2.vidplus.pro/embed/movie/${id}?autoplay=true&poster=true&title=true&download=true&watchparty=true&chromecast=true&servericon=true&setting=true&pip=true&primarycolor=6C63FF&secondarycolor=9F9BFF&iconcolor=FFFFFF&logourl=https%3A%2F%2Fi.ibb.co%2F67wTJd9R%2Fpngimg-com-netflix-PNG11.png&font=Roboto&fontcolor=FFFFFF&fontsize=20&opacity=0.5`,
      anyembed: `https://anyembed.xyz/embed/tmdb-movie-${id}?theme=red&logo=false`,
      oneembed: `https://1embed.cc/embed/movie/${id}`,
      fmovies: `https://fmovies4u.com/embed/movie/${id}?autoPlay=true?nextButton=true?sub=en?serve1`,
      xstream: `https://embed.7xstream.tv/embed/movie/${id}`,
      ntg: `https://www.NontonGo.win/embed/movie/${id}`,
      dub: `https://kayel415jek.com/play/${imdbId}`,
      share: `https://share.cdnm.ink/embed/tmdb/${id}`,
      nexa: `https://nxsha.space/embed/movie/${id}?lang=${lang}?server=ZetPly-[Multi-Lang]?disable_app_ad=true`
    };  
  } else {
    urls = {
      zxcstream: `https://zxcstream.xyz/player/tv/${id}/${s}/${e}?dubLang=${lang}?autoPlay=true`,
      autoembed: `https://autoembed.co/tv/tmdb/${id}-${s}-${e}?autoPlay=true`,
      apiplayer: `https://apiplayer.ru/embed/tv/${id}/${s}/${e}&ds_lang=${lang}`,
      primesrc: `https://primesrc.me/embed/tv?tmdb=${id}&season=${s}&episode=${e}`,
      vidlink: `https://vidlink.pro/tv/${id}/${s}/${e}?player=jw&multiLang=true&autoplay=true`,
      twoembed: `https://www.2embed.cc/embedtv/${id}&s=${s}&e=${e}?autoPlay=true`,
      twoembedskin: `https://www.2embed.skin/embedtv/${id}&s=${s}&e=${e}?autoPlay=true`,
      videasy: `https://player.videasy.net/tv/${id}/${s}/${e}?nextEpisode=true&autoplayNextEpisode=true&episodeSelector=true&overlay=true&color=8B5CF6`,
      vidfast:   `https://vidfast.vc/tv/${id}/${s}/${e}?autoPlay=true`,
      vidzee: `https://player.vidzee.wtf/embed/tv/${id}/${s}/${e}?autoPlay=true`,
      cinesrc: `https://cinesrc.st/embed/tv/${id}?s=${s}&e=${e}?autoPlay=true`,
      peachify: `https://peachify.top/embed/tv/${id}/${s}/${e}?autoPlay=true`,
      embedmaster: `https://embedmaster.link/tv/${id}/${s}/${e}?autoPlay=true`,
      filmu: `https://embed.filmu.in/tv/${id}/${s}/${e}?autoPlay=true`,
      vidnest: `https://vidnest.fun/tv/${id}/${s}/${e}?autoPlay=true`,
      mapplee: `https://mapplee.com/watch/movie/${id}/${s}/${e}?autoPlay=true`,
      vidking: `https://www.vidking.net/embed/tv/${id}/${s}/${e}?autoPlay=true`,
      movie: `https://111movies.net/tv/${id}/${s}/${e}?autoPlay=true`,
      vidcore: `https://vidcore.org/embed/tv/${id}/${s}/${e}?autoPlay=true`,
      xpass: `https://play.xpass.top/e/tv/${id}/${s}/${e}?autoPlay=true`,
      vidup: `https://vidup.to/tv/${id}/${s}/${e}?autoPlay=true`,
      cinemaos: `https://cinemaos.tech/player/${id}/${s}/${e}?autoPlay=true`,
      nhd: `https://nhdapi.com/embed/tv/${id}/${s}/${e}`,
      vidplus: `https://player2.vidplus.pro/embed/tv/${id}/${s}/${e}?autoplay=true&autonext=true&nextbutton=true&poster=true&title=true&download=true&watchparty=true&chromecast=true&episodelist=true&servericon=true&setting=true&pip=true&primarycolor=6C63FF&secondarycolor=9F9BFF&iconcolor=FFFFFF&logourl=https%3A%2F%2Fi.ibb.co%2F67wTJd9R%2Fpngimg-com-netflix-PNG11.png&font=Roboto&fontcolor=FFFFFF&fontsize=20&opacity=0.5`,
      anyembed: `https://anyembed.xyz/embed/tmdb-tv-${id}-${s}-${e}?theme=red&logo=false`,
      oneembed: `https://1embed.cc/embed/tv/${id}/${s}/${e}`,
      fmovies: `https://fmovies4u.com/embed/tv/${id}/${s}/${e}?autoPlay=true?nextButton=true?sub=en?serve1`,
      xstream: `https://embed.7xstream.tv/embed/tv/${id}/${s}/${e}`,
      ntg: `https://www.NontonGo.win/embed/tv/${id}/${s}/${e}`,
      dub: `https://kayel415jek.com/play/${imdbId}`,
      share: `https://share.cdnm.ink/embed/tmdb/${id}/${s}/${e}`,
      nexa: `https://nxsha.space/embed/tv/${id}/${s}/${e}?lang=${lang}?server=ZetPly-[Multi-Lang]?disable_app_ad=true`
    };
  }
  const download = {nhd: 'https://nhdapi.com/dl/movie/${id},https://nhdapi.com/dl/tv/${id}/${s}/${e}',
    oneembed: 'https://1embed.cc/download/movie/${id},https://1embed.cc/download/tv/${id}/${s}/${e}',
  }
  const noAds = ['dub','ntg','oneembed','nhd','autoembed','cinesrc','apiplayer',]
  const noSandbox = ['filmu','zxcstream','share','vidfast','vidnest','videasy','cinemaos','fmovies','vidplus','vidup','xpass','vidking','mapplee','movie','embedmaster','peachify','twoembed','twoembedskin','vidlink','vidapi','vidzee','primesrc'];
  const embedNote = document.getElementById('adWarning');
  
  if(noSandbox.includes(src)) {
    iframe().removeAttribute('sandbox');
    if(embedNote) embedNote.textContent = '⚠️ Ads possible on this source';
  } else {
    iframe().setAttribute('sandbox','allow-scripts allow-same-origin allow-forms allow-presentation');
    if(embedNote) embedNote.textContent = '';
  }
  saveProgress(document.getElementById('playerTitle').textContent, id, currentType, window._currentPoster || '', currentType !== 'movie' ? s : null, currentType !== 'movie' ? e : null, window._metaYear||'', window._metaRating||0, lang, src);
  const targetSrc = urls[src];
  document.getElementById('playerIframe').src = targetSrc;
  clearTimeout(window._embedFailTimer);
  window._embedFailTimer = setTimeout(() => {
    const opts = [...document.getElementById('srcSelect').options].filter(o=>o.style.display!=='none');
    const idx = opts.findIndex(o=>o.value===src);
    const next = opts[idx+1];
    if(next){
      document.getElementById('srcSelect').value = next.value;
      loadEmbed();
    }
  }, 6000);
}
const dubLangMap = {
    nexa:['en','hi','fr','es'], 
    zxcstream:['en','hi'],
    dub:['en','hi'],
    nhd:['en','hi'],
    cinemaos:['en','hi'],
    vidnest:['en','hi'],
    videasy:['en','hi'],
    vidzee:['en','hi'],
    peachify:['en','hi'],
    anyembed:['en','hi'],
    oneembed:['en','hi'],
    autoembed:['en',],
    twoembedskin:['en',],
    twoembed:['en',],
    vidcore:['en',],
    vidlink:['en',],
    vidfast:['en',],
    vidup:['en',],
    vidplus:['en',],
    vidking:['en',],
    xpass:['en',],
    xstream:['en',],
    mapplee:['en',],
    primesrc:['en',],
    filmu:['en',],
    fmovies:['en',],
    ntg:['en',],
    movie:['en',],
    share:['en',],
    embedmaster:['en',],
    apiplayer:['en',],
    cinesrc:['en',],
  };
  
function filterSourcesByLang(){
  const lang = document.getElementById('langSelect').value;
  const opts = document.getElementById('srcSelect').options;
  const isOriginal = lang === window._originalLang;
  for(let o of opts){
    const langs = dubLangMap[o.value];
    o.style.display = (isOriginal || !langs || langs.includes(lang)) ? '' : 'none';
  }
  const current = document.getElementById('srcSelect').value;
  if(document.querySelector(`#srcSelect option[value="${current}"]`).style.display === 'none'){
    const firstVisible = [...opts].find(o=>o.style.display !== 'none');
    if(firstVisible) document.getElementById('srcSelect').value = firstVisible.value;
  }
}
// Clean Ad Blocker
const realOpen = window.open.bind(window);
window.open = (url, target) => {
  if (target === '_blank' || !url || url === 'about:blank') return null;
  return null;
};
document.getElementById('playerIframe')?.addEventListener('load', () => {
  try {
    clearTimeout(window._embedFailTimer);
    const iw = document.getElementById('playerIframe').contentWindow;
    iw.open = () => null;
    iw.alert = () => null;
    iw.confirm = () => null;
  } catch(e) {}
});
document.addEventListener('click', e => {
  const a = e.target.closest('a[target="_blank"]');
  if(a && iframe().contains(a)) e.preventDefault();
}, true);
window.addEventListener('beforeunload', e => {
  e.preventDefault();
  e.returnValue = '';
});
function nextEpisode(){
  const epInput = document.getElementById('episodeInput');
  epInput.value = parseInt(epInput.value) + 1;
  loadEmbed();
}

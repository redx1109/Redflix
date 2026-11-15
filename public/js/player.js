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
  const anime = await resolveAnimeId(id, s);

  if(!id) return;
  let imdbId = id;
  if (src.startsWith('dub')) {
    const extRes = await fetch(`${TMDB_BASE}/${currentType === 'movie' ? 'movie' : 'tv'}/${id}/external_ids?api_key=${TMDB_KEY}`);
    imdbId = (await extRes.json()).imdb_id || id;
  }
  const anilistId = anime.kind === 'anilist' ? anime.id : null;
  const malId = anime.malId;
  
  const mpLang = lang === window._originalLang ? 'sub' : 'dub';
  const mpEp = currentType === 'movie' ? 1 : e;
  const mpUrl = anilistId
    ? `https://megaplay.buzz/stream/ani/${anilistId}/${mpEp}/${mpLang}`
    : malId
      ? `https://megaplay.buzz/stream/mal/${malId}/${mpEp}/${mpLang}`
      : '';
  let urls;
  console.log('Loading embed for', currentType, id, s, e, src, imdbId, 'Anilist id: ',anilistId);
  if(currentType === 'movie'){
    urls = {
      megaplay: mpUrl,
      try: `https://tryembed.us.cc/embed/anime/${anilistId}/${mpEp}/${mpLang}?skin=transparent`,
      novu: `https://novuscloud.buzz/embed/hd-1/ani/${anilistId}/${mpEp}/${mpLang}`,
      megabuzz: `https://megaplay.buzz/stream/ani/${anilistId}/${mpEp}/${mpLang}`,
      zxcstream: `https://zxcstream.cc/player/movie/${id}?dubLang=${lang}?autoPlay=true`,
      autoembed: `https://autoembed.co/movie/tmdb/${id}?autoPlay=true`,
      apiplayer: `https://atlantic.st/embed/movie/${id}?autoPlay=true?lang=${lang}`, //anime support
      primesrc: `https://primesrc.me/embed/movie?tmdb=${id}?autoPlay=true`,
      vidlink: `https://vidlink.pro/movie/${id}?player=jw&multiLang=true&autoplay=true?autoPlay=true`,
      twoembed: `https://www.2embed.online/embed/movie/${id}?autoPlay=true`, //anime support
      twoembed: `https://www.2embed.stream/embed/movie/${id}?autoPlay=true`,
      twoembedskin: `https://www.lookmovie2.skin/embed/player/${id}?autoPlay=true`,
      videasy: `https://player.videasy.net/movie/${id}?nextEpisode=true&autoplayNextEpisode=true&episodeSelector=true&overlay=true&color=8B5CF6x`,
      vidfast: `https://vidfast.vc/movie/${id}?autoPlay=true`,
      vidzee: `https://player.vidzee.wtf/embed/movie/${id}?autoPlay=true`,
      cinesrc: `https://cinesrc.st/embed/movie/${id}?autoPlay=true`,
      peachify: `https://peachify.top/embed/movie/${id}?autoPlay=true?dub=English`,
      embedmaster: `https://embedmaster.link/movie/${id}?autoPlay=true`,
      filmu: `https://embed.filmu.in/movie/${id}?autoPlay=true`,
      vidnest: `https://vidnest.fun/movie/${id}?autoPlay=true?server=delta`,
      mapplee: `https://mapple.uk/watch/movie/${id}?autoPlay=true`,
      vidking: `https://www.vidking.net/embed/movie/${id}?autoPlay=true`,
      movie: `https://player.vidlove.cc/embed/movie/${id}?autoPlay=true`,
      vidcore: `https://vidcore.io/movie/${id}?autoPlay=true?lang=${lang}`,
      xpass: `https://play.xpass.top/e/movie/${id}?autoPlay=true`,
      vidup: `https://vidup.to/movie/${id}?autoPlay=true`,
      cinemaos: `https://cinemaos.tech/player/${id}?autoPlay=true`,
      nhd: `https://nhdapi.com/embed/movie/${id}`,
      vidplus: `https://player2.vidplus.pro/embed/movie/${id}?autoplay=true&poster=true&title=true&download=true&watchparty=true&chromecast=true&servericon=true&setting=true&pip=true&primarycolor=6C63FF&secondarycolor=9F9BFF&iconcolor=FFFFFF&logourl=https%3A%2F%2Fi.ibb.co%2F67wTJd9R%2Fpngimg-com-netflix-PNG11.png&font=Roboto&fontcolor=FFFFFF&fontsize=20&opacity=0.5`,
      anyembed: `https://anyembed.xyz/embed/tmdb-movie-${id}?theme=red&logo=false`,
      oneembed: `https://1embed.cc/embed/movie/${id}?sr=vnes`,
      fmovies: `https://fmovies4u.com/embed/movie/${id}?autoPlay=true?nextButton=true?sub=en?serve1`,
      ntg: `https://www.NontonGo.win/embed/movie/${id}`,
      dub: `https://kayel415jek.com/play/${imdbId}`,
      dub2: `https://gemmaokl146.com/play/${imdbId}`,
      dub3: `https://linds425fur.com/play/${imdbId}`,
      share: `https://share.cdnm.ink/embed/tmdb/${id}`,  //down
      nexa: `https://nxsha.space/embed/movie/${id}?lang=${lang}?server=ZetPly-[Multi-Lang]?disable_app_ad=true`,
      nexi: `https://web.screenscape.fun/embed?tmdb=${id}&type=movie&lang=${lang}&autoplay=true`,
      vidsync: `https://vidsync.live/embed/movie/${id}?autoplay=true?defaultserver=cinedub-2`, //down
      flex: `https://flaxmovies.xyz/embed/movie/${id}`,
      pire: `https://video.moviepire.co/embed/movie/${id}`,
      cinezo: `https://player.cinezo.live/embed/movie/${id}?server=hindi`, //down
      cdn: `https://cdn.mov2day.xyz/embed/movie/${id}`,  //down
      vidflix: `https://vidflix.club/movie/${id}`,  //down
      vaplayer: `https://vaplayer.ru/embed/movie/${id}`,
      bandit: `https://embedbandit.com/embed/movie?tmdb=${id}`,
      buzz: `https://vidsrc.buzz/embed/movie/${id}?autoplay=true`,
      vidy: `https://www.vidy.st/movie/${id}`, // anime
      rive: `https://www.rivestream.app/embed?type=movie&id=${id}`,
      em: `https://videm.buzz/embed/movie/${id}/?autoplay=true`,
      ro: `https://rozgarlelo.modiplay.xyz/embed/tmdb/movie?id=${id}&autoplay=true`,
      vidrock: `https://vidrock.net/movie/${id}?autoplay=true`,
      vidly: `https://vidly.pro/movie/${id}?autoplay=1?audioPicker=1`,   // anime
      rip: `https://streamrip.fun/movie/${id}?autoplay=1?audioPicker=1`, // anime
      viduki: `https://www.viduki.net/1/movie/${id}?autoplay=1?audioPicker=1`, //anime
      vidrift: `https://embed.vidrift.net/embed/movie/${id}?autoplay=1?audioPicker=1`, //anime
      stuck: `https://vidstuck.cc/embed/movie/${id}?branding=RedFlix&loading=2&back=true`,
      bolt: `https://vidbolt.xyz/movie/${id}?autoplay=1?audioPicker=1`, // anime
      vidmario: `https://player.vidmario.net/embed/movie/${id}`
    };
  } else {
    urls = {
      megaplay: mpUrl,
      try: `https://tryembed.us.cc/embed/anime/${anilistId}/${mpEp}/${mpLang}?skin=transparent`,
      novu: `https://novuscloud.buzz/embed/hd-1/ani/${anilistId}/${mpEp}/${mpLang}`,
      megabuzz: `https://megaplay.buzz/stream/ani/${anilistId}/${mpEp}/${mpLang}`,
      zxcstream: `https://zxcstream.cc/player/tv/${id}/${s}/${e}?dubLang=${lang}?autoPlay=true`,
      autoembed: `https://autoembed.co/tv/tmdb/${id}-${s}-${e}?autoPlay=true`,
      apiplayer: `https://atlantic.st/embed/tv/${id}/${s}/${e}&ds_lang=${lang}`, // anime support
      primesrc: `https://primesrc.me/embed/tv?tmdb=${id}&season=${s}&episode=${e}`,
      vidlink: `https://vidlink.pro/tv/${id}/${s}/${e}?player=jw&multiLang=true&autoplay=true`,
      twoembed: `https://www.2embed.online/embed/tv/${id}&s=${s}&e=${e}?autoPlay=true`,
      twoembedskin: `https://www.2embed.stream/embed/tv/${id}&s=${s}&e=${e}?autoPlay=true`,
      videasy: `https://player.videasy.net/tv/${id}/${s}/${e}?nextEpisode=true&autoplayNextEpisode=true&episodeSelector=true&overlay=true&color=8B5CF6`, //down
      vidfast:   `https://vidfast.vc/tv/${id}/${s}/${e}?autoPlay=true`,
      vidzee: `https://player.vidzee.wtf/embed/tv/${id}/${s}/${e}?autoPlay=true`,
      cinesrc: `https://cinesrc.st/embed/tv/${id}?s=${s}&e=${e}?autoPlay=true`,
      peachify: `https://peachify.top/embed/tv/${id}/${s}/${e}?autoPlay=true?dub=English`, //down
      embedmaster: `https://embedmaster.link/tv/${id}/${s}/${e}?autoPlay=true`,
      filmu: `https://embed.filmu.in/tv/${id}/${s}/${e}?autoPlay=true`,  //vidly now
      vidnest: `https://vidnest.fun/tv/${id}/${s}/${e}?autoPlay=true?server=delta`,
      mapplee: `https://mapple.uk/watch/tv/${id}/${s}/${e}?autoPlay=true`,
      vidking: `https://www.vidking.net/embed/tv/${id}/${s}/${e}?autoPlay=true`,
      movie: `https://player.vidlove.cc/embed/tv/${id}/${s}/${e}?autoPlay=true`, // down
      vidcore: `https://vidcore.io/tv/${id}/${s}/${e}?autoPlay=true?lang=${lang}`,
      xpass: `https://play.xpass.top/e/tv/${id}/${s}/${e}?autoPlay=true`,
      vidup: `https://vidup.to/tv/${id}/${s}/${e}?autoPlay=true`,
      cinemaos: `https://cinemaos.tech/player/${id}/${s}/${e}?autoPlay=true`, // down
      nhd: `https://nhdapi.com/embed/tv/${id}/${s}/${e}`, // down
      vidplus: `https://player2.vidplus.pro/embed/tv/${id}/${s}/${e}?autoplay=true&autonext=true&nextbutton=true&poster=true&title=true&download=true&watchparty=true&chromecast=true&episodelist=true&servericon=true&setting=true&pip=true&primarycolor=6C63FF&secondarycolor=9F9BFF&iconcolor=FFFFFF&logourl=https%3A%2F%2Fi.ibb.co%2F67wTJd9R%2Fpngimg-com-netflix-PNG11.png&font=Roboto&fontcolor=FFFFFF&fontsize=20&opacity=0.5`,  //down
      anyembed: `https://anyembed.xyz/embed/tmdb-tv-${id}-${s}-${e}?theme=red&logo=false`,
      oneembed: `https://1embed.cc/embed/tv/${id}/${s}/${e}?sr=vnes`,
      fmovies: `https://fmovies4u.com/embed/tv/${id}/${s}/${e}?autoPlay=true?nextButton=true?sub=en?serve1`, //down
      ntg: `https://www.NontonGo.win/embed/tv/${id}/${s}/${e}`,
      dub: `https://kayel415jek.com/play/${imdbId}`,
      dub2: `https://gemmaokl146.com/play/${imdbId}`,
      dub3: `https://linds425fur.com/play/${imdbId}`,
      share: `https://share.cdnm.ink/embed/tmdb/${id}/${s}/${e}`,
      nexa: `https://nxsha.space/embed/tv/${id}/${s}/${e}?lang=${lang}?server=ZetPly-[Multi-Lang]?disable_app_ad=true`,
      nexi : `https://web.screenscape.fun/embed?tmdb=${id}&type=tv&s=${s}&e=${e}&lan=${lang}&autoplay=true`,  //down
      vidsync: `https://vidsync.live/embed/tv/${id}/${s}/${e}?autoplay=true?defaultserver=cinedub-2`,
      flex: `https://flaxmovies.xyz/embed/tv/${id}/${s}/${e}`,
      pire: `https://video.moviepire.co/embed/mtv/${id}/${s}/${e}`,
      cinezo: `https://player.cinezo.live/embed/tv/${id}/${s}/${e}?server=hindi`,
      cdn: `https://cdn.mov2day.xyz/embed/tv/${id}/${s}/${e}`,
      vidflix: `https://vidflix.club/tv/${id}/${s}/${e}`,
      vaplayer: `https://vaplayer.ru/embed/tv/${id}/${s}/${e}`,
      bandit: `https://embedbandit.com/embed/tv?tmdb=${id}&season=${s}&episode=${e}`,
      buzz: `https://vidsrc.buzz/embed/tv/${id}/${s}/${e}?autoplay=true`,
      vidy: `https://www.vidy.st/tv/${id}?s=${s}&e=${e}`, // anime support
      rive: `https://www.rivestream.app/embed?type=tv&id=${id}&s=${s}&e=${e}`,
      em: `https://videm.buzz/embed/tv/${id}/${s}/${e}?autoplay=true`,  //down
      ro: `https://rozgarlelo.modiplay.xyz/embed/tmdb/tv?id=${id}&s=${s}&e=${e}&autoplay=true`, // need new tab
      vidrock: `https://vidrock.net/tv/${id}/${s}/${e}?autoplay=true`,
      vidly: `https://vidly.pro/tv/${id}/${s}/${e}?autoplay=1?audioPicker=1`,     //anime
      rip: `https://streamrip.fun/tv/${id}/${s}/${e}?autoplay=1?audioPicker=1`,   //anime
      viduki: `https://www.viduki.net/1/tv/${id}/${s}/${e}?autoplay=1?audioPicker=1`, //anime
      vidrift: `https://embed.vidrift.net/embed/tv/${id}/${s}/${e}?autoplay=1?audioPicker=1`, //anime
      stuck: `https://vidstuck.cc/embed/tv/${id}/${s}/${e}?branding=RedFlix&loading=2&back=true`,
      bolt: `https://vidbolt.xyz/tv/${id}/${s}/${e}?autoplay=1?audioPicker=1`, // anime
      vidmario: `https://player.vidmario.net/embed/tv/${id}/${s}/${e}`
    };
  }
  const download = {nhd: 'https://nhdapi.com/dl/movie/${id},https://nhdapi.com/dl/tv/${id}/${s}/${e}',
    oneembed: 'https://1embed.cc/download/movie/${id},https://1embed.cc/download/tv/${id}/${s}/${e}',
  }
  const noAds = ['ro','nexa','nexi','flex','pire','dub','ntg','autoembed','cinesrc','apiplayer',]
  const noSandbox = ['vidflix','bandit','vidzee','cinesrc','peachify','anyembed','oneembed','pire','cinezo','flex','autoembed',
    'vaplayer','buzz','vidy','em','vidly','bolt',
    'cdn','vidrock','viduki','vidrift','vidcore','vidmario',
    'nhd','megaplay','stuck',
    'vidsync',
    'filmu','try','novu',
    'zxcstream',
    'share',
    'vidfast',
    'vidnest',
    'videasy',
    'cinemaos',
    'fmovies',
    'vidplus',
    'vidup',
    'xpass',
    'vidking',
    'mapplee',
    'movie',
    'embedmaster',
    'peachify',
    'twoembed','twoembedskin','vidlink','vidapi','primesrc'];
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
}

const dubLangMap = {
    anyembed:['en','hi'],
    apiplayer:['en','hi'],
    autoembed:['en',],
    bandit:['en'],
    bolt:['en','hi'],
    cdn:['en'],
    cinemaos:['en','hi'],
    cinezo:['en'],
    cinesrc:['en',],
    dub:['en','hi'],
    dub2:['en','hi'],
    dub3:['en','hi'],
    embedmaster:['en',],
    filmu:['en',],
    flex:['en'],
    fmovies:['en',],
    vidnest:['en','hi'],
    videasy:['en','hi'],
    vidzee:['en','hi'],
    vidly:['en','hi'],
    vidsync:['en','hi'],
    vidcore:['en','hi','fr','es'],
    vidlink:['en',],
    vidfast:['en',],
    vidup:['en',],
    vidplus:['en',],
    vidking:['en',],
    vidflix:['en',],
    vaplayer:['en',], 
    mapplee:['en',],
    movie:['en',],
    nexa:['en','hi','fr','es'], 
    nexi:['en','hi','fr','es'],
    nhd:['en','hi'],
    ntg:['en',],
    oneembed:['en','hi'],
    peachify:['en','hi'],
    pire:['en'],
    primesrc:['en',],
    ro:['en','hi','fr','es'], 
    rive:['en','hi'],
    share:['en',],
    twoembedskin:['en',],
    twoembed:['en',],
    xpass:['en',],
    zxcstream:['en','hi'],
  };
  
  function filterSourcesByLang(){
    const lang = document.getElementById('langSelect').value;
    const opts = document.getElementById('srcSelect').options;
  const isOriginal = lang === window._originalLang;
  for(let o of opts){
    const langs = dubLangMap[o.value];
    o.style.display = (isOriginal || !langs || langs.includes(lang)) ? '' : 'none';
  }
  const preferredByLang = { hi: 'ro', en: 'ro'};
  const preferred = preferredByLang[lang] || 'ro';
  if(preferred && document.querySelector(`#srcSelect option[value="${preferred}"]`)?.style.display !== 'none'){
    document.getElementById('srcSelect').value = preferred;
  } else {
    const current = document.getElementById('srcSelect').value;
    if(document.querySelector(`#srcSelect option[value="${current}"]`).style.display === 'none'){
      const firstVisible = [...opts].find(o=>o.style.display !== 'none');
      if(firstVisible) document.getElementById('srcSelect').value = firstVisible.value;
    }
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

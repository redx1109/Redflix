// Theme Switcher — paste this in your <script> tag or JS file
const themes = [
  { id: 'amoled',      name: '🌑 AMOLED',    file: 'amoled.css' },
  { id: 'red-black',   name: '🔴 Red Black',  file: 'red-black.css' },
  { id: 'ocean-blue',  name: '🌊 Ocean Blue', file: 'ocean-blue.css' },
  { id: 'purple-haze', name: '💜 Purple',     file: 'purple-haze.css' },
  { id: 'matrix',      name: '🌿 Matrix',     file: 'matrix-green.css' },
  { id: 'sunset',      name: '🔥 Sunset',     file: 'sunset.css' },
  { id: 'sakura',      name: '🌸 Sakura',     file: 'sakura.css' },
  { id: 'cosmic',      name: '🪐 Cosmic',     file: 'cosmic.css' },
];

function applyTheme(id) {
  const theme = themes.find(t => t.id === id);
  if (!theme) return;
  let style = document.getElementById('active-theme');
  if (!style) {
    style = document.createElement('style');
    style.id = 'active-theme';
    document.head.appendChild(style);
  }
  fetch(`themes/${theme.file}`).then(r => r.text()).then(css => { style.textContent = css; });
  localStorage.setItem('reddflix-theme', id);
  document.querySelectorAll('.theme-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.theme === id)
  );
}

function buildThemeSwitcher() {
  const container = document.createElement('div');
  container.id = 'theme-switcher';
  container.style.cssText = `
    position:fixed; bottom:20px; right:20px; z-index:9999;
    display:flex; flex-direction:column; align-items:flex-end; gap:6px;
  `;

  const toggle = document.createElement('button');
  toggle.innerHTML = '🎨';
  toggle.style.cssText = `
    width:40px; height:40px; border-radius:50%; border:none;
    background:var(--accent); color:#fff; font-size:18px;
    cursor:pointer; box-shadow:0 2px 12px rgba(0,0,0,0.4);
  `;

  const menu = document.createElement('div');
  menu.style.cssText = `
    display:none; flex-direction:column; gap:4px;
    background:rgba(15,15,20,0.97); border:0.5px solid rgba(255,255,255,0.1);
    border-radius:10px; padding:8px; min-width:140px;
  `;

  themes.forEach(t => {
    const btn = document.createElement('button');
    btn.className = 'theme-btn';
    btn.dataset.theme = t.id;
    btn.textContent = t.name;
    btn.style.cssText = `
      background:none; border:none; color:rgba(255,255,255,0.7);
      font-size:13px; padding:6px 10px; border-radius:6px;
      cursor:pointer; text-align:left; transition:all 0.15s;
    `;
    btn.onmouseenter = () => btn.style.background = 'rgba(255,255,255,0.08)';
    btn.onmouseleave = () => btn.style.background = btn.classList.contains('active') ? 'rgba(255,255,255,0.1)' : 'none';
    btn.onclick = () => { applyTheme(t.id); };
    menu.appendChild(btn);
  });

  toggle.onclick = () => {
    menu.style.display = menu.style.display === 'none' ? 'flex' : 'none';
  };

  container.appendChild(menu);
  container.appendChild(toggle);
  document.body.appendChild(container);
}

// Init on load
document.addEventListener('DOMContentLoaded', () => {
  buildThemeSwitcher();
  const saved = localStorage.getItem('reddflix-theme') || 'matrix';
  applyTheme(saved);
});

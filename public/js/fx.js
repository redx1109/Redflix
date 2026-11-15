// fx.js: starfield background + card tilt. Skips everything if reduced-motion is on.
(() => {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // ---------- Stars ----------
  const cv = document.createElement('canvas');
  cv.id = 'fxStars';
  document.body.prepend(cv);
  const cx = cv.getContext('2d');
  const COUNT = innerWidth < 700 ? 90 : 170;
  let W, H, stars = [], mx = 0, my = 0, tx = 0, ty = 0, shoot = null;

  function resize() {
    W = cv.width = innerWidth; H = cv.height = innerHeight;
    stars = Array.from({ length: COUNT }, () => ({
      x: Math.random() * W, y: Math.random() * H, z: Math.random() * 3 + .5, t: Math.random() * 6
    }));
  }
  resize();
  addEventListener('resize', resize);
  addEventListener('pointermove', e => { tx = e.clientX / innerWidth * 2 - 1; ty = e.clientY / innerHeight * 2 - 1; });

  function frame(t) {
    mx += (tx - mx) * .06; my += (ty - my) * .06;
    cx.clearRect(0, 0, W, H);
    for (const s of stars) {
      const d = s.z / 3.5;
      const x = (((s.x - mx * d * 40) % W) + W) % W;
      const y = (((s.y - scrollY * d * .5 - my * d * 25) % H) + H) % H;
      const a = .35 + .65 * Math.abs(Math.sin(t / 900 + s.t));
      cx.fillStyle = d > .65 ? `rgba(255,130,120,${a})` : `rgba(255,255,255,${a * .8})`;
      cx.beginPath(); cx.arc(x, y, d * 2, 0, 6.283); cx.fill();
    }
    if (!shoot && Math.random() < .004) shoot = { x: Math.random() * W * .8, y: Math.random() * H * .4, l: 0 };
    if (shoot) {
      const g = cx.createLinearGradient(shoot.x, shoot.y, shoot.x - 90, shoot.y - 45);
      g.addColorStop(0, 'rgba(255,255,255,.9)'); g.addColorStop(1, 'rgba(255,255,255,0)');
      cx.strokeStyle = g; cx.lineWidth = 2;
      cx.beginPath(); cx.moveTo(shoot.x, shoot.y); cx.lineTo(shoot.x - 90, shoot.y - 45); cx.stroke();
      shoot.x += 14; shoot.y += 7; if (++shoot.l > 50) shoot = null;
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  // ---------- Card tilt (works for cards added later too) ----------
  const SEL = '.movie-card, .trending-card';
  const reset = p => { p.style.transform = ''; p.style.transition = ''; p.classList.remove('fx-tilt'); };

  document.addEventListener('pointermove', e => {
    if (e.pointerType === 'touch') return;
    const card = e.target.closest?.(SEL);
    const p = card?.querySelector('.movie-poster');
    if (!p) return;
    const r = p.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    if (x < 0 || x > 1 || y < 0 || y > 1) return reset(p);
    p.classList.add('fx-tilt');
    p.style.transition = 'transform .08s';
    p.style.transform = `perspective(700px) rotateX(${(.5 - y) * 14}deg) rotateY(${(x - .5) * 14}deg)`;
    p.style.setProperty('--gx', x * 100 + '%');
    p.style.setProperty('--gy', y * 100 + '%');
  });

  document.addEventListener('pointerout', e => {
    const card = e.target.closest?.(SEL);
    if (card && !card.contains(e.relatedTarget)) {
      const p = card.querySelector('.movie-poster');
      if (p) reset(p);
    }
  });
})();
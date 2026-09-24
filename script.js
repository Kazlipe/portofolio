const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;


if (!isTouch) {
  const cursor = document.getElementById('cursor');
  const dot    = document.getElementById('cursorDot');
  let mx = 0, my = 0, cx = 0, cy = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
  });

  function anim() {
    cx += (mx - cx) * 0.18;
    cy += (my - cy) * 0.18;
    cursor.style.left = cx + 'px';
    cursor.style.top  = cy + 'px';
    requestAnimationFrame(anim);
  }
  anim();

  document.querySelectorAll('a, button, .hobi-card, .contact-item, .easter-egg, .lanyard-card')
    .forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('grow'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('grow'));
    });
}


const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('in');
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.reveal').forEach(el => io.observe(el));


if (!isTouch) {
  document.querySelectorAll('.magnetic').forEach(el => {
    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top  - r.height / 2;
      el.style.transform = `translate(${x * 0.25}px, ${y * 0.35}px)`;
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform = '';
    });
  });
}


document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.cv-panel').forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(tab.dataset.tab).classList.add('active');
  });
});


const egg = document.querySelector('.easter-egg');
let eggClicks = 0;
const eggTrigger = document.getElementById('eggTrigger');
if (eggTrigger && egg) {
  eggTrigger.addEventListener('click', () => {
    eggClicks++;
    if (eggClicks >= 3) {
      egg.classList.add('open');
    }
  });
}


if (!isTouch) {
  const heroTitle = document.querySelector('.hero-title');
  if (heroTitle) {
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      if (y < window.innerHeight) {
        heroTitle.style.transform = `translateY(${y * 0.15}px)`;
        heroTitle.style.opacity = 1 - y / (window.innerHeight * 1.2);
      }
    });
  }
}


(function () {
  const wrap  = document.getElementById('lanyardWrap');
  const pivot = wrap && wrap.querySelector('.lanyard-pivot');
  const card  = document.getElementById('lanyardCard');
  if (!wrap || !pivot || !card) return;

  let angle    = 0;
  let velocity = 0;
  let targetAngle = 0;
  let isDragging  = false;

  const STIFFNESS = 55;
  const DAMPING   = 5.5;
  const MAX_ANGLE = 32;

  pivot.style.transformOrigin = '50% 0%';

  function getPoint(e) {
    if (e.touches && e.touches[0]) return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    if (e.changedTouches && e.changedTouches[0]) return { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
    return { x: e.clientX, y: e.clientY };
  }

  function getAnchor() {
    const r = pivot.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top };
  }

  let anchor = getAnchor();
  window.addEventListener('resize', () => { anchor = getAnchor(); });

  let lastTime = performance.now();

  function loop(now) {
    const dt = Math.min((now - lastTime) / 1000, 0.05);
    lastTime = now;

    if (!isDragging) {
      const x = angle * Math.PI / 180;
      const accel = (-STIFFNESS * x) - (DAMPING * (velocity * Math.PI / 180));
      velocity += (accel * 180 / Math.PI) * dt;
      angle    += velocity * dt;

      if (Math.abs(angle) < 0.05 && Math.abs(velocity) < 0.05) {
        angle = 0; velocity = 0;
      }
    } else {
      const diff = targetAngle - angle;
      angle += diff * Math.min(1, dt * 18);
      velocity = diff * 6;
    }

    pivot.style.transform = `rotate(${angle.toFixed(3)}deg)`;
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  function onDown(e) {
    isDragging = true;
    card.style.cursor = 'grabbing';
    document.body.style.userSelect = 'none';
    anchor = getAnchor();
    targetAngle = angle;
    velocity = 0;
    e.preventDefault();
  }

  function onMove(e) {
    if (!isDragging) return;
    const p = getPoint(e);
    const dx = p.x - anchor.x;
    const L = 420;
    let raw = Math.atan2(dx, L) * (180 / Math.PI);
    raw = Math.max(-MAX_ANGLE, Math.min(MAX_ANGLE, raw * 1.4));
    targetAngle = raw;
    e.preventDefault();
  }

  function onUp() {
    if (!isDragging) return;
    isDragging = false;
    card.style.cursor = 'grab';
    document.body.style.userSelect = '';
  }

  card.addEventListener('mousedown', onDown);
  window.addEventListener('mousemove', onMove);
  window.addEventListener('mouseup', onUp);

  card.addEventListener('touchstart', onDown, { passive: false });
  window.addEventListener('touchmove', onMove, { passive: false });
  window.addEventListener('touchend', onUp);

  setTimeout(() => { velocity = 26; }, 700);

  card.addEventListener('mouseenter', () => {
    if (!isDragging) velocity += 8;
  });
})();

(function(){
  const nav         = document.getElementById('nav');
  const indicator   = document.getElementById('navIndicator');
  const links       = document.querySelectorAll('.nav-link');
  const burger      = document.getElementById('navBurger');
  const mobileMenu  = document.getElementById('navMobile');
  const navClockEl  = document.getElementById('navClock');
  if(!nav) return;

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive:true });

  const sections = ['about','cv','hobi','kontak']
    .map(id => document.getElementById(id))
    .filter(Boolean);

  function moveIndicator(el){
    if(!el || !indicator) return;
    const parentRect = el.parentElement.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    indicator.style.left  = (elRect.left - parentRect.left) + 'px';
    indicator.style.width = elRect.width + 'px';
    indicator.classList.add('show');
  }

  function clearIndicator(){
    if(indicator) indicator.classList.remove('show');
  }

  links.forEach(link => {
    link.addEventListener('click', () => {
      links.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      moveIndicator(link);
      closeMobile();
    });
    link.addEventListener('mouseenter', () => moveIndicator(link));
  });

  const navCenter = document.querySelector('.nav-center');
  if(navCenter){
    navCenter.addEventListener('mouseleave', () => {
      const active = document.querySelector('.nav-link.active');
      if(active) moveIndicator(active);
      else clearIndicator();
    });
  }

  const spy = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        const id = entry.target.id;
        links.forEach(l => l.classList.toggle('active', l.dataset.target === id));
        const activeLink = document.querySelector('.nav-link.active');
        if(activeLink) moveIndicator(activeLink);
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

  sections.forEach(s => spy.observe(s));

  if(navClockEl){
    function tickNav(){
      const now = new Date();
      const wib = new Date(now.getTime() + (now.getTimezoneOffset() + 420) * 60000);
      const hh = String(wib.getHours()).padStart(2,'0');
      const mm = String(wib.getMinutes()).padStart(2,'0');
      navClockEl.textContent = `${hh}:${mm} WIB`;
    }
    tickNav();
    setInterval(tickNav, 30000);
  }

  function closeMobile(){
    burger && burger.classList.remove('open');
    mobileMenu && mobileMenu.classList.remove('open');
  }
  if(burger && mobileMenu){
    burger.addEventListener('click', () => {
      burger.classList.toggle('open');
      mobileMenu.classList.toggle('open');
    });
    mobileMenu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', closeMobile);
    });
  }

  window.addEventListener('load', () => {
    const first = document.querySelector('.nav-link');
    if(first) moveIndicator(first);
  });
  setTimeout(() => {
    const first = document.querySelector('.nav-link');
    if(first) moveIndicator(first);
  }, 300);
})();
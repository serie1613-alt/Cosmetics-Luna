document.addEventListener('DOMContentLoaded', () => {
  // Menú móvil
  const toggle = document.querySelector('.nav-toggle');
  const list = document.querySelector('.nav-list');
  if (toggle && list) {
    toggle.addEventListener('click', () => list.classList.toggle('open'));
  }

  // Arrastre independiente de textos del navbar (no altera el resto)
  const navLinks = document.querySelectorAll('.nav-list a');
  navLinks.forEach((link) => {
    let dragging = false;
    let moved = false;
    let startX = 0;
    let startY = 0;
    let curX = parseFloat(link.dataset.dx || 0);
    let curY = parseFloat(link.dataset.dy || 0);

    // Estado inicial
    link.style.transform = `translate(${curX}px, ${curY}px)`;
    link.style.cursor = 'move';
    link.style.userSelect = 'none';

    link.addEventListener('mousedown', (e) => {
      dragging = true;
      moved = false;
      startX = e.clientX - curX;
      startY = e.clientY - curY;
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    });
    function onMove(e) {
      if (!dragging) return;
      curX = e.clientX - startX;
      curY = e.clientY - startY;
      link.style.transform = `translate(${curX}px, ${curY}px)`;
      link.dataset.dx = curX;
      link.dataset.dy = curY;
      moved = true;
    }
    function onUp() {
      dragging = false;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    }

    // Touch
    link.addEventListener('touchstart', (e) => {
      const t = e.touches[0];
      dragging = true;
      moved = false;
      startX = t.clientX - curX;
      startY = t.clientY - curY;
      document.addEventListener('touchmove', onTouchMove, { passive: false });
      document.addEventListener('touchend', onTouchEnd);
    }, { passive: false });
    function onTouchMove(e) {
      if (!dragging) return;
      const t = e.touches[0];
      curX = t.clientX - startX;
      curY = t.clientY - startY;
      link.style.transform = `translate(${curX}px, ${curY}px)`;
      link.dataset.dx = curX;
      link.dataset.dy = curY;
      moved = true;
      e.preventDefault();
    }
    function onTouchEnd() {
      dragging = false;
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onTouchEnd);
    }

    // Si hubo movimiento, evita navegar
    link.addEventListener('click', (e) => {
      if (moved) {
        e.preventDefault();
        moved = false;
      }
    });
  });

  // Arrastre del logo con bloqueo y persistencia usando left/top dentro del contenedor
  (function() {
    const container = document.querySelector('.header-logo');
    const logo = document.querySelector('.logo-Cosmetics-Luna');
    if (!container || !logo) return;

    // Asegurar estilos base
    container.style.position = 'relative';
    logo.style.position = 'absolute';
    logo.style.transform = '';

    let left = parseFloat(localStorage.getItem('logoLeft'));
    let top = parseFloat(localStorage.getItem('logoTop'));
    if (isNaN(left)) left = 0;
    if (isNaN(top)) top = 0;
    let locked = localStorage.getItem('logoLocked') === 'true';

    // Ajuste único: mover un poco más a la izquierda
    const adjustedOnce = localStorage.getItem('logoAdjustedLeft1') === 'true';
    if (!adjustedOnce) {
      left = Math.max(0, left - 20);
      localStorage.setItem('logoLeft', String(left));
      localStorage.setItem('logoAdjustedLeft1', 'true');
    }
    // Segundo ajuste: aún más a la izquierda
    const adjustedTwice = localStorage.getItem('logoAdjustedLeft2') === 'true';
    if (!adjustedTwice) {
      left = Math.max(0, left - 20);
      localStorage.setItem('logoLeft', String(left));
      localStorage.setItem('logoAdjustedLeft2', 'true');
    }

    logo.style.left = left + 'px';
    logo.style.top = top + 'px';
    logo.style.cursor = locked ? 'default' : 'grab';

    function ensureContainerMinHeight() {
      const extra = 24; // espacio para evitar solapamiento
      const h = logo.offsetHeight + extra;
      if (h > 0) container.style.minHeight = h + 'px';
    }
    ensureContainerMinHeight();
    window.addEventListener('resize', ensureContainerMinHeight);

    let isDown = false;
    let startX = 0;
    let startY = 0;
    let dragOffsetX = 0;
    let dragOffsetY = 0;

    function clampPosition(x, y) {
      const cw = container.clientWidth;
      const ch = container.clientHeight;
      const lw = logo.offsetWidth;
      const lh = logo.offsetHeight;
      const maxLeft = Math.max(0, cw - lw);
      const maxTop = Math.max(0, ch - lh);
      x = Math.min(Math.max(0, x), maxLeft);
      y = Math.min(Math.max(0, y), maxTop);
      return [x, y];
    }

    function saveAndLock(x, y) {
      left = x; top = y;
      localStorage.setItem('logoLeft', String(left));
      localStorage.setItem('logoTop', String(top));
      localStorage.setItem('logoLocked', 'true');
      locked = true;
      logo.style.cursor = 'default';
    }

    function onMove(e) {
      if (!isDown || locked) return;
      const containerRect = container.getBoundingClientRect();
      const curLeft = e.clientX - containerRect.left - dragOffsetX;
      const curTop = e.clientY - containerRect.top - dragOffsetY;
      const [x, y] = clampPosition(curLeft, curTop);
      logo.style.left = x + 'px';
      logo.style.top = y + 'px';
    }
    function onUp(e) {
      if (!isDown) return;
      isDown = false;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      const containerRect = container.getBoundingClientRect();
      const clientX = e.clientX ?? startX;
      const clientY = e.clientY ?? startY;
      const curLeft = clientX - containerRect.left - dragOffsetX;
      const curTop = clientY - containerRect.top - dragOffsetY;
      const [x, y] = clampPosition(curLeft, curTop);
      saveAndLock(x, y);
    }

    logo.addEventListener('mousedown', (e) => {
      if (locked) return;
      isDown = true;
      const containerRect = container.getBoundingClientRect();
      dragOffsetX = e.clientX - (containerRect.left + left);
      dragOffsetY = e.clientY - (containerRect.top + top);
      startX = e.clientX;
      startY = e.clientY;
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    });

    // Soporte táctil
    function onTouchMove(e) {
      if (!isDown || locked) return;
      const t = e.touches[0];
      const containerRect = container.getBoundingClientRect();
      const curLeft = t.clientX - containerRect.left - dragOffsetX;
      const curTop = t.clientY - containerRect.top - dragOffsetY;
      const [x, y] = clampPosition(curLeft, curTop);
      logo.style.left = x + 'px';
      logo.style.top = y + 'px';
      e.preventDefault();
    }
    function onTouchEnd(e) {
      if (!isDown) return;
      isDown = false;
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onTouchEnd);
      const t = e.changedTouches ? e.changedTouches[0] : null;
      const clientX = t ? t.clientX : startX;
      const clientY = t ? t.clientY : startY;
      const containerRect = container.getBoundingClientRect();
      const curLeft = clientX - containerRect.left - dragOffsetX;
      const curTop = clientY - containerRect.top - dragOffsetY;
      const [x, y] = clampPosition(curLeft, curTop);
      saveAndLock(x, y);
    }
    logo.addEventListener('touchstart', (e) => {
      if (locked) return;
      const t = e.touches[0];
      const containerRect = container.getBoundingClientRect();
      isDown = true;
      dragOffsetX = t.clientX - (containerRect.left + left);
      dragOffsetY = t.clientY - (containerRect.top + top);
      startX = t.clientX;
      startY = t.clientY;
      document.addEventListener('touchmove', onTouchMove, { passive: false });
      document.addEventListener('touchend', onTouchEnd);
    }, { passive: false });
  })();

  // Newsletter submit event
  const newsletterForm = document.querySelector('.newsletter-form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (event) => {
      event.preventDefault();
      alert('¡Gracias por unirte!');
    });
  }
});

// ===== Tema oscuro =====
function initThemeToggle() {
  const root = document.documentElement;
  const btn = document.getElementById('theme-toggle');
  if (!btn) return;

  // Texto e icono inicial según estado actual
  const isDark = root.getAttribute('data-theme') === 'dark';
  btn.innerHTML = isDark ? '☀️ Modo claro' : '🌙 Modo oscuro';
  btn.setAttribute('aria-pressed', isDark ? 'true' : 'false');
  btn.setAttribute('aria-label', isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro');

  btn.addEventListener('click', () => {
    const nowDark = root.getAttribute('data-theme') === 'dark';
    if (nowDark) {
      root.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
      btn.innerHTML = '🌙 Modo oscuro';
      btn.setAttribute('aria-pressed', 'false');
      btn.setAttribute('aria-label', 'Cambiar a modo oscuro');
    } else {
      root.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
      btn.innerHTML = '☀️ Modo claro';
      btn.setAttribute('aria-pressed', 'true');
      btn.setAttribute('aria-label', 'Cambiar a modo claro');
    }
  });
}

// Ejecutar cuando el DOM esté listo (o inmediatamente si ya lo está)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initThemeToggle);
} else {
  initThemeToggle();
}

// Botón de scroll arriba
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('scroll-top');
  if (!btn) return;

  const toggle = () => {
    const show = window.scrollY > 200;
    btn.classList.toggle('visible', show);
    btn.setAttribute('aria-hidden', show ? 'false' : 'true');
  };

  toggle();
  window.addEventListener('scroll', toggle, { passive: true });

  function scrollTop() {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  }

  btn.addEventListener('click', scrollTop);
  btn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      scrollTop();
    }
  });
});
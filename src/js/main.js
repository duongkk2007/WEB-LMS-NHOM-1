/* main.js - xu ly chung cho moi trang: menu mobile, dropdown, back to top */

document.addEventListener('DOMContentLoaded', function () {
  initMobileMenu();
  initPageDropdown();
  initBackToTop();
});

function initMobileMenu() {
  var toggle = document.querySelector('.menu-toggle') || document.getElementById('menuToggle');
  var nav = document.querySelector('.nav') || document.getElementById('mainNav');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', function (e) {
    e.stopPropagation();
    var open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  // bam link trong menu thi dong lai
  nav.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });

  // click ngoai menu thi dong
  document.addEventListener('click', function (e) {
    if (!nav.contains(e.target) && !toggle.contains(e.target)) {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });
}

function initPageDropdown() {
  // tren mobile: bam "Page" de mo/dong dropdown
  document.querySelectorAll('.nav-item > a.page-nav').forEach(function (link) {
    link.addEventListener('click', function (e) {
      if (window.matchMedia('(max-width: 992px)').matches) {
        e.preventDefault();
        link.parentElement.classList.toggle('open');
      }
    });
  });
}

function initBackToTop() {
  var btn = document.querySelector('.back-to-top');
  if (!btn) return;

  window.addEventListener('scroll', function () {
    if (window.scrollY > 300) {
      btn.classList.add('show');
      btn.classList.add('is-visible');
    } else {
      btn.classList.remove('show');
      btn.classList.remove('is-visible');
    }
  }, { passive: true });

  btn.addEventListener('click', function (e) {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// toast dung chung (neu page nao can goi)
window.showToast = function (message, type) {
  type = type || 'info';
  var old = document.querySelector('.js-toast');
  if (old) old.remove();

  var toast = document.createElement('div');
  toast.className = 'js-toast';
  toast.textContent = message;

  var colors = { success: '#55BE24', error: '#e74c3c', info: '#3498db' };
  Object.assign(toast.style, {
    position: 'fixed',
    bottom: '30px',
    right: '30px',
    background: colors[type] || colors.info,
    color: '#fff',
    padding: '14px 24px',
    borderRadius: '8px',
    fontSize: '16px',
    fontFamily: "Exo, sans-serif",
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    zIndex: '9999',
    opacity: '0',
    transform: 'translateY(20px)',
    transition: 'all 0.3s ease'
  });

  document.body.appendChild(toast);
  requestAnimationFrame(function () {
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
  });

  setTimeout(function () {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
    setTimeout(function () { toast.remove(); }, 300);
  }, 3000);
};

/**
 * Global header interactions: mobile menu + page dropdown (touch)
 */
document.addEventListener('DOMContentLoaded', function () {
  var toggle = document.querySelector('.menu-toggle');
  var nav = document.querySelector('.nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  // Touch/click support for Page dropdown
  document.querySelectorAll('.nav-item > a.page-nav').forEach(function (link) {
    link.addEventListener('click', function (e) {
      // On desktop hover works; on narrow screens toggle open
      if (window.matchMedia('(max-width: 992px)').matches) {
        e.preventDefault();
        link.parentElement.classList.toggle('open');
      }
    });
  });
});

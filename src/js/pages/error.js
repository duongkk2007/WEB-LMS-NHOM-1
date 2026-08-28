/* ========== Error Page JavaScript ========== */

document.addEventListener('DOMContentLoaded', function() {
  initMenuToggle();
  initBackToTop();
});

// ========== Menu Toggle ==========
function initMenuToggle() {
  const menuToggle = document.getElementById('menuToggle');
  const mainNav = document.getElementById('mainNav');

  if (menuToggle && mainNav) {
    menuToggle.addEventListener('click', function() {
      mainNav.classList.toggle('open');
    });

    // Close menu when clicking on a link
    const navLinks = mainNav.querySelectorAll('a');
    navLinks.forEach(link => {
      link.addEventListener('click', function() {
        mainNav.classList.remove('open');
      });
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
      if (!menuToggle.contains(event.target) && !mainNav.contains(event.target)) {
        mainNav.classList.remove('open');
      }
    });
  }
}

// ========== Back to Top ==========
function initBackToTop() {
  const backToTopBtn = document.querySelector('.back-to-top');

  window.addEventListener('scroll', function() {
    if (window.scrollY > 300) {
      backToTopBtn.classList.add('show');
    } else {
      backToTopBtn.classList.remove('show');
    }
  });
}
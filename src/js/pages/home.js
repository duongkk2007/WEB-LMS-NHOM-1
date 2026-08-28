/* ========== Homepage JavaScript ========== */

document.addEventListener('DOMContentLoaded', function () {
  initBackToTop();
});

// ========== Back to top ==========
function initBackToTop() {
  const backToTopBtn = document.querySelector('.back-to-top');
  if (!backToTopBtn) return;

  window.addEventListener('scroll', function () {
    if (window.scrollY > 300) {
      backToTopBtn.classList.add('show');
    } else {
      backToTopBtn.classList.remove('show');
    }
  });
}

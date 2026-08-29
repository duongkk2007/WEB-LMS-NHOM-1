// ---- Load course by ?id= from courses.json ----
async function loadCourseFromQuery() {
  const params = new URLSearchParams(window.location.search);
  const id = Number(params.get('id'));
  if (!id) return; // no id → keep static default content

  try {
    const res = await fetch('../data/courses.json');
    if (!res.ok) throw new Error('Cannot load courses.json');
    const data = await res.json();
    const courses = data.courses || data;
    const course = courses.find(c => c.id === id);
    if (!course) return;

    // Document title
    document.title = `${course.title} | EduPress`;

    // Breadcrumb (HTML uses .fading, not .current)
    const breadcrumbCurrent = document.querySelector('.breadcrumb .fading');
    if (breadcrumbCurrent) breadcrumbCurrent.textContent = course.title;

    // Hero title
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) heroTitle.textContent = course.title;

    // Category badge
    const badge = document.querySelector('.badge-category');
    if (badge) badge.textContent = course.category;

    // Author (HTML uses .author-name, not a <b>)
    const authorEl = document.querySelector('.hero-author .author-name');
    if (authorEl) authorEl.textContent = ` ${course.author}`;

    // Stats – keep the 5th item (Quizzes) unchanged
    const statLis = document.querySelectorAll('.hero-stats li');
    const statValues = [
      course.duration,
      `${course.students} Students`,
      course.level,
      `${course.lessons} Lessons`
    ];
    statLis.forEach((li, i) => {
      if (i >= statValues.length) return;
      const img = li.querySelector('img');
      li.innerHTML = '';
      if (img) li.appendChild(img);
      li.append(` ${statValues[i]}`);
    });

    // Course image (HTML uses .hero-card-image)
    const heroImg = document.querySelector('.hero-card-image img');
    if (heroImg) {
      heroImg.src = course.image;
      heroImg.alt = course.title;
    }

    // Price
    const priceOld = document.querySelector('.price-old');
    const priceNew = document.querySelector('.price-new');
    if (priceOld) {
      priceOld.textContent = `$${Number(course.oldPrice).toFixed(1)}`;
      // hide old price when the course is free
      priceOld.style.display = course.isFree ? 'none' : '';
    }
    if (priceNew) {
      priceNew.textContent = course.isFree ? 'Free' : course.currentPrice;
    }
  } catch (err) {
    console.error('Error loading course data:', err);
  }
}

document.addEventListener('DOMContentLoaded', loadCourseFromQuery);

// ---- Tabs ----
const tabButtons = document.querySelectorAll('.tabs-nav button');
const tabPanels = document.querySelectorAll('.tab-panel');

tabButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    tabButtons.forEach(b => b.classList.remove('active'));
    tabPanels.forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
  });
});

// ---- Curriculum accordion ----
document.querySelectorAll('.curr-head').forEach(head => {
  head.addEventListener('click', () => {
    head.closest('.curr-section').classList.toggle('open');
  });
});

// ---- FAQ accordion ----
document.querySelectorAll('.faq-q').forEach(q => {
  q.addEventListener('click', () => {
    q.closest('.faq-item').classList.toggle('open');
  });
});

// ---- Mobile menu toggle ----
const menuToggle = document.getElementById('menuToggle');
const mainNav = document.getElementById('mainNav');
if (menuToggle && mainNav) {
  menuToggle.addEventListener('click', () => {
    mainNav.classList.toggle('open');
  });
}
// ========== Back to Top ==========
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

document.addEventListener('DOMContentLoaded', initBackToTop);
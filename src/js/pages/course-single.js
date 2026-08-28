// ---- Load course by ?id= from courses.json ----
async function loadCourseFromQuery() {
  const params = new URLSearchParams(window.location.search);
  const id = Number(params.get('id'));
  if (!id) return; // Không có id trên URL -> giữ nguyên nội dung tĩnh mặc định

  try {
    const res = await fetch('../data/courses.json');
    if (!res.ok) throw new Error('Không thể tải courses.json');
    const data = await res.json();
    const courses = data.courses || data;
    const course = courses.find(c => c.id === id);
    if (!course) return;

    // Title (document + breadcrumb + hero)
    document.title = `${course.title} | EduPress`;
    const breadcrumbCurrent = document.querySelector('.breadcrumb .current');
    if (breadcrumbCurrent) breadcrumbCurrent.textContent = course.title;
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) heroTitle.textContent = course.title;

    // Category + author
    const badge = document.querySelector('.badge-category');
    if (badge) badge.textContent = course.category;
    const authorEl = document.querySelector('.hero-author b');
    if (authorEl) authorEl.textContent = course.author;

    // Stats (duration, students, level, lessons) - giữ nguyên icon quiz tĩnh
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

    // Ảnh minh họa
    const heroImg = document.querySelector('.hero-card-illustration img');
    if (heroImg) {
      heroImg.src = course.image;
      heroImg.alt = course.title;
    }

    // Giá
    const priceOld = document.querySelector('.price-old');
    const priceNew = document.querySelector('.price-new');
    if (priceOld) priceOld.textContent = `$${Number(course.oldPrice).toFixed(1)}`;
    if (priceNew) priceNew.textContent = course.isFree ? course.currentPrice : course.currentPrice;
  } catch (err) {
    console.error('Lỗi khi tải dữ liệu khóa học:', err);
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
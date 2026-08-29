/**
 * EduPress – Home page scripts
 * Features:
 * - Back-to-top visibility
 * - Category card active state on hover
 * - Stats counter animation (when in viewport)
 * - Section fade-in on scroll
 * - Optional dynamic courses / articles from JSON
 */

(function () {
  'use strict';

  // ========== 1. Back to top ==========
  const backToTop = document.querySelector('.back-to-top');
  if (backToTop) {
    const toggleBackToTop = () => {
      if (window.pageYOffset > 400) {
        backToTop.classList.add('is-visible');
      } else {
        backToTop.classList.remove('is-visible');
      }
    };
    window.addEventListener('scroll', toggleBackToTop, { passive: true });
    toggleBackToTop();
  }

  // ========== 2. Category cards – active on hover ==========
  const categoryCards = document.querySelectorAll('.category-card');
  if (categoryCards.length) {
    categoryCards.forEach((card) => {
      card.addEventListener('mouseenter', () => {
        categoryCards.forEach((c) => c.classList.remove('active'));
        card.classList.add('active');
      });
    });
  }

  // ========== 3. Stats counter animation ==========
  function animateValue(el, start, end, duration) {
    const startTime = performance.now();
    const isPercent = String(end).includes('%');
    const isK = String(end).toUpperCase().includes('K');
    const numericEnd = parseFloat(String(end).replace(/[^\d.]/g, '')) || 0;

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 4);
      const current = Math.floor(start + (numericEnd - start) * ease);

      if (isPercent) {
        el.textContent = current + '%';
      } else if (isK) {
        el.textContent = current + 'K+';
      } else {
        el.textContent = current.toLocaleString();
      }

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = end;
      }
    }
    requestAnimationFrame(update);
  }

  const statNumbers = document.querySelectorAll('.stat-number');
  if (statNumbers.length && 'IntersectionObserver' in window) {
    const statsObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const finalValue = el.textContent.trim();
            el.textContent = '0';
            animateValue(el, 0, finalValue, 1800);
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.4 }
    );
    statNumbers.forEach((el) => statsObserver.observe(el));
  }

  // ========== 4. Fade-in sections on scroll ==========
  const animatedSections = document.querySelectorAll(
    '.categories-section, .courses-section, .addons-section, .feedbacks-section, .cta-section, .articles-section, .grow-section, .theme-banner, .stats-row'
  );

  if (animatedSections.length && 'IntersectionObserver' in window) {
    animatedSections.forEach((section) => {
      section.classList.add('js-animate');
    });

    const fadeObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    animatedSections.forEach((section) => fadeObserver.observe(section));
  }

  // ========== 5. Optional: Load featured courses from courses.json ==========
  async function loadFeaturedCourses() {
    try {
      const res = await fetch('./courses.json');
      if (!res.ok) return;
      const data = await res.json();
      const grid = document.querySelector('.courses-grid');
      if (!grid || !Array.isArray(data.courses)) return;

      const featured = data.courses.slice(0, 6);
      grid.innerHTML = featured
        .map((course) => {
          const priceHtml = course.isFree
            ? `<span class="old">$${Number(course.oldPrice).toFixed(1)}</span><span class="free">Free</span>`
            : `<span class="old">$${Number(course.oldPrice).toFixed(1)}</span><span class="price">${course.currentPrice}</span>`;

          return `
            <article class="course-card">
              <div class="course-thumb">
                <img src="${course.image}" alt="${course.title}" loading="lazy">
                <span class="course-badge">${course.category}</span>
              </div>
              <div class="course-body">
                <div class="course-author"><span>by ${course.author}</span></div>
                <h3 class="course-title"><a href="./pages/course-single.html">${course.title}</a></h3>
                <div class="course-meta">
                  <span><img src="./src/assets/icons/meta1.svg" alt="" width="14" height="14"> ${course.duration}</span>
                  <span><img src="./src/assets/icons/meta2.svg" alt="" width="14" height="14"> ${course.students} Students</span>
                </div>
                <div class="course-footer">
                  <div class="course-price">${priceHtml}</div>
                  <a href="./pages/course-single.html" class="btn-view-more">View More</a>
                </div>
              </div>
            </article>`;
        })
        .join('');
    } catch (err) {
      console.warn('Could not load courses.json', err);
    }
  }

  // ========== 6. Optional: Load latest articles from blog.json ==========
  async function loadLatestArticles() {
    try {
      const res = await fetch('./blog.json');
      if (!res.ok) return;
      const data = await res.json();
      const grid = document.querySelector('.articles-grid');
      if (!grid || !Array.isArray(data.posts)) return;

      const posts = data.posts.slice(0, 3);
      grid.innerHTML = posts
        .map((post) => {
          return `
            <article class="article-card">
              <div class="article-thumb">
                <a href="./pages/blog-single.html">
                  <img src="${post.image}" alt="${post.title}" loading="lazy">
                </a>
              </div>
              <div class="article-body">
                <div class="article-date">
                  <img src="./src/assets/images/home/calendar.svg" alt="" width="14" height="14"> ${post.date}
                </div>
                <h3 class="article-title">
                  <a href="./pages/blog-single.html">${post.title}</a>
                </h3>
                <p class="article-excerpt">${post.excerpt}</p>
              </div>
            </article>`;
        })
        .join('');
    } catch (err) {
      console.warn('Could not load blog.json', err);
    }
  }

  // Bật load động nếu muốn (hiện đang tắt để giữ HTML tĩnh)
  // loadFeaturedCourses();
  // loadLatestArticles();
})();

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

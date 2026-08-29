/**
 * EduPress – Course Single
 * Tabs (keyboard), Curriculum accordion + lesson progress (localStorage),
 * Favorite toggle, Enroll, Progress bar
 */
(function () {
  "use strict";

  const S = window.EduPressStorage;

  function showToast(message, type) {
    const old = document.querySelector(".js-toast");
    if (old) old.remove();
    const toast = document.createElement("div");
    toast.className = "js-toast";
    toast.textContent = message;
    const colors = { success: "#55BE24", error: "#e74c3c", info: "#3498db" };
    Object.assign(toast.style, {
      position: "fixed",
      bottom: "30px",
      right: "30px",
      background: colors[type] || colors.info,
      color: "#fff",
      padding: "14px 24px",
      borderRadius: "8px",
      fontSize: "16px",
      fontFamily: "'Exo', sans-serif",
      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
      zIndex: "9999",
      opacity: "0",
      transform: "translateY(20px)",
      transition: "all 0.3s ease",
    });
    document.body.appendChild(toast);
    requestAnimationFrame(() => {
      toast.style.opacity = "1";
      toast.style.transform = "translateY(0)";
    });
    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(20px)";
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  function initTabs() {
    const tabButtons = Array.from(document.querySelectorAll(".tabs-nav button"));
    const tabPanels = document.querySelectorAll(".tab-panel");
    if (!tabButtons.length) return;

    tabButtons.forEach((btn, idx) => {
      btn.setAttribute("role", "tab");
      btn.setAttribute("tabindex", btn.classList.contains("active") ? "0" : "-1");
      btn.setAttribute("aria-selected", btn.classList.contains("active") ? "true" : "false");

      btn.addEventListener("click", () => activateTab(idx));
      btn.addEventListener("keydown", (e) => {
        let next = idx;
        if (e.key === "ArrowRight" || e.key === "ArrowDown") {
          e.preventDefault();
          next = (idx + 1) % tabButtons.length;
        } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
          e.preventDefault();
          next = (idx - 1 + tabButtons.length) % tabButtons.length;
        } else if (e.key === "Home") {
          e.preventDefault();
          next = 0;
        } else if (e.key === "End") {
          e.preventDefault();
          next = tabButtons.length - 1;
        } else {
          return;
        }
        activateTab(next);
        tabButtons[next].focus();
      });
    });

    function activateTab(index) {
      tabButtons.forEach((b, i) => {
        const on = i === index;
        b.classList.toggle("active", on);
        b.setAttribute("aria-selected", on ? "true" : "false");
        b.setAttribute("tabindex", on ? "0" : "-1");
      });
      tabPanels.forEach((p) => p.classList.remove("active"));
      const key = tabButtons[index].dataset.tab;
      const panel = document.getElementById("tab-" + key);
      if (panel) panel.classList.add("active");
    }
  }

  function initAccordion() {
    document.querySelectorAll(".curr-head").forEach((head) => {
      head.addEventListener("click", () => {
        head.closest(".curr-section").classList.toggle("open");
      });
    });
    document.querySelectorAll(".faq-q").forEach((q) => {
      q.addEventListener("click", () => {
        q.closest(".faq-item").classList.toggle("open");
      });
    });
  }

  function initMenu() {
    const menuToggle = document.getElementById("menuToggle");
    const mainNav = document.getElementById("mainNav");
    if (menuToggle && mainNav) {
      menuToggle.addEventListener("click", () => mainNav.classList.toggle("open"));
    }
  }

  function initBackToTop() {
    const backToTopBtn = document.querySelector(".back-to-top");
    if (!backToTopBtn) return;
    window.addEventListener("scroll", function () {
      if (window.scrollY > 300) backToTopBtn.classList.add("show");
      else backToTopBtn.classList.remove("show");
    });
  }

  function renderCurriculum(course) {
    const list = document.querySelector(".curriculum-list");
    if (!list || !course.curriculum) return;

    const totalLessons = course.curriculum.reduce(
      (n, sec) => n + (sec.lessons ? sec.lessons.length : 0),
      0
    );

    list.innerHTML = course.curriculum
      .map((sec, sIdx) => {
        const lessonsHtml = (sec.lessons || [])
          .map((les) => {
            const done = S && S.isLessonDone(course.id, les.id);
            return `
            <div class="curr-lesson" data-lesson-id="${les.id}">
              <img src="../src/assets/images/courses/courses-single/book.svg" alt="" class="lesson-icon">
              <span class="lesson-title">${les.title}</span>
              ${les.preview ? '<button class="btn-preview" type="button">Preview</button>' : ""}
              <span class="lesson-time">${les.duration}</span>
              <button type="button" class="lesson-toggle ${done ? "is-done" : ""}" data-lesson-id="${les.id}" aria-label="${done ? "Mark incomplete" : "Mark complete"}" title="${done ? "Mark incomplete" : "Mark complete"}">
                <span class="lesson-state ${done ? "check" : "lock"}">
                  ${
                    done
                      ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>'
                      : '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="11" width="16" height="9" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>'
                  }
                </span>
              </button>
            </div>`;
          })
          .join("");

        return `
        <div class="curr-section ${sIdx === 0 ? "open" : ""}">
          <button class="curr-head" type="button">
            <svg class="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="6 9 12 15 18 9"/></svg>
            <span class="title">${sec.title}</span>
            <span class="curr-meta"><span>${(sec.lessons || []).length} Lessons</span></span>
          </button>
          <div class="curr-body">${lessonsHtml}</div>
        </div>`;
      })
      .join("");

    initAccordion();

    list.querySelectorAll(".lesson-toggle").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const lid = btn.dataset.lessonId;
        if (!S) return;
        const nowDone = S.toggleLesson(course.id, lid);
        btn.classList.toggle("is-done", nowDone);
        btn.setAttribute("aria-label", nowDone ? "Mark incomplete" : "Mark complete");
        const state = btn.querySelector(".lesson-state");
        if (state) {
          state.className = "lesson-state " + (nowDone ? "check" : "lock");
          state.innerHTML = nowDone
            ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>'
            : '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="11" width="16" height="9" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>';
        }
        updateProgressUI(course.id, totalLessons);
        showToast(nowDone ? "Lesson marked complete" : "Lesson unmarked", "success");
      });
    });

    updateProgressUI(course.id, totalLessons);
  }

  function updateProgressUI(courseId, totalLessons) {
    if (!S) return;
    const pct = S.progressPercent(courseId, totalLessons);
    let bar = document.querySelector(".course-progress-bar");
    let label = document.querySelector(".course-progress-label");

    const heroCard =
      document.querySelector(".hero-card") ||
      document.querySelector(".course-sidebar") ||
      document.querySelector(".hero-right");
    if (!bar && heroCard) {
      const wrap = document.createElement("div");
      wrap.className = "course-progress-wrap";
      wrap.innerHTML = `
        <div class="course-progress-label" style="font-size:14px;margin-bottom:6px;font-family:Exo,sans-serif;">Progress: <strong>0%</strong></div>
        <div style="background:#e5e5e5;border-radius:6px;height:8px;overflow:hidden;">
          <div class="course-progress-bar" style="height:100%;width:0%;background:#55BE24;transition:width 0.35s ease;border-radius:6px;"></div>
        </div>
        <a href="./progress.html" style="display:inline-block;margin-top:10px;font-size:13px;color:#55BE24;">View my learning dashboard →</a>
      `;
      Object.assign(wrap.style, { marginTop: "16px", padding: "0 4px" });
      heroCard.appendChild(wrap);
      bar = wrap.querySelector(".course-progress-bar");
      label = wrap.querySelector(".course-progress-label");
    }

    if (bar) bar.style.width = pct + "%";
    if (label)
      label.innerHTML = `Progress: <strong>${pct}%</strong> (${S.getCourseProgress(courseId).length}/${totalLessons} lessons)`;
  }

  function injectFavoriteButton(courseId) {
    const hero = document.querySelector(".hero-title");
    if (!hero || document.querySelector(".btn-favorite")) return;

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "btn-favorite";
    btn.setAttribute("aria-label", "Toggle favorite");
    const fav = S && S.isFavorite(courseId);
    const heart = (filled) =>
      filled
        ? '<svg width="22" height="22" viewBox="0 0 24 24" fill="#e74c3c" stroke="#e74c3c" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>'
        : '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>';
    btn.innerHTML = heart(fav);
    Object.assign(btn.style, {
      background: "transparent",
      border: "none",
      cursor: "pointer",
      marginLeft: "12px",
      verticalAlign: "middle",
      padding: "4px",
    });
    hero.appendChild(btn);

    btn.addEventListener("click", () => {
      if (!S) return;
      const now = S.toggleFavorite(courseId);
      btn.innerHTML = heart(now);
      showToast(now ? "Added to favorites" : "Removed from favorites", "success");
    });
  }

  function injectEnrollButton(courseId) {
    const candidates = document.querySelectorAll("button, a");
    let target = null;
    candidates.forEach((el) => {
      const t = (el.textContent || "").trim().toLowerCase();
      if (t.includes("start now") || t.includes("buy now") || t.includes("enroll")) {
        target = el;
      }
    });
    if (target && S) {
      if (S.isEnrolled(courseId)) {
        target.textContent = "Continue Learning";
      }
      target.addEventListener("click", (e) => {
        if (target.tagName === "A") e.preventDefault();
        S.enroll(courseId);
        showToast("You are enrolled in this course!", "success");
        target.textContent = "Continue Learning";
      });
    }
  }

  async function loadCourseFromQuery() {
    const params = new URLSearchParams(window.location.search);
    const id = Number(params.get("id"));
    if (!id) {
      injectFavoriteButton(1);
      return;
    }

    try {
      const res = await fetch("../data/courses.json");
      if (!res.ok) throw new Error("Cannot load courses.json");
      const data = await res.json();
      const courses = data.courses || data;
      const course = courses.find((c) => c.id === id);
      if (!course) return;

      document.title = course.title + " | EduPress";

      const breadcrumbCurrent = document.querySelector(".breadcrumb .fading");
      if (breadcrumbCurrent) breadcrumbCurrent.textContent = course.title;

      const heroTitle = document.querySelector(".hero-title");
      if (heroTitle) heroTitle.textContent = course.title;

      const badge = document.querySelector(".badge-category");
      if (badge) badge.textContent = course.category;

      const authorEl = document.querySelector(".hero-author .author-name");
      if (authorEl) authorEl.textContent = " " + course.author;

      const statLis = document.querySelectorAll(".hero-stats li");
      const statValues = [
        course.duration,
        course.students + " Students",
        course.level,
        course.lessons + " Lessons",
      ];
      statLis.forEach((li, i) => {
        if (i >= statValues.length) return;
        const img = li.querySelector("img");
        li.innerHTML = "";
        if (img) li.appendChild(img);
        li.append(" " + statValues[i]);
      });

      const heroImg = document.querySelector(".hero-card-image img");
      if (heroImg) {
        heroImg.src = course.image;
        heroImg.alt = course.title;
      }

      const priceOld = document.querySelector(".price-old");
      const priceNew = document.querySelector(".price-new");
      if (priceOld) {
        priceOld.textContent = "$" + Number(course.oldPrice).toFixed(1);
        priceOld.style.display = course.isFree ? "none" : "";
      }
      if (priceNew) {
        priceNew.textContent = course.isFree ? "Free" : course.currentPrice;
      }

      renderCurriculum(course);
      injectFavoriteButton(course.id);
      injectEnrollButton(course.id);
    } catch (err) {
      console.error("Error loading course data:", err);
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    initTabs();
    initAccordion();
    initMenu();
    initBackToTop();
    loadCourseFromQuery();
  });
})();

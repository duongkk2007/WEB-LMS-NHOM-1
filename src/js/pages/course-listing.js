/**
 * EduPress - Course Listing Page
 * JavaScript
 */

(function () {
  "use strict";

  // ========== DOM ELEMENTS ==========
  const searchForm = document.querySelector(".search-box");
  const searchInput = document.querySelector(".search-text");
  const headerSearchBtn = document.querySelector(".search-icon-header");
  const viewTableBtn = document.querySelector(".icon-view-table");
  const viewListBtn = document.querySelector(".icon-view-list");
  const courseList = document.querySelector(".course-list");
  const pagination = document.querySelector(".pagination");
  const sidebar = document.querySelector(".sidebar");

  // ========== STATE ==========
  const state = {
    searchQuery: "",
    viewMode: localStorage.getItem("edupress-view-mode") || "list",
    currentPage: 1,
    itemsPerPage: 3,
    filters: {
      category: [],
      instructor: [],
      price: [],
      review: [],
      level: [],
    },
    allCourses: [],      // dữ liệu từ JSON
    courseCards: [],     // DOM cards sau khi render
  };

  // ========== LOAD JSON ==========
  async function loadCourses() {
    try {
      // Đường dẫn tính từ file HTML (thường nằm trong /pages/)
      const res = await fetch("../data/courses.json");
      if (!res.ok) throw new Error("Không tải được courses.json");
      const data = await res.json();
      return data.courses || data; // hỗ trợ cả 2 dạng
    } catch (err) {
      console.error(err);
      return [];
    }
  }

  // ========== TẠO CARD TỪ DATA ==========
  function createCourseCard(course, template) {
    const card = template.cloneNode(true);

    // Image
    const img = card.querySelector(".course-image img");
    if (img) {
      img.src = course.image;
      img.alt = course.title;
    }

    // Badge
    const badge = card.querySelector(".badge span");
    if (badge) badge.textContent = course.category;

    // Author
    const author = card.querySelector(".author");
    if (author) {
      author.innerHTML = `<span class="fading">by</span> ${course.author}`;
    }

      // Title
    const titleLink = card.querySelector(".course-title a");
    if (titleLink) {
      titleLink.textContent = course.title;
      titleLink.href = `./course-single.html?id=${course.id}`;
    }

    // Stats
    const stats = card.querySelectorAll(".course-stats span");
    if (stats.length >= 4) {
      stats[0].innerHTML = `<img src="../src/assets/icons/meta1.svg" alt=""> ${course.duration}`;
      stats[1].innerHTML = `<img src="../src/assets/icons/meta2.svg" alt=""> ${course.students} Students`;
      stats[2].innerHTML = `<img src="../src/assets/icons/meta3.svg" alt=""> ${course.level}`;
      stats[3].innerHTML = `<img src="../src/assets/icons/meta4.svg" alt=""> ${course.lessons} Lessons`;
    }

    // Price
    const oldPrice = card.querySelector(".old-price");
    const newPrice = card.querySelector(".new-price");
    if (oldPrice) {
      oldPrice.textContent = `$${Number(course.oldPrice).toFixed(1)}`;
    }
    if (newPrice) newPrice.textContent = course.currentPrice;

    // View More
    const viewMore = card.querySelector(".view-more");
    if (viewMore) {
      viewMore.href = `./course-single.html?id=${course.id}`;
    }
    
    // Lưu data vào card để filter dễ hơn (optional)
    card.dataset.id = course.id;
    card.dataset.category = (course.category || "").toLowerCase();
    card.dataset.author = (course.author || "").toLowerCase();
    card.dataset.level = (course.level || "").toLowerCase();
    card.dataset.free = course.isFree ? "true" : "false";

    return card;
  }

  // ========== HELPERS (giữ logic cũ, chỉnh nhẹ) ==========
  function getText(el) {
    return el ? el.textContent.trim().toLowerCase() : "";
  }

  function matchSearch(card, query) {
    if (!query) return true;
    const title = getText(card.querySelector(".course-title"));
    const author = getText(card.querySelector(".author"));
    return title.includes(query) || author.includes(query);
  }

  function matchFilters(card) {
    const { category, instructor, price, level } = state.filters;

    if (category.length > 0) {
      const badge = getText(card.querySelector(".badge span"));
      if (!category.some((c) => badge.includes(c))) return false;
    }

    if (instructor.length > 0) {
      const author = getText(card.querySelector(".author"));
      if (!instructor.some((i) => author.includes(i))) return false;
    }

    if (price.length > 0 && !price.includes("all")) {
      const isFree = card.dataset.free === "true";
      const wantFree = price.includes("free");
      const wantPaid = price.includes("paid");
      if (wantFree && !isFree) return false;
      if (wantPaid && isFree) return false;
    }

    if (level.length > 0 && !level.includes("all-levels")) {
      const statsText = getText(card.querySelector(".course-stats"));
      const matched = level.some((l) => {
        if (l === "beginner") return statsText.includes("beginner");
        if (l === "intermediate") return statsText.includes("intermediate");
        if (l === "expert") return statsText.includes("expert");
        return statsText.includes(l.replace("-", " "));
      });
      if (!matched) return false;
    }

    return true;
  }

  function getFilteredCards() {
    return state.courseCards.filter((card) => {
      return matchSearch(card, state.searchQuery) && matchFilters(card);
    });
  }

  // ========== RENDER ==========
  function renderCourses() {
    const filtered = getFilteredCards();
    const totalPages = Math.max(1, Math.ceil(filtered.length / state.itemsPerPage));

    if (state.currentPage > totalPages) state.currentPage = totalPages;

    const start = (state.currentPage - 1) * state.itemsPerPage;
    const end = start + state.itemsPerPage;
    const pageCards = filtered.slice(start, end);

    // Ẩn tất cả
    state.courseCards.forEach((card) => (card.style.display = "none"));

    // Hiện card trang hiện tại
    pageCards.forEach((card) => (card.style.display = ""));

    renderPagination(totalPages, filtered.length);
  }

  function renderPagination(totalPages, totalItems) {
    if (!pagination) return;

    const oldPageBtns = pagination.querySelectorAll(".page-btn, .page-btn-active");
    oldPageBtns.forEach((btn) => btn.remove());

    const nextArrow = pagination.querySelector('a[aria-label="Next page"]');
    const prevArrow =
      pagination.querySelector(".arrow-active") ||
      pagination.querySelector('a[aria-label="Previous page"]');

    for (let i = 1; i <= totalPages; i++) {
      const a = document.createElement("a");
      a.href = "#";
      a.textContent = i;
      a.className = i === state.currentPage ? "page-btn-active" : "page-btn";
      if (i === state.currentPage) a.setAttribute("aria-current", "page");

      a.addEventListener("click", (e) => {
        e.preventDefault();
        state.currentPage = i;
        renderCourses();
      });

      if (nextArrow) pagination.insertBefore(a, nextArrow);
      else pagination.appendChild(a);
    }

    if (prevArrow) {
      prevArrow.onclick = (e) => {
        e.preventDefault();
        if (state.currentPage > 1) {
          state.currentPage--;
          renderCourses();
        }
      };
      const special = prevArrow.querySelector(".special-number");
      if (special) special.textContent = state.currentPage;
    }

    if (nextArrow) {
      nextArrow.onclick = (e) => {
        e.preventDefault();
        if (state.currentPage < totalPages) {
          state.currentPage++;
          renderCourses();
        }
      };
    }

    pagination.style.display =
      totalItems === 0 || totalPages <= 1 ? "none" : "flex";
  }

  function applyViewMode() {
    if (!courseList) return;

    if (state.viewMode === "grid") {
      courseList.classList.add("is-grid");
      courseList.classList.remove("is-list");
      viewTableBtn?.classList.add("is-active");
      viewListBtn?.classList.remove("is-active");
    } else {
      courseList.classList.add("is-list");
      courseList.classList.remove("is-grid");
      viewListBtn?.classList.add("is-active");
      viewTableBtn?.classList.remove("is-active");
    }

    localStorage.setItem("edupress-view-mode", state.viewMode);
  }

  // ========== EVENT HANDLERS ==========
  function handleSearch(e) {
    if (e) e.preventDefault();
    state.searchQuery = (searchInput?.value || "").trim().toLowerCase();
    state.currentPage = 1;
    renderCourses();
  }

  let searchTimeout;
  function handleSearchInput() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      state.searchQuery = (searchInput?.value || "").trim().toLowerCase();
      state.currentPage = 1;
      renderCourses();
    }, 300);
  }

  function handleViewToggle(mode) {
    state.viewMode = mode;
    applyViewMode();
  }

  function collectFilters() {
    state.filters = {
      category: [],
      instructor: [],
      price: [],
      review: [],
      level: [],
    };

    if (!sidebar) return;

    sidebar.querySelectorAll('input[type="checkbox"]:checked').forEach((cb) => {
      const name = cb.name;
      const value = cb.value.toLowerCase();
      if (state.filters[name]) state.filters[name].push(value);
    });
  }

  function handleFilterChange() {
    collectFilters();
    state.currentPage = 1;
    renderCourses();
  }

  function handleHeaderSearch() {
    searchInput?.focus();
  }

  // ========== INIT ==========
  async function init() {
    // 1. Load data từ JSON
    state.allCourses = await loadCourses();

    // 2. Lấy template card
    const template = courseList?.querySelector(".course-card");
    if (!template) {
      console.error("Không tìm thấy .course-card template");
      return;
    }

    // 3. Xóa card mẫu
    template.remove();

    // 4. Tạo card từ JSON và chèn vào list (trước pagination)
    state.courseCards = state.allCourses.map((course) => {
      const card = createCourseCard(course, template);
      courseList.insertBefore(card, pagination);
      return card;
    });

    // 5. Gắn sự kiện
    if (searchForm) searchForm.addEventListener("submit", handleSearch);
    if (searchInput) searchInput.addEventListener("input", handleSearchInput);
    if (headerSearchBtn) headerSearchBtn.addEventListener("click", handleHeaderSearch);
    if (viewTableBtn) viewTableBtn.addEventListener("click", () => handleViewToggle("grid"));
    if (viewListBtn) viewListBtn.addEventListener("click", () => handleViewToggle("list"));

    if (sidebar) {
      sidebar.addEventListener("change", (e) => {
        if (e.target.matches('input[type="checkbox"]')) handleFilterChange();
      });
    }

    // 6. Áp dụng view + render lần đầu
    applyViewMode();
    renderCourses();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

/* SUA NGAY 26/8/2026 */
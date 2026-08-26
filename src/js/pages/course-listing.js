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
  const courseCards = Array.from(document.querySelectorAll(".course-card"));
  const pagination = document.querySelector(".pagination");
  const sidebar = document.querySelector(".sidebar");

  // ========== STATE ==========
  const state = {
    searchQuery: "",
    viewMode: localStorage.getItem("edupress-view-mode") || "list", // "list" | "grid"
    currentPage: 1,
    itemsPerPage: 3,
    filters: {
      category: [],
      instructor: [],
      price: [],
      review: [],
      level: [],
    },
  };

  // ========== HELPERS ==========

  /**
   * Lấy text sạch từ element (bỏ khoảng trắng thừa)
   */
  function getText(el) {
    return el ? el.textContent.trim().toLowerCase() : "";
  }

  /**
   * Kiểm tra card có match search query không
   */
  function matchSearch(card, query) {
    if (!query) return true;
    const title = getText(card.querySelector(".course-title"));
    const author = getText(card.querySelector(".author"));
    return title.includes(query) || author.includes(query);
  }

  /**
   * Kiểm tra card có match các filter đang active không
   * (logic OR trong cùng nhóm, AND giữa các nhóm)
   */
  function matchFilters(card) {
    const { category, instructor, price, review, level } = state.filters;

    // Category → so khớp badge
    if (category.length > 0) {
      const badge = getText(card.querySelector(".badge span"));
      const matched = category.some((c) => badge.includes(c));
      if (!matched) return false;
    }

    // Instructor → so khớp tên author
    if (instructor.length > 0) {
      const author = getText(card.querySelector(".author"));
      const matched = instructor.some((i) => author.includes(i));
      if (!matched) return false;
    }

    // Price → Free / Paid / All
    if (price.length > 0 && !price.includes("all")) {
      const priceText = getText(card.querySelector(".new-price"));
      const isFree = priceText.includes("free");
      const wantFree = price.includes("free");
      const wantPaid = price.includes("paid");

      if (wantFree && !isFree) return false;
      if (wantPaid && isFree) return false;
    }

    // Level → so khớp trong course-stats
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

    // Review: HTML hiện tại không có số sao trên card → bỏ qua hoặc luôn pass
    // (khi có data review trên card có thể mở rộng sau)

    return true;
  }

  /**
   * Lấy danh sách card đã lọc (search + filter)
   */
  function getFilteredCards() {
    return courseCards.filter((card) => {
      return matchSearch(card, state.searchQuery) && matchFilters(card);
    });
  }

  // ========== RENDER ==========

  /**
   * Ẩn/hiện card theo trang hiện tại + filter/search
   */
  function renderCourses() {
    const filtered = getFilteredCards();
    const totalPages = Math.max(1, Math.ceil(filtered.length / state.itemsPerPage));

    // Đảm bảo currentPage không vượt quá
    if (state.currentPage > totalPages) {
      state.currentPage = totalPages;
    }

    const start = (state.currentPage - 1) * state.itemsPerPage;
    const end = start + state.itemsPerPage;
    const pageCards = filtered.slice(start, end);

    // Ẩn tất cả trước
    courseCards.forEach((card) => {
      card.style.display = "none";
    });

    // Hiện card của trang hiện tại
    pageCards.forEach((card) => {
      card.style.display = ""; // trả về giá trị CSS mặc định
    });

    renderPagination(totalPages, filtered.length);
  }

  /**
   * Cập nhật UI pagination
   */
  function renderPagination(totalPages, totalItems) {
    if (!pagination) return;

    // Xóa các page-btn cũ (giữ lại arrow)
    const oldPageBtns = pagination.querySelectorAll(".page-btn, .page-btn-active");
    oldPageBtns.forEach((btn) => btn.remove());

    const nextArrow = pagination.querySelector('a[aria-label="Next page"]');
    const prevArrow = pagination.querySelector(".arrow-active") || pagination.querySelector('a[aria-label="Previous page"]');

    // Tạo lại các nút số trang
    for (let i = 1; i <= totalPages; i++) {
      const a = document.createElement("a");
      a.href = "#";
      a.textContent = i;
      a.className = i === state.currentPage ? "page-btn-active" : "page-btn";
      if (i === state.currentPage) {
        a.setAttribute("aria-current", "page");
      }

      a.addEventListener("click", (e) => {
        e.preventDefault();
        state.currentPage = i;
        renderCourses();
      });

      // Chèn trước nút Next
      if (nextArrow) {
        pagination.insertBefore(a, nextArrow);
      } else {
        pagination.appendChild(a);
      }
    }

    // Prev / Next
    if (prevArrow) {
      prevArrow.onclick = (e) => {
        e.preventDefault();
        if (state.currentPage > 1) {
          state.currentPage--;
          renderCourses();
        }
      };
      // Cập nhật special-number nếu có
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

    // Ẩn pagination nếu chỉ có 1 trang hoặc không có kết quả
    pagination.style.display = totalItems === 0 || totalPages <= 1 ? "none" : "flex";
  }

  /**
   * Áp dụng view mode (list / grid)
   */
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

  /**
   * Search
   */
  function handleSearch(e) {
    if (e) e.preventDefault();
    state.searchQuery = (searchInput?.value || "").trim().toLowerCase();
    state.currentPage = 1;
    renderCourses();
  }

  /**
   * Debounce search khi gõ
   */
  let searchTimeout;
  function handleSearchInput() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      state.searchQuery = (searchInput?.value || "").trim().toLowerCase();
      state.currentPage = 1;
      renderCourses();
    }, 300);
  }

  /**
   * Toggle view
   */
  function handleViewToggle(mode) {
    state.viewMode = mode;
    applyViewMode();
  }

  /**
   * Đọc tất cả checkbox filter đang checked
   */
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
      if (state.filters[name]) {
        state.filters[name].push(value);
      }
    });
  }

  /**
   * Khi thay đổi bất kỳ filter nào
   */
  function handleFilterChange() {
    collectFilters();
    state.currentPage = 1;
    renderCourses();
  }

  /**
   * Focus search chính khi bấm icon header
   */
  function handleHeaderSearch() {
    searchInput?.focus();
  }

  // ========== INIT ==========

  function init() {
    // Search form
    if (searchForm) {
      searchForm.addEventListener("submit", handleSearch);
    }
    if (searchInput) {
      searchInput.addEventListener("input", handleSearchInput);
    }

    // Header search icon
    if (headerSearchBtn) {
      headerSearchBtn.addEventListener("click", handleHeaderSearch);
    }

    // View mode buttons
    if (viewTableBtn) {
      viewTableBtn.addEventListener("click", () => handleViewToggle("grid"));
    }
    if (viewListBtn) {
      viewListBtn.addEventListener("click", () => handleViewToggle("list"));
    }

    // Sidebar filters
    if (sidebar) {
      sidebar.addEventListener("change", (e) => {
        if (e.target.matches('input[type="checkbox"]')) {
          handleFilterChange();
        }
      });
    }

    // Áp dụng view mode đã lưu
    applyViewMode();

    // Render lần đầu
    renderCourses();
  }

  // Chạy khi DOM sẵn sàng
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
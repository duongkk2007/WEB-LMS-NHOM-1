/**
 * EduPress - Course Listing (Dynamic - Hướng B)
 * JAVASCRIPT
 */

(function () {
    "use strict";

    // ========== DOM ==========
    const searchForm     = document.querySelector(".search-box");
    const searchInput    = document.querySelector(".search-text");
    const headerSearchBtn= document.querySelector(".search-icon-header");
    const viewTableBtn   = document.querySelector(".icon-view-table");
    const viewListBtn    = document.querySelector(".icon-view-list");
    const courseList     = document.querySelector(".course-list");
    const cardsWrapper   = document.querySelector(".course-cards-wrapper");
    const pagination     = document.querySelector(".pagination");
    const sidebar        = document.querySelector(".sidebar");

    // ========== STATE ==========
    const state = {
        searchQuery: "",
        viewMode: localStorage.getItem("edupress-view-mode") || "list",
        currentPage: 1,
        itemsPerPage: 6,
        filters: {
            category: [],
            instructor: [],
            price: [],
            review: [],
            level: []
        },
        allCourses: [],
        courseCards: []
    };

    // ========== TOAST ==========
    function showToast(message, type = "info") {
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
            transition: "all 0.3s ease"
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

    // ========== LOAD DATA ==========
    async function loadCourses() {
        try {
            const res = await fetch("../data/courses.json");
            if (!res.ok) throw new Error("Không thể tải courses.json");
            const data = await res.json();
            return data.courses || data;
        } catch (err) {
            console.error(err);
            showToast("Không tải được danh sách khóa học", "error");
            return [];
        }
    }

    // ========== TẠO CARD ==========
    function createCourseCard(course, template) {
        const card = template.cloneNode(true);
        card.style.display = "";
        card.classList.remove("template-card");

        // Ảnh
        const img = card.querySelector(".course-image img");
        if (img) {
            img.src = course.image;
            img.alt = course.title;
            img.loading = "lazy";
        }

        // Badge
        const badgeSpan = card.querySelector(".badge span");
        if (badgeSpan) badgeSpan.textContent = course.category;

        // Tác giả
        const authorName = card.querySelector(".author-name");
        if (authorName) authorName.textContent = course.author;

        // Tiêu đề + link
        const titleLink = card.querySelector(".course-title a");
        if (titleLink) {
            titleLink.textContent = course.title;
            titleLink.href = `./course-single.html?id=${course.id}`;
        }

        // Stats
        const statSpans = card.querySelectorAll(".course-stats span");
        if (statSpans.length >= 4) {
            const icons = [
                "../src/assets/icons/meta1.svg",
                "../src/assets/icons/meta2.svg",
                "../src/assets/icons/meta3.svg",
                "../src/assets/icons/meta4.svg"
            ];
            const values = [
                course.duration,
                `${course.students} Students`,
                course.level,
                `${course.lessons} Lessons`
            ];
            statSpans.forEach((span, i) => {
                span.innerHTML = `<img src="${icons[i]}" alt=""> ${values[i]}`;
            });
        }

        // Giá
        const oldPrice = card.querySelector(".old-price");
        const newPrice = card.querySelector(".new-price");
        if (oldPrice) oldPrice.textContent = `$${Number(course.oldPrice).toFixed(1)}`;
        if (newPrice) {
            newPrice.textContent = course.currentPrice;
            newPrice.style.color = course.isFree ? "#55BE24" : "#000";
        }

        // View More
        const viewMore = card.querySelector(".view-more");
        if (viewMore) viewMore.href = `./course-single.html?id=${course.id}`;

        // Data attributes để filter
        card.dataset.id       = course.id;
        card.dataset.category = (course.category || "").toLowerCase();
        card.dataset.author   = (course.author || "").toLowerCase();
        card.dataset.level    = (course.level || "").toLowerCase();
        card.dataset.free     = course.isFree ? "true" : "false";
        card.dataset.rating   = course.rating || 0;

        return card;
    }

    // ========== FILTER ==========
    function matchSearch(card, query) {
        if (!query) return true;
        const title  = card.querySelector(".course-title a")?.textContent?.toLowerCase() || "";
        const author = card.querySelector(".author-name")?.textContent?.toLowerCase() || "";
        return title.includes(query) || author.includes(query);
    }

    function matchFilters(card) {
        const { category, instructor, price, level, review } = state.filters;

        if (category.length) {
            const cat = card.dataset.category || "";
            if (!category.some(c => cat.includes(c))) return false;
        }

        if (instructor.length) {
            const author = card.dataset.author || "";
            if (!instructor.some(i => author.includes(i))) return false;
        }

        if (price.length && !price.includes("all")) {
            const isFree = card.dataset.free === "true";
            if (price.includes("free") && !isFree) return false;
            if (price.includes("paid") && isFree) return false;
        }

        if (level.length && !level.includes("all-levels")) {
            const lvl = card.dataset.level || "";
            if (!level.some(l => lvl.includes(l))) return false;
        }

        if (review.length) {
            const rating = Number(card.dataset.rating) || 0;
            if (!review.some(r => rating >= Number(r))) return false;
        }

        return true;
    }

    function getFilteredCards() {
        return state.courseCards.filter(card =>
            matchSearch(card, state.searchQuery) && matchFilters(card)
        );
    }

    // ========== RENDER ==========
    function renderCourses() {
        const filtered = getFilteredCards();
        const total = filtered.length;
        const totalPages = Math.max(1, Math.ceil(total / state.itemsPerPage));

        if (state.currentPage > totalPages) state.currentPage = totalPages;

        const start = (state.currentPage - 1) * state.itemsPerPage;
        const end   = start + state.itemsPerPage;
        const pageCards = filtered.slice(start, end);

        // Ẩn tất cả
        state.courseCards.forEach(c => c.style.display = "none");
        // Hiện trang hiện tại
        pageCards.forEach(c => c.style.display = "");

        renderPagination(totalPages, total);
    }

    function renderPagination(totalPages, totalItems) {
        if (!pagination) return;

        // Xóa nút số cũ
        pagination.querySelectorAll(".page-btn, .page-btn-active").forEach(btn => btn.remove());

        const nextArrow = pagination.querySelector('a[aria-label="Next page"]');
        const prevArrow = pagination.querySelector('a[aria-label="Previous page"]');

        for (let i = 1; i <= totalPages; i++) {
            const a = document.createElement("a");
            a.href = "#";
            a.textContent = i;
            a.className = i === state.currentPage ? "page-btn-active" : "page-btn";
            if (i === state.currentPage) a.setAttribute("aria-current", "page");

            a.addEventListener("click", e => {
                e.preventDefault();
                state.currentPage = i;
                renderCourses();
            });

            if (nextArrow) pagination.insertBefore(a, nextArrow);
            else pagination.appendChild(a);
        }

        // Prev / Next
        if (prevArrow) {
            prevArrow.onclick = e => {
                e.preventDefault();
                if (state.currentPage > 1) {
                    state.currentPage--;
                    renderCourses();
                }
            };
        }
        if (nextArrow) {
            nextArrow.onclick = e => {
                e.preventDefault();
                if (state.currentPage < totalPages) {
                    state.currentPage++;
                    renderCourses();
                }
            };
        }

        pagination.style.display = (totalItems === 0 || totalPages <= 1) ? "none" : "flex";
    }

    // ========== VIEW MODE ==========
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

    // ========== EVENTS ==========
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
        state.filters = { category: [], instructor: [], price: [], review: [], level: [] };
        if (!sidebar) return;

        sidebar.querySelectorAll('input[type="checkbox"]:checked').forEach(cb => {
            const name  = cb.name;
            const value = cb.value.toLowerCase();
            if (state.filters[name]) state.filters[name].push(value);
        });
    }

    function handleFilterChange() {
        collectFilters();
        state.currentPage = 1;
        renderCourses();
    }


    // ========== BACK TO TOP ==========
    function initBackToTop() {
        const backToTopBtn = document.querySelector(".back-to-top");
        if (!backToTopBtn) return;
        window.addEventListener("scroll", function () {
            if (window.scrollY > 300) {
                backToTopBtn.classList.add("show");
            } else {
                backToTopBtn.classList.remove("show");
            }
        });
    }

    // ========== INIT ==========
    async function init() {
        state.allCourses = await loadCourses();

        const template = document.querySelector(".template-card");
        if (!template || !cardsWrapper) {
            console.error("Không tìm thấy template-card hoặc course-cards-wrapper");
            return;
        }

        // Tạo toàn bộ card
        state.courseCards = state.allCourses.map(course => {
            const card = createCourseCard(course, template);
            cardsWrapper.appendChild(card);
            return card;
        });

        // Gắn sự kiện
        searchForm?.addEventListener("submit", handleSearch);
        searchInput?.addEventListener("input", handleSearchInput);
        headerSearchBtn?.addEventListener("click", () => searchInput?.focus());
        viewTableBtn?.addEventListener("click", () => handleViewToggle("grid"));
        viewListBtn?.addEventListener("click", () => handleViewToggle("list"));
        sidebar?.addEventListener("change", e => {
            if (e.target.matches('input[type="checkbox"]')) handleFilterChange();
        });

        applyViewMode();
        renderCourses();
        initBackToTop();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
/**
 * blog-listing.js
 * Đọc JSON → render bài viết động + View mode + Search + Pagination (giống course-listing)
 */

document.addEventListener('DOMContentLoaded', async function () {

    const blogList = document.getElementById('blogList');
    const paginationEl = document.getElementById('pagination');
    const searchInput = document.querySelector('.search-box input[type="search"]');
    const btnGrid = document.querySelector('.icon-view-table');
    const btnList = document.querySelector('.icon-view-list');

    let allPosts = [];
    let filteredPosts = [];
    let currentPage = 1;
    const itemsPerPage = 6;

    // ========== 1. LOAD JSON ==========
    try {
        const response = await fetch('../data/blog.json');
        const data = await response.json();
        allPosts = data.posts || [];
        filteredPosts = [...allPosts];
        renderPage();
    } catch (error) {
        console.error('Không load được blog-data.json:', error);
        if (blogList) {
            blogList.innerHTML = '<p>Không tải được dữ liệu bài viết.</p>';
        }
    }

    // ========== 2. RENDER POSTS (1 trang) ==========
    function renderPosts(posts) {
        if (!blogList) return;

        if (!posts.length) {
            blogList.innerHTML = '<p>Không tìm thấy bài viết nào.</p>';
            return;
        }

        blogList.innerHTML = posts.map(post => `
            <article class="blog-post" data-id="${post.id}">
                <a href="./blog-single.html?id=${post.id}" class="post-image">
                    <img src="${post.image}" alt="${post.title}">
                </a>
                <div class="post-content">
                    <h2 class="post-title">
                        <a href="./blog-single.html?id=${post.id}">${post.title}</a>
                    </h2>
                    <div class="post-meta">
                        <span class="post-date">
                            <img src="../src/assets/icons/Icon-schedule.svg" alt="" class="Icon-schedule">
                            ${post.date}
                        </span>
                    </div>
                    <p class="post-excerpt">${post.excerpt}</p>
                </div>
            </article>
        `).join('');
    }

    // ========== 3. RENDER PAGE + PAGINATION ==========
    function renderPage() {
        const total = filteredPosts.length;
        const totalPages = Math.max(1, Math.ceil(total / itemsPerPage));
        if (currentPage > totalPages) currentPage = totalPages;

        const start = (currentPage - 1) * itemsPerPage;
        const pagePosts = filteredPosts.slice(start, start + itemsPerPage);

        renderPosts(pagePosts);
        renderPagination(totalPages, total);
    }

    function renderPagination(totalPages, totalItems) {
        if (!paginationEl) return;

        // Xóa nút số cũ, giữ mũi tên
        paginationEl.querySelectorAll('.page-btn, .page-btn-active').forEach(el => el.remove());

        const prevArrow = paginationEl.querySelector('[aria-label="Previous page"]');
        const nextArrow = paginationEl.querySelector('[aria-label="Next page"]');

        for (let i = 1; i <= totalPages; i++) {
            const a = document.createElement('a');
            a.href = '#';
            a.textContent = i;
            a.className = i === currentPage ? 'page-btn-active' : 'page-btn';
            if (i === currentPage) a.setAttribute('aria-current', 'page');
            a.addEventListener('click', e => {
                e.preventDefault();
                currentPage = i;
                renderPage();
            });
            if (nextArrow) paginationEl.insertBefore(a, nextArrow);
            else paginationEl.appendChild(a);
        }

        if (prevArrow) {
            prevArrow.onclick = e => {
                e.preventDefault();
                if (currentPage > 1) {
                    currentPage--;
                    renderPage();
                }
            };
        }
        if (nextArrow) {
            nextArrow.onclick = e => {
                e.preventDefault();
                if (currentPage < totalPages) {
                    currentPage++;
                    renderPage();
                }
            };
        }

        paginationEl.style.display = (totalItems === 0 || totalPages <= 1) ? 'none' : 'flex';
    }

    // ========== 4. SEARCH ==========
    if (searchInput) {
        searchInput.addEventListener('input', function () {
            const keyword = this.value.trim().toLowerCase();
            filteredPosts = allPosts.filter(post =>
                post.title.toLowerCase().includes(keyword) ||
                post.excerpt.toLowerCase().includes(keyword)
            );
            currentPage = 1;
            renderPage();
        });
    }

    // ========== 5. VIEW MODE ==========
    function setViewMode(mode) {
        if (!blogList) return;

        blogList.classList.remove('is-grid', 'is-list');
        blogList.classList.add(`is-${mode}`);

        if (mode === 'grid') {
            btnGrid?.classList.add('is-active');
            btnList?.classList.remove('is-active');
        } else {
            btnList?.classList.add('is-active');
            btnGrid?.classList.remove('is-active');
        }

        localStorage.setItem('blogViewMode', mode);
    }

    btnGrid?.addEventListener('click', () => setViewMode('grid'));
    btnList?.addEventListener('click', () => setViewMode('list'));

    const savedMode = localStorage.getItem('blogViewMode') || 'list';
    setViewMode(savedMode);

    // ========== 6. BACK TO TOP ==========
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
    initBackToTop();
});

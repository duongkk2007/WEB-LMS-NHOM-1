/**
 * blog-listing.js
 * Đọc JSON → render bài viết động + View mode + Search
 */

document.addEventListener('DOMContentLoaded', async function () {

    const blogList = document.getElementById('blogList');
    const paginationEl = document.getElementById('pagination');
    const searchInput = document.querySelector('.search-box input[type="search"]');
    const btnGrid = document.querySelector('.icon-view-table');
    const btnList = document.querySelector('.icon-view-list');

    let allPosts = [];

    // ========== 1. LOAD JSON ==========
    try {
        // Từ src/js/pages/ → lên 2 cấp rồi vào data/
        const response = await fetch('../data/blog.json');
        const data = await response.json();
        allPosts = data.posts;

        renderPosts(allPosts);
        renderPagination(data.pagination);
        // (tùy chọn) renderSidebar(data.sidebar);
    } catch (error) {
        console.error('Không load được blog-data.json:', error);
        if (blogList) {
            blogList.innerHTML = '<p>Không tải được dữ liệu bài viết.</p>';
        }
    }

    // ========== 2. RENDER POSTS ==========
    function renderPosts(posts) {
        if (!blogList) return;

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

    // ========== 3. RENDER PAGINATION ==========
    function renderPagination(pagination) {
        if (!paginationEl) return;

        let html = `<a href="#" class="arrow" aria-label="Previous page">‹</a>`;

        for (let i = 1; i <= pagination.total; i++) {
            const active = i === pagination.current ? 'page-btn-active' : 'page-btn';
            html += `<a href="#" class="${active}" data-page="${i}">${i}</a>`;
        }

        html += `<a href="#" class="arrow" aria-label="Next page">›</a>`;
        paginationEl.innerHTML = html;
    }

    // ========== 4. SEARCH ==========
    if (searchInput) {
        searchInput.addEventListener('input', function () {
            const keyword = this.value.trim().toLowerCase();

            const filtered = allPosts.filter(post =>
                post.title.toLowerCase().includes(keyword) ||
                post.excerpt.toLowerCase().includes(keyword)
            );

            renderPosts(filtered);
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
});
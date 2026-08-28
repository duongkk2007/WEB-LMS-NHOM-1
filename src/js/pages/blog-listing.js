/**
 * blog-listing.js
 * Xử lý: Search, View mode (Grid/List), Pagination, Hover effect
 */

document.addEventListener('DOMContentLoaded', function () {

    // ========== ELEMENTS ==========
    const searchInput   = document.querySelector('.search-box input[type="search"]');
    const blogList      = document.querySelector('.blog-list');
    const blogPosts     = document.querySelectorAll('.blog-post');
    const btnGrid       = document.querySelector('.icon-view-table');
    const btnList       = document.querySelector('.icon-view-list');
    const pagination    = document.querySelector('.pagination');

    // ========== 1. SEARCH ARTICLES ==========
    if (searchInput) {
        searchInput.addEventListener('input', function () {
            const keyword = this.value.trim().toLowerCase();

            blogPosts.forEach(post => {
                const title   = post.querySelector('.post-title')?.textContent.toLowerCase() || '';
                const excerpt = post.querySelector('.post-excerpt')?.textContent.toLowerCase() || '';

                if (title.includes(keyword) || excerpt.includes(keyword)) {
                    post.style.display = 'flex';
                } else {
                    post.style.display = 'none';
                }
            });
        });
    }

    // ========== 2. VIEW MODE (Grid / List) ==========
    function setViewMode(mode) {
        if (!blogList) return;

        // Xóa class cũ
        blogList.classList.remove('is-grid', 'is-list');

        // Thêm class mới
        blogList.classList.add(`is-${mode}`);

        // Active button
        if (mode === 'grid') {
            btnGrid?.classList.add('is-active');
            btnList?.classList.remove('is-active');
        } else {
            btnList?.classList.add('is-active');
            btnGrid?.classList.remove('is-active');
        }

        // Lưu preference
        localStorage.setItem('blogViewMode', mode);
    }

    // Click Grid
    btnGrid?.addEventListener('click', () => setViewMode('grid'));

    // Click List
    btnList?.addEventListener('click', () => setViewMode('list'));

    // Load preference khi vào trang
    const savedMode = localStorage.getItem('blogViewMode') || 'list';
    setViewMode(savedMode);

    // ========== 3. PAGINATION (demo) ==========
    if (pagination) {
        const pageButtons = pagination.querySelectorAll('.page-btn, .page-arrow');

        pageButtons.forEach(btn => {
            btn.addEventListener('click', function (e) {
                e.preventDefault();

                // Bỏ active cũ
                pagination.querySelectorAll('.page-btn').forEach(b => {
                    b.classList.remove('page-btn-active');
                });

                // Nếu click vào số trang
                if (this.classList.contains('page-btn')) {
                    this.classList.add('page-btn-active');
                }

                // TODO: Khi có API thật thì gọi fetch page tại đây
                // Ví dụ: loadPosts(pageNumber);
                console.log('Chuyển sang trang:', this.textContent.trim());
            });
        });
    }

    // ========== 4. SMOOTH HOVER EFFECT (optional) ==========
    blogPosts.forEach(post => {
        post.addEventListener('mouseenter', () => {
            post.style.transition = 'box-shadow 0.25s ease, transform 0.25s ease';
        });
    });

});
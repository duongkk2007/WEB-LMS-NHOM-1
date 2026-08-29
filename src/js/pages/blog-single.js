/**
 * EduPress - Blog Single Page
 * Fixed to match blog-single.html (IDs: comment-name, comment-email, comment-text)
 */

document.addEventListener('DOMContentLoaded', async function () {

    // Lấy id từ URL
    const urlParams = new URLSearchParams(window.location.search);
    const postId = parseInt(urlParams.get('id')) || 1;

    try {
        // Cùng file JSON với listing
        const response = await fetch('../data/blog.json');
        const data = await response.json();

        const post = data.posts.find(p => p.id === postId);

        if (post) {
            // Cập nhật title trang
            document.title = `${post.title} - EduPress`;

            // Cập nhật tiêu đề bài
            const pageTitle = document.querySelector('.page-title');
            if (pageTitle) pageTitle.textContent = post.title;

            // Cập nhật ảnh featured
            const featuredImg = document.querySelector('.featured-image img');
            if (featuredImg) {
                featuredImg.src = post.image;
                featuredImg.alt = post.title;
            }

            // Cập nhật ngày
            const dateEl = document.querySelector('.meta-date time');
            if (dateEl) {
                dateEl.textContent = post.date;
                dateEl.setAttribute('datetime', '2023-01-24'); // có thể map thêm nếu JSON có
            }

            // Cập nhật breadcrumb
            const fading = document.querySelector('.fading');
            if (fading) fading.textContent = post.title;
        }
    } catch (error) {
        console.error('Không load được dữ liệu bài viết:', error);
    }

    // ========== SELECTORS (khớp HTML) ==========
    const commentForm = document.querySelector('.comment-form');
    const nameInput = document.getElementById('comment-name');
    const emailInput = document.getElementById('comment-email');
    const commentText = document.getElementById('comment-text');
    const saveInfoCheckbox = document.querySelector('input[name="save-info"]');

    // ========== TOAST ==========
    function showToast(message, type = 'info') {
        const oldToast = document.querySelector('.js-toast');
        if (oldToast) oldToast.remove();

        const toast = document.createElement('div');
        toast.className = 'js-toast';
        toast.textContent = message;

        const colors = {
            success: '#55BE24',
            error: '#e74c3c',
            info: '#3498db'
        };

        toast.style.cssText = `
            position: fixed;
            bottom: 30px;
            right: 30px;
            background: ${colors[type] || colors.info};
            color: #fff;
            padding: 14px 24px;
            border-radius: 8px;
            font-size: 16px;
            font-family: 'Exo', sans-serif;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 9999;
            opacity: 0;
            transform: translateY(20px);
            transition: all 0.3s ease;
        `;

        document.body.appendChild(toast);
        requestAnimationFrame(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateY(0)';
        });

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(20px)';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // ========== VALIDATION ==========
    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function showFieldError(input, message) {
        if (!input) return;
        input.style.borderColor = '#e74c3c';
        let errorEl = input.parentElement.querySelector('.js-error');
        if (!errorEl) {
            errorEl = document.createElement('span');
            errorEl.className = 'js-error';
            errorEl.style.cssText = 'color:#e74c3c;font-size:14px;margin-top:4px;display:block;';
            input.parentElement.appendChild(errorEl);
        }
        errorEl.textContent = message;
    }

    function clearFormErrors() {
        [nameInput, emailInput, commentText].forEach(input => {
            if (input) {
                input.style.borderColor = '';
                const errorEl = input.parentElement.querySelector('.js-error');
                if (errorEl) errorEl.remove();
            }
        });
    }

    // ========== LOAD SAVED INFO ==========
    function loadSavedUserInfo() {
        const savedName = localStorage.getItem('edupress_comment_name');
        const savedEmail = localStorage.getItem('edupress_comment_email');
        if (savedName && nameInput) nameInput.value = savedName;
        if (savedEmail && emailInput) emailInput.value = savedEmail;
        if (savedName && savedEmail && saveInfoCheckbox) {
            saveInfoCheckbox.checked = true;
        }
    }

    // ========== FORM SUBMIT ==========
    function handleCommentSubmit(e) {
        e.preventDefault();
        clearFormErrors();

        const name = nameInput?.value.trim() || '';
        const email = emailInput?.value.trim() || '';
        const comment = commentText?.value.trim() || '';

        let isValid = true;

        if (!name) {
            showFieldError(nameInput, 'Name is required');
            isValid = false;
        }
        if (!email) {
            showFieldError(emailInput, 'Email is required');
            isValid = false;
        } else if (!isValidEmail(email)) {
            showFieldError(emailInput, 'Please enter a valid email');
            isValid = false;
        }
        if (!comment) {
            showFieldError(commentText, 'Comment cannot be empty');
            isValid = false;
        } else if (comment.length < 10) {
            showFieldError(commentText, 'Comment must be at least 10 characters');
            isValid = false;
        }

        if (!isValid) {
            showToast('Please fix the errors above', 'error');
            return;
        }

        // Save info
        if (saveInfoCheckbox?.checked) {
            localStorage.setItem('edupress_comment_name', name);
            localStorage.setItem('edupress_comment_email', email);
        } else {
            localStorage.removeItem('edupress_comment_name');
            localStorage.removeItem('edupress_comment_email');
        }

        showToast('Comment posted successfully!', 'success');
        commentForm.reset();
        clearFormErrors();
    }

    // ========== REPLY BUTTON ==========
    document.querySelectorAll('.reply-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const commentItem = btn.closest('.comment-item');
            const authorEl = commentItem?.querySelector('.comment-author');
            const authorName = authorEl ? authorEl.textContent.trim() : 'User';

            if (commentText) {
                commentText.focus();
                commentText.value = `@${authorName} `;
                commentText.setSelectionRange(commentText.value.length, commentText.value.length);
            }

            document.querySelector('.comment-form-section')?.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        });
    });

    // ========== TAGS ==========
    document.querySelectorAll('.post-tags .tags-list a, .tags-widget .tags-list a').forEach(tag => {
        tag.addEventListener('click', (e) => {
            e.preventDefault();
            const parentList = tag.closest('.tags-list');
            if (parentList) {
                parentList.querySelectorAll('li').forEach(li => li.classList.remove('active-tag'));
                tag.parentElement.classList.add('active-tag');
            }
        });
    });

    // ========== PAGINATION ==========
    const pagination = document.querySelector('.pagination');
    if (pagination) {
        pagination.addEventListener('click', (e) => {
            e.preventDefault();
            const target = e.target.closest('a');
            if (!target) return;

            pagination.querySelectorAll('.page-btn-active').forEach(btn => {
                btn.classList.remove('page-btn-active');
                btn.classList.add('page-btn');
            });

            if (target.classList.contains('page-btn') || target.classList.contains('page-btn-active')) {
                target.classList.remove('page-btn');
                target.classList.add('page-btn-active');
                showToast(`Showing comments page ${target.textContent}`, 'info');
            }
        });
    }

    // ========== SHARE ==========
    const pageUrl = encodeURIComponent(window.location.href);
    const pageTitle = encodeURIComponent(document.title);

    document.querySelectorAll('.share-list a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const alt = (link.querySelector('img')?.alt || '').toLowerCase();
            let shareUrl = '';

            if (alt.includes('facebook')) {
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${pageUrl}`;
            } else if (alt.includes('twitter') || alt.includes('x')) {
                shareUrl = `https://twitter.com/intent/tweet?url=${pageUrl}&text=${pageTitle}`;
            } else if (alt.includes('pinterest')) {
                shareUrl = `https://pinterest.com/pin/create/button/?url=${pageUrl}&description=${pageTitle}`;
            } else if (alt.includes('instagram')) {
                navigator.clipboard?.writeText(window.location.href);
                showToast('Link copied! You can paste it on Instagram', 'success');
                return;
            } else if (alt.includes('youtube')) {
                showToast('YouTube does not support direct share of articles', 'info');
                return;
            }

            if (shareUrl) {
                window.open(shareUrl, '_blank', 'width=600,height=400,noopener,noreferrer');
            }
        });
    });

    // ========== SEARCH ICON ==========
    document.querySelector('.search-icon-header')?.addEventListener('click', (e) => {
        e.preventDefault();
        showToast('Search feature is coming soon', 'info');
    });

    // ========== INIT ==========
    loadSavedUserInfo();
    if (commentForm) {
        commentForm.addEventListener('submit', handleCommentSubmit);
    }
});

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


if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initBackToTop);
} else {
  initBackToTop();
}

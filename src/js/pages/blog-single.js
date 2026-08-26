/**
 * EduPress - Blog Single Page
 * JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. COMMENT FORM
    const commentForm = document.querySelector('.comment-form');
    const nameInput = document.getElementById('comment-name');
    const emailInput = document.getElementById('comment-email');
    const commentText = document.getElementById('comment-text');
    const saveInfoCheckbox = document.querySelector('input[name="save-info"]');

    // Load dữ liệu đã lưu (nếu có)
    loadSavedUserInfo();

    if (commentForm) {
        commentForm.addEventListener('submit', handleCommentSubmit);
    }

    function handleCommentSubmit(e) {
        e.preventDefault();

        // Xóa lỗi cũ
        clearFormErrors();

        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const comment = commentText.value.trim();

        let isValid = true;

        // Validate Name
        if (!name) {
            showFieldError(nameInput, 'Name is required');
            isValid = false;
        }

        // Validate Email
        if (!email) {
            showFieldError(emailInput, 'Email is required');
            isValid = false;
        } else if (!isValidEmail(email)) {
            showFieldError(emailInput, 'Please enter a valid email');
            isValid = false;
        }

        // Validate Comment
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

        // Lưu thông tin nếu checkbox được chọn
        if (saveInfoCheckbox && saveInfoCheckbox.checked) {
            localStorage.setItem('edupress_comment_name', name);
            localStorage.setItem('edupress_comment_email', email);
        } else {
            localStorage.removeItem('edupress_comment_name');
            localStorage.removeItem('edupress_comment_email');
        }

        // Giả lập gửi comment thành công
        showToast('Comment posted successfully!', 'success');
        commentForm.reset();

        // Xóa class error nếu còn
        clearFormErrors();
    }

    function isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    function showFieldError(input, message) {
        input.style.borderColor = '#e74c3c';

        // Tạo hoặc cập nhật thông báo lỗi
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
        const inputs = [nameInput, emailInput, commentText];
        inputs.forEach(input => {
            if (input) {
                input.style.borderColor = '';
                const errorEl = input.parentElement.querySelector('.js-error');
                if (errorEl) errorEl.remove();
            }
        });
    }

    function loadSavedUserInfo() {
        const savedName = localStorage.getItem('edupress_comment_name');
        const savedEmail = localStorage.getItem('edupress_comment_email');

        if (savedName && nameInput) nameInput.value = savedName;
        if (savedEmail && emailInput) emailInput.value = savedEmail;
        if (savedName && savedEmail && saveInfoCheckbox) {
            saveInfoCheckbox.checked = true;
        }
    }

    // 2. REPLY BUTTON
    const replyButtons = document.querySelectorAll('.reply-btn');

    replyButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();

            // Lấy tên người dùng từ comment cha
            const commentItem = btn.closest('.comment-item');
            const authorEl = commentItem?.querySelector('.comment-author');
            const authorName = authorEl ? authorEl.textContent.trim() : 'User';

            // Focus vào form + điền @tên
            if (commentText) {
                commentText.focus();
                commentText.value = `@${authorName} `;
                // Di chuyển cursor về cuối
                commentText.setSelectionRange(commentText.value.length, commentText.value.length);
            }

            // Scroll mượt đến form
            const formSection = document.querySelector('.comment-form-section');
            if (formSection) {
                formSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });
    });

    // 3. TAGS (Post + Sidebar)
    const allTags = document.querySelectorAll('.post-tags .tags-list a, .tags-widget .tags-list a');

    allTags.forEach(tag => {
        tag.addEventListener('click', (e) => {
            e.preventDefault();

            // Xóa active cũ trong cùng list
            const parentList = tag.closest('.tags-list');
            if (parentList) {
                parentList.querySelectorAll('li').forEach(li => li.classList.remove('active-tag'));
                tag.parentElement.classList.add('active-tag');
            }
        });
    });

    // 4. PAGINATION COMMENTS
    const pagination = document.querySelector('.pagination');

    if (pagination) {
        pagination.addEventListener('click', (e) => {
            e.preventDefault();
            const target = e.target.closest('a');
            if (!target) return;

            // Bỏ active cũ
            pagination.querySelectorAll('.page-btn-active').forEach(btn => {
                btn.classList.remove('page-btn-active');
                btn.classList.add('page-btn');
            });

            // Nếu click vào số trang
            if (target.classList.contains('page-btn') || target.classList.contains('page-btn-active')) {
                target.classList.remove('page-btn');
                target.classList.add('page-btn-active');
                showToast(`Showing comments page ${target.textContent}`, 'info');
            }

            // Xử lý mũi tên (giả lập)
            if (target.classList.contains('arrow-pargi') || target.classList.contains('arrow-pargi-active')) {
                showToast('Pagination navigation', 'info');
            }
        });
    }

    // 5. SHARE BUTTONS
    const shareLinks = document.querySelectorAll('.share-list a');
    const pageUrl = encodeURIComponent(window.location.href);
    const pageTitle = encodeURIComponent(document.title);

    shareLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();

            const img = link.querySelector('img');
            const alt = img ? img.alt.toLowerCase() : '';

            let shareUrl = '';

            if (alt.includes('facebook')) {
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${pageUrl}`;
            } else if (alt.includes('twitter') || alt.includes('x')) {
                shareUrl = `https://twitter.com/intent/tweet?url=${pageUrl}&text=${pageTitle}`;
            } else if (alt.includes('pinterest')) {
                shareUrl = `https://pinterest.com/pin/create/button/?url=${pageUrl}&description=${pageTitle}`;
            } else if (alt.includes('instagram')) {
                // Instagram không có share web đơn giản → copy link
                copyToClipboard(window.location.href);
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

    function copyToClipboard(text) {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).catch(() => {
                fallbackCopy(text);
            });
        } else {
            fallbackCopy(text);
        }
    }

    function fallbackCopy(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
    }

    // 6. SEARCH ICON
    const searchIcon = document.querySelector('.search-icon-header');
    if (searchIcon) {
        searchIcon.addEventListener('click', (e) => {
            e.preventDefault();
            showToast('Search feature is coming soon', 'info');
        });
    }

    // 7. PREVENT DEFAULT cho các link #
    document.querySelectorAll('a[href="#"]').forEach(link => {
        // Chỉ prevent những link không phải reply (đã xử lý riêng)
        if (!link.classList.contains('reply-btn')) {
            link.addEventListener('click', (e) => {
                // Cho phép một số hành vi khác nếu cần
                // Hiện tại chỉ ngăn nhảy lên đầu trang
                e.preventDefault();
            });
        }
    });

    // 8. TOAST NOTIFICATION
    function showToast(message, type = 'info') {
        // Xóa toast cũ nếu có
        const oldToast = document.querySelector('.js-toast');
        if (oldToast) oldToast.remove();

        const toast = document.createElement('div');
        toast.className = 'js-toast';
        toast.textContent = message;

        // Style cơ bản (không sửa CSS file)
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

        // Animation hiện
        requestAnimationFrame(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateY(0)';
        });

        // Tự ẩn sau 3 giây
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(20px)';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // Expose showToast nếu cần gọi từ ngoài (tùy chọn)
    window.showToast = showToast;
});
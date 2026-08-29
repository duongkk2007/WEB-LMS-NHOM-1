/**
 * Contact Page - EduPress
 * JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1.SELECTORS
    const form = document.querySelector('.comment-form');
    const nameInput = document.getElementById('contact-name');
    const emailInput = document.getElementById('contact-email');
    const messageInput = document.getElementById('contact-message');
    const saveInfoCheckbox = document.querySelector('input[name="save-info"]');
    const searchBtn = document.querySelector('.search-icon-header');

    // 2.TOAST NOTIFICATION
    function showToast(message, type = 'success') {
        // Xóa toast cũ nếu còn
        const existingToast = document.querySelector('.edupress-toast');
        if (existingToast) existingToast.remove();

        const toast = document.createElement('div');
        toast.className = `edupress-toast edupress-toast--${type}`;
        toast.textContent = message;

        // Style cơ bản (không phụ thuộc CSS file)
        Object.assign(toast.style, {
            position: 'fixed',
            bottom: '30px',
            right: '30px',
            padding: '14px 24px',
            borderRadius: '8px',
            color: '#fff',
            fontSize: '16px',
            fontFamily: 'Exo, sans-serif',
            zIndex: '9999',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            opacity: '0',
            transform: 'translateY(20px)',
            transition: 'all 0.3s ease',
            backgroundColor: type === 'success' ? '#55BE24' : '#e74c3c'
        });

        document.body.appendChild(toast);

        // Hiện toast
        requestAnimationFrame(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateY(0)';
        });

        // Tự ẩn sau 3.5s
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(20px)';
            setTimeout(() => toast.remove(), 300);
        }, 3500);
    }

    // 3.VALIDATION HELPERS
    function isValidEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    function showError(input, message) {
        // Xóa lỗi cũ
        clearError(input);

        input.style.borderColor = '#e74c3c';

        const errorEl = document.createElement('span');
        errorEl.className = 'form-error-msg';
        errorEl.textContent = message;
        Object.assign(errorEl.style, {
            display: 'block',
            color: '#e74c3c',
            fontSize: '14px',
            marginTop: '6px'
        });

        input.parentElement.appendChild(errorEl);
    }

    function clearError(input) {
        input.style.borderColor = '';
        const error = input.parentElement.querySelector('.form-error-msg');
        if (error) error.remove();
    }

    function clearAllErrors() {
        [nameInput, emailInput, messageInput].forEach(input => {
            if (input) clearError(input);
        });
    }

    // 4. FORM VALIDATION
    function validateForm() {
        let isValid = true;
        clearAllErrors();

        const name = nameInput.value.trim();
        const email = emailInput.value.trim();

        if (!name) {
            showError(nameInput, 'Please enter your name');
            isValid = false;
        }

        if (!email) {
            showError(emailInput, 'Please enter your email');
            isValid = false;
        } else if (!isValidEmail(email)) {
            showError(emailInput, 'Please enter a valid email address');
            isValid = false;
        }

        return isValid;
    }

    // 5.LOCAL STORAGE
    const STORAGE_KEY = 'edupress_contact_info';

    function saveUserInfo() {
        if (!saveInfoCheckbox || !saveInfoCheckbox.checked) return;

        const data = {
            name: nameInput.value.trim(),
            email: emailInput.value.trim()
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }

    function loadUserInfo() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (!saved) return;

            const data = JSON.parse(saved);
            if (data.name) nameInput.value = data.name;
            if (data.email) emailInput.value = data.email;
            if (saveInfoCheckbox) saveInfoCheckbox.checked = true;
        } catch (err) {
            console.warn('Cannot load saved contact info:', err);
        }
    }

    // 6.FORM SUBMIT HANDLER
    function handleFormSubmit(e) {
        e.preventDefault();

        if (!validateForm()) {
            showToast('Please fill in the required fields correctly', 'error');
            return;
        }

        // Lưu thông tin nếu checkbox được chọn
        saveUserInfo();

        // Giả lập gửi form thành công
        // (Trong thực tế sẽ gọi API ở đây)
        showToast('Thank you! Your message has been sent successfully.');

        // Reset form (giữ lại name/email nếu đã lưu)
        messageInput.value = '';
        // Không clear name/email vì người dùng có thể muốn gửi tiếp
    }

    // 7.SEARCH BUTTON
    function handleSearchClick() {
        // HTML hiện tại không có ô search → chỉ thông báo đơn giản
        showToast('Search feature is coming soon!', 'error');
    }

    // 8.REAL-TIME CLEAR ERROR
    function attachInputListeners() {
        if (nameInput) {
            nameInput.addEventListener('input', () => clearError(nameInput));
        }
        if (emailInput) {
            emailInput.addEventListener('input', () => clearError(emailInput));
        }
    }

    // 9.INIT
    function init() {
        // Load dữ liệu đã lưu
        loadUserInfo();

        // Gắn event
        if (form) {
            form.addEventListener('submit', handleFormSubmit);
        }

        if (searchBtn) {
            searchBtn.addEventListener('click', handleSearchClick);
        }

        attachInputListeners();
    }

    init();
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

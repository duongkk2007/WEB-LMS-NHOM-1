/* ========== Login / Register Page JavaScript ========== */

document.addEventListener('DOMContentLoaded', function() {
  initPasswordToggle();
  initMenuToggle();
  initBackToTop();
  initFormSubmit();
});

// ========== Password Show/Hide ==========
function initPasswordToggle() {
  const toggles = document.querySelectorAll('.pw-toggle');

  toggles.forEach(btn => {
    btn.addEventListener('click', function() {
      const field = btn.closest('.form-field');
      const input = field.querySelector('input');
      const eyeIcon = btn.querySelector('.icon-eye');
      const eyeOffIcon = btn.querySelector('.icon-eye-off');

      const isHidden = input.type === 'password';
      input.type = isHidden ? 'text' : 'password';
      eyeIcon.style.display = isHidden ? 'none' : 'block';
      eyeOffIcon.style.display = isHidden ? 'block' : 'none';
      btn.setAttribute('aria-label', isHidden ? 'Hide password' : 'Show password');
    });
  });
}

// ========== Menu Toggle ==========
function initMenuToggle() {
  const menuToggle = document.getElementById('menuToggle');
  const mainNav = document.getElementById('mainNav');

  if (menuToggle && mainNav) {
    menuToggle.addEventListener('click', function() {
      mainNav.classList.toggle('open');
    });

    const navLinks = mainNav.querySelectorAll('a');
    navLinks.forEach(link => {
      link.addEventListener('click', function() {
        mainNav.classList.remove('open');
      });
    });

    document.addEventListener('click', function(event) {
      if (!menuToggle.contains(event.target) && !mainNav.contains(event.target)) {
        mainNav.classList.remove('open');
      }
    });
  }
}

// ========== Back to Top ==========
function initBackToTop() {
  const backToTopBtn = document.querySelector('.back-to-top');

  window.addEventListener('scroll', function() {
    if (window.scrollY > 300) {
      backToTopBtn.classList.add('show');
    } else {
      backToTopBtn.classList.remove('show');
    }
  });
}

// ========== Form Submit (demo) ==========
function initFormSubmit() {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');

  if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      // TODO: nối API đăng nhập thực tế tại đây
      console.log('Login submit:', Object.fromEntries(new FormData(loginForm)));
    });
  }

  if (registerForm) {
    registerForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(registerForm));
      if (data.password !== data.confirmPassword) {
        alert('Mật khẩu xác nhận không khớp.');
        return;
      }
      // TODO: nối API đăng ký thực tế tại đây
      console.log('Register submit:', data);
    });
  }
}
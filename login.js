// 세련된 로그인 시스템

class LoginSystem {
  constructor() {
    this.form = document.getElementById('loginForm');
    this.inputs = {
      username: document.getElementById('username'),
      studentNumber: document.getElementById('studentNumber'),
      phoneNumber: document.getElementById('phoneNumber')
    };
    this.submitButton = document.querySelector('.signin-button');
    this.toast = document.getElementById('toast');

    this.beforeUnloadHandler = this.beforeUnloadHandler.bind(this);
    window.addEventListener('beforeunload', this.beforeUnloadHandler);

    this.init();
  }

  init() {
    this.bindEvents();
    this.setupInputValidation();
    this.addInputAnimations();
  }

  bindEvents() {
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));

    Object.values(this.inputs).forEach(input => {
      input.addEventListener('blur', () => this.validateField(input));
      input.addEventListener('input', () => this.clearError(input));
    });

    this.inputs.phoneNumber.addEventListener('input', (e) => {
      this.formatPhoneNumber(e.target);
    });
  }

  setupInputValidation() {
    Object.values(this.inputs).forEach(input => {
      const wrapper = input.closest('.input-wrapper');

      input.addEventListener('focus', () => {
        wrapper.classList.add('focused');
        this.addRippleEffect(wrapper);
      });

      input.addEventListener('blur', () => {
        wrapper.classList.remove('focused');
        if (!input.value.trim()) {
          wrapper.classList.remove('has-value');
        } else {
          wrapper.classList.add('has-value');
        }
      });
    });
  }

  addInputAnimations() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.animationDelay = `${entry.target.dataset.delay || 0}ms`;
          entry.target.classList.add('animate-in');
        }
      });
    });

    document.querySelectorAll('.form-group').forEach((group, index) => {
      group.dataset.delay = index * 100;
      observer.observe(group);
    });
  }

  addRippleEffect(element) {
    const ripple = document.createElement('div');
    ripple.className = 'ripple-effect';
    ripple.style.cssText = `
      position: absolute;
      border-radius: 50%;
      background: rgba(84, 60, 82, 0.3);
      transform: scale(0);
      animation: ripple 0.6s linear;
      pointer-events: none;
      z-index: 0;
    `;

    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = '50%';
    ripple.style.top = '50%';
    ripple.style.marginLeft = -size / 2 + 'px';
    ripple.style.marginTop = -size / 2 + 'px';

    element.style.position = 'relative';
    element.appendChild(ripple);

    setTimeout(() => ripple.remove(), 600);
  }

  validateField(input) {
    const value = input.value.trim();
    const fieldName = input.id;
    let isValid = true;
    let errorMessage = '';

    if (!value) {
      isValid = false;
      errorMessage = this.getFieldLabel(fieldName) + '을(를) 입력해주세요.';
    } else {
      switch (fieldName) {
        case 'username':
          if (value.length < 2) {
            isValid = false;
            errorMessage = '사용자명은 2자 이상 입력해주세요.';
          } else if (!/^[a-zA-Z가-힣0-9_]+$/.test(value)) {
            isValid = false;
            errorMessage = '사용자명은 영문, 한글, 숫자, 언더스코어만 사용 가능합니다.';
          }
          break;
        case 'studentNumber':
          if (!/^\d{4,10}$/.test(value)) {
            isValid = false;
            errorMessage = '학번은 4-10자리 숫자로 입력해주세요.';
          }
          break;
        case 'phoneNumber':
          if (!/^010-\d{4}-\d{4}$/.test(value)) {
            isValid = false;
            errorMessage = '전화번호는 010-0000-0000 형식으로 입력해주세요.';
          }
          break;
      }
    }

    this.showFieldError(input, isValid ? '' : errorMessage);
    return isValid;
  }

  getFieldLabel(fieldName) {
    const labels = {
      username: '사용자명',
      studentNumber: '학번',
      phoneNumber: '전화번호'
    };
    return labels[fieldName] || fieldName;
  }

  showFieldError(input, message) {
    const errorElement = document.getElementById(input.id + 'Error');
    const inputWrapper = input.closest('.input-wrapper');

    if (message) {
      errorElement.textContent = message;
      errorElement.classList.add('show');
      inputWrapper.classList.add('error');
      input.classList.add('error');
    } else {
      errorElement.classList.remove('show');
      inputWrapper.classList.remove('error');
      input.classList.remove('error');
    }
  }

  clearError(input) {
    const errorElement = document.getElementById(input.id + 'Error');
    const inputWrapper = input.closest('.input-wrapper');

    if (errorElement.classList.contains('show')) {
      errorElement.classList.remove('show');
      inputWrapper.classList.remove('error');
      input.classList.remove('error');
    }
  }

  formatPhoneNumber(input) {
    let value = input.value.replace(/\D/g, '');

    if (value.length >= 3) {
      if (value.length >= 7) {
        value = value.replace(/(\d{3})(\d{4})(\d{0,4})/, '$1-$2-$3');
      } else {
        value = value.replace(/(\d{3})(\d{0,4})/, '$1-$2');
      }
    }

    input.value = value;
  }

  async handleSubmit(e) {
    e.preventDefault();

    let isFormValid = true;
    Object.values(this.inputs).forEach(input => {
      if (!this.validateField(input)) {
        isFormValid = false;
      }
    });

    if (!isFormValid) {
      this.showToast('입력 정보를 확인해주세요.', 'error');
      return;
    }

    this.setLoadingState(true);

    try {
      await this.simulateLogin();

      const { username, studentNumber, phoneNumber } = this.getFormData();

      if (this.validateLogin(username, studentNumber, phoneNumber)) {
        this.showToast('로그인 성공! 메인 페이지로 이동합니다.', 'success');

        setTimeout(() => {
          this.redirectToMainPage();
        }, 1500);
      } else {
        this.showToast('로그인 정보가 일치하지 않습니다. 다시 확인해주세요.', 'error');
      }
    } catch (error) {
      console.error('Login error:', error);
      this.showToast('로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.', 'error');
    } finally {
      this.setLoadingState(false);
    }
  }

  getFormData() {
    return {
      username: this.inputs.username.value.trim(),
      studentNumber: this.inputs.studentNumber.value.trim(),
      phoneNumber: this.inputs.phoneNumber.value.trim()
    };
  }

  validateLogin(username, studentNumber, phoneNumber) {
    const validCredentials = [
      { username: 'admin', studentNumber: '1234', phoneNumber: '010-0000-0000' },
      { username: 'student', studentNumber: '2021001234', phoneNumber: '010-1234-5678' },
      { username: 'test', studentNumber: '2020001111', phoneNumber: '010-9999-8888' }
    ];

    return validCredentials.some(cred => 
      cred.username === username && 
      cred.studentNumber === studentNumber && 
      cred.phoneNumber === phoneNumber
    );
  }

  simulateLogin() {
    return new Promise(resolve => {
      setTimeout(resolve, 1500 + Math.random() * 1000);
    });
  }

  setLoadingState(isLoading) {
    if (isLoading) {
      this.submitButton.classList.add('loading');
      this.submitButton.disabled = true;
    } else {
      this.submitButton.classList.remove('loading');
      this.submitButton.disabled = false;
    }
  }

  showToast(message, type = 'info') {
    const toastContent = this.toast.querySelector('.toast-content');
    const toastIcon = this.toast.querySelector('.toast-icon');
    const toastMessage = this.toast.querySelector('.toast-message');

    const icons = {
      success: 'fas fa-check-circle',
      error: 'fas fa-exclamation-circle',
      warning: 'fas fa-exclamation-triangle',
      info: 'fas fa-info-circle'
    };

    toastIcon.className = `toast-icon ${icons[type] || icons.info}`;
    toastMessage.textContent = message;
    this.toast.className = `toast ${type}`;
    this.toast.classList.add('show');

    setTimeout(() => {
      this.toast.classList.remove('show');
    }, 4000);
  }

  redirectToMainPage() {
    document.body.style.transition = 'opacity 0.5s ease-out';
    document.body.style.opacity = '0';

    window.removeEventListener('beforeunload', this.beforeUnloadHandler);

    setTimeout(() => {
      window.location.href = 'mainmenu.html';
    }, 500);
  }

  beforeUnloadHandler(e) {
    const form = document.getElementById('loginForm');
    const hasData = Array.from(form.elements).some(element => 
      element.type !== 'submit' && element.value.trim() !== ''
    );

    if (hasData) {
      e.preventDefault();
      e.returnValue = '';
    }
  }
}

const style = document.createElement('style');
style.textContent = `
  @keyframes ripple {
    to {
      transform: scale(4);
      opacity: 0;
    }
  }
  .form-group {
    opacity: 0;
    transform: translateY(20px);
    transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .form-group.animate-in {
    opacity: 1;
    transform: translateY(0);
  }
  .input-wrapper.error input {
    border-color: var(--error-color);
    background-color: #fef5f5;
  }
  .input-wrapper.error i {
    color: var(--error-color);
  }
  .input-wrapper.focused {
    transform: translateY(-1px);
  }
  .signin-button {
    position: relative;
    overflow: hidden;
  }
  .signin-button::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    transition: left 0.5s;
  }
  .signin-button:hover::before {
    left: 100%;
  }
`;
document.head.appendChild(style);

document.addEventListener('DOMContentLoaded', () => {
  new LoginSystem();
  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity 0.5s ease-in';

  setTimeout(() => {
    document.body.style.opacity = '1';
  }, 100);
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.altKey) {
    const activeElement = document.activeElement;
    if (activeElement && activeElement.tagName === 'INPUT') {
      e.preventDefault();
      document.querySelector('.signin-button').click();
    }
  }

  if (e.key === 'Escape') {
    document.querySelectorAll('.error-message.show').forEach(error => {
      error.classList.remove('show');
    });
    document.querySelectorAll('.input-wrapper.error').forEach(wrapper => {
      wrapper.classList.remove('error');
    });
  }
});

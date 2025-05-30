// 세련된 마이페이지 시스템

class MyPageSystem {
  constructor() {
    this.currentTemp = 36.5
    this.elements = {
      tempNumber: document.querySelector(".temp-number"),
      gaugeFill: document.querySelector(".gauge-fill"),
      toast: document.getElementById("toast"),
    }

    this.init()
  }

  init() {
    this.bindEvents()
    this.updateTemperatureGauge()
    this.addAnimations()
    this.startRealTimeUpdates()
  }

  bindEvents() {
    // 네비게이션 아이템 클릭
    document.querySelectorAll(".nav-item").forEach((item) => {
      item.addEventListener("click", () => {
        const page = item.dataset.page
        if (page) {
          this.navigateWithAnimation(page)
        }
      })
    })

    // 네비게이션 그룹 헤더 클릭
    document.querySelectorAll(".nav-group-header").forEach((header) => {
      header.addEventListener("click", () => {
        const page = header.dataset.page
        if (page) {
          this.navigateWithAnimation(page)
        }
      })
    })

    // 퀵 액션 카드 클릭
    document.querySelectorAll(".action-card").forEach((card) => {
      card.addEventListener("click", () => {
        const tab = card.dataset.tab
        const page = card.dataset.page

        if (tab === "usage") {
          this.navigateWithAnimation("usage-history.html")
        } else if (tab === "points") {
          this.navigateWithAnimation("point.html")
        } else if (page) {
          this.navigateWithAnimation(page)
        }
      })
    })

    // 로그아웃 버튼
    document.querySelector(".logout-btn").addEventListener("click", () => {
      if (confirm("정말 로그아웃하시겠습니까?")) {
        this.showToast("로그아웃 중입니다...", "info")
        setTimeout(() => {
          this.navigateWithAnimation("login.html")
        }, 1500)
      }
    })

    // 키보드 단축키
    document.addEventListener("keydown", (e) => {
      // Ctrl + H: 홈으로
      if (e.ctrlKey && e.key === "h") {
        e.preventDefault()
        this.navigateWithAnimation("mainmenu.html")
      }

      // Ctrl + U: 이용 내역
      if (e.ctrlKey && e.key === "u") {
        e.preventDefault()
        this.navigateWithAnimation("usage-history.html")
      }

      // Ctrl + P: 포인트
      if (e.ctrlKey && e.key === "p") {
        e.preventDefault()
        this.navigateWithAnimation("point.html")
      }
    })
  }

  updateTemperatureGauge() {
    if (this.elements.tempNumber) {
      this.elements.tempNumber.textContent = this.currentTemp.toFixed(1)
    }

    if (this.elements.gaugeFill) {
      // 온도를 백분율로 변환 (0-100도 기준)
      const percent = Math.min(Math.max(this.currentTemp, 0), 100)
      this.elements.gaugeFill.style.width = `${percent}%`
    }
  }

  increaseTemperature(delta) {
    const newTemp = this.currentTemp + delta
    this.currentTemp = Math.min(Math.max(newTemp, 0), 100) // 0-100 범위 제한
    this.updateTemperatureGauge()

    // 온도 변화 알림
    if (delta > 0) {
      this.showToast(`온도가 ${delta.toFixed(1)}°C 상승했습니다!`, "success")
    } else {
      this.showToast(`온도가 ${Math.abs(delta).toFixed(1)}°C 하락했습니다.`, "warning")
    }
  }

  startRealTimeUpdates() {
    // 실시간 데이터 업데이트 시뮬레이션
    setInterval(() => {
      // 랜덤하게 온도 미세 조정 (±0.1도)
      const randomChange = (Math.random() - 0.5) * 0.2
      this.currentTemp = Math.min(Math.max(this.currentTemp + randomChange, 0), 100)
      this.updateTemperatureGauge()
    }, 30000) // 30초마다

    // 현재 시간 업데이트
    this.updateCurrentTime()
    setInterval(() => {
      this.updateCurrentTime()
    }, 1000)
  }

  updateCurrentTime() {
    const now = new Date()
    const timeString = now.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
    })

    // 헤더에 시간 표시 (선택사항)
    const userInfo = document.querySelector(".user-name")
    if (userInfo && !userInfo.dataset.originalText) {
      userInfo.dataset.originalText = userInfo.textContent
    }
  }

  addAnimations() {
    // 카드 애니메이션 관찰자
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.animationDelay = `${entry.target.dataset.delay || 0}ms`
          entry.target.classList.add("animate-in")
        }
      })
    })

    // 액션 카드 애니메이션
    document.querySelectorAll(".action-card").forEach((card, index) => {
      card.dataset.delay = index * 100
      observer.observe(card)
    })

    // 활동 아이템 애니메이션
    document.querySelectorAll(".activity-item").forEach((item, index) => {
      item.dataset.delay = index * 150
      observer.observe(item)
    })

    // 호버 효과 개선
    this.addAdvancedHoverEffects()
  }

  addAdvancedHoverEffects() {
    // 액션 카드 3D 효과
    document.querySelectorAll(".action-card").forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top

        const centerX = rect.width / 2
        const centerY = rect.height / 2

        const rotateX = (y - centerY) / 20
        const rotateY = (centerX - x) / 20

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`
      })

      card.addEventListener("mouseleave", () => {
        card.style.transform = "perspective(1000px) rotateX(0) rotateY(0) translateZ(0)"
      })
    })

    // 리플 효과 추가
    document.querySelectorAll(".action-card, .activity-item").forEach((element) => {
      element.addEventListener("click", (e) => {
        this.createRippleEffect(e, element)
      })
    })
  }

  createRippleEffect(event, element) {
    const ripple = document.createElement("div")
    ripple.className = "ripple-effect"

    const rect = element.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height)
    const x = event.clientX - rect.left - size / 2
    const y = event.clientY - rect.top - size / 2

    ripple.style.cssText = `
      position: absolute;
      border-radius: 50%;
      background: rgba(84, 60, 82, 0.3);
      transform: scale(0);
      animation: ripple 0.6s linear;
      pointer-events: none;
      z-index: 1;
      width: ${size}px;
      height: ${size}px;
      left: ${x}px;
      top: ${y}px;
    `

    element.style.position = "relative"
    element.style.overflow = "hidden"
    element.appendChild(ripple)

    setTimeout(() => ripple.remove(), 600)
  }

  showToast(message, type = "info") {
    const toast = this.elements.toast
    if (!toast) return

    const toastIcon = toast.querySelector(".toast-icon")
    const toastMessage = toast.querySelector(".toast-message")

    // 아이콘 설정
    const icons = {
      success: "fas fa-check-circle",
      error: "fas fa-exclamation-circle",
      warning: "fas fa-exclamation-triangle",
      info: "fas fa-info-circle",
    }

    toastIcon.className = `toast-icon ${icons[type] || icons.info}`
    toastMessage.textContent = message

    // 토스트 타입 클래스 설정
    toast.className = `toast ${type}`

    // 토스트 표시
    toast.classList.add("show")

    // 자동 숨김
    setTimeout(() => {
      toast.classList.remove("show")
    }, 4000)
  }

  navigateWithAnimation(page) {
    // 페이지 전환 애니메이션
    document.body.style.transition = "opacity 0.3s ease-out"
    document.body.style.opacity = "0.7"

    setTimeout(() => {
      window.location.href = page
    }, 300)
  }
}

// CSS 애니메이션 추가
const style = document.createElement("style")
style.textContent = `
  @keyframes ripple {
    to {
      transform: scale(4);
      opacity: 0;
    }
  }
  
  .action-card {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .action-card.animate-in {
    animation: slideUp 0.6s ease-out forwards;
  }
  
  .activity-item {
    position: relative;
    overflow: hidden;
  }
  
  .activity-item.animate-in {
    animation: slideInLeft 0.6s ease-out forwards;
  }
  
  @keyframes slideInLeft {
    from {
      opacity: 0;
      transform: translateX(-30px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  .gauge-fill {
    position: relative;
  }
  
  .gauge-fill::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%);
    animation: shimmer 2s infinite;
  }
  
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
`
document.head.appendChild(style)

// 페이지 로드 완료 후 초기화
document.addEventListener("DOMContentLoaded", () => {
  const myPageSystem = new MyPageSystem()

  // 페이지 로드 애니메이션
  document.body.style.opacity = "0"
  document.body.style.transition = "opacity 0.5s ease-in"

  setTimeout(() => {
    document.body.style.opacity = "1"
  }, 100)

  // 환영 메시지
  setTimeout(() => {
    myPageSystem.showToast("마이페이지에 오신 것을 환영합니다!", "success")
  }, 1000)
})

// 브라우저 뒤로가기 처리
window.addEventListener("popstate", (e) => {
  // 필요시 상태 복원 로직 추가
})

// 페이지 가시성 변경 처리
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    // 페이지가 숨겨졌을 때
    console.log("Page hidden")
  } else {
    // 페이지가 다시 보일 때
    console.log("Page visible")
    // 실시간 데이터 새로고침
    if (window.myPageSystem) {
      window.myPageSystem.updateTemperatureGauge()
    }
  }
})
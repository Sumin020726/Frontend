//mainmenu.js
// 세련된 메인 메뉴 시스템

class MainMenuSystem {
  constructor() {
    this.navItems = document.querySelectorAll(".nav-item")
    this.buildingCards = document.querySelectorAll(".building-card")
    this.actionCards = document.querySelectorAll(".action-card")
    this.logoutBtn = document.querySelector(".logout-btn")
    this.toast = document.getElementById("toast")

    this.routes = {
      "mainmenu.html": "강의실 목록",
      "classroom-search1.html": "IT 1호관",
      "classroom-search2.html": "IT 5호관",
      "mypage.html": "마이페이지",
      "usage-history.html": "이용 내역",
      "point.html": "보증 포인트",
    }

    this.init()
  }

  init() {
    this.bindEvents()
    this.addAnimations()
    this.updateRealTimeData()
    this.startRealTimeUpdates()
  }

  bindEvents() {
    // 네비게이션 아이템 클릭
    this.navItems.forEach((item) => {
      item.addEventListener("click", (e) => this.handleNavigation(e, item))
    })
    this.navHeaders = document.querySelectorAll(".nav-group-header")
    this.navHeaders.forEach((header) => {
    header.addEventListener("click", (e) => this.handleNavigation(e, header))
    })


    // 건물 카드 클릭
    this.buildingCards.forEach((card) => {
      const selectBtn = card.querySelector(".select-building-btn")
      selectBtn.addEventListener("click", (e) => this.handleBuildingSelection(e, card))

      // 카드 전체 클릭도 가능하게
      card.addEventListener("click", (e) => {
        if (!e.target.closest(".select-building-btn")) {
          this.handleBuildingSelection(e, card)
        }
      })
    })

    // 빠른 실행 카드 클릭
    this.actionCards.forEach((card) => {
      card.addEventListener("click", (e) => this.handleQuickAction(e, card))
    })

    // 로그아웃 버튼
    this.logoutBtn.addEventListener("click", () => this.handleLogout())

    // 키보드 단축키
    document.addEventListener("keydown", (e) => this.handleKeyboardShortcuts(e))
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

    // 건물 카드 애니메이션
    this.buildingCards.forEach((card, index) => {
      card.dataset.delay = index * 200
      observer.observe(card)
    })

    // 빠른 실행 카드 애니메이션
    this.actionCards.forEach((card, index) => {
      card.dataset.delay = (index + 2) * 100
      observer.observe(card)
    })

    // 호버 효과 개선
    this.addAdvancedHoverEffects()
  }

  addAdvancedHoverEffects() {
    // 건물 카드 3D 효과
    this.buildingCards.forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top

        const centerX = rect.width / 2
        const centerY = rect.height / 2

        const rotateX = (y - centerY) / 10
        const rotateY = (centerX - x) / 10

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`
      })

      card.addEventListener("mouseleave", () => {
        card.style.transform = "perspective(1000px) rotateX(0) rotateY(0) translateZ(0)"
      })
    })

    // 리플 효과 추가
    document.querySelectorAll(".select-building-btn, .action-card").forEach((element) => {
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
      background: rgba(255, 255, 255, 0.6);
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

  handleNavigation(event, item) {
    event.preventDefault()

    const page = item.dataset.page
    if (!page) return

    // 네비게이션 상태 업데이트
    this.updateNavState(item)

    // 페이지 이동 애니메이션
    this.navigateWithAnimation(page)
  }

  updateNavState(activeItem) {
    // 모든 네비게이션 아이템에서 active 클래스 제거
    this.navItems.forEach((item) => item.classList.remove("active"))

    // 선택된 아이템에 active 클래스 추가
    activeItem.classList.add("active")

    // 토스트 알림
    const pageName = this.routes[activeItem.dataset.page] || "페이지"
    this.showToast(`${pageName}로 이동합니다.`, "info")
  }

  handleBuildingSelection(event, card) {
    event.preventDefault()

    const building = card.dataset.building
    const buildingName = card.querySelector("h3").textContent

    // 선택 효과
    this.addSelectionEffect(card)

    // 로딩 상태
    const btn = card.querySelector(".select-building-btn")
    this.setButtonLoading(btn, true)

    setTimeout(() => {
      this.setButtonLoading(btn, false)

      if (building === "it1") {
        this.navigateWithAnimation("classroom-search1.html")
      } else if (building === "it5") {
        this.navigateWithAnimation("classroom-search2.html")
      }

      this.showToast(`${buildingName} 강의실 목록을 불러옵니다.`, "success")
    }, 1000)
  }

  addSelectionEffect(card) {
    card.style.transform = "scale(0.98)"
    card.style.boxShadow = "0 5px 15px rgba(84, 60, 82, 0.3)"

    setTimeout(() => {
      card.style.transform = ""
      card.style.boxShadow = ""
    }, 200)
  }

  setButtonLoading(button, isLoading) {
    const text = button.querySelector("span")
    const icon = button.querySelector("i")

    if (isLoading) {
      button.disabled = true
      text.textContent = "로딩 중..."
      icon.className = "fas fa-spinner fa-spin"
      button.style.pointerEvents = "none"
    } else {
      button.disabled = false
      text.textContent = "선택하기"
      icon.className = "fas fa-arrow-right"
      button.style.pointerEvents = ""
    }
  }

  handleQuickAction(event, card) {
    event.preventDefault()

    const actionText = card.querySelector("span").textContent

    // 액션별 처리
    switch (actionText) {
      case "빈 강의실 검색":
        this.showToast("빈 강의실 검색 기능을 준비 중입니다.", "info")
        break
      case "예약 현황":
        this.navigateWithAnimation("usage-history.html")
        break
      case "이용 통계":
        this.showToast("이용 통계 기능을 준비 중입니다.", "info")
        break
      default:
        this.showToast("기능을 준비 중입니다.", "info")
    }
  }

  handleLogout() {
    if (confirm("정말 로그아웃하시겠습니까?")) {
      this.showToast("로그아웃 중입니다...", "info")

      setTimeout(() => {
        this.navigateWithAnimation("login.html")
      }, 1500)
    }
  }

  handleKeyboardShortcuts(event) {
    // Ctrl + 1: IT 1호관
    if (event.ctrlKey && event.key === "1") {
      event.preventDefault()
      this.navigateWithAnimation("classroom-search1.html")
    }

    // Ctrl + 2: IT 5호관
    if (event.ctrlKey && event.key === "2") {
      event.preventDefault()
      this.navigateWithAnimation("classroom-search2.html")
    }

    // Ctrl + M: 마이페이지
    if (event.ctrlKey && event.key === "m") {
      event.preventDefault()
      this.navigateWithAnimation("usage-history.html")
    }
    

    // ESC: 알림 닫기
    if (event.key === "Escape") {
      this.hideToast()
    }
  }

  navigateWithAnimation(page) {
    // 페이지 전환 애니메이션
    document.body.style.transition = "opacity 0.3s ease-out"
    document.body.style.opacity = "0.7"

    setTimeout(() => {
      window.location.href = page
    }, 300)
  }

  updateRealTimeData() {
    // 실시간 데이터 업데이트 시뮬레이션
    const updateAvailableRooms = () => {
      const it1Rooms = Math.floor(Math.random() * 8) + 3 // 3-10개
      const it5Rooms = Math.floor(Math.random() * 6) + 2 // 2-7개

      // 네비게이션 배지 업데이트
      const navBadges = document.querySelectorAll(".nav-badge")
      if (navBadges[0]) navBadges[0].textContent = it1Rooms
      if (navBadges[1]) navBadges[1].textContent = it5Rooms

      // 카드 통계 업데이트
      const statNumbers = document.querySelectorAll(".stat-number")
      if (statNumbers[0]) statNumbers[0].textContent = it1Rooms
      if (statNumbers[2]) statNumbers[2].textContent = it5Rooms
    }

    updateAvailableRooms()
  }

  startRealTimeUpdates() {
    // 30초마다 데이터 업데이트
    setInterval(() => {
      this.updateRealTimeData()
    }, 30000)

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

  showToast(message, type = "info") {
    const toastContent = this.toast.querySelector(".toast-content")
    const toastIcon = this.toast.querySelector(".toast-icon")
    const toastMessage = this.toast.querySelector(".toast-message")

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
    this.toast.className = `toast ${type}`

    // 토스트 표시
    this.toast.classList.add("show")

    // 자동 숨김
    setTimeout(() => {
      this.hideToast()
    }, 4000)
  }

  hideToast() {
    this.toast.classList.remove("show")
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
  
  .building-card {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .building-card.animate-in {
    animation: slideUp 0.6s ease-out forwards;
  }
  
  .action-card {
    position: relative;
    overflow: hidden;
  }
  
  .select-building-btn {
    position: relative;
    overflow: hidden;
  }
  
  .nav-item {
    position: relative;
  }
  
  .nav-item::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 3px;
    background: var(--secondary-color);
    transform: scaleY(0);
    transition: transform 0.3s ease;
  }
  
  .nav-item.active::before {
    transform: scaleY(1);
  }
  
  .building-card:hover .building-icon {
    transform: scale(1.1) rotate(5deg);
  }
  
  .building-icon {
    transition: transform 0.3s ease;
  }
`
document.head.appendChild(style)

// 페이지 로드 완료 후 초기화
document.addEventListener("DOMContentLoaded", () => {
  new MainMenuSystem()

  // 페이지 로드 애니메이션
  document.body.style.opacity = "0"
  document.body.style.transition = "opacity 0.5s ease-in"

  setTimeout(() => {
    document.body.style.opacity = "1"
  }, 100)

  // 환영 메시지
  setTimeout(() => {
    const mainMenu = new MainMenuSystem()
    mainMenu.showToast("경북대학교 강의실 예약 시스템에 오신 것을 환영합니다!", "success")
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
    if (window.mainMenuSystem) {
      window.mainMenuSystem.updateRealTimeData()
    }
  }
})
// 사이드바 네비게이션 이벤트 (기존 코드 복원)
document.querySelectorAll('.sidebar-button, .sidebar-sub').forEach(btn => {
  if (btn.dataset.page) {
    btn.addEventListener('click', () => {
      window.location.href = btn.dataset.page;
    });
  }
});



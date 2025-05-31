class PointsSystem {
  constructor() {
    // 로컬 스토리지에서 포인트 불러오기
    const storedPoints = localStorage.getItem("userPoints")
    this.currentPoints = storedPoints ? Number.parseInt(storedPoints, 10) : 100

    // 로컬 스토리지에서 포인트 이력 불러오기
    const storedHistory = localStorage.getItem("pointHistory")
    this.historyData = storedHistory
      ? JSON.parse(storedHistory)
      : [
          {
            id: 1,
            type: "plus",
            title: "신고 보상",
            description: "부정 이용 신고 접수 완료",
            points: 10,
            date: "2025-05-21 14:30",
          },
          {
            id: 3,
            type: "minus",
            title: "미퇴실",
            description: "예약 시간 종료 후 미퇴실",
            points: -15,
            date: "2025-05-18 18:00",
          },
          {
            id: 4,
            type: "plus",
            title: "정상 이용",
            description: "IT1-101 강의실 정상 이용 완료",
            points: 5,
            date: "2025-05-15 14:00",
          },
          {
            id: 5,
            type: "plus",
            title: "첫 이용 보너스",
            description: "강의실 예약 시스템 첫 이용",
            points: 100,
            date: "2025-05-10 10:00",
          },
        ]

    this.currentFilter = "all"

    this.elements = {
      pointsNumber: document.querySelector(".points-number"),
      pointsStatus: document.querySelector(".points-status"),
      gaugeFill: document.querySelector(".gauge-fill"),
      filterBtns: document.querySelectorAll(".filter-btn"),
      historyList: document.querySelector(".history-list"),
      historyEmpty: document.querySelector(".history-empty"),
      toast: document.getElementById("toast"),
    }

    this.init()
  }

  // Add method to add new point history entries
  addPointHistoryEntry(title, description, points, roomName = null) {
    const now = new Date()
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`

    const newEntry = {
      id: Date.now(),
      type: points > 0 ? "plus" : "minus",
      title: title,
      description: roomName ? `${description} (${roomName})` : description,
      points: points,
      date: formattedDate,
    }

    // Add to the beginning of the array
    this.historyData.unshift(newEntry)

    // Save to localStorage
    this.saveHistoryToStorage()

    // Re-render the history
    this.renderHistory()

    // 애니메이션 효과 추가
    setTimeout(() => {
      this.animateHistoryItems()
    }, 100)

    console.log("포인트 이력 추가됨:", newEntry)
  }

  // 포인트 이력을 로컬 스토리지에 저장
  saveHistoryToStorage() {
    localStorage.setItem("pointHistory", JSON.stringify(this.historyData))
  }

  // Modify the init method to listen for point change events
  init() {
    this.bindEvents()
    this.updatePointsDisplay()
    this.renderHistory()

    // Listen for custom point events from other pages
    document.addEventListener("pointsEarned", (e) => {
      const { amount, reason, description, roomName } = e.detail
      this.addPointHistoryEntry(reason, description, amount, roomName)

      // 포인트 업데이트 (이미 localStorage에서 업데이트된 경우 중복 방지)
      const storedPoints = localStorage.getItem("userPoints")
      if (storedPoints) {
        this.currentPoints = Number.parseInt(storedPoints, 10)
        this.updatePointsDisplay()
      }
    })

    // Listen for point changes
    window.addEventListener("storage", (e) => {
      if (e.key === "userPoints") {
        const oldPoints = this.currentPoints
        const newPoints = Number.parseInt(e.newValue, 10)

        this.currentPoints = newPoints
        this.updatePointsDisplay()
      } else if (e.key === "pointHistory") {
        // Reload history from localStorage
        const history = JSON.parse(e.newValue)
        if (history && Array.isArray(history)) {
          this.historyData = history
          this.renderHistory()
        }
      }
    })

    // 페이지 로드 시 localStorage에서 최신 데이터 확인
    const storedHistory = localStorage.getItem("pointHistory")
    if (storedHistory) {
      try {
        const parsedHistory = JSON.parse(storedHistory)
        if (Array.isArray(parsedHistory) && parsedHistory.length > 0) {
          this.historyData = parsedHistory
          this.renderHistory()
        }
      } catch (e) {
        console.error("포인트 이력 파싱 오류:", e)
      }
    }

    this.addAnimations()
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

    // 필터 버튼 클릭
    this.elements.filterBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        this.elements.filterBtns.forEach((b) => b.classList.remove("active"))
        btn.classList.add("active")
        this.currentFilter = btn.dataset.filter
        this.renderHistory()
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

      // Ctrl + M: 마이페이지
      if (e.ctrlKey && e.key === "m") {
        e.preventDefault()
        this.navigateWithAnimation("mypage.html")
      }

      // Ctrl + U: 이용 내역
      if (e.ctrlKey && e.key === "u") {
        e.preventDefault()
        this.navigateWithAnimation("usage-history.html")
      }

      // 숫자 키로 필터 변경
      if (e.key === "1") {
        this.setFilter("all")
      } else if (e.key === "2") {
        this.setFilter("plus")
      } else if (e.key === "3") {
        this.setFilter("minus")
      }
    })
  }

  updatePointsDisplay() {
    // 포인트 숫자 업데이트
    if (this.elements.pointsNumber) {
      this.elements.pointsNumber.textContent = this.currentPoints
    }

    // 포인트 상태 업데이트
    if (this.elements.pointsStatus) {
      let statusClass = "good"
      let statusText = "양호"
      let statusIcon = "fas fa-check-circle"

      if (this.currentPoints < 30) {
        statusClass = "danger"
        statusText = "위험"
        statusIcon = "fas fa-exclamation-triangle"
      } else if (this.currentPoints < 70) {
        statusClass = "warning"
        statusText = "주의"
        statusIcon = "fas fa-exclamation-circle"
      }

      this.elements.pointsStatus.className = `points-status ${statusClass}`
      this.elements.pointsStatus.innerHTML = `
      <i class="${statusIcon}"></i>
      <span>${statusText}</span>
    `
    }

    // 게이지 업데이트 - 수정된 부분
    if (this.elements.gaugeFill) {
      const percent = (Math.min(Math.max(this.currentPoints, 0), 150) / 150) * 100
      console.log("Setting gauge width to:", percent + "%")
      this.elements.gaugeFill.style.width = `${percent}%`

      // Force a repaint to ensure the gauge is visible
      this.elements.gaugeFill.offsetHeight
    }

    // 사이드바 포인트 배지 업데이트
    this.updatePointBadge()

    // 로컬 스토리지에 포인트 저장 (다른 페이지와 동기화)
    localStorage.setItem("userPoints", this.currentPoints.toString())
  }

  updatePointBadge() {
    const pointBadges = document.querySelectorAll(".nav-badge.point")
    pointBadges.forEach((badge) => {
      badge.textContent = `${this.currentPoints}P`
    })
  }

  renderHistory() {
    let filteredHistory = this.historyData

    // 필터 적용
    if (this.currentFilter === "plus") {
      filteredHistory = this.historyData.filter((item) => item.type === "plus")
    } else if (this.currentFilter === "minus") {
      filteredHistory = this.historyData.filter((item) => item.type === "minus")
    }

    // 히스토리 렌더링
    if (filteredHistory.length === 0) {
      this.elements.historyList.style.display = "none"
      this.elements.historyEmpty.style.display = "block"
    } else {
      this.elements.historyList.style.display = "flex"
      this.elements.historyEmpty.style.display = "none"

      this.elements.historyList.innerHTML = filteredHistory
        .map(
          (item) => `
        <div class="history-item ${item.type}" data-type="${item.type}">
          <div class="history-icon ${item.type}">
            <i class="fas fa-${item.type === "plus" ? "plus" : "minus"}"></i>
          </div>
          <div class="history-content">
            <h4>${item.title}</h4>
            <p>${item.description}</p>
            <span class="history-date">${item.date}</span>
          </div>
          <div class="history-points ${item.type}">
            <span>${item.points > 0 ? "+" : ""}${item.points}P</span>
          </div>
        </div>
      `,
        )
        .join("")

      // 애니메이션 적용
      this.animateHistoryItems()
    }
  }

  animateHistoryItems() {
    const items = document.querySelectorAll(".history-item")
    items.forEach((item, index) => {
      item.style.opacity = "0"
      item.style.transform = "translateX(-20px)"
      setTimeout(() => {
        item.style.transition = "all 0.3s ease"
        item.style.opacity = "1"
        item.style.transform = "translateX(0)"
      }, index * 100)
    })
  }

  setFilter(filter) {
    this.currentFilter = filter
    this.elements.filterBtns.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.filter === filter)
    })
    this.renderHistory()
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

    // 카드들에 애니메이션 적용
    document
      .querySelectorAll(".current-points-card, .points-history-card, .points-guide-card")
      .forEach((card, index) => {
        card.dataset.delay = index * 200
        observer.observe(card)
      })

    // 호버 효과 개선
    this.addAdvancedHoverEffects()
  }

  addAdvancedHoverEffects() {
    // 히스토리 아이템 호버 효과
    document.addEventListener("mouseover", (e) => {
      const historyItem = e.target.closest(".history-item")
      if (historyItem) {
        historyItem.style.transform = "translateX(8px) scale(1.02)"
      }
    })

    document.addEventListener("mouseout", (e) => {
      const historyItem = e.target.closest(".history-item")
      if (historyItem) {
        historyItem.style.transform = "translateX(0) scale(1)"
      }
    })

    // 리플 효과 추가
    document.querySelectorAll(".filter-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        this.createRippleEffect(e, btn)
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

  // Add a method to check for active reservations and update badges
  updateHistoryBadge() {
    const reservations = JSON.parse(localStorage.getItem("reservations")) || []
    const activeReservations = reservations.filter((r) => r.status === "reserved" || r.status === "active")

    const historyBadges = document.querySelectorAll('.nav-item[data-page="usage-history.html"] .nav-badge')
    historyBadges.forEach((badge) => {
      if (activeReservations.length > 0) {
        badge.textContent = activeReservations.length
        badge.style.display = "flex"
      } else {
        badge.style.display = "none"
      }
    })
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
  
  .history-item {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .filter-btn {
    position: relative;
    overflow: hidden;
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
  
  .points-icon {
    animation: coinSpin 3s ease-in-out infinite;
  }
  
  @keyframes coinSpin {
    0%, 100% { transform: rotateY(0deg); }
    50% { transform: rotateY(180deg); }
  }
`
document.head.appendChild(style)

// Call updateHistoryBadge when the page loads
document.addEventListener("DOMContentLoaded", () => {
  const pointsSystem = new PointsSystem()
  window.pointsSystem = pointsSystem

  // Update history badge
  pointsSystem.updateHistoryBadge()

  // Page load animation
  document.body.style.opacity = "0"
  document.body.style.transition = "opacity 0.5s ease-in"

  setTimeout(() => {
    document.body.style.opacity = "1"
  }, 100)

  // Welcome message
  setTimeout(() => {
    pointsSystem.showToast("보증 포인트 페이지에 오신 것을 환영합니다!", "success")
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
    if (window.pointsSystem) {
      window.pointsSystem.updatePointsDisplay()
    }
  }
})

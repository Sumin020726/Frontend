//usage-history.js
// 세련된 이용 내역 시스템

class UsageHistorySystem {
  constructor() {
    this.currentStatus = "reserved" // reserved, active, completed
    this.countdownInterval = null

    this.elements = {
      roomStatus: document.getElementById("room-status"),
      changeStatusBtn: document.getElementById("change-status-btn"),
      cancelBtn: document.getElementById("cancel-btn"),
      exitBtn: document.getElementById("exit-btn"),
      countdown: document.getElementById("countdown"),
      currentRoom: document.getElementById("current-room"),
      toast: document.getElementById("toast"),
      modal: document.getElementById("confirmModal"),
      modalTitle: document.getElementById("modal-title"),
      modalMessage: document.getElementById("modal-message"),
      modalConfirm: document.getElementById("modal-confirm"),
      modalCancel: document.getElementById("modal-cancel"),
      closeModalBtn: document.querySelector(".close-modal-btn"),
    }

    this.init()
  }

  init() {
    this.bindEvents()
    this.startCountdown()
    this.addAnimations()
  }

  bindEvents() {
    // 사용 중 변경 버튼
    if (this.elements.changeStatusBtn) {
      this.elements.changeStatusBtn.addEventListener("click", () => {
        this.showConfirmModal("사용 중 변경", "강의실 사용을 시작하시겠습니까?", () => this.changeToActive())
      })
    }

    // 예약 취소 버튼
    if (this.elements.cancelBtn) {
      this.elements.cancelBtn.addEventListener("click", () => {
        this.showConfirmModal("예약 취소", "정말 예약을 취소하시겠습니까?\n취소된 예약은 복구할 수 없습니다.", () =>
          this.cancelReservation(),
        )
      })
    }

    // 퇴실 인증 버튼
    if (this.elements.exitBtn) {
      this.elements.exitBtn.addEventListener("click", () => {
        this.showConfirmModal("퇴실 인증", "퇴실 인증을 진행하시겠습니까?\n인증 후 강의실 이용이 종료됩니다.", () =>
          this.exitRoom(),
        )
      })
    }

    // 모달 이벤트
    if (this.elements.modalCancel) {
      this.elements.modalCancel.addEventListener("click", () => this.closeModal())
    }

    if (this.elements.closeModalBtn) {
      this.elements.closeModalBtn.addEventListener("click", () => this.closeModal())
    }

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

    // 로그아웃 버튼
    document.querySelector(".logout-btn").addEventListener("click", () => {
      if (confirm("정말 로그아웃하시겠습니까?")) {
        this.showToast("로그아웃 중입니다...", "info")
        setTimeout(() => {
          this.navigateWithAnimation("login.html")
        }, 1500)
      }
    })

    // 전체 보기 버튼
    document.querySelector(".view-all-btn")?.addEventListener("click", () => {
      this.showToast("전체 이용 내역 기능을 준비 중입니다.", "info")
    })

    // 빈 상태 액션 버튼
    document.querySelector(".empty-action-btn")?.addEventListener("click", () => {
      this.navigateWithAnimation("classroom-search1.html")
    })

    // 키보드 단축키
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.closeModal()
      }

      // Ctrl + 1: 사용 중 변경
      if (e.ctrlKey && e.key === "1" && this.currentStatus === "reserved") {
        e.preventDefault()
        this.elements.changeStatusBtn.click()
      }

      // Ctrl + 2: 예약 취소
      if (e.ctrlKey && e.key === "2" && this.currentStatus === "reserved") {
        e.preventDefault()
        this.elements.cancelBtn.click()
      }

      // Ctrl + 3: 퇴실 인증
      if (e.ctrlKey && e.key === "3") {
        e.preventDefault()
        this.elements.exitBtn.click()
      }
    })
  }

  changeToActive() {
    this.currentStatus = "active"

    // 상태 표시 업데이트
    if (this.elements.roomStatus) {
      this.elements.roomStatus.innerHTML = `
        <i class="fas fa-play"></i>
        <span>사용 중</span>
      `
      this.elements.roomStatus.classList.remove("status-reserved")
      this.elements.roomStatus.classList.add("status-active")
    }

    // 사용 중 변경 버튼 숨기기
    if (this.elements.changeStatusBtn) {
      this.elements.changeStatusBtn.style.display = "none"
    }

    // 예약 취소 버튼 비활성화
    if (this.elements.cancelBtn) {
      this.elements.cancelBtn.disabled = true
      this.elements.cancelBtn.style.opacity = "0.5"
      this.elements.cancelBtn.style.cursor = "not-allowed"
    }

    this.showToast("강의실 사용이 시작되었습니다!", "success")
    this.closeModal()
  }

  cancelReservation() {
    // 현재 이용 중인 강의실 카드 제거
    if (this.elements.currentRoom) {
      this.elements.currentRoom.style.transition = "all 0.5s ease-out"
      this.elements.currentRoom.style.transform = "translateX(-100%)"
      this.elements.currentRoom.style.opacity = "0"

      setTimeout(() => {
        this.elements.currentRoom.remove()
        this.showEmptyState()
      }, 500)
    }

    // 카운트다운 중지
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval)
    }

    this.showToast("예약이 취소되었습니다.", "info")
    this.closeModal()
  }

  exitRoom() {
    // 현재 이용 중인 강의실 카드 제거
    if (this.elements.currentRoom) {
      this.elements.currentRoom.style.transition = "all 0.5s ease-out"
      this.elements.currentRoom.style.transform = "scale(0.8)"
      this.elements.currentRoom.style.opacity = "0"

      setTimeout(() => {
        this.elements.currentRoom.remove()
        this.showEmptyState()
      }, 500)
    }

    // 카운트다운 중지
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval)
    }

    this.showToast("퇴실 인증이 완료되었습니다!", "success")
    this.closeModal()
  }

  showEmptyState() {
    const currentSection = document.querySelector(".current-usage-section")
    if (currentSection) {
      currentSection.innerHTML = `
        <div class="section-header">
          <h2>
            <i class="fas fa-door-open"></i>
            현재 이용 중
          </h2>
        </div>
        <div class="empty-state">
          <i class="fas fa-inbox"></i>
          <h3>현재 이용 중인 강의실이 없습니다</h3>
          <p>강의실을 예약하고 이용해보세요!</p>
          <button class="empty-action-btn" onclick="window.location.href='classroom-search1.html'">
            <i class="fas fa-plus"></i>
            <span>강의실 예약하기</span>
          </button>
        </div>
      `
    }
  }

  startCountdown() {
    // 예시: 1시간 20분 = 80분
    let remainingMinutes = 80

    this.countdownInterval = setInterval(() => {
      if (remainingMinutes <= 0) {
        clearInterval(this.countdownInterval)
        this.elements.countdown.textContent = "시간 종료"
        this.elements.countdown.style.color = "var(--error-color)"
        return
      }

      const hours = Math.floor(remainingMinutes / 60)
      const minutes = remainingMinutes % 60

      let timeText = ""
      if (hours > 0) {
        timeText = `약 ${hours}시간 ${minutes}분`
      } else {
        timeText = `약 ${minutes}분`
      }

      if (this.elements.countdown) {
        this.elements.countdown.textContent = timeText
      }

      // 30분 이하일 때 경고 색상
      if (remainingMinutes <= 30) {
        this.elements.countdown.style.color = "var(--error-color)"
      } else if (remainingMinutes <= 60) {
        this.elements.countdown.style.color = "var(--warning-color)"
      }

      remainingMinutes--
    }, 60000) // 1분마다 업데이트 (실제로는 1초마다 할 수도 있음)
  }

  showConfirmModal(title, message, onConfirm) {
    if (this.elements.modalTitle) {
      this.elements.modalTitle.textContent = title
    }

    if (this.elements.modalMessage) {
      this.elements.modalMessage.textContent = message
    }

    // 기존 이벤트 리스너 제거 후 새로 추가
    if (this.elements.modalConfirm) {
      const newConfirmBtn = this.elements.modalConfirm.cloneNode(true)
      this.elements.modalConfirm.parentNode.replaceChild(newConfirmBtn, this.elements.modalConfirm)
      this.elements.modalConfirm = newConfirmBtn

      this.elements.modalConfirm.addEventListener("click", () => {
        onConfirm()
      })
    }

    this.elements.modal.classList.add("show")
    document.body.style.overflow = "hidden"
  }

  closeModal() {
    this.elements.modal.classList.remove("show")
    document.body.style.overflow = ""
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

    // 섹션들에 애니메이션 적용
    document
      .querySelectorAll(".current-usage-section, .usage-stats-section, .recent-history-section")
      .forEach((section, index) => {
        section.dataset.delay = index * 200
        observer.observe(section)
      })

    // 통계 카드 호버 효과
    document.querySelectorAll(".stat-card").forEach((card) => {
      card.addEventListener("mouseenter", () => {
        card.style.transform = "translateY(-8px) scale(1.02)"
      })

      card.addEventListener("mouseleave", () => {
        card.style.transform = "translateY(0) scale(1)"
      })
    })

    // 히스토리 아이템 애니메이션
    this.animateHistoryItems()
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
  .action-btn {
    position: relative;
    overflow: hidden;
  }
  
  .action-btn::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    transition: left 0.5s;
  }
  
  .action-btn:hover::before {
    left: 100%;
  }
  
  .stat-card {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .history-item {
    transition: all 0.3s ease;
  }
  
  .room-icon {
    animation: doorOpen 2s ease-in-out infinite;
  }
  
  @keyframes doorOpen {
    0%, 100% { transform: rotateY(0deg); }
    50% { transform: rotateY(15deg); }
  }
`
document.head.appendChild(style)

// 페이지 로드 완료 후 초기화
document.addEventListener("DOMContentLoaded", () => {
  const usageHistorySystem = new UsageHistorySystem()

  // 페이지 로드 애니메이션
  document.body.style.opacity = "0"
  document.body.style.transition = "opacity 0.5s ease-in"

  setTimeout(() => {
    document.body.style.opacity = "1"
  }, 100)

  // 환영 메시지
  setTimeout(() => {
    usageHistorySystem.showToast("이용 내역 페이지에 오신 것을 환영합니다!", "success")
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
    if (window.usageHistorySystem) {
      window.usageHistorySystem.startCountdown()
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

//classroom-search2.js - 잠금된 강의실 입장 제한 추가

// 세련된 강의실 목록 시스템

class ClassroomSystem {
  constructor() {
    this.classrooms = [
      {
        id: 1,
        name: "IT5-101",
        probability: 85,
        isLocked: false,
        inUse: true,
      },
      {
        id: 2,
        name: "IT5-103",
        probability: 60,
        isLocked: true,
        inUse: false,
      },
      {
        id: 3,
        name: "IT5-106",
        probability: 90,
        isLocked: false,
        inUse: true,
      },
      {
        id: 4,
        name: "IT5-204",
        probability: 45,
        isLocked: true,
        inUse: false,
      },
      {
        id: 5,
        name: "IT5-208",
        probability: 70,
        isLocked: false,
        inUse: true,
      },
      {
        id: 6,
        name: "IT5-301",
        probability: 95,
        isLocked: false,
        inUse: false,
      },
      {
        id: 7,
        name: "IT5-305",
        probability: 30,
        isLocked: false,
        inUse: true,
      },
      {
        id: 8,
        name: "IT5-307",
        probability: 75,
        isLocked: false,
        inUse: false,
      },
    ]

    this.currentFilter = "all"
    this.searchTerm = ""

    this.elements = {
      tableBody: document.getElementById("classroomTableBody"),
      searchInput: document.getElementById("searchInput"),
      refreshBtn: document.getElementById("refreshBtn"),
      filterBtns: document.querySelectorAll(".filter-btn"),
      lastUpdate: document.getElementById("lastUpdate"),
      toast: document.getElementById("toast"),
      modal: document.getElementById("entryModal"),
      selectedRoom: document.getElementById("selectedRoom"),
      confirmEntryBtn: document.getElementById("confirmEntryBtn"),
      cancelEntryBtn: document.getElementById("cancelEntryBtn"),
      closeModalBtn: document.querySelector(".close-modal-btn"),
    }

    this.init()
  }

  init() {
    this.renderClassrooms()
    this.bindEvents()
    this.updateLastUpdateTime()
    this.addAnimations()
  }

  bindEvents() {
    // 검색 기능
    this.elements.searchInput.addEventListener("input", (e) => {
      this.searchTerm = e.target.value.toLowerCase()
      this.renderClassrooms()
    })
    this.navHeaders = document.querySelectorAll(".nav-group-header")
    this.navHeaders.forEach((header) => {
      header.addEventListener("click", (e) => this.handleNavigation(e, header))
    })

    // 새로고침 버튼
    this.elements.refreshBtn.addEventListener("click", () => this.refreshData())

    // 필터 버튼
    this.elements.filterBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        this.elements.filterBtns.forEach((b) => b.classList.remove("active"))
        btn.classList.add("active")
        this.currentFilter = btn.dataset.filter
        this.renderClassrooms()
      })
    })

    // 모달 닫기 버튼
    this.elements.closeModalBtn.addEventListener("click", () => this.closeModal())
    this.elements.cancelEntryBtn.addEventListener("click", () => this.closeModal())

    // 모달 확인 버튼
    this.elements.confirmEntryBtn.addEventListener("click", () => this.handleEntryConfirm())

    // 네비게이션 아이템 클릭
    document.querySelectorAll(".nav-item").forEach((item) => {
      item.addEventListener("click", () => {
        const page = item.dataset.page
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

    // 키보드 단축키
    document.addEventListener("keydown", (e) => {
      // ESC 키로 모달 닫기
      if (e.key === "Escape" && this.elements.modal.classList.contains("show")) {
        this.closeModal()
      }

      // F5 키 대신 Ctrl+R로 새로고침
      if (e.ctrlKey && e.key === "r") {
        e.preventDefault()
        this.refreshData()
      }

      // Ctrl+F로 검색창 포커스
      if (e.ctrlKey && e.key === "f") {
        e.preventDefault()
        this.elements.searchInput.focus()
      }
    })

    // 클릭 이벤트 위임 (테이블 내 입장 버튼)
    this.elements.tableBody.addEventListener("click", (e) => {
      const entryBtn = e.target.closest(".entry-btn")
      if (entryBtn) {
        const roomId = entryBtn.dataset.roomId
        const room = this.classrooms.find((r) => r.id === Number.parseInt(roomId))
        if (room) {
          // 잠금된 강의실 입장 제한 검사
          if (room.isLocked) {
            this.showToast("잠금된 강의실은 입장할 수 없습니다.", "error")
            return
          }
          this.openEntryModal(room)
        }
      }
    })

    // 네비게이션 그룹 헤더 클릭 (강의실 목록 -> 메인메뉴)
    document.querySelectorAll(".nav-group-header").forEach((header) => {
      header.addEventListener("click", () => {
        const page = header.dataset.page
        if (page) {
          this.navigateWithAnimation(page)
        }
      })
    })
  }

  renderClassrooms() {
    // 필터링 및 검색 적용
    const filteredClassrooms = this.classrooms.filter((room) => {
      // 검색어 필터링
      const matchesSearch = room.name.toLowerCase().includes(this.searchTerm)

      // 확률 필터링
      let matchesFilter = true
      if (this.currentFilter === "high") {
        matchesFilter = room.probability >= 70
      } else if (this.currentFilter === "medium") {
        matchesFilter = room.probability >= 40 && room.probability < 70
      } else if (this.currentFilter === "low") {
        matchesFilter = room.probability < 40
      }

      return matchesSearch && matchesFilter
    })

    // 테이블 내용 생성
    let html = ""

    if (filteredClassrooms.length === 0) {
      html = `
        <tr>
          <td colspan="5" class="empty-state">
            <div class="empty-message">
              <i class="fas fa-search"></i>
              <p>검색 결과가 없습니다.</p>
            </div>
          </td>
        </tr>
      `
    } else {
      filteredClassrooms.forEach((room) => {
        // 확률에 따른 클래스 결정
        let probabilityClass = ""
        if (room.probability >= 70) {
          probabilityClass = "probability-high"
        } else if (room.probability >= 40) {
          probabilityClass = "probability-medium"
        } else {
          probabilityClass = "probability-low"
        }

        // 잠김 여부 아이콘 및 텍스트
        const lockedIcon = room.isLocked ? '<i class="fas fa-lock"></i>' : '<i class="fas fa-lock-open"></i>'
        const lockedText = room.isLocked ? "잠김" : "열림"
        const lockedClass = room.isLocked ? "status-locked" : "status-unlocked"

        // 사용 여부 아이콘 및 텍스트
        let inUseIcon = ""
        let inUseText = ""
        let inUseClass = ""

        if (room.isLocked) {
          inUseIcon = '<i class="fas fa-lock"></i>'
          inUseText = "미사용"
          inUseClass = "status-not-in-use"
        } else if (room.probability < 50) {
          inUseIcon = '<i class="fas fa-user"></i>'
          inUseText = "사용 중"
          inUseClass = "status-in-use"
        } else {
          inUseIcon = '<i class="fas fa-user-check"></i>'
          inUseText = "사용 가능"
          inUseClass = "status-available"
        }


        // 잠금된 강의실은 입장 버튼 비활성화
        const isEntryDisabled = room.isLocked
        const entryBtnClass = isEntryDisabled ? "entry-btn disabled" : "entry-btn"
        const entryBtnDisabled = isEntryDisabled ? "disabled" : ""

        html += `
          <tr class="classroom-row" data-room-id="${room.id}">
            <td>${room.name}</td>
            <td>
              <span class="probability-cell ${probabilityClass}">${room.probability}%</span>
            </td>
            <td>
              <div class="status-cell ${lockedClass}">
                ${lockedIcon}
                <span>${lockedText}</span>
              </div>
            </td>
            <td>
              <div class="status-cell ${inUseClass}">
                ${inUseIcon}
                <span>${inUseText}</span>
              </div>
            </td>
            <td>
              <button class="${entryBtnClass}" data-room-id="${room.id}" ${entryBtnDisabled}>
                <i class="fas fa-sign-in-alt"></i>
                <span>${isEntryDisabled ? "입장 불가" : "입장"}</span>
              </button>
            </td>
          </tr>
        `
      })
    }

    this.elements.tableBody.innerHTML = html
    this.animateTableRows()
  }

  animateTableRows() {
    const rows = document.querySelectorAll(".classroom-row")
    rows.forEach((row, index) => {
      row.style.opacity = "0"
      row.style.transform = "translateY(10px)"
      setTimeout(() => {
        row.style.transition = "all 0.3s ease"
        row.style.opacity = "1"
        row.style.transform = "translateY(0)"
      }, index * 50)
    })
  }

  refreshData() {
    // 새로고침 버튼 로딩 상태
    const refreshBtn = this.elements.refreshBtn
    const originalContent = refreshBtn.innerHTML
    refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>로딩 중...</span>'
    refreshBtn.disabled = true

    // 실제 환경에서는 API 호출을 통해 데이터를 가져옴
    // 여기서는 시뮬레이션
    setTimeout(() => {
      // 랜덤하게 데이터 변경
      this.classrooms.forEach((room) => {
        // 확률 변경 (±10% 범위 내에서)
        const probabilityChange = Math.floor(Math.random() * 20) - 10
        room.probability = Math.max(5, Math.min(99, room.probability + probabilityChange))

        // 20% 확률로 잠김 상태 변경
        if (Math.random() < 0.2) {
          room.isLocked = !room.isLocked
        }

        // 30% 확률로 사용 상태 변경
        if (Math.random() < 0.3) {
          room.inUse = !room.inUse
        }
      })

      // UI 업데이트
      this.renderClassrooms()
      this.updateLastUpdateTime()

      // 버튼 상태 복원
      refreshBtn.innerHTML = originalContent
      refreshBtn.disabled = false

      // 토스트 알림
      this.showToast("강의실 정보가 업데이트되었습니다.", "success")
    }, 1500)
  }

  updateLastUpdateTime() {
    const now = new Date()
    const formattedDate = now.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
    const formattedTime = now.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
    })
    this.elements.lastUpdate.textContent = `${formattedDate} ${formattedTime}`
  }

  openEntryModal(room) {
    this.elements.selectedRoom.textContent = room.name
    this.elements.modal.classList.add("show")
    this.elements.modal.dataset.roomId = room.id
    document.body.style.overflow = "hidden" // 배경 스크롤 방지
  }

  closeModal() {
    this.elements.modal.classList.remove("show")
    document.body.style.overflow = "" // 스크롤 복원
  }

  handleEntryConfirm() {
    const roomId = this.elements.modal.dataset.roomId
    const room = this.classrooms.find((r) => r.id === Number.parseInt(roomId))

    if (room) {
      this.closeModal()
      this.showToast(`${room.name} 강의실에 입장합니다.`, "success")

      setTimeout(() => {
        // 강의실 페이지로 이동 + room 이름 URL 파라미터로 전달
        this.navigateWithAnimation(`classroom-page2.html?room=${encodeURIComponent(room.name)}`)
      }, 500)
    }
  }

  showToast(message, type = "info") {
    const toast = this.elements.toast
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

  addAnimations() {
    // CSS 애니메이션 추가
    const style = document.createElement("style")
    style.textContent = `
      @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
      }

      .entry-btn:hover:not(.disabled) {
        animation: pulse 1s infinite;
      }

      .entry-btn.disabled {
        background: #f5f5f5;
        color: #999;
        cursor: not-allowed;
        opacity: 0.6;
      }

      .entry-btn.disabled:hover {
        background: #f5f5f5;
        transform: none;
        animation: none;
      }

      .refresh-btn i {
        transition: transform 0.3s ease;
      }
      
      .refresh-btn:hover i {
        transform: rotate(180deg);
      }
      
      .empty-message {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
        padding: 40px;
        color: var(--text-secondary);
      }
      
      .empty-message i {
        font-size: 32px;
        opacity: 0.5;
      }
    `
    document.head.appendChild(style)

    // 페이지 로드 애니메이션
    document.body.style.opacity = "0"
    document.body.style.transition = "opacity 0.5s ease-in"

    setTimeout(() => {
      document.body.style.opacity = "1"
    }, 100)
  }
}

// 페이지 로드 완료 후 초기화
document.addEventListener("DOMContentLoaded", () => {
  const classroomSystem = new ClassroomSystem()

  // 환영 메시지
  setTimeout(() => {
    classroomSystem.showToast("IT 5호관 강의실 목록이 로드되었습니다.", "success")
  }, 1000)
})
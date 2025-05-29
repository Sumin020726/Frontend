//classroom-page2.js
// 세련된 강의실 페이지 시스템

class ClassroomPageSystem {
  constructor() {
    this.isAuthenticated = false
    this.currentReservation = null

    // URL 파라미터에서 강의실 정보 가져오기
    this.currentRoom = this.getRoomFromURL() || "IT1호관 101호"

    this.elements = {
      photoUploadArea: document.getElementById("photoUploadArea"),
      photoInput: document.getElementById("photoInput"),
      authBtn: document.getElementById("authBtn"),
      startTime: document.getElementById("startTime"),
      endTime: document.getElementById("endTime"),
      durationDisplay: document.getElementById("durationDisplay"),
      reservationSummary: document.getElementById("reservationSummary"),
      reservationBtn: document.getElementById("reservationBtn"),
      reservationForm: document.getElementById("reservationForm"),
      toast: document.getElementById("toast"),
      authModal: document.getElementById("authModal"),
      reservationModal: document.getElementById("reservationModal"),
      modalReservationDetails: document.getElementById("modalReservationDetails"),
      reservationDate: document.getElementById("reservationDate"),
      reservationTime: document.getElementById("reservationTime"),
      reservationDuration: document.getElementById("reservationDuration"),
      roomTitle: document.getElementById("roomTitle"),
      roomCardTitle: document.getElementById("roomCardTitle"),
      roomSummaryName: document.getElementById("roomSummaryName"),
    }

    this.init()
  }

  init() {
    this.bindEvents()
    this.updateCurrentDate()
    this.addAnimations()
    this.updateRoomDisplay()
  }

  bindEvents() {
    
    // 사진 업로드 영역 클릭
    if (this.elements.photoUploadArea) {
      this.elements.photoUploadArea.addEventListener("click", () => {
        this.elements.photoInput.click()
      })
    }


    // 파일 선택
    if (this.elements.photoInput) {
      this.elements.photoInput.addEventListener("change", (e) => {
        this.handleFileSelect(e)
      })
    }

    // 드래그 앤 드롭
    if (this.elements.photoUploadArea) {
      this.elements.photoUploadArea.addEventListener("dragover", (e) => {
        e.preventDefault()
        this.elements.photoUploadArea.style.borderColor = "var(--info-color)"
        this.elements.photoUploadArea.style.background = "rgba(66, 153, 225, 0.1)"
      })

      this.elements.photoUploadArea.addEventListener("dragleave", (e) => {
        e.preventDefault()
        this.elements.photoUploadArea.style.borderColor = "var(--border-color)"
        this.elements.photoUploadArea.style.background = ""
      })

      this.elements.photoUploadArea.addEventListener("drop", (e) => {
        e.preventDefault()
        this.elements.photoUploadArea.style.borderColor = "var(--border-color)"
        this.elements.photoUploadArea.style.background = ""

        const files = e.dataTransfer.files
        if (files.length > 0) {
          this.handleFileSelect({ target: { files } })
        }
      })
    }

    // 인증 버튼
    if (this.elements.authBtn) {
      this.elements.authBtn.addEventListener("click", () => this.handleAuthentication())
    }

    // 시간 선택
    if (this.elements.startTime) {
      this.elements.startTime.addEventListener("change", () => this.updateTimeSelection())
    }

    if (this.elements.endTime) {
      this.elements.endTime.addEventListener("change", () => this.updateTimeSelection())
    }

    // 예약 버튼
    if (this.elements.reservationBtn) {
      this.elements.reservationBtn.addEventListener("click", () => this.handleReservation())
    }

    // 모달 닫기 버튼들
    document.querySelectorAll(".close-modal-btn").forEach((btn) => {
      btn.addEventListener("click", () => this.closeAllModals())
    })

    // 예약 확인/취소 버튼
    const confirmReservationBtn = document.getElementById("confirmReservationBtn")
    if (confirmReservationBtn) {
      confirmReservationBtn.addEventListener("click", () => this.confirmReservation())
    }

    const cancelReservationBtn = document.getElementById("cancelReservationBtn")
    if (cancelReservationBtn) {
      cancelReservationBtn.addEventListener("click", () => this.closeAllModals())
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

    // 로그아웃 버튼
    const logoutBtn = document.querySelector(".logout-btn")
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        if (confirm("정말 로그아웃하시겠습니까?")) {
          this.showToast("로그아웃 중입니다...", "info")
          setTimeout(() => {
            this.navigateWithAnimation("login.html")
          }, 1500)
        }
      })
    }

    // 키보드 단축키
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.closeAllModals()
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

  handleFileSelect(event) {
    const file = event.target.files[0]
    if (!file) return

    // 파일 유효성 검사
    if (!file.type.startsWith("image/")) {
      this.showToast("이미지 파일만 업로드 가능합니다.", "error")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      this.showToast("파일 크기는 5MB 이하여야 합니다.", "error")
      return
    }

    // 파일 미리보기
    const reader = new FileReader()
    reader.onload = (e) => {
      this.showImagePreview(e.target.result, file.name)
    }
    reader.readAsDataURL(file)
  }

  showImagePreview(imageSrc, fileName) {
    const uploadArea = this.elements.photoUploadArea
    uploadArea.innerHTML = `
      <div class="image-preview">
        <img src="${imageSrc}" alt="업로드된 이미지" style="max-width: 100%; max-height: 200px; border-radius: 8px; margin-bottom: 12px;">
        <p style="font-weight: 500; color: var(--text-primary);">${fileName}</p>
        <button type="button" class="change-photo-btn" style="margin-top: 8px; padding: 6px 12px; background: var(--background-color); border: 1px solid var(--border-color); border-radius: 6px; cursor: pointer;">
          사진 변경
        </button>
      </div>
    `

    // 사진 변경 버튼 이벤트
    uploadArea.querySelector(".change-photo-btn").addEventListener("click", (e) => {
      e.stopPropagation()
      this.resetPhotoUpload()
    })

    // 인증 버튼 활성화
    this.elements.authBtn.disabled = false
    this.showToast("사진이 업로드되었습니다. 인증을 진행해주세요.", "success")
  }

  resetPhotoUpload() {
    this.elements.photoUploadArea.innerHTML = `
      <div class="upload-placeholder">
        <i class="fas fa-cloud-upload-alt"></i>
        <p>사진을 업로드하거나 여기를 클릭하세요</p>
        <span>JPG, PNG 파일만 가능 (최대 5MB)</span>
      </div>
    `
    this.elements.photoInput.value = ""
    this.elements.authBtn.disabled = true
  }

  handleAuthentication() {
    if (!this.elements.photoInput.files[0]) {
      this.showToast("먼저 사진을 업로드해주세요.", "error")
      return
    }

    // 로딩 상태
    const originalContent = this.elements.authBtn.innerHTML
    this.elements.authBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>인증 중...</span>'
    this.elements.authBtn.disabled = true

    // AI 인증 시뮬레이션
    setTimeout(() => {
      const isSuccess = Math.random() < 0.8 // 80% 성공률

      if (isSuccess) {
        this.isAuthenticated = true
        this.showAuthSuccessModal()
      } else {
        this.showToast("인증에 실패했습니다. 다시 촬영해주세요.", "error")
        this.resetPhotoUpload()
      }

      // 버튼 상태 복원
      this.elements.authBtn.innerHTML = originalContent
      this.elements.authBtn.disabled = !this.elements.photoInput.files[0]
    }, 2000)
  }

  showAuthSuccessModal() {
    // 기존 모달 대신 새로운 스타일의 모달 생성
    const modalHTML = `
    <div class="auth-success-modal" id="authSuccessModal">
      <div class="modal-overlay-custom">
        <div class="modal-box-custom">
          <div class="success-icon">
            <i class="fas fa-check-circle"></i>
          </div>
          <p class="modal-message">인증되었습니다.</p>
          <button class="modal-confirm-btn" onclick="this.closest('.auth-success-modal').remove(); document.body.style.overflow = '';">확인</button>
        </div>
      </div>
    </div>
  `

    document.body.insertAdjacentHTML("beforeend", modalHTML)
    document.body.style.overflow = "hidden"

    // 애니메이션 효과
    const modal = document.getElementById("authSuccessModal")
    setTimeout(() => {
      modal.classList.add("show")
    }, 10)
  }

  updateTimeSelection() {
    const startTime = this.elements.startTime.value
    const endTime = this.elements.endTime.value

    if (startTime && endTime) {
      const start = new Date(`2000-01-01 ${startTime}:00`)
      const end = new Date(`2000-01-01 ${endTime}:00`)

      if (end <= start) {
        this.showToast("종료 시간은 시작 시간보다 늦어야 합니다.", "error")
        this.elements.endTime.value = ""
        return
      }

      const duration = (end - start) / (1000 * 60 * 60) // 시간 단위

      if (duration > 4) {
        this.showToast("최대 4시간까지만 예약 가능합니다.", "error")
        this.elements.endTime.value = ""
        return
      }

      // 시간 표시 업데이트
      this.elements.durationDisplay.innerHTML = `
        <i class="fas fa-clock"></i>
        <span>선택된 시간: ${duration}시간</span>
      `
      this.elements.durationDisplay.classList.add("active")

      // 예약 정보 표시
      this.updateReservationSummary(startTime, endTime, duration)
      this.elements.reservationBtn.disabled = false
    } else {
      this.elements.durationDisplay.innerHTML = `
        <i class="fas fa-clock"></i>
        <span>사용 시간을 선택해주세요</span>
      `
      this.elements.durationDisplay.classList.remove("active")
      this.elements.reservationSummary.style.display = "none"
      this.elements.reservationBtn.disabled = true
    }
  }

  updateReservationSummary(startTime, endTime, duration) {
    const today = new Date()
    const dateString = today.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    })

    this.elements.reservationDate.textContent = dateString
    this.elements.reservationTime.textContent = `${startTime} ~ ${endTime}`
    this.elements.reservationDuration.textContent = `${duration}시간`
    this.elements.reservationSummary.style.display = "block"

    // 현재 예약 정보 저장
    this.currentReservation = {
      room: this.currentRoom, // 동적 강의실명 사용
      date: dateString,
      startTime,
      endTime,
      duration: `${duration}시간`,
    }
  }

  updateCurrentDate() {
    const today = new Date()
    const dateString = today.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    })

    if (this.elements.reservationDate) {
      this.elements.reservationDate.textContent = dateString
    }
  }

  handleReservation() {
    if (!this.currentReservation) {
      this.showToast("예약 정보를 확인할 수 없습니다.", "error")
      return
    }

    // 모달에 예약 정보 표시
    this.elements.modalReservationDetails.innerHTML = `
      <div class="summary-item">
        <span>강의실:</span>
        <span>${this.currentReservation.room}</span>
      </div>
      <div class="summary-item">
        <span>날짜:</span>
        <span>${this.currentReservation.date}</span>
      </div>
      <div class="summary-item">
        <span>시간:</span>
        <span>${this.currentReservation.startTime} ~ ${this.currentReservation.endTime}</span>
      </div>
      <div class="summary-item">
        <span>사용 시간:</span>
        <span>${this.currentReservation.duration}</span>
      </div>
    `

    this.elements.reservationModal.classList.add("show")
    document.body.style.overflow = "hidden"
  }

  confirmReservation() {
    // 로컬 스토리지에 예약 정보 저장
    const reservations = JSON.parse(localStorage.getItem("reservations") || "[]")
    reservations.push({
      ...this.currentReservation,
      id: Date.now(),
      status: "예약됨",
      createdAt: new Date().toISOString(),
    })
    localStorage.setItem("reservations", JSON.stringify(reservations))

    this.closeAllModals()
    this.showToast("예약이 성공적으로 완료되었습니다!", "success")

    // 폼 초기화
    this.elements.reservationForm.reset()
    this.elements.reservationSummary.style.display = "none"
    this.elements.reservationBtn.disabled = true
    this.elements.durationDisplay.classList.remove("active")
    this.elements.durationDisplay.innerHTML = `
      <i class="fas fa-clock"></i>
      <span>사용 시간을 선택해주세요</span>
    `
  }

  closeAllModals() {
    document.querySelectorAll(".modal").forEach((modal) => {
      modal.classList.remove("show")
    })
    document.body.style.overflow = ""
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

  addAnimations() {
    // CSS 애니메이션 추가
    const style = document.createElement("style")
    style.textContent = `
      .function-card {
        opacity: 0;
        transform: translateY(20px);
        animation: slideUpCard 0.6s ease-out forwards;
      }
      
      .function-card:nth-child(1) {
        animation-delay: 0.1s;
      }
      
      .function-card:nth-child(2) {
        animation-delay: 0.2s;
      }
      
      @keyframes slideUpCard {
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      .btn-primary:hover:not(:disabled) {
        animation: buttonPulse 0.3s ease;
      }
      
      @keyframes buttonPulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.02); }
        100% { transform: scale(1); }
      }
      
      .photo-upload-area.dragover {
        border-color: var(--info-color) !important;
        background: rgba(66, 153, 225, 0.1) !important;
        transform: scale(1.02);
      }
      
      .image-preview {
        animation: fadeIn 0.3s ease;
      }
      
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      /* 사이드바 강의실 목록 헤더 스타일 */
      .nav-group-header {
        cursor: pointer;
        transition: all 0.3s ease;
      }

      .nav-group-header:hover {
        background: rgba(255, 255, 255, 0.1);
        transform: translateX(4px);
      }

      /* 강의실 목록 헤더 클릭 시 시각적 피드백 */
      .nav-group-header:active {
        transform: translateX(2px) scale(0.98);
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

  getRoomFromURL() {
    try {
      const urlParams = new URLSearchParams(window.location.search)
      return urlParams.get("room") || "IT1호관 101호" // 기본값 제공
    } catch (error) {
      console.error("URL 파라미터 파싱 중 오류:", error)
      return "IT1호관 101호" // 오류 시 기본값 반환
    }
  }

  updateRoomDisplay() {
    // 페이지의 모든 강의실 표시 요소 업데이트
    if (this.elements.roomTitle) this.elements.roomTitle.textContent = this.currentRoom
    if (this.elements.roomCardTitle) this.elements.roomCardTitle.textContent = this.currentRoom
    if (this.elements.roomSummaryName) this.elements.roomSummaryName.textContent = this.currentRoom

    // 페이지 타이틀도 업데이트
    document.title = `${this.currentRoom} – Kyungpook University`
  }
}

// 페이지 로드 완료 후 초기화
document.addEventListener("DOMContentLoaded", () => {
  try {
    const classroomPageSystem = new ClassroomPageSystem()

    // 환영 메시지
    setTimeout(() => {
      classroomPageSystem.showToast("강의실 페이지가 로드되었습니다. 사용 인증 또는 예약을 진행해주세요.", "info")
    }, 1000)
  } catch (error) {
    console.error("페이지 초기화 중 오류 발생:", error)
  }
})


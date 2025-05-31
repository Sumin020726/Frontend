// 이용 내역 페이지 스크립트 - 개선된 버전
document.addEventListener("DOMContentLoaded", () => {
  // DOM 요소 참조
  const currentRoomCard = document.getElementById("current-room")
  const emptyState = document.querySelector(".empty-state")
  const toast = document.getElementById("toast")
  const confirmModal = document.getElementById("confirmModal")
  const modalTitle = document.getElementById("modal-title")
  const modalMessage = document.getElementById("modal-message")
  const modalCancel = document.getElementById("modal-cancel")
  const modalConfirm = document.getElementById("modal-confirm")
  const closeModalBtn = document.querySelector(".close-modal-btn")
  const changeStatusBtn = document.getElementById("change-status-btn")
  const cancelBtn = document.getElementById("cancel-btn")
  const exitBtn = document.getElementById("exit-btn")
  const roomStatus = document.getElementById("room-status")
  const actionButtons = document.getElementById("action-buttons")

  // 로컬 스토리지에서 예약 정보 가져오기
  let reservations = JSON.parse(localStorage.getItem("reservations")) || []

  // 예약 정보가 있는지 확인하고 UI 업데이트
  updateUI()

  // UI 업데이트 함수
  function updateUI() {
    // 최신 예약 정보 다시 가져오기
    reservations = JSON.parse(localStorage.getItem("reservations")) || []

    if (reservations.length > 0) {
      // 가장 최근 활성 예약 정보 가져오기
      const activeReservation = reservations.find((r) => r.status === "reserved" || r.status === "active")

      if (activeReservation) {
        // 현재 이용 중인 강의실 정보 업데이트
        const roomDetails = currentRoomCard.querySelector(".room-details h3")
        const roomDescription = currentRoomCard.querySelector(".room-details p")
        roomDetails.textContent = activeReservation.roomName

        // 강의실 타입 설정
        if (activeReservation.roomName.includes("IT1")) {
          roomDescription.textContent = "강의실 · 1층"
        } else if (activeReservation.roomName.includes("IT5")) {
          roomDescription.textContent = "컴퓨터실 · 2층"
        } else {
          roomDescription.textContent = "강의실"
        }

        // 예약 시간 정보 업데이트
        const timelineValue = currentRoomCard.querySelector(".timeline-value")
        timelineValue.textContent = `${activeReservation.date} ${activeReservation.startTime} ~ ${activeReservation.endTime}`

        // 남은 시간 계산 및 표시
        updateRemainingTime(activeReservation)
        const countdownItem = document.querySelector(".timeline-item:nth-child(2)")
        if (activeReservation.status === "reserved") {
          countdownItem.style.display = "none"
        } else {
          countdownItem.style.display = "flex"
        }

        // 상태에 따른 UI 업데이트
        updateStatusUI(activeReservation.status, activeReservation.type)
        // updateUI 함수 내부에서 이 부분 찾아서
        const sectionHeader = document.querySelector(".current-usage-section .section-header h2")

        // 상태가 active일 때 텍스트 바꾸기
        if (activeReservation.status === "active") {
          sectionHeader.innerHTML = `<i class="fas fa-door-open"></i> 현재 이용 중`
        } else {
          sectionHeader.innerHTML = `<i class="fas fa-door-open"></i> 현재 예약 중`
        }

        // 빈 상태 숨기고 현재 이용 중인 강의실 표시
        emptyState.style.display = "none"
        currentRoomCard.style.display = "block"
      } else {
        // 활성 예약이 없으면 빈 상태 표시
        showEmptyState()
      }

      // 배지 업데이트
      updateBadge()
    } else {
      // 예약 정보가 없으면 빈 상태 표시
      showEmptyState()
    }
  }

  // 빈 상태 표시 함수
  function showEmptyState() {
    emptyState.style.display = "block"
    currentRoomCard.style.display = "none"

    // 배지 숨기기
    const historyBadge = document.querySelector('.nav-item[data-page="usage-history.html"] .nav-badge')
    if (historyBadge) {
      historyBadge.style.display = "none"
    }
  }

  // 배지 업데이트 함수
  function updateBadge() {
    const historyBadges = document.querySelectorAll('.nav-item[data-page="usage-history.html"] .nav-badge')
    historyBadges.forEach((badge) => {
      const activeReservations = reservations.filter((r) => r.status === "reserved" || r.status === "active")
      if (activeReservations.length > 0) {
        badge.textContent = activeReservations.length
        badge.style.display = "flex"
      } else {
        badge.style.display = "none"
      }
    })
  }

  // 남은 시간 업데이트 함수 (NaN 오류 수정)
  function updateRemainingTime(reservation) {
    const countdown = document.getElementById("countdown")

    try {
      // 현재 시간
      const now = new Date()

      // 예약 종료 시간 파싱 (안전한 파싱)
      if (!reservation.endTime || reservation.endTime === "미정") {
        countdown.textContent = "진행 중"
        countdown.style.color = "var(--success-color)"
        return
      }

      const timeParts = reservation.endTime.split(":")
      if (timeParts.length !== 2) {
        countdown.textContent = "시간 오류"
        countdown.style.color = "var(--error-color)"
        return
      }

      const hours = Number.parseInt(timeParts[0], 10)
      const minutes = Number.parseInt(timeParts[1], 10)

      // 유효한 시간인지 확인
      if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
        countdown.textContent = "시간 오류"
        countdown.style.color = "var(--error-color)"
        return
      }

      const endTime = new Date()
      endTime.setHours(hours, minutes, 0, 0)

      // 남은 시간 계산 (밀리초)
      const remainingTime = endTime - now

      if (remainingTime <= 0) {
        countdown.textContent = "종료됨"
        countdown.style.color = "var(--error-color)"
        return
      }

      // 남은 시간을 시간과 분으로 변환
      const remainingHours = Math.floor(remainingTime / (1000 * 60 * 60))
      const remainingMinutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60))

      if (remainingHours > 0) {
        countdown.textContent = `약 ${remainingHours}시간 ${remainingMinutes}분`
      } else {
        countdown.textContent = `약 ${remainingMinutes}분`
      }

      // 30분 이하일 때 경고 색상
      if (remainingTime <= 30 * 60 * 1000) {
        countdown.style.color = "var(--error-color)"
      } else if (remainingTime <= 60 * 60 * 1000) {
        countdown.style.color = "var(--warning-color)"
      } else {
        countdown.style.color = "var(--success-color)"
      }

      // 1분마다 남은 시간 업데이트
      setTimeout(() => {
        const currentReservations = JSON.parse(localStorage.getItem("reservations")) || []
        const activeReservation = currentReservations.find((r) => r.status === "reserved" || r.status === "active")
        if (activeReservation) {
          updateRemainingTime(activeReservation)
        }
      }, 60000)
    } catch (error) {
      console.error("시간 계산 오류:", error)
      countdown.textContent = "시간 오류"
      countdown.style.color = "var(--error-color)"
    }
  }
  

  // 상태에 따른 UI 업데이트 함수
  function updateStatusUI(status, type) {
    if (status === "reserved") {
      roomStatus.className = "room-status-badge status-reserved"
      roomStatus.innerHTML = '<i class="fas fa-calendar-check"></i><span>예약</span>'

      changeStatusBtn.style.display = "block"
      cancelBtn.style.display = "block"
      exitBtn.style.display = "none"
    } else if (status === "active") {
      roomStatus.className = "room-status-badge status-active"
      roomStatus.innerHTML = '<i class="fas fa-play-circle"></i><span>사용 중</span>'

      changeStatusBtn.style.display = "none"
      cancelBtn.style.display = "none" // 사용 중일 때는 예약 취소 버튼 숨김
      exitBtn.style.display = "block"
    }
  }
  

  // 사용 중 변경 버튼 클릭 이벤트 (사진 업로드 필요)
  changeStatusBtn.addEventListener("click", () => {
    showPhotoUploadModal("사용 중 변경", "강의실 사용을 시작하시겠습니까?", (photoFile) => {
      reservations = JSON.parse(localStorage.getItem("reservations")) || []
      const activeReservation = reservations.find((r) => r.status === "reserved")
      if (activeReservation) {
        activeReservation.status = "active"
        activeReservation.actualStartTime = new Date().getTime()
        localStorage.setItem("reservations", JSON.stringify(reservations))
        updateStatusUI("active", activeReservation.type)
        showToast("success", "상태가 사용 중으로 변경되었습니다.")
        updateUI()
      }
    })
  })

  // 예약 취소 버튼 클릭 이벤트
  cancelBtn.addEventListener("click", () => {
    showConfirmModal("예약 취소", "정말 예약을 취소하시겠습니까?", () => {
      reservations = JSON.parse(localStorage.getItem("reservations")) || []
      const activeIndex = reservations.findIndex((r) => r.status === "reserved")
      if (activeIndex !== -1) {
        const reservation = reservations[activeIndex]
        reservations.splice(activeIndex, 1) // 해당 예약 제거
        localStorage.setItem("reservations", JSON.stringify(reservations))
        updateUI()
        showToast("info", "예약이 취소되었습니다.")

        // 예약 정상 취소 시 포인트 적립 (5P)
        updateUserPoints(5, "예약 취소", "정상적인 예약 취소 처리 (15분 전)", reservation.roomName)
      }
    })
  })

  // 퇴실 인증 버튼 클릭 이벤트 (사진 업로드 필요) - 완료 후 목록에서 제거
  exitBtn.addEventListener("click", () => {
    showPhotoUploadModal("퇴실 인증", "퇴실 인증을 진행하시겠습니까?", (photoFile) => {
      reservations = JSON.parse(localStorage.getItem("reservations")) || []
      const activeIndex = reservations.findIndex((r) => r.status === "active")
      if (activeIndex !== -1) {
        const reservation = reservations[activeIndex]
        // 퇴실 인증 완료 시 목록에서 완전히 제거
        reservations.splice(activeIndex, 1)
        localStorage.setItem("reservations", JSON.stringify(reservations))
        updateUI()
        showToast("success", "퇴실 인증이 완료되었습니다.")

        // 포인트 적립 (5P)
        updateUserPoints(5, "정상 이용 완료", "강의실 정상 이용 완료", reservation.roomName)
      }
    })
  })

  // 사진 업로드 모달 표시 함수
  function showPhotoUploadModal(title, message, onConfirm) {
    const modalHTML = `
      <div class="photo-upload-modal" id="photoUploadModal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 2000; opacity: 0; transition: opacity 0.3s ease;">
        <div class="modal-overlay-custom">
          <div class="modal-box-custom" style="background: white; border-radius: 12px; width: 90%; max-width: 500px; box-shadow: 0 10px 25px rgba(0,0,0,0.2); position: relative;">
            <div class="modal-header" style="text-align: left; padding: 20px 20px 0 20px; display: flex; justify-content: space-between; align-items: center;">
              <h3 style="margin: 0; font-size: 18px; color: var(--text-primary);">${title}</h3>
              <button class="close-modal-btn" onclick="window.closePhotoModal()" style="background: none; border: none; font-size: 20px; cursor: pointer;">
                <i class="fas fa-times"></i>
              </button>
            </div>
            <div class="modal-body" style="padding: 20px;">
              <p style="margin-bottom: 20px; color: var(--text-primary);">${message}</p>
              <p style="margin-bottom: 15px; font-size: 14px; color: var(--text-secondary);">인증을 위해 강의실 팻말 사진을 업로드해주세요.</p>
              
              <div class="photo-upload-area-modal" id="photoUploadAreaModal" style="border: 2px dashed var(--border-color); border-radius: 8px; padding: 30px; text-align: center; cursor: pointer; transition: all 0.3s ease;">
                <div class="upload-placeholder">
                  <i class="fas fa-cloud-upload-alt" style="font-size: 32px; color: var(--text-secondary); margin-bottom: 12px;"></i>
                  <p style="margin: 0 0 4px 0; font-weight: 500; color: var(--text-primary);">사진을 업로드하거나 여기를 클릭하세요</p>
                  <span style="font-size: 12px; color: var(--text-secondary);">JPG, PNG 파일만 가능 (최대 5MB)</span>
                </div>
                <input type="file" id="photoInputModal" accept="image/*" style="display: none;">
              </div>
            </div>
            <div class="modal-footer" style="padding: 0 20px 20px 20px; display: flex; gap: 10px; justify-content: flex-end;">
              <button class="btn-secondary" onclick="window.closePhotoModal()" style="padding: 10px 20px; background: var(--background-color); color: var(--text-primary); border: 1px solid var(--border-color); border-radius: 8px; font-weight: 600; font-size: 14px; cursor: pointer;">취소</button>
              <button class="btn-primary" id="confirmPhotoBtn" disabled style="padding: 10px 20px; background: linear-gradient(135deg, var(--primary-color) 0%, var(--accent-color) 100%); color: white; border: none; border-radius: 8px; font-weight: 600; font-size: 14px; cursor: pointer; opacity: 0.7;">확인</button>
            </div>
          </div>
        </div>
      </div>
    `

    document.body.insertAdjacentHTML("beforeend", modalHTML)
    document.body.style.overflow = "hidden"

    const modal = document.getElementById("photoUploadModal")
    const photoUploadAreaModal = document.getElementById("photoUploadAreaModal")
    const photoInputModal = document.getElementById("photoInputModal")
    const confirmPhotoBtn = document.getElementById("confirmPhotoBtn")

    // 사진 업로드 영역 클릭 이벤트
    photoUploadAreaModal.addEventListener("click", () => {
      photoInputModal.click()
    })

    // 파일 선택 이벤트
    photoInputModal.addEventListener("change", function () {
      if (this.files && this.files[0]) {
        const file = this.files[0]

        // 파일 유효성 검사
        if (!file.type.startsWith("image/")) {
          showToast("error", "이미지 파일만 업로드 가능합니다.")
          return
        }

        if (file.size > 5 * 1024 * 1024) {
          showToast("error", "파일 크기는 5MB 이하여야 합니다.")
          return
        }

        // 미리보기 표시
        const reader = new FileReader()
        reader.onload = (e) => {
          photoUploadAreaModal.innerHTML = `
            <div class="upload-success">
              <img src="${e.target.result}" alt="업로드된 이미지" style="max-width: 100%; max-height: 150px; border-radius: 8px; margin-bottom: 8px;">
              <p style="margin: 8px 0; color: var(--success-color);"><i class="fas fa-check-circle"></i> 사진이 업로드되었습니다</p>
              <button type="button" onclick="window.resetPhotoModalUpload()" style="padding: 4px 8px; background: var(--background-color); border: 1px solid var(--border-color); border-radius: 4px; cursor: pointer; font-size: 12px;">사진 변경</button>
            </div>
          `
        }
        reader.readAsDataURL(file)

        confirmPhotoBtn.disabled = false
        confirmPhotoBtn.style.opacity = "1"
      }
    })

    // 확인 버튼 클릭 이벤트
    confirmPhotoBtn.addEventListener("click", () => {
      if (photoInputModal.files[0]) {
        // 로딩 상태
        confirmPhotoBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 처리 중...'
        confirmPhotoBtn.disabled = true

        // 인증 시뮬레이션
        setTimeout(() => {
          onConfirm(photoInputModal.files[0])
          window.closePhotoModal()
        }, 1500)
      }
    })

    // 사진 업로드 초기화 함수
    window.resetPhotoModalUpload = () => {
      photoUploadAreaModal.innerHTML = `
        <div class="upload-placeholder">
          <i class="fas fa-cloud-upload-alt" style="font-size: 32px; color: var(--text-secondary); margin-bottom: 12px;"></i>
          <p style="margin: 0 0 4px 0; font-weight: 500; color: var(--text-primary);">사진을 업로드하거나 여기를 클릭하세요</p>
          <span style="font-size: 12px; color: var(--text-secondary);">JPG, PNG 파일만 가능 (최대 5MB)</span>
        </div>
      `
      photoInputModal.value = ""
      confirmPhotoBtn.disabled = true
      confirmPhotoBtn.style.opacity = "0.7"
    }

    // 모달 닫기 함수
    window.closePhotoModal = () => {
      const modal = document.getElementById("photoUploadModal")
      if (modal) {
        modal.remove()
        document.body.style.overflow = ""
      }
    }

    // 애니메이션 효과
    setTimeout(() => {
      modal.style.opacity = "1"
    }, 10)
  }

  // 확인 모달 표시 함수
  function showConfirmModal(title, message, confirmCallback) {
    modalTitle.textContent = title
    modalMessage.textContent = message

    // 기존 이벤트 리스너 제거
    const newModalConfirm = modalConfirm.cloneNode(true)
    const newModalCancel = modalCancel.cloneNode(true)
    modalConfirm.parentNode.replaceChild(newModalConfirm, modalConfirm)
    modalCancel.parentNode.replaceChild(newModalCancel, modalCancel)

    // 새 이벤트 리스너 추가
    newModalConfirm.addEventListener("click", () => {
      confirmCallback()
      confirmModal.classList.remove("show")
    })

    newModalCancel.addEventListener("click", () => {
      confirmModal.classList.remove("show")
    })

    confirmModal.classList.add("show")
  }

  // 모달 닫기 버튼 이벤트
  closeModalBtn.addEventListener("click", () => {
    confirmModal.classList.remove("show")
  })

  // 빈 상태의 예약하기 버튼 클릭 이벤트
  const emptyActionBtn = document.querySelector(".empty-action-btn")
  if (emptyActionBtn) {
    emptyActionBtn.addEventListener("click", () => {
      window.location.href = "classroom-page1.html"
    })
  }

  // 토스트 메시지 표시 함수
  function showToast(type, message) {
    const toastIcon = toast.querySelector(".toast-icon")
    const toastMessage = toast.querySelector(".toast-message")

    toast.className = "toast"
    toast.classList.add(type)

    if (type === "success") {
      toastIcon.className = "toast-icon fas fa-check-circle"
    } else if (type === "error") {
      toastIcon.className = "toast-icon fas fa-exclamation-circle"
    } else if (type === "info") {
      toastIcon.className = "toast-icon fas fa-info-circle"
    }

    toastMessage.textContent = message
    toast.classList.add("show")

    setTimeout(() => {
      toast.classList.remove("show")
    }, 3000)
  }

  // 네비게이션 아이템 클릭 이벤트 (페이지 이동)
  document.querySelectorAll(".nav-item").forEach((item) => {
    item.addEventListener("click", () => {
      const page = item.dataset.page
      if (page) {
        window.location.href = page
      }
    })
  })

  // 네비게이션 그룹 헤더 클릭 이벤트 (페이지 이동)
  document.querySelectorAll(".nav-group-header").forEach((header) => {
    header.addEventListener("click", () => {
      const page = header.dataset.page
      if (page) {
        window.location.href = page
      }
    })
  })

  // 로그아웃 버튼 클릭 이벤트
  const logoutBtn = document.querySelector(".logout-btn")
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      if (confirm("정말 로그아웃하시겠습니까?")) {
        showToast("info", "로그아웃 중입니다...")
        setTimeout(() => {
          window.location.href = "login.html"
        }, 1500)
      }
    })
  }

  // 페이지 포커스 시 UI 업데이트 (다른 페이지에서 돌아왔을 때)
  window.addEventListener("focus", () => {
    updateUI()
  })

  // localStorage 변경 감지 (같은 도메인의 다른 탭에서 변경 시)
  window.addEventListener("storage", (e) => {
    if (e.key === "reservations") {
      updateUI()
    }
  })

  // 사용자 포인트 업데이트 함수
  function updateUserPoints(delta, reason = "", description = "", roomName = null) {
    // 로컬 스토리지에서 현재 포인트 가져오기
    let currentPoints = Number.parseInt(localStorage.getItem("userPoints") || "100", 10)

    // 포인트 업데이트
    currentPoints += delta

    // 포인트 범위 제한 (0-150)
    currentPoints = Math.min(Math.max(currentPoints, 0), 150)

    // 로컬 스토리지에 저장
    localStorage.setItem("userPoints", currentPoints.toString())

    // 사이드바 포인트 배지 업데이트
    const pointBadges = document.querySelectorAll(".nav-badge.point")
    pointBadges.forEach((badge) => {
      badge.textContent = `${currentPoints}P`
    })

    // 포인트 변경 알림
    if (delta > 0) {
      showToast("success", `${delta}P가 적립되었습니다!`)

      // 포인트 이력에 직접 추가
      const pointHistory = JSON.parse(localStorage.getItem("pointHistory") || "[]")
      const now = new Date()
      const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`

      const newEntry = {
        id: Date.now(),
        type: "plus",
        title: reason || "포인트 적립",
        description: roomName ? `${description} (${roomName})` : description,
        points: delta,
        date: formattedDate,
      }

      pointHistory.unshift(newEntry)
      localStorage.setItem("pointHistory", JSON.stringify(pointHistory))

      // 이벤트도 계속 발생시킵니다 (다른 페이지와의 호환성을 위해)
      const event = new CustomEvent("pointsEarned", {
        detail: {
          amount: delta,
          reason: reason || (delta === 5 ? "포인트 적립" : "포인트 적립"),
          description: description || (delta === 5 ? "강의실 정상 이용 완료" : "시스템 포인트 적립"),
          roomName: roomName,
        },
      })
      document.dispatchEvent(event)
    } else if (delta < 0) {
      showToast("warning", `${Math.abs(delta)}P가 차감되었습니다.`)

      // 포인트 차감 이력 추가
      const pointHistory = JSON.parse(localStorage.getItem("pointHistory") || "[]")
      const now = new Date()
      const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`

      const newEntry = {
        id: Date.now(),
        type: "minus",
        title: reason || "포인트 차감",
        description: roomName ? `${description} (${roomName})` : description,
        points: delta,
        date: formattedDate,
      }

      pointHistory.unshift(newEntry)
      localStorage.setItem("pointHistory", JSON.stringify(pointHistory))

      // 이벤트 발생
      const event = new CustomEvent("pointsEarned", {
        detail: {
          amount: delta,
          reason: reason || "포인트 차감",
          description: description || "시스템 포인트 차감",
          roomName: roomName,
        },
      })
      document.dispatchEvent(event)
    }
  }
})

// Add event listener for page load to update badges
document.addEventListener("DOMContentLoaded", () => {
  // Update badges when page loads
  const updateBadge = () => {
    const historyBadges = document.querySelectorAll('.nav-item[data-page="usage-history.html"] .nav-badge')
    historyBadges.forEach((badge) => {
      const reservations = JSON.parse(localStorage.getItem("reservations")) || []
      const activeReservations = reservations.filter((r) => r.status === "reserved" || r.status === "active")
      if (activeReservations.length > 0) {
        badge.textContent = activeReservations.length
        badge.style.display = "flex"
      } else {
        badge.style.display = "none"
      }
    })
  }

  updateBadge()

  // Rest of the initialization code...
})

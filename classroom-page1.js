// 강의실 예약 페이지 스크립트 - 개선된 버전 (시간 충돌 검사 추가)
document.addEventListener("DOMContentLoaded", () => {
  // DOM 요소 참조
  const startTimeSelect = document.getElementById("startTime")
  const endTimeSelect = document.getElementById("endTime")
  const durationDisplay = document.getElementById("durationDisplay")
  const reservationSummary = document.getElementById("reservationSummary")
  const reservationBtn = document.getElementById("reservationBtn")
  const reservationDate = document.getElementById("reservationDate")
  const reservationTime = document.getElementById("reservationTime")
  const reservationDuration = document.getElementById("reservationDuration")
  const reservationModal = document.getElementById("reservationModal")
  const modalReservationDetails = document.getElementById("modalReservationDetails")
  const confirmReservationBtn = document.getElementById("confirmReservationBtn")
  const cancelReservationBtn = document.getElementById("cancelReservationBtn")
  const closeModalBtns = document.querySelectorAll(".close-modal-btn")
  const toast = document.getElementById("toast")
  const photoUploadArea = document.getElementById("photoUploadArea")
  const photoInput = document.getElementById("photoInput")
  const authBtn = document.getElementById("authBtn")
  const authModal = document.getElementById("authModal")
  const confirmAuthBtn = document.getElementById("confirmAuthBtn")
  const roomTitle = document.getElementById("roomTitle")
  const roomCardTitle = document.getElementById("roomCardTitle")

  // URL에서 강의실 정보 파싱 함수
  function parseRoomInfoFromURL() {
    const urlParams = new URLSearchParams(window.location.search)
    const roomParam = urlParams.get("room")

    if (roomParam) {
      // URL 파라미터에서 강의실 정보 가져오기 (예: IT1-101, IT5-201)
      const [building, room] = roomParam.split("-")
      const buildingName = building === "IT1" ? "IT1호관" : building === "IT5" ? "IT5호관" : building
      const roomNumber = room + "호"
      return `${buildingName} ${roomNumber}`
    }

    // URL에서 파일명으로 추정 (예: classroom-page1.html?room=IT1-101)
    const pathname = window.location.pathname
    if (pathname.includes("classroom-page1")) {
      return "IT1호관 101호" // 기본값
    } else if (pathname.includes("classroom-page2")) {
      return "IT5호관 201호" // 기본값
    }

    return "IT1호관 101호" // 최종 기본값
  }

  // 강의실 정보 설정
  const currentRoom = parseRoomInfoFromURL()

  // 강의실 정보 동적 설정
  roomTitle.textContent = currentRoom
  roomCardTitle.textContent = currentRoom
  document.title = `${currentRoom} – Kyungpook University`

  // 예약 요약의 강의실 이름도 업데이트
  const roomSummaryName = document.getElementById("roomSummaryName")
  if (roomSummaryName) {
    roomSummaryName.textContent = currentRoom
  }

  // 현재 날짜 설정
  const today = new Date()
  const formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`

  // 활성 예약 확인 함수
  function hasActiveReservation() {
    const reservations = JSON.parse(localStorage.getItem("reservations")) || []
    return reservations.some((r) => r.status === "reserved" || r.status === "active")
  }

  // 예약된 시간대 가져오기 함수
  function getReservedTimeSlots() {
    const reservations = JSON.parse(localStorage.getItem("reservations")) || []
    return reservations
      .filter((r) => (r.status === "reserved" || r.status === "active") && r.date === formattedDate)
      .map((r) => ({
        startTime: r.startTime,
        endTime: r.endTime,
        roomName: r.roomName,
      }))
  }

  // 시간이 예약된 시간대와 충돌하는지 확인하는 함수
  function isTimeConflict(startTime, endTime) {
    const reservedSlots = getReservedTimeSlots()

    const [startHour, startMin] = startTime.split(":").map(Number)
    const [endHour, endMin] = endTime.split(":").map(Number)
    const startTotalMin = startHour * 60 + startMin
    const endTotalMin = endHour * 60 + endMin

    return reservedSlots.some((slot) => {
      const [slotStartHour, slotStartMin] = slot.startTime.split(":").map(Number)
      const [slotEndHour, slotEndMin] = slot.endTime.split(":").map(Number)
      const slotStartTotalMin = slotStartHour * 60 + slotStartMin
      const slotEndTotalMin = slotEndHour * 60 + slotEndMin

      // 시간 충돌 검사: 새로운 예약이 기존 예약과 겹치는지 확인
      return (
        startTotalMin < slotEndTotalMin &&
        endTotalMin > slotStartTotalMin &&
        (slot.roomName === currentRoom || !slot.roomName) // 같은 강의실이거나 강의실 정보가 없는 경우
      )
    })
  }

  // 현재 시간에서 다음 30분 단위 시간 계산 함수 (정확한 계산)
  function getNextAvailableTime() {
    const now = new Date()
    const currentMinutes = now.getMinutes()
    const currentHours = now.getHours()

    // 다음 30분 단위로 올림
    let startMinutes, startHours

    if (currentMinutes === 0) {
      startMinutes = 30
      startHours = currentHours
    } else if (currentMinutes <= 30) {
      startMinutes = 30
      startHours = currentHours
    } else {
      startMinutes = 0
      startHours = currentHours + 1
    }

    // 24시간 넘어가면 다음날 0시로
    if (startHours >= 24) {
      startHours = 0
    }

    const startTime = `${String(startHours).padStart(2, "0")}:${String(startMinutes).padStart(2, "0")}`

    // 종료 시간은 시작 시간 + 3시간
    let endHours = startHours + 3
    const endMinutes = startMinutes

    if (endHours >= 24) {
      endHours = endHours - 24
    }

    const endTime = `${String(endHours).padStart(2, "0")}:${String(endMinutes).padStart(2, "0")}`

    return { startTime, endTime }
  }

  // 현재 시간 이전 옵션들과 예약된 시간대 비활성화
  function disableUnavailableTimeOptions() {
    const now = new Date()
    const currentHour = now.getHours()
    const currentMinute = now.getMinutes()
    const currentTotalMinutes = currentHour * 60 + currentMinute
    const reservedSlots = getReservedTimeSlots()

    // 시작 시간 옵션들 확인
    Array.from(startTimeSelect.options).forEach((option) => {
      if (option.value) {
        const [hour, minute] = option.value.split(":").map(Number)
        const optionTotalMinutes = hour * 60 + minute

        // 현재 시간 이전이거나 예약된 시간대인 경우 비활성화
        const isPastTime = optionTotalMinutes <= currentTotalMinutes
        const isReservedTime = reservedSlots.some((slot) => {
          const [slotStartHour, slotStartMin] = slot.startTime.split(":").map(Number)
          const [slotEndHour, slotEndMin] = slot.endTime.split(":").map(Number)
          const slotStartTotalMin = slotStartHour * 60 + slotStartMin
          const slotEndTotalMin = slotEndHour * 60 + slotEndMin

          return (
            optionTotalMinutes >= slotStartTotalMin &&
            optionTotalMinutes < slotEndTotalMin &&
            (slot.roomName === currentRoom || !slot.roomName)
          )
        })

        if (isPastTime || isReservedTime) {
          option.disabled = true
          option.style.color = "#ccc"
          if (isReservedTime) {
            option.textContent = `${option.value} (예약됨)`
          }
        } else {
          option.disabled = false
          option.style.color = ""
          option.textContent = option.value
        }
      }
    })

    // 종료 시간 옵션들 확인
    Array.from(endTimeSelect.options).forEach((option) => {
      if (option.value) {
        const [hour, minute] = option.value.split(":").map(Number)
        const optionTotalMinutes = hour * 60 + minute

        const isReservedTime = reservedSlots.some((slot) => {
          const [slotStartHour, slotStartMin] = slot.startTime.split(":").map(Number)
          const [slotEndHour, slotEndMin] = slot.endTime.split(":").map(Number)
          const slotStartTotalMin = slotStartHour * 60 + slotStartMin
          const slotEndTotalMin = slotEndHour * 60 + slotEndMin

          return (
            optionTotalMinutes > slotStartTotalMin &&
            optionTotalMinutes <= slotEndTotalMin &&
            (slot.roomName === currentRoom || !slot.roomName)
          )
        })

        if (isReservedTime) {
          option.disabled = true
          option.style.color = "#ccc"
          option.textContent = `${option.value} (예약됨)`
        } else {
          option.disabled = false
          option.style.color = ""
          option.textContent = option.value
        }
      }
    })
  }

  // 시간 선택 이벤트 리스너
  startTimeSelect.addEventListener("change", updateReservationSummary)
  endTimeSelect.addEventListener("change", updateReservationSummary)

  // 예약 정보 업데이트 함수
  function updateReservationSummary() {
    const startTime = startTimeSelect.value
    const endTime = endTimeSelect.value

    if (startTime && endTime) {
      // 시간과 분 단위까지 쪼개서 분으로 환산
      const [startHour, startMin] = startTime.split(":").map(Number)
      const [endHour, endMin] = endTime.split(":").map(Number)

      const startTotalMin = startHour * 60 + startMin
      const endTotalMin = endHour * 60 + endMin

      if (endTotalMin <= startTotalMin) {
        durationDisplay.innerHTML =
          '<i class="fas fa-exclamation-triangle"></i> <span>종료 시간은 시작 시간보다 늦어야 합니다</span>'
        durationDisplay.classList.remove("active")
        reservationSummary.style.display = "none"
        reservationBtn.disabled = true
        return
      }

      // 시간 충돌 검사
      if (isTimeConflict(startTime, endTime)) {
        durationDisplay.innerHTML =
          '<i class="fas fa-exclamation-triangle"></i> <span>선택한 시간대에 이미 예약이 있습니다</span>'
        durationDisplay.classList.remove("active")
        reservationSummary.style.display = "none"
        reservationBtn.disabled = true
        return
      }

      const totalMin = endTotalMin - startTotalMin

      if (totalMin > 240) {
        durationDisplay.innerHTML =
          '<i class="fas fa-exclamation-triangle"></i> <span>최대 4시간까지만 예약 가능합니다</span>'
        durationDisplay.classList.remove("active")
        reservationSummary.style.display = "none"
        reservationBtn.disabled = true
        return
      }

      // 시간 + 분으로 표시
      const hours = Math.floor(totalMin / 60)
      const minutes = totalMin % 60
      const formattedDuration = minutes === 0 ? `${hours}시간` : `${hours}시간 ${minutes}분`

      // 화면 표시
      durationDisplay.innerHTML = `<i class="fas fa-clock"></i> <span>총 ${formattedDuration} 사용</span>`
      durationDisplay.classList.add("active")

      reservationDate.textContent = formattedDate
      reservationTime.textContent = `${startTime} ~ ${endTime}`
      reservationDuration.textContent = formattedDuration

      reservationSummary.style.display = "block"
      reservationBtn.disabled = false
    } else {
      durationDisplay.innerHTML = '<i class="fas fa-clock"></i> <span>사용 시간을 선택해주세요</span>'
      durationDisplay.classList.remove("active")
      reservationSummary.style.display = "none"
      reservationBtn.disabled = true
    }
  }

  // 예약 버튼 클릭 이벤트
  reservationBtn.addEventListener("click", () => {
    // 활성 예약 확인
    if (hasActiveReservation()) {
      showToast("error", "이미 예약하거나 사용 중인 강의실이 있습니다. 먼저 퇴실하거나 예약을 취소해주세요.")
      return
    }

    if (startTimeSelect.value && endTimeSelect.value) {
      // 최종 시간 충돌 검사
      if (isTimeConflict(startTimeSelect.value, endTimeSelect.value)) {
        showToast("error", "선택한 시간대에 이미 예약이 있습니다. 다른 시간을 선택해주세요.")
        return
      }

      // 모달에 예약 정보 표시
      modalReservationDetails.innerHTML = `
        <div class="summary-item">
          <span>강의실:</span>
          <span>${roomCardTitle.textContent}</span>
        </div>
        <div class="summary-item">
          <span>날짜:</span>
          <span>${formattedDate}</span>
        </div>
        <div class="summary-item">
          <span>시간:</span>
          <span>${startTimeSelect.value} ~ ${endTimeSelect.value}</span>
        </div>
        <div class="summary-item">
          <span>사용 시간:</span>
          <span>${(() => {
            const [startHour, startMin] = startTimeSelect.value.split(":").map(Number)
            const [endHour, endMin] = endTimeSelect.value.split(":").map(Number)
            const totalStart = startHour * 60 + startMin
            const totalEnd = endHour * 60 + endMin
            const diff = totalEnd - totalStart
            const hours = Math.floor(diff / 60)
            const minutes = diff % 60
            return minutes === 0 ? `${hours}시간` : `${hours}시간 ${minutes}분`
          })()}</span>
        </div>
      `

      // 예약 확인 모달 표시
      reservationModal.classList.add("show")
    }
  })

  // 예약 확정 버튼 클릭 이벤트
  confirmReservationBtn.addEventListener("click", () => {
    // 예약 정보 저장
    const reservationInfo = {
      id: Date.now().toString(),
      roomName: roomCardTitle.textContent,
      date: formattedDate,
      startTime: startTimeSelect.value,
      endTime: endTimeSelect.value,
      duration: Number.parseInt(endTimeSelect.value) - Number.parseInt(startTimeSelect.value),
      status: "reserved",
      timestamp: new Date().getTime(),
      createdAt: new Date().toISOString(),
      type: "reservation", // 예약을 통한 이용
    }

    // 로컬 스토리지에 예약 정보 저장
    saveReservation(reservationInfo)

    // 모달 닫기
    reservationModal.classList.remove("show")

    // 토스트 메시지 표시
    showToast("success", "예약이 성공적으로 완료되었습니다!")

    // 폼 초기화
    startTimeSelect.value = ""
    endTimeSelect.value = ""
    updateReservationSummary()

    // 시간 옵션 다시 업데이트
    disableUnavailableTimeOptions()

    // 이용 내역 페이지로 이동 옵션 제공
    setTimeout(() => {
      if (confirm("예약이 완료되었습니다. 이용 내역 페이지로 이동하시겠습니까?")) {
        window.location.href = "usage-history.html"
      }
    }, 2000)
  })

  // 예약 취소 버튼 클릭 이벤트
  cancelReservationBtn.addEventListener("click", () => {
    reservationModal.classList.remove("show")
  })

  // 모달 닫기 버튼 이벤트
  closeModalBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      const modal = this.closest(".modal")
      modal.classList.remove("show")
    })
  })

  // 사진 업로드 영역 클릭 이벤트
  photoUploadArea.addEventListener("click", () => {
    photoInput.click()
  })

  // 사진 선택 이벤트
  photoInput.addEventListener("change", function () {
    if (this.files && this.files[0]) {
      // 파일 유효성 검사
      const file = this.files[0]
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
        photoUploadArea.innerHTML = `
          <div class="upload-success">
            <img src="${e.target.result}" alt="업로드된 이미지" style="max-width: 100%; max-height: 150px; border-radius: 8px; margin-bottom: 8px;">
            <p><i class="fas fa-check-circle"></i> 사진이 업로드되었습니다</p>
            <button type="button" onclick="resetPhotoUpload()" style="margin-top: 8px; padding: 4px 8px; background: var(--background-color); border: 1px solid var(--border-color); border-radius: 4px; cursor: pointer; font-size: 12px;">사진 변경</button>
          </div>
        `
      }
      reader.readAsDataURL(file)

      authBtn.disabled = false
    }
  })

  // 사진 업로드 초기화 함수
  window.resetPhotoUpload = () => {
    photoUploadArea.innerHTML = `
      <div class="upload-placeholder">
        <i class="fas fa-cloud-upload-alt"></i>
        <p>사진을 업로드하거나 여기를 클릭하세요</p>
        <span>JPG, PNG 파일만 가능 (최대 5MB)</span>
      </div>
    `
    photoInput.value = ""
    authBtn.disabled = true
  }

  // 인증 버튼 클릭 이벤트 (바로 사용)
  authBtn.addEventListener("click", () => {
    // 활성 예약 확인
    if (hasActiveReservation()) {
      showToast("error", "이미 예약하거나 사용 중인 강의실이 있습니다. 먼저 퇴실하거나 예약을 취소해주세요.")
      return
    }

    if (!photoInput.files[0]) {
      showToast("error", "먼저 사진을 업로드해주세요.")
      return
    }

    // 로딩 상태
    const originalContent = authBtn.innerHTML
    authBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>인증 중...</span>'
    authBtn.disabled = true

    // AI 인증 시뮬레이션
    setTimeout(() => {
      const isSuccess = Math.random() < 0.9 // 90% 성공률

      if (isSuccess) {
        // 자동 시간 계산 (정확한 30분 단위)
        const { startTime, endTime } = getNextAvailableTime()

        // 바로 사용 정보 저장
        const directUseInfo = {
          id: Date.now().toString(),
          roomName: roomCardTitle.textContent,
          date: formattedDate,
          startTime: startTime,
          endTime: endTime,
          duration: "3시간",
          status: "active", // 바로 사용 중 상태
          timestamp: new Date().getTime(),
          createdAt: new Date().toISOString(),
          type: "direct", // 바로 사용
          actualStartTime: new Date().getTime(), // 실제 시작 시간 저장
        }

        saveReservation(directUseInfo)

        // 인증 성공 모달 표시
        showAuthSuccessModal(startTime, endTime)
      } else {
        showToast("error", "인증에 실패했습니다. 강의실 내부가 잘 보이도록 다시 촬영해주세요.")
        window.resetPhotoUpload()
      }

      // 버튼 상태 복원
      authBtn.innerHTML = originalContent
      authBtn.disabled = !photoInput.files[0]
    }, 2000)
  })

  // 인증 성공 모달 표시 함수
  function showAuthSuccessModal(startTime, endTime) {
    const modalHTML = `
      <div class="auth-success-modal" id="authSuccessModal">
        <div class="modal-overlay-custom">
          <div class="modal-box-custom">
            <div class="success-icon">
              <i class="fas fa-check-circle"></i>
            </div>
            <p class="modal-message">인증이 완료되었습니다!</p>
            <p style="font-size: 14px; color: var(--text-secondary); margin-bottom: 10px;">강의실 사용이 시작되었습니다.</p>
            <div style="background: #f8f9fa; padding: 12px; border-radius: 8px; margin-bottom: 20px;">
              <p style="margin: 0; font-size: 14px; color: var(--text-primary);"><strong>사용 시간:</strong> ${startTime} ~ ${endTime} (3시간)</p>
            </div>
            <button class="modal-confirm-btn" onclick="closeAuthModal()">확인</button>
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

  // 인증 모달 닫기 함수
  window.closeAuthModal = () => {
    const modal = document.getElementById("authSuccessModal")
    if (modal) {
      modal.remove()
      document.body.style.overflow = ""
    }

    // 이용 내역 페이지로 이동 옵션 제공
    setTimeout(() => {
      if (confirm("강의실 사용이 시작되었습니다. 이용 내역 페이지로 이동하시겠습니까?")) {
        window.location.href = "usage-history.html"
      }
    }, 1000)
  }

  // 인증 확인 버튼 클릭 이벤트
  confirmAuthBtn.addEventListener("click", () => {
    authModal.classList.remove("show")
    showToast("success", "인증이 완료되었습니다. 이제 강의실을 이용할 수 있습니다.")
  })

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

  // 로컬 스토리지에 예약 정보 저장 함수
  function saveReservation(reservationInfo) {
    const reservations = JSON.parse(localStorage.getItem("reservations")) || []
    reservations.push(reservationInfo)
    localStorage.setItem("reservations", JSON.stringify(reservations))

    // 이용 내역 페이지의 배지 업데이트
    updateHistoryBadge()

    // 시간 옵션 다시 업데이트
    disableUnavailableTimeOptions()
  }

  // 이용 내역 배지 업데이트 함수
  function updateHistoryBadge() {
    const reservations = JSON.parse(localStorage.getItem("reservations")) || []
    const activeReservations = reservations.filter((r) => r.status === "reserved" || r.status === "active")

    const historyBadge = document.querySelector('.nav-item[data-page="usage-history.html"] .nav-badge')
    if (historyBadge) {
      if (activeReservations.length > 0) {
        historyBadge.textContent = activeReservations.length
        historyBadge.style.display = "flex"
      } else {
        historyBadge.style.display = "none"
      }
    }
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

  // 페이지 로드 시 초기화
  disableUnavailableTimeOptions()
  updateHistoryBadge()

  // localStorage 변경 감지 (다른 탭에서 예약 변경 시)
  window.addEventListener("storage", (e) => {
    if (e.key === "reservations") {
      disableUnavailableTimeOptions()
      updateReservationSummary()
    }
  })
})

// 이 파일을 mypage.js 이후에 로드하여 게이지 문제를 해결합니다
document.addEventListener("DOMContentLoaded", () => {
  // 게이지 요소 직접 접근
  const gaugeFill = document.querySelector(".gauge-fill")
  const pointsNumber = document.querySelector(".points-number")

  if (gaugeFill) {
    // 현재 포인트 가져오기
    const storedPoints = localStorage.getItem("userPoints")
    const currentPoints = storedPoints ? Number.parseInt(storedPoints, 10) : 100

    // 포인트 숫자 업데이트
    if (pointsNumber) {
      pointsNumber.textContent = currentPoints
    }

    // 포인트를 백분율로 변환 (0-150점 기준)
    const percent = (Math.min(Math.max(currentPoints, 0), 150) / 150) * 100

    // 게이지 너비 설정
    console.log("직접 게이지 너비 설정:", percent + "%")

    // 애니메이션 효과 추가
    setTimeout(() => {
      gaugeFill.style.transition = "width 1s ease-in-out, background 0.5s ease"
      gaugeFill.style.width = `${percent}%`

      // 포인트에 따른 색상 변경
      if (currentPoints < 30) {
        gaugeFill.style.background = "linear-gradient(90deg, var(--error-color) 0%, var(--error-color) 100%)"
      } else if (currentPoints < 70) {
        gaugeFill.style.background = "linear-gradient(90deg, var(--warning-color) 0%, var(--warning-color) 100%)"
      } else {
        gaugeFill.style.background = "linear-gradient(90deg, var(--success-color) 0%, var(--success-color) 100%)"
      }
    }, 300)
  } else {
    console.error("게이지 요소를 찾을 수 없습니다.")
  }

  // 포인트 변경 감지 이벤트 리스너
  window.addEventListener("storage", (e) => {
    if (e.key === "userPoints" && gaugeFill) {
      const newPoints = Number.parseInt(e.newValue, 10)
      const percent = (Math.min(Math.max(newPoints, 0), 150) / 150) * 100

      // 포인트 숫자 업데이트
      if (pointsNumber) {
        pointsNumber.textContent = newPoints
      }

      gaugeFill.style.width = `${percent}%`

      // 포인트에 따른 색상 변경
      if (newPoints < 30) {
        gaugeFill.style.background = "linear-gradient(90deg, var(--error-color) 0%, var(--error-color) 100%)"
      } else if (newPoints < 70) {
        gaugeFill.style.background = "linear-gradient(90deg, var(--warning-color) 0%, var(--warning-color) 100%)"
      } else {
        gaugeFill.style.background = "linear-gradient(90deg, var(--success-color) 0%, var(--success-color) 100%)"
      }
    }
  })

  // 포인트 변경 테스트 버튼 추가 (개발용)
  const addTestButtons = () => {
    const container = document.querySelector(".points-description")
    if (!container) return

    const buttonContainer = document.createElement("div")
    buttonContainer.style.cssText = "display: flex; gap: 10px; margin-top: 12px;"

    const addButton = document.createElement("button")
    addButton.textContent = "+10P"
    addButton.style.cssText =
      "padding: 4px 8px; background: var(--success-color); color: white; border: none; border-radius: 4px; cursor: pointer;"
    addButton.onclick = () => {
      if (window.myPageSystem) {
        window.myPageSystem.updatePoints(10)
      }
    }

    const subtractButton = document.createElement("button")
    subtractButton.textContent = "-10P"
    subtractButton.style.cssText =
      "padding: 4px 8px; background: var(--error-color); color: white; border: none; border-radius: 4px; cursor: pointer;"
    subtractButton.onclick = () => {
      if (window.myPageSystem) {
        window.myPageSystem.updatePoints(-10)
      }
    }

    buttonContainer.appendChild(addButton)
    buttonContainer.appendChild(subtractButton)
    container.appendChild(buttonContainer)
  }

  // 개발 환경에서만 테스트 버튼 추가
  if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
    addTestButtons()
  }
})

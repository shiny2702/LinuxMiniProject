import os
import re
import time
import subprocess
import notify2
from datetime import datetime

# 설정 파일 및 로그 파일 경로
STATE_FILE = "/opt/LinuxFocusScheduler/state/idle_popup_enabled"
LOG_FILE = "/var/log/LinuxFocusScheduler/idle.log"

# 유휴 상태로 판단할 임계값 (초 단위)
IDLE_THRESHOLD = 15  # 15초 이상 입력이 없으면 유휴 상태로 판단
CHECK_INTERVAL = 5   # 유휴 상태 (on/off) 체크 간격 (초)

# 시스템 알림 초기화
notify2.init("IdleNotifier")

def is_idle(threshold):
    """
    GNOME 환경에서 gdbus를 통해 현재 시스템의 유휴 시간을 가져와
    지정된 임계값(threshold) 초 이상일 경우 True를 반환함.
    예외 발생 시 False 반환 및 로그 기록.
    """
    try:
        # GNOME 환경인지 확인 (gnome-shell 명령이 없으면 오류 발생)
        subprocess.check_output(
            ["gnome-shell", "--version"],
            stderr=subprocess.DEVNULL
        )

        # gdbus를 사용해 Mutter IdleMonitor로부터 유휴 시간 조회
        output = subprocess.check_output(
            ["gdbus", "call", "--session",
             "--dest", "org.gnome.Mutter.IdleMonitor",
             "--object-path", "/org/gnome/Mutter/IdleMonitor/Core",
             "--method", "org.gnome.Mutter.IdleMonitor.GetIdletime"]
        ).decode()

        # 결과에서 uint32 또는 uint64 숫자 추출 (밀리초 단위)
        match = re.search(r'uint(?:32|64)\s+(\d+)', output)
        if not match:
            raise ValueError(f"파싱 실패: {output}")
        
        idle_time = int(match.group(1)) / 1000  # 밀리초 → 초로 변환
        return idle_time >= threshold

    except Exception as e:
        # 오류 발생 시 로그 기록하고 유휴 상태 아님으로 간주
        log(f"⚠️ Idle 체크 중 오류 발생: {str(e)}")
        return False

def log(message):
    """
    로그 파일에 타임스탬프와 함께 메시지를 기록하는 함수
    """
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    with open(LOG_FILE, "a") as f:
        f.write(f"[{timestamp}] {message}\n")

def notify(message):
    """
    notify2를 사용해 시스템 알림을 표시하는 함수
    """
    n = notify2.Notification("💤 유휴 상태 감지됨", message)
    n.set_urgency(notify2.URGENCY_NORMAL)
    n.show()

def main():
    """
    상태 파일이 on으로 설정되어 있을 때,
    일정 시간 이상 유휴 상태가 감지되면 알림을 보내고 로그를 남김.
    유휴 상태가 해제되면 다시 활동 재개 로그를 기록함.
    """
    log("🎬 monitor_idle.py 시작됨")

    idle_logged = False         # 유휴 상태 감지 로그/알림 중복 방지 플래그
    inactive_logged = False     # 비활성 상태 로그 중복 방지 플래그

    while True:
        # 상태 파일이 존재하는 경우에만 모니터링 진행
        if os.path.exists(STATE_FILE):
            with open(STATE_FILE, "r") as f:
                state = f.read().strip()

            # 상태가 "on"이 아닐 경우, 모니터링 일시 정지
            if state != "on":
                if not inactive_logged:
                    log("🛑 모니터링 비활성화 상태. 대기 중...")
                    inactive_logged = True  # 한 번만 로그
                time.sleep(CHECK_INTERVAL)
                continue
        else:
            # 상태 파일 자체가 없으면 종료
            log("❌ 상태 파일 없음, 모니터링 중단")
            break

        # 유휴 상태 판단
        if is_idle(IDLE_THRESHOLD):
            if not idle_logged:
                log("💤 사용자 유휴 상태 감지됨")
                notify("Focus Alarm :: 집중 필요!!")
                idle_logged = True
        else:
            # 유휴 상태에서 벗어난 경우 로그 및 상태 초기화
            if idle_logged:
                log("💡 사용자 활동 재개 감지됨")
                idle_logged = False
                inactive_logged = False  # 모니터링 재개 메시지도 재허용

        time.sleep(CHECK_INTERVAL)

if __name__ == "__main__":
    main()



#!/usr/bin/env python3

import os
import re
import time
import subprocess
import notify2
from datetime import datetime

STATE_FILE = "/opt/LinuxFocusScheduler/state/idle_popup_enabled"
LOG_FILE = "/var/log/LinuxFocusScheduler/idle.log"
IDLE_THRESHOLD = 60  # seconds
CHECK_INTERVAL = 5   # seconds

# Initialize notifications
notify2.init("IdleNotifier")

def is_idle(threshold):
    try:
        # GNOME 환경 확인 (실패하면 예외 처리됨)
        subprocess.check_output(
            ["gnome-shell", "--version"],
            stderr=subprocess.DEVNULL
        )

        # gdbus로 idle time 가져오기
        output = subprocess.check_output(
            ["gdbus", "call", "--session",
             "--dest", "org.gnome.Mutter.IdleMonitor",
             "--object-path", "/org/gnome/Mutter/IdleMonitor/Core",
             "--method", "org.gnome.Mutter.IdleMonitor.GetIdletime"]
        ).decode()

        # 정규식으로 uint32 숫자 추출
        match = re.search(r'uint(?:32|64)\s+(\d+)', output)
        if not match:
            raise ValueError(f"파싱 실패: {output}")
        
        idle_time = int(match.group(1)) / 1000  # ms → sec
        return idle_time >= threshold

    except Exception as e:
        log(f"⚠️ Idle 체크 중 오류 발생: {str(e)}")
        return False

def log(message):
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    with open(LOG_FILE, "a") as f:
        f.write(f"[{timestamp}] {message}\n")

def notify(message):
    n = notify2.Notification("💤 유휴 상태 감지됨", message)
    n.set_urgency(notify2.URGENCY_NORMAL)
    n.show()

def main():
    log("🎬 monitor_idle.py 시작됨")
    idle_logged = False

    while True:
        if os.path.exists(STATE_FILE):
            with open(STATE_FILE, "r") as f:
                state = f.read().strip()
            if state != "on":
                log("🛑 모니터링 비활성화 상태. 대기 중...")
                time.sleep(CHECK_INTERVAL)
                continue
        else:
            log("❌ 상태 파일 없음, 모니터링 중단")
            break

        if is_idle(IDLE_THRESHOLD):
            if not idle_logged:
                log("💤 사용자 유휴 상태 감지됨")
                notify("사용자가 60초 동안 입력이 없습니다.")
                idle_logged = True
        else:
            if idle_logged:
                log("💡 사용자 활동 재개 감지됨")
                idle_logged = False

        time.sleep(CHECK_INTERVAL)

if __name__ == "__main__":
    main()


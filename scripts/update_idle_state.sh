#!/bin/bash

# 현재 스크립트가 위치한 디렉토리 경로를 구함
SCRIPT_DIR=$(dirname "$(readlink -f "$0")")

# 입력 인자(상태 값: on 또는 off)
NEW_STATE=$1

# 상태 파일 경로: idle 팝업 기능의 현재 설정 상태를 기록
STATE_FILE="/opt/LinuxFocusScheduler/state/idle_popup_enabled"

# PID 파일 경로: 모니터링 프로세스의 PID를 기록
PID_FILE="/opt/LinuxFocusScheduler/state/idle_monitor.pid"

# 로그 파일 경로: 모니터링 시작/중지 등 기록
LOG_FILE="/var/log/LinuxFocusScheduler/idle.log"

# 실제 모니터링 스크립트 경로 (Python 스크립트로 교체됨)
MONITOR_SCRIPT="/opt/LinuxFocusScheduler/scripts/idle_monitor.py"

# on 또는 off 외의 인자가 들어오면 사용법 안내 후 종료
if [[ "$NEW_STATE" != "on" && "$NEW_STATE" != "off" ]]; then
    echo "사용법: $0 [on|off]"
    exit 1
fi

# 필요한 디렉토리 생성 (state 파일과 로그 디렉토리)
mkdir -p "$(dirname "$STATE_FILE")" "$(dirname "$LOG_FILE")"

# 상태 파일에 현재 설정(on/off) 저장
echo "$NEW_STATE" > "$STATE_FILE"

# 상태 변경 로그 기록
timestamp=$(date '+%Y-%m-%d %H:%M:%S')
echo "[$timestamp] idle_popup_enabled set to '$NEW_STATE'" >> "$LOG_FILE"

# 'on'일 경우: 모니터링 프로세스 실행
if [[ "$NEW_STATE" == "on" ]]; then
    if [ -f "$PID_FILE" ]; then
        # 이미 실행 중이면 로그에 해당 PID 표시
        echo "모니터링 이미 실행 중 (PID: $(cat "$PID_FILE"))" >> "$LOG_FILE"
    else
        # 백그라운드에서 모니터링 스크립트 실행 및 PID 저장
        echo "모니터링 시작" >> "$LOG_FILE"
        nohup python3 "$MONITOR_SCRIPT" > /dev/null 2>&1 &
        echo $! > "$PID_FILE"
        echo "모니터링 프로세스 시작됨 (PID: $!)" >> "$LOG_FILE"
    fi

# 'off'일 경우: 기존 모니터링 프로세스 종료
else
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        if ps -p $PID > /dev/null; then
            echo "모니터링 중지 (PID: $PID)" >> "$LOG_FILE"
            kill $PID
        fi
        rm -f "$PID_FILE"
    else
        # PID 파일이 없을 경우 이미 종료된 것으로 간주
        echo "모니터링 프로세스 없음" >> "$LOG_FILE"
    fi
fi


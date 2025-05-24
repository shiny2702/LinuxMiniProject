#!/bin/bash

IDLE_THRESHOLD=$((10 * 60 * 1000))
SCRIPT_DIR=$(dirname "$(readlink -f "$0")")
STATUS_FILE="$SCRIPT_DIR/../state/idle_popup_enabled"
PID_FILE="$SCRIPT_DIR/../state/idle_monitor.pid"

# zenity, xprintidle 확인
command -v zenity >/dev/null 2>&1 || { echo "zenity가 설치되어야 합니다."; exit 1; }
command -v xprintidle >/dev/null 2>&1 || { echo "xprintidle이 설치되어야 합니다."; exit 1; }

# PID 파일 저장
echo $$ > "$PID_FILE"

# 무한 루프
while true; do
    # 상태가 off이면 종료
    if grep -q "off" "$STATUS_FILE"; then
        echo "상태가 off로 바뀜. 모니터 종료."
        rm -f "$PID_FILE"
        exit 0
    fi

    idle_time=$(xprintidle)
    if [ "$idle_time" -ge "$IDLE_THRESHOLD" ]; then
        zenity --info --text="너무 오래 쉬고 있어요! 집중할 시간이에요!" --timeout=10
    fi

    sleep 60
done

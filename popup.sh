#!/bin/bash

# 유휴 시간 기준 (ms) -10분
IDLE_THRESHOLD=$((10 * 60 * 1000)) 

# 상태 파일 경로
STATUS_FILE="/tmp/idle_popup_enabled"

# 상태 파일이 없으면 자동으로 생성 (기본 ON 상태)
touch "$STATUS_FILE"

while true; do
    # OFF 상태면 동작하지 않음
    if grep -q "off" "$STATUS_FILE"; then
        sleep 10
        continue
    fi

    idle_time=$(xprintidle)
    if [ "$idle_time" -ge "$IDLE_THRESHOLD" ]; then
        zenity --info --text="너무 오래 쉬고 있어요! 집중할 시간이에요!" --timeout=10
    fi
    sleep 60
done

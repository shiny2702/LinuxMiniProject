#!/bin/bash

SCRIPT_DIR=$(dirname "$(readlink -f "$0")")
NEW_STATE=$1

STATE_FILE="$SCRIPT_DIR/../state/idle_popup_enabled"
PID_FILE="$SCRIPT_DIR/../state/idle_monitor.pid"
MONITOR_SCRIPT="$SCRIPT_DIR/monitor_idle.sh"
LOG_FILE="$SCRIPT_DIR/../logs/idle.log"

if [[ "$NEW_STATE" != "on" && "$NEW_STATE" != "off" ]]; then
    echo "사용법: $0 [on|off]"
    exit 1
fi

mkdir -p "$(dirname "$STATE_FILE")" "$(dirname "$LOG_FILE")"

echo "$NEW_STATE" > "$STATE_FILE"
timestamp=$(date '+%Y-%m-%d %H:%M:%S')
echo "[$timestamp] idle_popup_enabled set to '$NEW_STATE'" >> "$LOG_FILE"

if [[ "$NEW_STATE" == "on" ]]; then
    if [ -f "$PID_FILE" ]; then
        echo "모니터링 이미 실행 중 (PID: $(cat "$PID_FILE"))"
    else
        echo "모니터링 시작"
        nohup bash "$MONITOR_SCRIPT" > /dev/null 2>&1 &
    fi
else
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        if ps -p $PID > /dev/null; then
            echo "모니터링 중지 (PID: $PID)"
            kill $PID
        fi
        rm -f "$PID_FILE"
    else
        echo "모니터링 프로세스 없음"
    fi
fi

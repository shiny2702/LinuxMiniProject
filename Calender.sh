#로그 저장 구조
#~/.focus_logs/YYYY-MM-DD.log

#~/.focus_mode_on.sh (시작 시 호출)
#!/bin/bash
FOCUS_LOG_DIR="$HOME/.focus_logs"
mkdir -p "$FOCUS_LOG_DIR"

DATE=$(date +%F)
TIME=$(date +%T)

# 스위치 확인 (켜져있을 때만 기록 시작)
FOCUS_SWITCH="$HOME/.focus_mode_enabled"
if [ -f "$FOCUS_SWITCH" ]; then
    echo "START: $TIME" >> "$FOCUS_LOG_DIR/$DATE.log"
    echo "$TIME" > "$HOME/.focus_current_start"
fi

# 알림
DISPLAY=:0 DBUS_SESSION_BUS_ADDRESS=unix:path=/run/user/$(id -u)/bus notify-send "집중 모드 시작" "지금부터 집중 모드입니다."


#~/.focus_mode_off.sh (종료 시 호출)
#!/bin/bash
FOCUS_LOG_DIR="$HOME/.focus_logs"
mkdir -p "$FOCUS_LOG_DIR"

DATE=$(date +%F)
END_TIME=$(date +%T)

# 스위치가 켜져있고 시작 시간이 기록되어 있을 경우만 종료 기록
if [ -f "$HOME/.focus_mode_enabled" ] && [ -f "$HOME/.focus_current_start" ]; then
    START_TIME=$(cat "$HOME/.focus_current_start")
    rm "$HOME/.focus_current_start"

    # 시간 계산
    START_TS=$(date -d "$START_TIME" +%s)
    END_TS=$(date -d "$END_TIME" +%s)
    DURATION=$((END_TS - START_TS))

    echo "END: $END_TIME" >> "$FOCUS_LOG_DIR/$DATE.log"
    echo "DURATION: $DURATION" >> "$FOCUS_LOG_DIR/$DATE.log"
fi

DISPLAY=:0 DBUS_SESSION_BUS_ADDRESS=unix:path=/run/user/$(id -u)/bus notify-send "집중 모드 종료" "집중 모드가 종료되었습니다."

#ON/OFF 스위치 이야기를 했더니 GPT가 써 줬는데... 필요없으시면 삭제해 주세요!
#프론드엔드 버튼이랑 연결하면 된다고 합니다
# 집중모드 수동 활성화
touch ~/.focus_mode_enabled

# 집중모드 수동 비활성화
rm -f ~/.focus_mode_enabled

#get_focus_duration.sh 날짜별 사용 시간 계산 스크립트
#!/bin/bash
DATE="$1"
LOG="$HOME/.focus_logs/$DATE.log"

if [ ! -f "$LOG" ]; then
    echo "00:00:00"
    exit 0
fi

TOTAL=0
while read -r LINE; do
    if [[ $LINE == DURATION:* ]]; then
        SECONDS=$(echo $LINE | cut -d' ' -f2)
        TOTAL=$((TOTAL + SECONDS))
    fi
done < "$LOG"

# 출력: HH:MM:SS 형식
printf '%02d:%02d:%02d\n' $((TOTAL/3600)) $((TOTAL%3600/60)) $((TOTAL%60))
#사용 예: ./get_focus_duration.sh 2025-05-23
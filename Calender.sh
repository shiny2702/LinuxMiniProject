#로그 기록 포맷 예시 (~/focus_mode.log)
2025-05-19 START 10:00:00
2025-05-19 END 11:45:00
2025-05-19 START 15:00:00
2025-05-19 END 16:00:00

#집중 모드 실행 스크립트(로그 기록 포함)

#!/bin/bash

export DISPLAY=:0
export DBUS_SESSION_BUS_ADDRESS="unix:path=/run/user/$(id -u)/bus"

LOGFILE="$HOME/focus_mode.log"

# 로그 시작 시간
echo "$(date '+%F') START $(date '+%T')" >> "$LOGFILE"

# 알림
notify-send "집중 모드가 실행됩니다"

#사용자가 직접 종료할 때 종료 기록 남김(focus_end.sh)
#!/bin/bash

LOGFILE="$HOME/focus_mode.log"
echo "$(date '+%F') END $(date '+%T')" >> "$LOGFILE"

notify-send "집중 모드가 종료되었습니다"

#하루별 집중 시간 계산 스크립트(daily_focus_report.sh)

#!/bin/bash

LOGFILE="$HOME/focus_mode.log"
DATE=$(date '+%F')

# 오늘 날짜 로그 추출
awk -v date="$DATE" '$1 == date' "$LOGFILE" > /tmp/focus_today.log

# 시간 누적
total_sec=0
while read -r line1 && read -r line2; do
    start=$(echo "$line1" | awk '{print $3}')
    end=$(echo "$line2" | awk '{print $3}')
    sec=$(( $(date -d "$end" +%s) - $(date -d "$start" +%s) ))
    total_sec=$((total_sec + sec))
done < /tmp/focus_today.log

hours=$((total_sec / 3600))
minutes=$(((total_sec % 3600) / 60))

notify-send "오늘 집중 모드 사용 시간: ${hours}시간 ${minutes}분"

chmod +x ~/daily_focus_report.sh

#주간 평균 통계 스크립트(weekly_focus_report.sh)

#!/bin/bash

LOGFILE="$HOME/focus_mode.log"
START_DATE=$(date -d "last monday" '+%F')
END_DATE=$(date -d "last sunday" '+%F')

total_sec=0
days=0

# 월요일부터 일요일까지
for d in $(seq 0 6); do
    day=$(date -d "$START_DATE +$d day" '+%F')
    awk -v date="$day" '$1 == date' "$LOGFILE" > /tmp/day.log

    daily_sec=0
    while read -r line1 && read -r line2; do
        start=$(echo "$line1" | awk '{print $3}')
        end=$(echo "$line2" | awk '{print $3}')
        sec=$(( $(date -d "$end" +%s) - $(date -d "$start" +%s) ))
        daily_sec=$((daily_sec + sec))
    done < /tmp/day.log

    if [ "$daily_sec" -gt 0 ]; then
        total_sec=$((total_sec + daily_sec))
        days=$((days + 1))
    fi
done

if [ "$days" -eq 0 ]; then
    avg_sec=0
else
    avg_sec=$((total_sec / days))
fi

hours=$((avg_sec / 3600))
minutes=$(((avg_sec % 3600) / 60))

notify-send "이번 주 집중 모드 사용 시간 평균은 ${hours}시간 ${minutes}분입니다."

chmod +x ~/weekly_focus_report.sh

#crontab 설정
crontab -e
# 매일 밤 23:59에 오늘의 집중 모드 사용 시간 알림
59 23 * * * /home/USERNAME/daily_focus_report.sh

# 매주 일요일 밤 23:59에 주간 평균 시간 알림
59 23 * * 0 /home/USERNAME/weekly_focus_report.sh
# 분석한 로그 바탕으로 사용자 메일에 리포트 전송

sudo apt update
sudo apt install mailutils postfix   # 메일 전송 기능 갖추기
sudo apt install jq     # json의 변수 참조를 위해 필요함

#!/bin/bash         # bash 셀을 이용하여 스크립트 실행

# 메일을 일주일에 한 번 보내기 위해서는 리눅스 터미널에 크론탭으로 설정을 해야한다고 해요
# chmod +x /backends/scripts/send_report.sh
# crontab e
# 0 9 * * 0 /backends/scripts/send_report.sh

# 사용자 정보 설정 - setting.json 필드 참조
settings="backend/config/settings.json"
TO=$(jq -r '.email' "$settings")   # 사용자 메일 주소
USERNAME=$(jq -r '.username' "$settings")  # 사용자 이름
GROUP_NAME=$(jq -r '.username' "$settings")  # 사용자가 속한 그룹명


START_DATE=$(date -d "last sunday -6 days" '+%Y-%m-%d')  # 일주일 시작 (월요일)
END_DATE=$(date -d "last sunday" '+%Y-%m-%d')            # 일주일 끝 (일요일)
DATE="$START_DATE ~ $END_DATE"
HOSTNAME=$(hostname)    # 서버명

TIME_FOCUS=$(node focus.js)     # 자바스크립트 파일에서 집중시간, 집중해제 횟수 변수 가져오기
TIMES_UNLOCK=$(node unlock.js)


source ./check_idle.sh      # 쉘 스크립트 파일에서 유휴시간 기록해두는 변수 가져오기
# TIME_IDLE <- 대충 이런 이름?


# 메일 제목과 본문
SUBJECT="LinuxFocusScheduler - [$DATE] 사용자 활동 리포트"

BODY=$( cat <<EOF
안녕하세요, ${USERNAME}님. LinuxFocusScheduler에서 이번주의 리포트를 전달드립니다.


서버명: $HOSTNAME
소속 그룹: ${GROUP_NAME:-없음}
리포트 생성일시: $DATE
총 집중 시간: $TIME_FOCUS
총 유휴 시간: $TIME_IDLE
집중 모드 해제 시도 횟수: $TIMES_UNLOCK 


일주일 동안 수고하셨습니다.

EOF
)

# 메일 전송
echo "$BODY" | mail -s "$SUBJECT" "$TO"
# 그룹 별로 사용자들의 집중 통계를 공유
# 그룹 별 통계를 불러오는 동시에 사용자들의 현재 상태를 업데이트
# 사용자가 그룹에 추가되는 경우?

sudo apt install jq     # json의 변수 참조를 위해 필요함

#!/bin/bash

USERNAME=$(jq -r '.username' "$settings")  # 사용자 이름
GROUP_NAME=$(jq -r '.username' "$settings")  # 사용자가 속한 그룹명
GROUP_MEMBERS=$(getent group "$GROUP_NAME" | cut -d: -f4)
# getent group "$GROUP_NAME" : 지정된 그룹의 정보를 /etc/group 파일에서 가져옴
# cut -d: -f4 : 그룹 정보에서 4번째 필드는 그룹의 사용자 목록


# 각 사용자에 대해 통계 기록
for USER in $GROUP_MEMBERS; do
    DATE= # 마지막 접속 일자 & 시간을 표시하고 싶은데 가능할까
    TIME_FOCUS=$(node focus.js)     # 자바스크립트 파일에서 집중시간, 집중해제 횟수 변수 가져오기
    TIMES_UNLOCK=$(node unlock.js)

    source ./check_idle.sh      # 쉘 스크립트 파일에서 유휴시간 기록해두는 변수 가져오기
    # TIME_IDLE <- 대충 이런 이름?


    echo "$USER의 집중 현황 통계"
    echo "마지막 접속: $DATE"
    echo "총 집중 시간: $TIME_FOCUS"
    echo "총 유휴 시간: $TIME_IDLE"
    echo "집중 모드 해제 시도 횟수: $TIMES_UNLOCK" 
    echo "--------------------------------------"
done

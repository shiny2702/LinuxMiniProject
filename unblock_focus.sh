#!/bin/bash

# 차단했던 도메인
BLOCK_SITES=("facebook.com" "youtube.com" "instagram.com")

# /etc/hosts 복원
if [ -f /etc/hosts.bak ]; then
    echo "/etc/hosts 복원 중..."
    cp /etc/hosts.bak /etc/hosts
    echo "복원 완료!"
else
    echo "백업 파일이 없어 직접 복구합니다."
    for site in "${BLOCK_SITES[@]}"; do
        sed -i "/$site/d" /etc/hosts
    done
    echo "수동 제거 완료!"
fi

# 종료된 앱은 수동으로 다시 실행해야 하므로 메시지만 출력
echo "종료된 앱은 필요시 수동으로 다시 실행하세요."

# 실행 코드
#chmod +x unblock_focus.sh
#sudo ./unblock_focus.sh

#!/bin/bash

BLOCK_SITES=("facebook.com" "youtube.com" "instagram.com")
BLOCK_APPS=("discord" "spotify")

echo "[차단 상태 확인]"

# 웹사이트 차단 여부 확인
echo "웹사이트 차단 상태:"
for site in "${BLOCK_SITES[@]}"; do
    if grep -q "$site" /etc/hosts; then
        echo " - $site: 차단됨"
    else
        echo " - $site: 차단 안 됨"
    fi
done

echo ""

# 앱 실행 여부 확인
echo "방해 앱 실행 상태:"
for app in "${BLOCK_APPS[@]}"; do
    if pgrep -f "$app" >/dev/null; then
        echo " - $app: 실행 중"
    else
        echo " - $app: 실행 안 됨"
    fi
done

# 실행코드
#chmod +x check_block_status.sh
#./check_block_status.sh

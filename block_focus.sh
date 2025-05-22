#!/bin/bash

# 차단할 도메인 및 앱 리스트 ## 입력값을 받아야됨 수정
BLOCK_SITES=("facebook.com" "youtube.com" "instagram.com")
BLOCK_APPS=("discord" "spotify")

# /etc/hosts 백업
sudo cp /etc/hosts /etc/hosts.bak

echo #웹사이트 차단
for site in "${BLOCK_SITES[@]}"; do
    if ! grep -q "$site" /etc/hosts; then
        echo "127.0.0.1 $site" | sudo tee -a /etc/hosts > /dev/null
    fi
done

echo # 방해 앱을 써주긴 했는데 앱은 필요없을 것 같음
for app in "${BLOCK_APPS[@]}"; do
    pkill -f "$app"
done

echo #차단 완료

#실행 코드
#chmod +x block_focus.sh
#sudo ./block_focus.sh

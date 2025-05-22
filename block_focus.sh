#!/bin/bash

# 쉘스크립트에 인자로 전달된 도메인들을 차단
BLOCK_SITES=("$@")

# /etc/hosts 백업 (이미 백업이 존재하면 건너뜀)
if [ ! -f /etc/hosts.bak ]; then
    sudo cp /etc/hosts /etc/hosts.bak
fi

echo "[웹사이트 차단 시작]"
for site in "${BLOCK_SITES[@]}"; do
    if ! grep -q "$site" /etc/hosts; then
        echo "127.0.0.1 $site" | sudo tee -a /etc/hosts > /dev/null
        echo "$site 차단됨"
    else
        echo "$site 이미 차단되어 있음"
    fi
done

echo "[차단 완료]"

#!/bin/bash

# 인자로 전달된 도메인들을 차단 해제
BLOCK_SITES=("$@")

echo "[웹사이트 차단 해제 시작]"
for site in "${BLOCK_SITES[@]}"; do
    if grep -q "$site" /etc/hosts; then
        # 해당 도메인 줄 삭제
        sudo sed -i "/$site/d" /etc/hosts
        echo "$site 차단 해제됨"
    else
        echo "$site 은(는) 차단되어 있지 않음"
    fi
done

echo "[차단 해제 완료]"

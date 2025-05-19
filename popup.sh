#!/bin/bash

# 유휴 시간 기준 (ms)
IDLE_THRESHOLD=$((10 * 60 * 1000))  # 10분

while true; do
    idle_time=$(xprintidle)
    if [ "$idle_time" -ge "$IDLE_THRESHOLD" ]; then
        zenity --info --text="⏰ 너무 오래 쉬고 있어요! 집중할 시간이에요!" --timeout=10
    fi
    sleep 60
done

# xprintidle, zenity가 설치되어 있어야 하고, 
#GUI 환경이어야 작동함
#sudo apt install x11-utils zenity로 설치 가능.iamyena!

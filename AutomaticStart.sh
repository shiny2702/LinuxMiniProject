#!/bin/bash

# DISPLAY 및 DBUS 세션 주소 설정 (GUI 환경에서 알림을 위해 필요)
export DISPLAY=:0
export DBUS_SESSION_BUS_ADDRESS="unix:path=/run/user/$(id -u)/bus"

# 알림 보내기, 안 될 시 로그인한 GUI 사용자로 crontab을 설정했는지 확인
notify-send "집중 모드가 실행됩니다"

# 로그 기록 저장 위치 ~/focus_mode.sh
echo "집중 모드 실행됨: $(date)" >> ~/focus_mode.log

#실행 권한 부여
chmod +x ~/focus_mode.sh

#crontab 설정
crontab -e
0 10 * * * /home/USERNAME/focus_mode.sh #USERNAME 실제 사용자 명으로 바꾸기

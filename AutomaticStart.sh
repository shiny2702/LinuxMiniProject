#sudo apt install libnotify-bin
#libnotify-bin 패키지가 설치되어 있어야 notify-send가 작동한다고 함

#!/bin/bash

echo "집중 모드 시작 시간 설정 (예: 09 00)"
read -p "시 (0-23): " START_HOUR
read -p "분 (0-59): " START_MIN

echo "집중 모드 종료 시간 설정 (예: 17 30)"
read -p "시 (0-23): " END_HOUR
read -p "분 (0-59): " END_MIN

# 실행 스크립트 경로
FOCUS_ON_SCRIPT="$HOME/.focus_mode_on.sh"
FOCUS_OFF_SCRIPT="$HOME/.focus_mode_off.sh"

# 집중 모드 ON 스크립트 생성
cat <<EOF > "$FOCUS_ON_SCRIPT"
#!/bin/bash
DISPLAY=:0 DBUS_SESSION_BUS_ADDRESS=unix:path=/run/user/\$(id -u)/bus notify-send "집중 모드 시작" "지금부터 집중 모드입니다."
EOF

# 집중 모드 OFF 스크립트 생성
cat <<EOF > "$FOCUS_OFF_SCRIPT"
#!/bin/bash
DISPLAY=:0 DBUS_SESSION_BUS_ADDRESS=unix:path=/run/user/\$(id -u)/bus notify-send "집중 모드 종료" "집중 모드가 종료되었습니다."
EOF

chmod +x "$FOCUS_ON_SCRIPT" "$FOCUS_OFF_SCRIPT"

# 기존 크론탭 백업
crontab -l > mycron 2>/dev/null

# 기존 동일 시간 명령 제거
sed -i "\|$FOCUS_ON_SCRIPT|d" mycron
sed -i "\|$FOCUS_OFF_SCRIPT|d" mycron

# 새로 등록
echo "$START_MIN $START_HOUR * * * $FOCUS_ON_SCRIPT" >> mycron
echo "$END_MIN $END_HOUR * * * $FOCUS_OFF_SCRIPT" >> mycron

# 크론탭 적용
crontab mycron
rm mycron

echo "집중 모드 설정이 완료되었습니다!"

chmod +x setup_focus_mode.sh
./setup_focus_mode.sh
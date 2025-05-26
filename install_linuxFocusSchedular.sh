#!/bin/bash

set -e

# 기본 변수
APP_DIR="/opt/LinuxFocusScheduler"
LOG_DIR="/var/log/LinuxFocusScheduler"
WEB_ROOT="/var/www/html"
SRC_DIR="$PWD"  # 현재 디렉토리 기준 (개발 환경에서 실행)
CAFFEINE_DIR="$HOME/.local/share/gnome-shell/extensions/caffeine@patapon.info"

echo "1. 패키지 설치 중..."
sudo apt update
sudo apt install -y nodejs npm apache2 curl git python3 python3-pip libinput-tools
sudo pip3 install notify2 --break-system-packages

echo "2. 애플리케이션 디렉토리 구성 중..."
sudo mkdir -p "$APP_DIR"
sudo cp -r "$SRC_DIR/backend" "$APP_DIR/"
sudo cp -r "$SRC_DIR/scripts" "$APP_DIR/"
sudo cp -r "$SRC_DIR/state" "$APP_DIR/"

echo "3. 로그 디렉토리 설정 중..."
sudo mkdir -p "$LOG_DIR"
sudo cp "$SRC_DIR/logs/idle.log" "$LOG_DIR/"
sudo chmod -R 777 "$LOG_DIR"

echo "4. 웹 페이지 배포 중..."
sudo cp -r "$SRC_DIR/apacheWeb/"* "$WEB_ROOT/"
sudo chmod -R 777 "$WEB_ROOT/"*.html

echo "5. 권한 설정 중..."
sudo find "$APP_DIR" -type d -exec chmod 777 {} \;
sudo find "$APP_DIR" -type f -exec chmod 777 {} \;
sudo find "$WEB_ROOT" -type d -exec chmod 777 {} \;
sudo find "$WEB_ROOT" -type f -exec chmod 777 {} \;
sudo find "$LOG_DIR" -type d -exec chmod 777 {} \;
sudo find "$LOG_DIR" -type f -exec chmod 777 {} \;

echo "6. Node.js 의존성 설치 중..."
sudo npm install --prefix "$APP_DIR/backend"
sudo npm install cors --prefix "$APP_DIR/backend"

echo "7. 상태 파일 초기화 중..."
echo "on" | sudo tee "$APP_DIR/state/idle_popup_enabled" > /dev/null

echo "8. idle_monitor.py 백그라운드 실행 중..."
python3 "$APP_DIR/scripts/idle_monitor.py" &

echo ""
echo "✅ 설치 및 실행 완료!"
echo "➡ 웹 페이지: http://127.0.0.1/"
echo "➡ 백엔드:    http://127.0.0.1:3000/"
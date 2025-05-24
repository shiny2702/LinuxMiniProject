#!/bin/bash

set -e

# 기본 변수
APP_DIR="/opt/LinuxFocusScheduler"
LOG_DIR="/var/log/LinuxFocusScheduler"
WEB_ROOT="/var/www/html"
SRC_DIR="$PWD"  # 현재 디렉토리 기준 (개발 환경에서 실행)

echo "1. 패키지 설치 중..."
sudo apt update
sudo apt install -y nodejs npm apache2 zenity xprintidle

echo "2. 애플리케이션 디렉터리 복사 중..."
sudo mkdir -p $APP_DIR
sudo cp -r "$SRC_DIR/backend" "$APP_DIR/"
sudo cp -r "$SRC_DIR/scripts" "$APP_DIR/"
sudo cp -r "$SRC_DIR/state" "$APP_DIR/"

# ✅ backend 내부의 일반 파일 권한 664, 디렉터리는 755로 설정
sudo find "$APP_DIR/backend" -type d -exec chmod 755 {} \;
sudo find "$APP_DIR/backend" -type f -exec chmod 664 {} \;

# ✅ 쉘 스크립트에 실행 권한 부여 (scripts 폴더 내)
sudo find "$APP_DIR/scripts" -type d -exec chmod 755 {} \;
sudo find "$APP_DIR/scripts" -type f -name "*.sh" -exec chmod 755 {} \;

# ✅ state 디렉터리 및 파일 권한
sudo chmod -R 777 "$APP_DIR/state"

echo "3. 로그 디렉토리 설정 중..."
sudo mkdir -p $LOG_DIR
sudo cp "$SRC_DIR/logs/idle.log" "$LOG_DIR/"
sudo chmod -R 755 "$LOG_DIR"

echo "4. Apache 웹 루트에 index.html 배포 중..."
sudo cp -r "$SRC_DIR/apacheWeb/"* "$WEB_ROOT/"
sudo chmod -R 644 "$WEB_ROOT/"*.html

echo "5. Node.js 의존성 설치 중..."
# cd는 권한 문제 생기니 직접 실행
sudo npm install --prefix "$APP_DIR/backend"

echo "6. 초기 상태 파일 설정 중..."
echo "on" | sudo tee "$APP_DIR/state/idle_popup_enabled" > /dev/null

echo "7. monitor_idle.sh 백그라운드 실행 중..."
bash "$APP_DIR/scripts/monitor_idle.sh" &

echo "⭐ 설치 및 초기 구동 완료!"
echo "➡ 웹 페이지: http://127.0.0.1/"
echo "➡ 백엔드:    http://127.0.0.1:3000/"


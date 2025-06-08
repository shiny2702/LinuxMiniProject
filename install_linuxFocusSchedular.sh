#!/bin/bash

set -e

# 기본 변수
APP_DIR="/opt/LinuxFocusScheduler"      # 애플리케이션 설치 경로
LOG_DIR="/var/log/LinuxFocusScheduler"  # 로그 파일 저장 경로
WEB_ROOT="/var/www/html"                # 웹 페이지가 배포될 Apache 웹 루트 경로
SRC_DIR="$PWD"   # 현재 실행 디렉토리 (배포할 원본 파일들이 존재하는 위치)

# (옵션) GNOME 확장 프로그램 디렉토리 -> 화면 꺼짐 / 잠금 방지 기능
# CAFFEINE_DIR="$HOME/.local/share/gnome-shell/extensions/caffeine@patapon.info"

echo "1. 필수 패키지 설치 중..."
sudo apt update
sudo apt install -y nodejs npm apache2 python3 python3-pip libinput-tools jq dnsmasq
sudo pip3 install notify2 --break-system-packages  # Graphic 시스템 알림을 위한 파이썬 라이브러리

echo "2. systemd-resolved 비활성화 및 DNS 설정 중..."  # 53 포트에서 dnsmasq가 DNS 요청을 처리하도록 다른 서비스가 해당 포트 사용하지 못하도록 설정
sudo systemctl stop systemd-resolved
sudo systemctl disable systemd-resolved
sudo rm -f /etc/resolv.conf
echo "nameserver 127.0.0.1" | sudo tee /etc/resolv.conf

echo "3. dnsmasq 설정 파일 구성 중..."
sudo bash -c 'cat > /etc/dnsmasq.conf <<EOF
listen-address=127.0.0.1
server=8.8.8.8 
EOF'
# dnsmasq가 로컬에서만 요청을 수신
# 로컬에서 처리할 수 없는 DNS 요청은 Google DNS로 전달 --> 로컬 설정도 실현 가능하고, 다른 사이트 접속도 문제 없이 가능

echo "4. dnsmasq 서비스 재시작 중..."
sudo systemctl restart dnsmasq

echo "5. 애플리케이션 디렉토리 구성 중..."  # /opt에 backend, scripts, state 디렉토리 복사
sudo mkdir -p "$APP_DIR"
sudo cp -r "$SRC_DIR/backend" "$APP_DIR/"
sudo cp -r "$SRC_DIR/scripts" "$APP_DIR/"
sudo cp -r "$SRC_DIR/state" "$APP_DIR/"

echo "6. 로그 디렉토리 설정 중..."
sudo mkdir -p "$LOG_DIR"
sudo cp -r "$SRC_DIR/logs/"* "$LOG_DIR/"

echo "7. 웹 페이지 배포 중..."  # Apache 웹 루트에 웹 프론트 파일 복사
sudo cp -r "$SRC_DIR/apacheWeb/"* "$WEB_ROOT/"

echo "8. 권한 설정 중..."  # 디렉토리와 파일 모두 777 권한으로 설정 (편의 only for 개발환경)
sudo find "$APP_DIR" -type d -exec chmod 777 {} \;
sudo find "$APP_DIR" -type f -exec chmod 777 {} \;
sudo find "$WEB_ROOT" -type d -exec chmod 777 {} \;
sudo find "$WEB_ROOT" -type f -exec chmod 777 {} \;
sudo find "$LOG_DIR" -type d -exec chmod 777 {} \;
sudo find "$LOG_DIR" -type f -exec chmod 777 {} \;

echo "9. Node.js 의존성 설치 중..."
sudo npm install --prefix "$APP_DIR/backend"
sudo npm install cors --prefix "$APP_DIR/backend"

echo "10. 상태 파일 초기화 중..."  # idle 팝업 활성화 상태로 설정
echo "on" | sudo tee "$APP_DIR/state/idle_popup_enabled" > /dev/null

echo "11. idle_monitor.py 백그라운드 실행 중..."
python3 "$APP_DIR/scripts/idle_monitor.py" &

echo "12. 분석용 크론 등록 스크립트 실행 중..."  # 사용자 활동 분석을 위한 crontab 등록 스크립트 실행
sudo bash "$APP_DIR/scripts/register_analyzing_cron.sh"

echo ""
echo "✅ 설치 및 실행 완료!"
echo "➡ 웹 페이지: http://127.0.0.1/"
echo "➡ 백엔드:    http://127.0.0.1:3000/"
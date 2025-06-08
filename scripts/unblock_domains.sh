#!/bin/bash

# 차단 해제 대상 도메인이 등록된 JSON 파일 경로
JSON_FILE="/opt/LinuxFocusScheduler/state/registered_blockSiteApp.json"

# 시스템 hosts 파일, dnsmasq 설정파일 경로
HOSTS_FILE="/etc/hosts"
DNSMASQ_CONF="/etc/dnsmasq.conf"

# 로그 디렉토리 및 집중 시간 관련 로그 파일 경로
LOG_DIR="/var/log/LinuxFocusScheduler"
FOCUSED_LOG="$LOG_DIR/focusedTime.log"

# 로그 기록 함수 정의
log_event() {
  mkdir -p "$LOG_DIR"  # 로그 디렉토리 없으면 생성
  timestamp=$(date '+%Y-%m-%d %H:%M:%S')  # 현재 시각 기록
  echo "$timestamp $1" >> "$FOCUSED_LOG"  # 로그 파일에 메시지 저장
}

# 차단 설정 JSON 파일이 존재하지 않거나 비어있는 경우 종료
if [ ! -s "$JSON_FILE" ]; then
  echo "⚠️ 차단 설정 JSON이 없거나 비어 있음: $JSON_FILE"
  exit 0
fi

# JSON 문법 유효성 검사
if ! jq empty "$JSON_FILE" 2>/dev/null; then
  echo "❌ JSON 파싱 오류: $JSON_FILE"
  exit 1
fi

# 로그에 스크립트 실행 사실 기록
log_event "🕓 집중 시간 종료 - 도메인 차단 해제 스크립트 실행"

# 현재 hosts 파일 백업 (시간 정보 포함된 파일명 사용)
BACKUP_FILE="$HOSTS_FILE.unblock.backup.$(date +%Y%m%d%H%M%S)"
sudo cp "$HOSTS_FILE" "$BACKUP_FILE"
echo "📦 기존 $HOSTS_FILE 백업 완료: $BACKUP_FILE"

# /etc/dnsmasq.conf 백업
DNSMASQ_BACKUP="$DNSMASQ_CONF.unblock.backup.$(date +%Y%m%d%H%M%S)"
sudo cp "$DNSMASQ_CONF" "$DNSMASQ_BACKUP"
echo "📦 기존 /etc/dnsmasq.conf 백업 완료: $DNSMASQ_BACKUP"

# 작업용 임시 파일 생성
temp_file=$(mktemp)
cp "$HOSTS_FILE" "$temp_file"

temp_dnsmasq=$(mktemp)
cp "$DNSMASQ_CONF" "$temp_dnsmasq"

REMOVED=0  # 해제된 도메인 수 카운터 초기화

# JSON 파일에 정의된 각 도메인에 대해 반복
while IFS= read -r domain; do
  if [[ -n "$domain" ]]; then
    # hosts 파일에서 해당 도메인을 차단한 라인을 grep -v로 제거
    grep -v "127.0.0.1[[:space:]]\{1,\}$domain" "$temp_file" > "${temp_file}.new"
    mv "${temp_file}.new" "$temp_file"

    # dnsmasq.conf에서 제거
    grep -v "^address=/$domain/0\.0\.0\.0" "$temp_dnsmasq" > "${temp_dnsmasq}.new"
    mv "${temp_dnsmasq}.new" "$temp_dnsmasq"

    echo "✅ 차단 해제됨: $domain"
    ((REMOVED++))
  fi
done < <(jq -r '.[].domain' "$JSON_FILE")

# 변경 사항이 있는 경우 실제 hosts 파일 OR dnsmasq.conf 설정파일에 반영
if (( REMOVED > 0 )); then
  sudo cp "$temp_file" "$HOSTS_FILE"
  sudo cp "$temp_dnsmasq" "$DNSMASQ_CONF"
  echo "🧹 도메인 ${REMOVED}개 해제 완료"

  # dnsmasq 재시작
  echo "🔁 dnsmasq 재시작 중..."
  sudo systemctl restart dnsmasq
else
  echo "ℹ️ 해제할 도메인 없음"
fi

# 임시 파일 정리
rm -f "$temp_file" "$temp_dnsmasq"



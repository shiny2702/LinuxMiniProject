#!/bin/bash

set -e

# 경로 설정
JSON_FILE="/opt/LinuxFocusScheduler/state/registered_blockSiteApp.json"
HOSTS_FILE="/etc/hosts"

LOG_DIR="/var/log/LinuxFocusSchedular"
FOCUSED_LOG="$LOG_DIR/focusedTime.log"

log_event() {
  mkdir -p "$LOG_DIR"  # 로그 디렉토리 없으면 생성
  timestamp=$(date '+%Y-%m-%d %H:%M:%S')
  echo "$timestamp $1" >> "$FOCUSED_LOG"
}

# JSON 존재 확인
if [ ! -f "$JSON_FILE" ]; then
  echo "❌ JSON 파일이 존재하지 않습니다: $JSON_FILE"
  exit 1
fi

# 백업
BACKUP_FILE="/etc/hosts.unblock.backup.$(date +%Y%m%d%H%M%S)"
sudo cp "$HOSTS_FILE" "$BACKUP_FILE"
echo "✔️ 기존 /etc/hosts 백업 완료: $BACKUP_FILE"

# 로그 기록
log_event "🕓 집중 시간 종료 - 도메인 차단 해제 스크립트 실행"

# 도메인 리스트 추출 (빈 경우에도 에러 없이 빈 문자열로 처리)
domains=$(jq -r '.[].domain' "$JSON_FILE" 2>/dev/null || echo "")

REMOVED=0

if [ -n "$domains" ]; then
  while IFS= read -r domain; do
    # 빈 줄 무시
    if [ -z "$domain" ]; then
      continue
    fi

    if grep -qE "^127\.0\.0\.1\s+$domain(\s|$)" "$HOSTS_FILE"; then
      sudo sed -i.bak "/^127\.0\.0\.1\s\+$domain(\s|$)/d" "$HOSTS_FILE"
      echo "🔓 차단 해제됨: $domain"
      ((REMOVED++))
    else
      echo "⚠️ 차단 항목이 없음: $domain"
    fi
  done <<< "$domains"
else
  echo "⚠️ 해제할 도메인이 없습니다."
fi

echo "✅ 도메인 차단 해제 완료 ($REMOVED개 해제됨)"


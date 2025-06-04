#!/bin/bash

# 집중 시간에 등록된 도메인을 /etc/hosts 파일을 통해 차단하는 스크립트

# 차단 대상 도메인이 저장된 JSON 파일 경로
JSON_FILE="/opt/LinuxFocusScheduler/state/registered_blockSiteApp.json"
# hosts 파일 경로
HOSTS_FILE="/etc/hosts"
# 로그 디렉터리 및 로그 파일 경로 설정
LOG_DIR="/var/log/LinuxFocusScheduler"
FOCUSED_LOG="$LOG_DIR/focusedTime.log"

# 로그 기록 함수 (타임스탬프와 함께 메시지를 로그 파일에 기록)
log_event() {
  mkdir -p "$LOG_DIR"  # 로그 디렉터리 없으면 생성
  timestamp=$(date '+%Y-%m-%d %H:%M:%S')
  echo "$timestamp $1" >> "$FOCUSED_LOG"
}

# JSON 파일이 없거나 비어 있는 경우 처리 중단
if [ ! -s "$JSON_FILE" ]; then
  echo "⚠️ 차단 설정 JSON이 없거나 비어 있음: $JSON_FILE"
  exit 0
fi

# JSON 문법 검사 (문법 오류 시 스크립트 종료)
if ! jq empty "$JSON_FILE" 2>/dev/null; then
  echo "❌ JSON 파싱 오류: $JSON_FILE"
  exit 1
fi

# /etc/hosts 파일 백업 (백업 파일 이름에 타임스탬프 포함)
BACKUP_FILE="/etc/hosts.block.backup.$(date +%Y%m%d%H%M%S)"
sudo cp "$HOSTS_FILE" "$BACKUP_FILE"
echo "✔️ 기존 /etc/hosts 백업 완료: $BACKUP_FILE"

# 차단 시작 로그 기록
log_event "⏰ 집중 시간 시작 - 도메인 차단 스크립트 실행"

# 도메인 차단 개수 및 추가할 줄 초기화
BLOCKED=0
append_lines=""

# JSON에서 도메인 항목을 추출하여 한 줄씩 처리
while IFS= read -r domain; do
  [[ -z "$domain" ]] && continue  # 빈 줄은 무시

  # 이미 차단된 도메인이 아니라면 추가할 목록에 포함
  if ! grep -qE "^[[:space:]]*127\.0\.0\.1[[:space:]]+$domain([[:space:]]|$)" "$HOSTS_FILE"; then
    append_lines+="127.0.0.1 $domain"$'\n'
    echo "⛔ 차단 추가됨: $domain"
    ((BLOCKED++))
  else
    echo "⚠️ 이미 차단된 도메인: $domain"
  fi
done < <(jq -r '.[].domain' "$JSON_FILE")

# 차단할 항목이 있으면 hosts 파일에 한 번에 추가
if [ -n "$append_lines" ]; then
  temp_file=$(mktemp)                 # 임시 파일 생성
  cat "$HOSTS_FILE" > "$temp_file"   # 기존 hosts 복사
  printf "%s" "$append_lines" >> "$temp_file"  # 차단 도메인 추가
  sudo cp "$temp_file" "$HOSTS_FILE"           # 원본 파일 덮어쓰기
  rm "$temp_file"                    # 임시 파일 삭제
fi

# 최종 결과 출력
echo "✅ 도메인 차단 완료 ($BLOCKED개 추가됨)"


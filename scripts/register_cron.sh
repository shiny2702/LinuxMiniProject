#!/bin/bash

# 스크립트 실행 도중 오류 발생 시 즉시 종료
set -e

# 스케줄 JSON 경로
SCHEDULE_JSON="/opt/LinuxFocusScheduler/state/registered_schedule.json"
# 도메인 차단/해제 스크립트 경로
BLOCK_SCRIPT="/opt/LinuxFocusScheduler/scripts/block_domains.sh"
UNBLOCK_SCRIPT="/opt/LinuxFocusScheduler/scripts/unblock_domains.sh"
# 크론 임시 설정 파일 경로
CRON_TMP="/tmp/new_cron"

# 스케줄 JSON 파일이 없거나 비어있는지 확인
if [ ! -s "$SCHEDULE_JSON" ]; then
  echo "⚠️ 스케줄 JSON이 없거나 비어 있습니다: $SCHEDULE_JSON"
  exit 0
fi

# JSON 구문 유효성 검사 (구문 오류 시 종료)
if ! jq empty "$SCHEDULE_JSON" 2>/dev/null; then
  echo "❌ JSON 파싱 오류 발생: $SCHEDULE_JSON"
  exit 1
fi

# 기존 크론에서 LinuxFocusScheduler 관련 항목 제거 (crontab이 비어 있을 경우 대비해 오류 무시)
( crontab -l 2>/dev/null | grep -v "## LinuxFocusScheduler" ) > "$CRON_TMP" || true

# 새로 등록된 크론 작업 수 추적용 변수
ADDED=0

# JSON 배열의 각 항목을 반복하여 차단 및 해제 시간 크론 등록
while read -r entry; do
  # 시작/종료 시간 추출
  startHour=$(echo "$entry" | jq -r '.startHour')
  startMin=$(echo "$entry" | jq -r '.startMin')
  endHour=$(echo "$entry" | jq -r '.endHour')
  endMin=$(echo "$entry" | jq -r '.endMin')

  # 도메인 차단 시간 크론 등록
  echo "$startMin $startHour * * * bash $BLOCK_SCRIPT ## LinuxFocusScheduler BLOCK" >> "$CRON_TMP"
  
  # 도메인 해제 시간 크론 등록
  echo "$endMin $endHour * * * bash $UNBLOCK_SCRIPT ## LinuxFocusScheduler UNBLOCK" >> "$CRON_TMP"

  # 두 항목이 추가되었음을 카운트
  ((ADDED+=2))
done < <(jq -c '.[]' "$SCHEDULE_JSON")

# 최종 크론 작업 등록
crontab "$CRON_TMP"

# 임시 파일 정리
rm "$CRON_TMP"

# 완료 메시지 출력
echo "✅ 총 $ADDED개의 크론 작업이 등록되었습니다."

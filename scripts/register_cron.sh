#!/bin/bash

set -e

SCHEDULE_JSON="/opt/LinuxFocusScheduler/state/registered_schedule.json"
BLOCK_SCRIPT="/opt/LinuxFocusScheduler/scripts/block_domains.sh"
UNBLOCK_SCRIPT="/opt/LinuxFocusScheduler/scripts/unblock_domains.sh"

# 고유 태그로 기존 항목 삭제
( crontab -l | grep -v "## LinuxFocusScheduler" ) > /tmp/new_cron || true

# 각 스케줄 읽어 cron 등록
jq -c '.[]' "$SCHEDULE_JSON" | while read -r entry; do
  startHour=$(echo "$entry" | jq -r '.startHour')
  startMin=$(echo "$entry" | jq -r '.startMin')
  endHour=$(echo "$entry" | jq -r '.endHour')
  endMin=$(echo "$entry" | jq -r '.endMin')

  echo "$startMin $startHour * * * bash $BLOCK_SCRIPT ## LinuxFocusScheduler BLOCK" >> /tmp/new_cron
  echo "$endMin $endHour * * * bash $UNBLOCK_SCRIPT ## LinuxFocusScheduler UNBLOCK" >> /tmp/new_cron
done

# 적용
crontab /tmp/new_cron
rm /tmp/new_cron

echo "모든 스케줄에 대해 차단/해제 cron 등록 완료"

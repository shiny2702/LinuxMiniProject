#!/bin/bash

set -e

LOG_FILE="/var/log/LinuxFocusSchedular/scheduleSettings.log"
OUTPUT_JSON="/opt/LinuxFocusScheduler/state/everyday_scheduleSettings.json"

SUMMARY_DIR="$(dirname "$OUTPUT_JSON")"

if [ ! -d "$SUMMARY_DIR" ]; then
  mkdir -p "$SUMMARY_DIR"
fi

if [ ! -s "$LOG_FILE" ]; then
  echo "ℹ️ 로그 파일이 비어 있어 작업을 생략합니다: $LOG_FILE"
  exit 0
fi

declare -A added
declare -A deleted

while read -r line; do
  timestamp="${line:0:19}"               # YYYY-MM-DD HH:MM:SS
  date_part="${timestamp:0:10}"          # YYYY-MM-DD

  if [[ "$line" == *"✅ 스케줄 추가됨:"* ]]; then
    schedule_info=$(echo "$line" | grep -oP '\d{1,2}:\d{1,2} ~ \d{1,2}:\d{1,2} \(id: \d+\)')
    added["$date_part"]+="{\"info\": \"${schedule_info}\"},"
  elif [[ "$line" == *"🗑️ 스케줄 삭제됨:"* ]]; then
    schedule_info=$(echo "$line" | grep -oP '\d{1,2}:\d{1,2} ~ \d{1,2}:\d{1,2} \(id: \d+\)')
    deleted["$date_part"]+="{\"info\": \"${schedule_info}\"},"
  fi
done < "$LOG_FILE"

echo "{" > "$OUTPUT_JSON"
for date in "${!added[@]}" "${!deleted[@]}"; do
  # 중복 키 제거
  all_dates["$date"]=1
done

for date in "${!all_dates[@]}"; do
  added_entries="[${added[$date]%?}]"
  deleted_entries="[${deleted[$date]%?}]"

  [[ "${added[$date]}" == "" ]] && added_entries="[]"
  [[ "${deleted[$date]}" == "" ]] && deleted_entries="[]"

  printf '  "%s": {\n    "added": %s,\n    "deleted": %s\n  },\n' "$date" "$added_entries" "$deleted_entries" >> "$OUTPUT_JSON"
done

# 마지막 쉼표 제거
sed -i '$ s/},/}/' "$OUTPUT_JSON"
echo "}" >> "$OUTPUT_JSON"

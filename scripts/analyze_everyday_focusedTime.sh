#!/bin/bash

set -e

LOG_FILE="/var/log/LinuxFocusSchedular/focusedTime.log"
OUTPUT_JSON="/opt/LinuxFocusScheduler/state/everyday_focusedTime_summary.json"

SUMMARY_DIR="$(dirname "$OUTPUT_JSON")"

if [ ! -d "$SUMMARY_DIR" ]; then
  mkdir -p "$SUMMARY_DIR"
fi

if [ ! -s "$LOG_FILE" ]; then
  echo "ℹ️ 로그 파일이 비어 있어 작업을 생략합니다: $LOG_FILE"
  exit 0
fi

declare -A sessions
declare -A start_times

while read -r line; do
  timestamp="${line:0:19}"
  date_part="${timestamp:0:10}"
  time_part="${timestamp:11:8}"

  if [[ "$line" == *"⏰ 집중 시간 시작"* ]]; then
    start_times["$date_part"]="$time_part"
  elif [[ "$line" == *"🕓 집중 시간 종료"* ]]; then
    start="${start_times[$date_part]}"
    end="$time_part"

    if [[ -n "$start" ]]; then
      duration=$(date -u -d "0 $end - $start" +"%H:%M:%S")
      sessions["$date_part"]+="{\"start\":\"$start\",\"end\":\"$end\",\"duration\":\"$duration\"},"
      unset start_times["$date_part"]
    fi
  fi
done < "$LOG_FILE"

echo "{" > "$OUTPUT_JSON"
for date in "${!sessions[@]}"; do
  total_seconds=0
  entries="[${sessions[$date]%?}]"

  while read -r d; do
    IFS=':' read -r h m s <<< "$(echo "$d" | jq -r '.duration')"
    ((total_seconds+=10#$h*3600 + 10#$m*60 + 10#$s))
  done <<< "$(echo "$entries" | jq -c '.[]')"

  printf '  "%s": {\n    "sessions": %s,\n    "total": "%02d:%02d:%02d"\n  },\n' "$date" "$entries" \
    $((total_seconds / 3600)) $(( (total_seconds % 3600) / 60 )) $((total_seconds % 60)) >> "$OUTPUT_JSON"
done
sed -i '$ s/},/}/' "$OUTPUT_JSON"
echo "}" >> "$OUTPUT_JSON"

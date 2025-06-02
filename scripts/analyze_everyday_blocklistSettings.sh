#!/bin/bash

set -e

LOG_FILE="/var/log/LinuxFocusSchedular/blocklistSettings.log"
OUTPUT_JSON="/opt/LinuxFocusScheduler/state/everyday_blocklistSettings.json"

SUMMARY_DIR="$(dirname "$OUTPUT_JSON")"

# 상태 파일 경로가 없으면 생성
if [ ! -d "$SUMMARY_DIR" ]; then
  mkdir -p "$SUMMARY_DIR"
fi

# 로그 파일이 비어 있을 경우 종료
if [ ! -s "$LOG_FILE" ]; then
  echo "ℹ️ 로그 파일이 비어 있어 작업을 생략합니다: $LOG_FILE"
  exit 0
fi

# 임시 데이터 저장용 associative array
declare -A added_map
declare -A deleted_map

# 로그 분석
while read -r line; do
  timestamp="${line:0:19}"
  date_part="${timestamp:0:10}"

  if [[ "$line" =~ 차단\ 항목\ 추가됨:\ ([^ ]+) ]]; then
    hostname="${BASH_REMATCH[1]}"
    added_map["$date_part"]+="$hostname,"
  elif [[ "$line" =~ 차단\ 항목\ 삭제됨:\ ([^ ]+) ]]; then
    hostname="${BASH_REMATCH[1]}"
    deleted_map["$date_part"]+="$hostname,"
  fi
done < "$LOG_FILE"

# JSON 파일 생성
echo "{" > "$OUTPUT_JSON"
all_dates=$(printf "%s\n%s\n" "${!added_map[@]}" "${!deleted_map[@]}" | sort -u)

for date in $all_dates; do
  # added 항목 처리
  added_raw="${added_map[$date]}"
  deleted_raw="${deleted_map[$date]}"

  # 배열로 변환 및 중복 제거
  IFS=',' read -r -a added_arr <<< "${added_raw%,}"
  IFS=',' read -r -a deleted_arr <<< "${deleted_raw%,}"

  # JSON 배열로 포맷팅
  added_json=$(printf '"%s",' "${added_arr[@]}" | sed 's/,$//')
  deleted_json=$(printf '"%s",' "${deleted_arr[@]}" | sed 's/,$//')

  printf '  "%s": {\n    "added": [%s],\n    "deleted": [%s]\n  },\n' \
    "$date" "$added_json" "$deleted_json" >> "$OUTPUT_JSON"
done

# 마지막 쉼표 제거 후 마무리
sed -i '$ s/},/}/' "$OUTPUT_JSON"
echo "}" >> "$OUTPUT_JSON"

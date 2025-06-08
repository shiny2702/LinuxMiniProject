#!/bin/bash

set -e  # 오류 발생 시 즉시 스크립트 종료

# 원본 스케줄 설정 로그 파일 경로와 출력 JSON 파일 경로 지정
LOG_FILE="/var/log/LinuxFocusScheduler/scheduleSettings.log"
OUTPUT_JSON="/opt/LinuxFocusScheduler/state/everyday_scheduleSettings.json"

# 출력 JSON 파일이 위치할 디렉토리 경로 추출
SUMMARY_DIR="$(dirname "$OUTPUT_JSON")"

# 출력 디렉토리가 없으면 재귀적으로 생성
if [ ! -d "$SUMMARY_DIR" ]; then
  mkdir -p "$SUMMARY_DIR"
fi

# 로그 파일이 없거나 비어 있으면 작업을 생략하고 종료
if [ ! -f "$LOG_FILE" ] || [ ! -s "$LOG_FILE" ]; then
  echo "ℹ️ 로그 파일이 없거나 비어 있어 작업을 생략합니다: $LOG_FILE"
  exit 0
fi

# 날짜별 추가된 스케줄 정보 저장용 연관 배열 (JSON 문자열 형태)
declare -A added

# 날짜별 삭제된 스케줄 정보 저장용 연관 배열 (JSON 문자열 형태)
declare -A deleted

# 모든 날짜를 저장하는 연관 배열 (추가/삭제 날짜 통합용)
declare -A all_dates

# 로그 파일 라인별로 읽으며 스케줄 추가/삭제 이벤트 파싱
while read -r line; do
  # 로그 라인의 타임스탬프에서 날짜 부분 추출 (YYYY-MM-DD)
  timestamp="${line:0:19}"          
  date_part="${timestamp:0:10}"

  # "✅ 스케줄 추가됨:" 문구가 포함된 라인에서 스케줄 시간과 ID 정보 추출
  if [[ "$line" == *"✅ 스케줄 추가됨:"* ]]; then
    # 'HH:mm ~ HH:mm (id: 숫자)' 형식만 추출
    schedule_info=$(echo "$line" | grep -oP '\d{1,2}:\d{1,2} ~ \d{1,2}:\d{1,2} \(id: \d+\)')
    # 해당 날짜의 추가 배열에 JSON 객체 문자열 형태로 누적 (쉼표 포함)
    added["$date_part"]+="{\"info\": \"${schedule_info}\"},"

  # "🗑️ 스케줄 삭제됨:" 문구가 포함된 라인에서 스케줄 시간과 ID 정보 추출
  elif [[ "$line" == *"🗑️ 스케줄 삭제됨:"* ]]; then
    schedule_info=$(echo "$line" | grep -oP '\d{1,2}:\d{1,2} ~ \d{1,2}:\d{1,2} \(id: \d+\)')
    deleted["$date_part"]+="{\"info\": \"${schedule_info}\"},"
  fi
done < "$LOG_FILE"

# 추가된 날짜와 삭제된 날짜를 통합하여 전체 날짜 목록 생성
for date in "${!added[@]}"; do
  all_dates["$date"]=1
done

for date in "${!deleted[@]}"; do
  all_dates["$date"]=1
done

# JSON 출력 파일 생성 시작
echo "{" > "$OUTPUT_JSON"

# 모든 날짜에 대해 추가 및 삭제된 스케줄 정보를 JSON 형식으로 출력
for date in "${!all_dates[@]}"; do
  # 해당 날짜의 추가 스케줄 배열 문자열에서 마지막 쉼표 제거 후 대괄호로 감싸기
  added_entries="[${added[$date]%?}]"
  # 해당 날짜의 삭제 스케줄 배열 문자열에서 마지막 쉼표 제거 후 대괄호로 감싸기
  deleted_entries="[${deleted[$date]%?}]"

  # 만약 추가 또는 삭제 배열이 비어있다면 빈 배열로 대체
  [[ -z "${added[$date]}" ]] && added_entries="[]"
  [[ -z "${deleted[$date]}" ]] && deleted_entries="[]"

  # 날짜별 JSON 객체 출력 (쉼표 포함)
  printf '  "%s": {\n    "added": %s,\n    "deleted": %s\n  },\n' "$date" "$added_entries" "$deleted_entries" >> "$OUTPUT_JSON"
done

# 마지막 JSON 객체의 쉼표를 제거하여 올바른 JSON 형식 완성
sed -i '$ s/},/}/' "$OUTPUT_JSON"

# JSON 객체 닫기
echo "}" >> "$OUTPUT_JSON"



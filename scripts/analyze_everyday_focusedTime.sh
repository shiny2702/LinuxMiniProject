#!/bin/bash

set -e  # 스크립트 실행 중 오류 발생 시 즉시 종료

# 원본 로그 파일과 출력 JSON 파일 경로 설정
LOG_FILE="/var/log/LinuxFocusScheduler/focusedTime.log"
OUTPUT_JSON="/opt/LinuxFocusScheduler/state/everyday_focusedTime_summary.json"

# 출력 JSON 파일의 디렉토리 경로 추출
SUMMARY_DIR="$(dirname "$OUTPUT_JSON")"

# 출력 디렉토리가 없으면 생성 (재귀적 생성)
if [ ! -d "$SUMMARY_DIR" ]; then
  mkdir -p "$SUMMARY_DIR"
fi

# 로그 파일이 없거나 비어 있으면 작업 생략 후 종료
if [ ! -f "$LOG_FILE" ] || [ ! -s "$LOG_FILE" ]; then
  echo "ℹ️ 로그 파일이 없거나 비어 있어 작업을 생략합니다: $LOG_FILE"
  exit 0
fi

# 날짜별 집중 시간 세션을 저장할 연관 배열 (JSON 조각 저장용)
declare -A sessions
# 날짜별 집중 시간 시작 시각 저장용 연관 배열
declare -A start_times

# 로그 파일 한 줄씩 읽으며 집중 시간 시작/종료 이벤트 처리
while read -r line; do
  # 로그의 타임스탬프에서 날짜와 시간 부분 분리
  timestamp="${line:0:19}"
  date_part="${timestamp:0:10}"   # YYYY-MM-DD
  time_part="${timestamp:11:8}"   # HH:mm:ss

  # 집중 시간 시작 이벤트 감지 시 시작 시간 저장
  if [[ "$line" == *"⏰ 집중 시간 시작"* ]]; then
    start_times["$date_part"]="$time_part"

  # 집중 시간 종료 이벤트 감지 시 처리
  elif [[ "$line" == *"🕓 집중 시간 종료"* ]]; then
    start="${start_times[$date_part]}"
    end="$time_part"

    if [[ -n "$start" ]]; then
      # 시작/종료 시간을 초 단위 Unix timestamp로 변환
      start_sec=$(date -d "$start" +%s)
      end_sec=$(date -d "$end" +%s)

      # 종료 시간이 시작 시간보다 이전일 경우 (자정 넘김) 보정
      duration_sec=$((end_sec - start_sec))
      if (( duration_sec < 0 )); then
        duration_sec=$((duration_sec + 86400))  # 86400초 = 24시간
      fi

      # 지속 시간을 HH:mm:ss 포맷으로 변환
      duration=$(date -u -d "@$duration_sec" +"%H:%M:%S")

      # 해당 날짜 세션 배열에 JSON 형식으로 추가 (콤마 구분)
      sessions["$date_part"]+="{\"start\":\"$start\",\"end\":\"$end\",\"duration\":\"$duration\"},"

      # 처리 완료된 시작 시간 제거
      unset start_times["$date_part"]
    fi
  fi
done < "$LOG_FILE"

# JSON 출력 파일 생성 시작 (맨 앞에 '{' 추가)
echo "{" > "$OUTPUT_JSON"

# 날짜별로 세션 데이터와 총 집중 시간 합산 후 JSON 객체 작성
for date in "${!sessions[@]}"; do
  total_seconds=0
  # 세션 문자열에서 마지막 쉼표 제거 후 배열 형태로 감싸기
  entries="[${sessions[$date]%?}]"

  # jq를 이용해 각 세션의 duration 값을 파싱하여 초 단위로 누적 합산
  while read -r d; do
    IFS=':' read -r h m s <<< "$(echo "$d" | jq -r '.duration')"
    ((total_seconds+=10#$h*3600 + 10#$m*60 + 10#$s))
  done <<< "$(echo "$entries" | jq -c '.[]')"

  # 누적된 총 집중 시간을 HH:mm:ss 포맷으로 변환하여 JSON에 기록
  printf '  "%s": {\n    "sessions": %s,\n    "total": "%02d:%02d:%02d"\n  },\n' "$date" "$entries" \
    $((total_seconds / 3600)) $(( (total_seconds % 3600) / 60 )) $((total_seconds % 60)) >> "$OUTPUT_JSON"
done

# 마지막 객체의 쉼표 제거 (유효한 JSON 문법 유지)
sed -i '$ s/},/}/' "$OUTPUT_JSON"

# JSON 닫는 중괄호 추가
echo "}" >> "$OUTPUT_JSON"

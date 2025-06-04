#!/bin/bash

set -e  # 에러 발생 시 스크립트 즉시 종료 설정 (안전성 확보)

# 로그 파일과 출력 JSON 파일 경로 지정
LOG_FILE="/var/log/LinuxFocusScheduler/blocklistSettings.log"
OUTPUT_JSON="/opt/LinuxFocusScheduler/state/everyday_blocklistSettings.json"

# 출력 JSON 파일의 디렉토리 경로 추출
SUMMARY_DIR="$(dirname "$OUTPUT_JSON")"

# 출력 디렉토리가 없으면 생성 (재귀적으로 생성)
if [ ! -d "$SUMMARY_DIR" ]; then
  mkdir -p "$SUMMARY_DIR"
fi

# 로그 파일이 없거나 비어 있으면 처리 생략하고 종료
if [ ! -f "$LOG_FILE" ] || [ ! -s "$LOG_FILE" ]; then
  echo "ℹ️ 로그 파일이 없거나 비어 있어 작업을 생략합니다: $LOG_FILE"
  exit 0
fi

# 날짜별로 추가 및 삭제된 차단 항목을 저장할 연관 배열 초기화
declare -A added_map
declare -A deleted_map

# 로그 파일 한 줄씩 읽으며 분석
while read -r line; do
  # 로그 타임스탬프(앞 19글자: YYYY-MM-DD HH:mm:ss) 추출
  timestamp="${line:0:19}"
  # 날짜 부분(YYYY-MM-DD)만 분리
  date_part="${timestamp:0:10}"

  # "차단 항목 추가됨: domain" 패턴 매칭 시
  if [[ "$line" =~ 차단\ 항목\ 추가됨:\ ([^ ]+) ]]; then
    domain="${BASH_REMATCH[1]}"
    # 해당 날짜의 added_map 배열에 도메인 추가 (콤마 구분)
    added_map["$date_part"]+="$domain,"
  
  # "차단 항목 삭제됨: domain" 패턴 매칭 시
  elif [[ "$line" =~ 차단\ 항목\ 삭제됨:\ ([^ ]+) ]]; then
    domain="${BASH_REMATCH[1]}"
    # 해당 날짜의 deleted_map 배열에 도메인 추가 (콤마 구분)
    deleted_map["$date_part"]+="$domain,"
  fi
done < "$LOG_FILE"

# JSON 형식으로 출력 파일 생성 시작 (맨 앞에 '{' 추가)
echo "{" > "$OUTPUT_JSON"

# 날짜별 키값 합집합을 구해 정렬하여 변수에 저장
all_dates=$(printf "%s\n%s\n" "${!added_map[@]}" "${!deleted_map[@]}" | sort -u)

# 각 날짜별로 JSON 객체 생성
for date in $all_dates; do
  # 해당 날짜에 추가/삭제된 원시 문자열 값 추출
  added_raw="${added_map[$date]}"
  deleted_raw="${deleted_map[$date]}"

  # 콤마로 구분된 문자열을 배열로 변환 (마지막 콤마 제거)
  IFS=',' read -r -a added_arr <<< "${added_raw%,}"
  IFS=',' read -r -a deleted_arr <<< "${deleted_raw%,}"

  # 빈 문자열일 경우 빈 배열로 처리
  if [[ -z "$added_raw" ]]; then
    added_json=""
  else
    added_json=$(printf '"%s",' "${added_arr[@]}" | sed 's/,$//')
  fi

  if [[ -z "$deleted_raw" ]]; then
    deleted_json=""
  else
    deleted_json=$(printf '"%s",' "${deleted_arr[@]}" | sed 's/,$//')
  fi

  # 날짜별 JSON 객체를 출력 파일에 추가 (포맷팅 포함)
  printf '  "%s": {\n    "added": [%s],\n    "deleted": [%s]\n  },\n' \
    "$date" "$added_json" "$deleted_json" >> "$OUTPUT_JSON"
done

# 마지막 JSON 객체의 쉼표(,)를 제거하여 올바른 JSON 문법 완성
sed -i '$ s/},/}/' "$OUTPUT_JSON"

# JSON 닫는 중괄호 추가
echo "}" >> "$OUTPUT_JSON"


#!/bin/bash

# 스크립트 실행 도중 오류 발생 시 즉시 종료
set -e

# 현재 crontab에서 'analyze_everyday' 문자열이 포함된 모든 항목을 제거한 후 다시 등록
crontab -l 2>/dev/null | grep -v 'analyze_everyday' | crontab -

echo "분석용 크론 해제 완료"


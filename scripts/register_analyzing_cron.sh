#!/bin/bash

# 오류 발생 시 즉시 스크립트 종료
set -e

# 3개의 분석 스크립트를 매 1분마다 자동 실행되도록 crontab에 추가
{
  # 기존에 설정된 사용자 크론 작업을 가져옴 (없을 경우 무시)
  crontab -l 2>/dev/null

  # 집중 시간 로그 분석 스크립트 등록
  echo "* * * * * bash /opt/LinuxFocusScheduler/scripts/analyze_everyday_focusedTime.sh"
  # 사용자 일정 기반 집중 시간 분석 스크립트 등록 
  echo "* * * * * bash /opt/LinuxFocusScheduler/scripts/analyze_everyday_scheduleSettings.sh"
  # 차단 사이트/앱 설정 분석 스크립트 등록
  echo "* * * * * bash /opt/LinuxFocusScheduler/scripts/analyze_everyday_blocklistSettings.sh"
  
# 중복을 제거하고 크론에 다시 등록
} | sort -u | crontab -

echo "✅ 분석용 크론 작업 등록 완료"

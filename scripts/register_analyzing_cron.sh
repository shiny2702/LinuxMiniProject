#!/bin/bash

set -e

(crontab -l 2>/dev/null; echo "0 0 * * * /opt/LinuxFocusScheduler/scripts/analyze_everyday_focusedTime.sh") | crontab -
(crontab -l 2>/dev/null; echo "0 0 * * * /opt/LinuxFocusScheduler/scripts/analyze_everyday_scheduleSettings.sh") | crontab -
(crontab -l 2>/dev/null; echo "0 0 * * * /opt/LinuxFocusScheduler/scripts/analyze_everyday_blocklistSettings.sh") | crontab -

echo "일별 로그 분석용 크론 등록 완료"

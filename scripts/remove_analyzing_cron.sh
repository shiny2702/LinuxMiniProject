#!/bin/bash

set -e

crontab -l 2>/dev/null | grep -v 'analyze_everyday' | crontab -

echo "크론 해제 완료"

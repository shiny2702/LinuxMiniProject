// 서버에서 유휴 팝업 기능을 켜고 끄는 상태를 관리하는 라우터

const express = require('express');
const path = require('path');
const fs = require('fs');
const { execFile } = require('child_process');
const router = express.Router();

// 유휴 팝업 기능의 현재 상태를 저장하는 파일 경로
const STATE_FILE = '/opt/LinuxFocusScheduler/state/idle_popup_enabled';

/**
 * [POST] /toggle-popup
 * 클라이언트로부터 받은 on/off 요청에 따라 시스템 스크립트를 실행해
 * idle popup 기능의 상태를 변경함
 * - 'on' 또는 'off'를 인자로 전달해 스크립트 실행
 */
router.post('/toggle-popup', (req, res) => {
  const { enabled } = req.body;              // true 또는 false
  const state = enabled ? 'on' : 'off';      // 실행할 스크립트 인자로 변환
  const scriptPath = path.join(__dirname, '..', '..', 'scripts', 'update_idle_state.sh');

  // 외부 스크립트 실행 (보안 위해 execFile 사용)
  execFile(scriptPath, [state], (error, stdout, stderr) => {
    if (error) {
      console.error('스크립트 실행 오류:', error);
      return res.status(500).send('스크립트 실행 실패');
    }

    console.log(`상태 변경됨: ${state}`);
    res.send('상태 변경 성공');
  });
});

/**
 * [GET] /status
 * 현재 idle popup 기능이 활성화 되어 있는지를 확인
 * - 상태 파일을 읽어 'on'이면 true, 아니면 false로 반환
 */
router.get('/status', (req, res) => {
  try {
    const state = fs.existsSync(STATE_FILE)
      ? fs.readFileSync(STATE_FILE, 'utf-8').trim()  // 상태 파일이 존재하면 내용 읽기
      : 'off';                                       // 없으면 기본값 'off'
    
    // 클라이언트에 JSON 형태로 응답 (enabled: true/false)
    res.json({ enabled: state === 'on' });
  } catch (err) {
    console.error('상태 파일 읽기 오류:', err);
    res.status(500).json({ error: '상태 파일 읽기 실패' });
  }
});

module.exports = router;


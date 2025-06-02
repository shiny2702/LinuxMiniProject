// backend/routes/togglePopup.js
const express = require('express');
const path = require('path');
const fs = require('fs');
const { execFile } = require('child_process');
const router = express.Router();

const STATE_FILE = '/opt/LinuxFocusScheduler/state/idle_popup_enabled';

router.post('/toggle-popup', (req, res) => {
  const { enabled } = req.body;
  const state = enabled ? 'on' : 'off';
  const scriptPath = path.join(__dirname, '..', '..', 'scripts', 'update_idle_state.sh');

  execFile(scriptPath, [state], (error, stdout, stderr) => {
    if (error) {
      console.error('스크립트 실행 오류:', error);
      return res.status(500).send('스크립트 실행 실패');
    }
    console.log(`상태 변경됨: ${state}`);
    res.send('상태 변경 성공');
  });
});

router.get('/status', (req, res) => {
  try {
    const state = fs.existsSync(STATE_FILE)
      ? fs.readFileSync(STATE_FILE, 'utf-8').trim()
      : 'off';
    res.json({ enabled: state === 'on' });
  } catch (err) {
    console.error('상태 파일 읽기 오류:', err);
    res.status(500).json({ error: '상태 파일 읽기 실패' });
  }
});

module.exports = router;

const express = require('express');
const path = require('path');
const { execFile } = require('child_process');
const router = express.Router();

router.get('/scripts/run/:script', (req, res) => {
  const scriptName = req.params.script;
  const fullPath = path.join(__dirname, '..', '..', 'scripts', scriptName);

  execFile(fullPath, (error, stdout, stderr) => {
    if (error) {
      console.error(`❌ ${scriptName} 실행 오류:`, error);
      return res.status(500).send(stderr || '스크립트 오류');
    }
    res.send(stdout || '스크립트 실행 완료');
  });
});

module.exports = router;

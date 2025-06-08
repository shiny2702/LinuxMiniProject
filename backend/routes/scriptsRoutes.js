// 외부에서 실행 요청한 쉘 스크립트를 서버 측에서 실행하는 API 라우터

const express = require('express');
const path = require('path');
const { execFile } = require('child_process'); // 보안상 안전한 외부 스크립트 실행 방법
const router = express.Router();

/**
 * [GET] /run/:script
 * 지정된 스크립트 파일을 실행하는 API
 * - 사용자가 URL 경로 파라미터로 전달한 스크립트명을 기반으로 실행
 * - scripts 폴더 내의 파일만 실행하도록 제한
 * - execFile을 사용하여 인젝션 방지 및 파라미터 안전 확보
 */
router.get('/run/:script', (req, res) => {
  const scriptName = req.params.script;

  // scripts 디렉토리 내에서 실행할 스크립트의 전체 경로 구성
  const fullPath = path.join(__dirname, '..', '..', 'scripts', scriptName);

  // 지정된 스크립트를 execFile로 실행 (쉘 해석 없이 안전하게 실행)
  execFile(fullPath, (error, stdout, stderr) => {
    if (error) {
      // 스크립트 실행 중 오류 발생 시 에러 로그 출력 및 클라이언트에 오류 응답 전송
      console.error(`❌ ${scriptName} 실행 오류:`, error);
      return res.status(500).send(stderr || '스크립트 오류');
    }

    // 정상적으로 실행된 경우 표준 출력 결과 반환
    res.send(stdout || '스크립트 실행 완료');
  });
});

module.exports = router;

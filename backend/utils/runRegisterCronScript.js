const path = require('path');
const { exec } = require('child_process');

// 크론 작업 등록을 담당하는 셸 스크립트 파일 경로 지정
const REGISTER_CRON_SCRIPT = path.join(__dirname, '..', '..', 'scripts', 'register_cron.sh');

/**
 * 외부 셸 스크립트인 register_cron.sh를 실행하여
 * 시스템의 크론 작업을 등록하거나 갱신하는 함수
 * 
 * exec를 사용하여 비동기적으로 bash 스크립트 실행
 * 실행 결과에 따른 에러, 경고(stderr), 정상 출력(stdout)을 적절히 처리함
 */
function runRegisterCronScript() {
  exec(`bash ${REGISTER_CRON_SCRIPT}`, (error, stdout, stderr) => {
    // 스크립트 실행 중 오류가 발생하면 에러 메시지 출력 후 종료
    if (error) {
      console.error(`❌ register_cron.sh 실행 중 오류: ${error.message}`);
      return;
    }
    // 스크립트 실행 중 stderr에 내용이 있으면 경고로 출력
    if (stderr) console.error(`⚠️ stderr: ${stderr}`);
    // 정상 실행 결과(stdout)가 있을 경우 성공 로그로 출력
    if (stdout) console.log(`✅ cron 등록됨:\n${stdout}`);
  });
}

// 다른 파일에서 runRegisterCronScript 함수를 사용할 수 있도록 모듈 내보내기
module.exports = { runRegisterCronScript };


const path = require('path');
const { exec } = require('child_process');

const REGISTER_CRON_SCRIPT = path.join(__dirname, '..', '..', 'scripts', 'register_cron.sh');

function runRegisterCronScript() {
  exec(`bash ${REGISTER_CRON_SCRIPT}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`❌ register_cron.sh 실행 중 오류: ${error.message}`);
      return;
    }
    if (stderr) console.error(`⚠️ stderr: ${stderr}`);
    if (stdout) console.log(`✅ cron 등록됨:\n${stdout}`);
  });
}

module.exports = { runRegisterCronScript };

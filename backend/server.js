// backend/server.js

const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000;

// 라우트 모듈 불러오기
const togglePopupRoutes = require('./routes/togglePopupRoutes');
const scheduleRegisterRoutes = require('./routes/scheduleRegisterRoutes');
const blockSiteAppRegisterRoutes = require('./routes/blockSiteAppRegisterRoutes');
const utilsRoutes = require('./routes/utilsRoutes');
const scriptsRoutes = require('./routes/scriptsRoutes');

// 미들웨어 설정
// CORS 활성화: 다른 도메인/포트에서의 요청 허용
app.use(cors());
// 요청 본문(JSON) 파싱을 위한 미들웨어
app.use(express.json());


// 라우팅 경로 설정
// '/idle' 경로로 들어오는 요청은 togglePopup 관련 라우터에서 처리
app.use('/idle', togglePopupRoutes);

// '/schedule' 경로로 들어오는 요청은 스케줄 등록 및 관리 라우터에서 처리
app.use('/schedule', scheduleRegisterRoutes);

// '/blockSiteApp' 경로로 들어오는 요청은 차단 사이트/앱 등록 라우터에서 처리
app.use('/blockSiteApp', blockSiteAppRegisterRoutes);

// '/state' 경로는 서버 내 특정 상태 정보가 저장된 디렉토리를 정적 파일로 제공
app.use('/state', express.static('/opt/LinuxFocusScheduler/state'));

// '/utils' 경로로 들어오는 요청은 각종 유틸리티 기능 라우터에서 처리
app.use('/utils', utilsRoutes);

// '/scripts' 경로로 들어오는 요청은 서버 내 스크립트 실행 관련 라우터에서 처리
app.use('/scripts', scriptsRoutes);


// 서버 실행
// 지정한 포트(PORT)에서 HTTP 서버 시작 및 정상 실행 시 로그 출력
app.listen(PORT, () => {
  console.log(`서버 실행 중: http://localhost:${PORT}`);
});



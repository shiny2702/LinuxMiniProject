// backend/server.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const PORT = 3000;
const togglePopupRoutes = require('./routes/togglePopupRoutes');
const scheduleRegisterRoutes = require('./routes/scheduleRegisterRoutes');
const blockSiteAppRegisterRoutes = require('./routes/blockSiteAppRegisterRoutes');

// 미들웨어
app.use(cors());
app.use(express.json());

app.use('/idle', togglePopupRoutes);
app.use('/schedule', scheduleRegisterRoutes);
app.use('/blockSiteApp', blockSiteAppRegisterRoutes);
app.use('/state', express.static('/opt/LinuxFocusScheduler/state'));
app.use('/utils', utilsRoutes);
app.use('/scripts', scriptsRoutes);

// 서버 실행
app.listen(PORT, () => {
  console.log(`서버 실행 중: http://localhost:${PORT}`);
});


// backend/server.js
const express = require('express');
const app = express();
const PORT = 3000;
const togglePopupRouter = require('./routes/togglePopup');

// 미들웨어
app.use(express.json());
app.use(express.static('apacheWeb'));


app.use('/', togglePopupRouter);

// 서버 실행
app.listen(PORT, () => {
  console.log(`서버 실행 중: http://localhost:${PORT}`);
});


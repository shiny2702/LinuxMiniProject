// 유틸리티 관련 기능들을 제공하는 라우터 모듈

const express = require('express');
const router = express.Router();
const { isFocusTimeNow } = require('../utils/focusTimeChecker');

/**
 * [GET] /utils/focusTimeChecker
 * 현재 시점이 등록된 집중 시간(focus time)에 포함되는지 여부를 확인
 * - isFocusTimeNow() 함수는 내부적으로 스케줄 파일을 참조하여 판단함
 * - 클라이언트에 { isFocusTime: true | false } 형태로 결과 응답
 */
router.get('/focusTimeChecker', (req, res) => {
  try {
    const isFocusTime = isFocusTimeNow(); // 현재가 집중 시간인지 확인
    res.json({ isFocusTime });            // JSON 응답 반환
  } catch (err) {
    // focusTimeChecker 함수 내부에서 에러 발생 시 예외 처리
    console.error('focusTimeChecker 오류:', err);
    res.status(500).json({ error: 'Focus 시간 확인 중 오류 발생' });
  }
});

module.exports = router;


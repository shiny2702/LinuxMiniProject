# 베이스 이미지
FROM ubuntu:22.04

# 필수 패키지 설치 (bash, zenity, xprintidle, nodejs 등)
RUN apt-get update && apt-get install -y \
  bash \
  zenity \
  xprintidle \
  curl \
  && rm -rf /var/lib/apt/lists/*

# Node.js 설치 (예: 18 버전)
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs

# 작업 디렉토리 설정
WORKDIR /app

# 백엔드 코드 복사
COPY backend/ ./backend/

# 프론트엔드 복사
COPY apacheWeb/ ./apacheWeb/

# 권한 설정 (스크립트 실행 가능하게)
RUN chmod +x ./backend/scripts/*.sh

# npm 초기화 및 의존성 설치 (package.json이 있다면)
COPY package.json package-lock.json* ./
RUN npm install

# 포트 개방
EXPOSE 3000

# 컨테이너 시작 시 서버 실행
CMD ["node", "backend/server.js"]

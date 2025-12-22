
# Listify 🎵

음악 추천 및 플레이리스트 관리 웹 서비스

## 프로젝트 소개
Listify는 Spotify API와 연동하여 음악을 추천하고, 사용자가 직접 플레이리스트를 만들고 관리할 수 있는 풀스택 웹 프로젝트입니다. React 기반의 프론트엔드와 Flask 기반의 백엔드, MySQL 데이터베이스, Docker를 활용한 배포 환경을 갖추고 있습니다.

## 주요 기능
- 회원가입 및 로그인 (JWT 인증)
- 음악 추천 및 검색 (Spotify API 연동)
- 플레이리스트 생성/관리
- 음악 미리듣기(Spotify 웹 플레이어)
- 사용자 프로필 관리 및 수정
- 공지사항 확인

## 기술 스택
- **Frontend**: React, Vite, TypeScript
- **Backend**: Python (Flask)
- **Database**: MySQL
- **외부 API**: Spotify API
- **DevOps/Deployment**: Docker

## 폴더 구조
```
Listify/
├── backend/
│   ├── app.py
│   ├── controllers/
│   ├── model/
│   ├── routes/
│   ├── services/
│   ├── middleware/
│   └── ...
├── frontend/
│   ├── App.tsx
│   ├── components/
│   ├── pages/
│   ├── services/
│   └── ...
└── README.md
```

## 설치 및 실행 방법
### 환경설정
- Python 3.x, Node.js, npm, MySQL, Docker 설치 필요
- backend/.env 파일에 DB 및 Spotify API 키 등 환경변수 설정

### 백엔드 실행
```bash
cd backend
pip install -r requirements.txt
python app.py
```

### 프론트엔드 실행
```bash
cd frontend
npm install
npm run dev
```

### Docker로 전체 실행 (선택)
```bash
docker-compose up --build
```

## API 문서
- 주요 엔드포인트: `/music`, `/playlist`, `/user`, `/notice` 등
- 상세 API 문서는 [backend/API_TEST_GUIDE.md](backend/API_TEST_GUIDE.md) 참고

## 기여 방법
1. 이슈 등록 또는 Pull Request 생성
2. 코드 컨벤션 및 커밋 메시지 규칙 준수
3. 팀원과 협업 시 README 및 문서 업데이트

## 라이선스
MIT License

## 문의
프로젝트 관련 문의: [your-email@example.com]

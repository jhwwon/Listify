# Listify Frontend

음악 큐레이션 플랫폼 Listify의 프론트엔드 애플리케이션입니다.

## 기술 스택

- React 19.2.3
- TypeScript
- Vite
- TailwindCSS
- Recharts (데이터 시각화)
- Lucide React (아이콘)
- Spotify Web API

## 주요 기능

### 구현된 기능
- **홈**: 인기 트랙 조회 및 음악 장바구니 추가
- **탐색**: Spotify API를 통한 실시간 음악 검색
- **라이브러리**: 사용자 플레이리스트 관리
- **프로필**: 사용자 정보 및 음악 청취 통계 시각화
- **공지사항**: 운영자 공지사항 조회
- **장바구니**: 음악 큐레이션 및 플레이리스트 저장

### 데이터 시각화
- 장르 분포 (Pie Chart)
- 주간 활동 패턴 (Bar Chart)
- 음악적 특성 분석 (Radar Chart)

## 설치 및 실행

```bash
# 패키지 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build

# 프로덕션 미리보기
npm run preview
```

## 프로젝트 구조

```
frontend/
├── components/          # React 컴포넌트
│   ├── CartSidebar.tsx  # 장바구니 사이드바
│   ├── Charts.tsx       # 차트 컴포넌트들
│   ├── Header.tsx       # 헤더
│   ├── PlaylistCard.tsx # 플레이리스트 카드
│   └── SettingsModal.tsx # 설정 모달
├── services/            # 외부 API 서비스
│   └── spotifyService.ts # Spotify API 통신
├── App.tsx              # 메인 앱 컴포넌트
├── constants.ts         # 상수 및 목 데이터
├── types.ts             # TypeScript 타입 정의
├── index.tsx            # 앱 진입점
├── index.html           # HTML 템플릿
├── package.json         # 의존성 관리
├── tsconfig.json        # TypeScript 설정
└── vite.config.ts       # Vite 설정
```

## 환경 변수

Spotify API 자격 증명은 `constants.ts` 파일에 설정되어 있습니다.

## 개발 참고사항

- 현재 백엔드 API 연동은 미구현 상태입니다.
- Spotify API를 통해 음악 데이터를 실시간으로 가져옵니다.
- 플레이리스트 저장은 로컬 상태로만 관리됩니다.
- 향후 백엔드 API가 완성되면 실제 데이터베이스와 연동할 예정입니다.

## 포트

개발 서버는 기본적으로 `http://localhost:3000`에서 실행됩니다.

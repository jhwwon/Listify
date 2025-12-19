import { ListeningStats, Notice, User } from './types';

// API URL
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

// Spotify Credentials
export const SPOTIFY_CLIENT_ID = '3e66a42a7cc745408da6194cec098d55';
export const SPOTIFY_CLIENT_SECRET = '9989901cbbe9462f82e0df79fb9878f5';

export const MOCK_USER: User = {
  user_no: 1,
  role_no: 1,
  email: 'listify@example.com',
  nickname: 'Listify Master',
  profile_url: null,
  created_at: '2025-01-01'
};

export const MOCK_NOTICES: Notice[] = [
  {
    notice_no: 1,
    user_no: 1,
    title: '정기 점검 안내',
    content: '12월 25일 오전 2시부터 4시까지 서버 정기 점검이 진행될 예정입니다. 이용에 참고 부탁드립니다.',
    created_at: '2025-12-15',
    updated_at: '2025-12-15'
  },
  {
    notice_no: 2,
    user_no: 1,
    title: '신규 기능: Spotify 연동',
    content: '이제 Spotify API를 통해 실제 음원을 검색하고 플레이리스트를 만들 수 있습니다.',
    created_at: '2025-12-10',
    updated_at: '2025-12-10'
  },
  {
    notice_no: 3,
    user_no: 1,
    title: 'Listify 베타 오픈',
    content: 'Listify 베타 서비스에 오신 것을 환영합니다. 버그 제보는 고객센터를 이용해 주세요.',
    created_at: '2025-12-01',
    updated_at: '2025-12-01'
  }
];

export const MOCK_STATS: ListeningStats = {
  totalMinutes: 4230,
  topGenres: [
    { name: 'K-Pop', value: 35 },
    { name: 'Rock', value: 25 },
    { name: 'Jazz', value: 20 },
    { name: 'Classical', value: 12 },
    { name: 'Electronic', value: 8 }
  ],
  weeklyActivity: [
    { day: '월', hours: 2.5 },
    { day: '화', hours: 3.2 },
    { day: '수', hours: 1.8 },
    { day: '목', hours: 4.1 },
    { day: '금', hours: 5.5 },
    { day: '토', hours: 6.2 },
    { day: '일', hours: 4.8 }
  ],
  audioFeatures: [
    { subject: 'Energy', A: 85, fullMark: 100 },
    { subject: 'Danceability', A: 70, fullMark: 100 },
    { subject: 'Valence', A: 60, fullMark: 100 },
    { subject: 'Acousticness', A: 40, fullMark: 100 },
    { subject: 'Instrumentalness', A: 30, fullMark: 100 }
  ]
};


export interface User {
  user_no: number;
  role_no: number;
  email: string;
  nickname: string;
  profile_url: string | null;
  created_at?: string;
}

export interface Notice {
  notice_no: number;
  user_no: number;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface Music {
  music_no?: number;
  track_name: string;
  artist_name: string;
  album_name: string;
  album_image_url: string;
  duration_ms: number;
  popularity: number;
  spotify_url: string;
}

export interface Playlist {
  playlist_no: number;
  user_no: number;
  title: string;
  content: string | null;
  created_at: string;
  updated_at: string;
  music_items?: Music[];
}

export interface ListeningStats {
  totalMinutes: number;
  topGenres: { name: string; value: number }[];
  weeklyActivity: { day: string; hours: number }[];
  audioFeatures: { subject: string; A: number; fullMark: number }[];
}

export type AppView = 'home' | 'search' | 'library' | 'profile' | 'notices';
export type AuthState = 'login' | 'signup' | 'forgot-password';

export interface CartItem extends Music {
  addedAt: number;
}

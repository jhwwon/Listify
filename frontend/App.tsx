import React, { useState, useEffect } from 'react';

import { 
  Home, Library, Search as SearchIcon, User as UserIcon, LogOut, 
  Settings, Bell, Plus, Play, Pause, Music as MusicIcon, 
  Search, Loader2, Heart, Check, Calendar, Clock, Edit3, Trash2
} from 'lucide-react';
import { Music, Playlist, AppView, User } from './types';
import { searchMusic, getAllMusic, getTop50Music } from './services/musicService';
import { login, register, logout as logoutApi, getToken, verifyToken } from './services/authService';
import { getUserPlaylists, createPlaylist, updatePlaylist, deletePlaylist, addMusicToPlaylist, removeMusicFromPlaylist, getPlaylistMusic } from './services/playlistService';
import { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, MOCK_NOTICES, MOCK_STATS } from './constants';
import { getUserProfile, updateUserProfile, deleteAccount } from './services/userService';

import Header from './components/Header';
import PlaylistCard from './components/PlaylistCard';
import SettingsModal from './components/SettingsModal';
import ProfileEditModal from './components/ProfileEditModal';
import CartSidebar from './components/CartSidebar';
import PlaylistDetail from './components/PlaylistDetail';
import CreatePlaylistModal from './components/CreatePlaylistModal';
import { GenreDistribution, WeeklyActivity, AudioRadar } from './components/Charts';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { NoticesPage } from './pages/NoticesPage';

type AuthView = 'login' | 'register' | null;

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authView, setAuthView] = useState<AuthView>('login');
  const [view, setView] = useState<AppView>('home');
  const [songs, setSongs] = useState<Music[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileEditOpen, setIsProfileEditOpen] = useState(false);
  const [playlistCount, setPlaylistCount] = useState(0);
  const [currentSong, setCurrentSong] = useState<Music | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Music[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Cart state
  const [cart, setCart] = useState<Music[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Playlist detail & modal state
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // 자동 로그인 체크
  useEffect(() => {
    const checkAuth = async () => {
      const token = getToken();
      if (token) {
        const response = await verifyToken(token);
        if (response.success && response.data) {
          const nickname = localStorage.getItem('nickname') || 'User';
          const userNo = parseInt(localStorage.getItem('user_no') || '0');
          setUser({
            user_no: userNo,
            role_no: response.data.role_no,
            email: '',
            nickname: nickname,
            profile_url: null,
            created_at: new Date().toISOString()
          });
          setAuthView(null);
          fetchPlaylists(userNo);
        }
      }
      setIsAuthChecking(false);
    };
    checkAuth();
  }, []);

  // 플레이리스트 목록 조회 함수 (음악 포함)
  const fetchPlaylists = async (userNo: number) => {
    setIsLoading(true);
    try {
      const response = await getUserPlaylists(userNo);
      if (response.success && response.data) {
        const playlistsWithMusic = await Promise.all(
          response.data.map(async (p: Playlist) => {
            const musicRes = await getPlaylistMusic(p.playlist_no);
            const musicData = musicRes.data as any;

            return {
              ...p,
              music_items:
                musicRes.success && musicData?.music_list
                  ? musicData.music_list
                  : [],
            };
          })
        );
        setPlaylists(playlistsWithMusic);
        setPlaylistCount(playlistsWithMusic.length);
      }
    } catch (e) {
      console.error('플레이리스트 조회 실패:', e);
    } finally {
      setIsLoading(false);
    }
  };

  // 프로필 및 플레이리스트 데이터 로드
  useEffect(() => {
    const loadUserData = async () => {
      if (!user) return;

      try {
        const profileResponse = await getUserProfile(user.user_no);
        if (profileResponse.success) {
          setUser(prev =>
            prev
              ? {
                  ...prev,
                  email: profileResponse.data.email,
                  nickname: profileResponse.data.nickname,
                  profile_url: profileResponse.data.profile_url,
                }
              : null
          );
        }
        await fetchPlaylists(user.user_no);
      } catch (error) {
        console.error('사용자 데이터 로드 실패:', error);
      }
    };

    loadUserData();
  }, [user?.user_no]);

  useEffect(() => {
    const init = async () => {
      try {
        const response = await getAllMusic();
        if (response.success && response.data) {
          setSongs(response.data);
        }
      } catch (e) {
        console.error(e);
      }
    };
    init();
  }, []);

  // 백엔드 API로 음악 검색
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const response = await searchMusic(searchQuery);
      if (response.success && response.data) {
        setSearchResults(response.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearching(false);
    }
  };

  const toggleCart = (song: Music) => {
    const isInCart = cart.some(c => c.spotify_url === song.spotify_url);
    if (isInCart) {
      setCart(cart.filter(c => c.spotify_url !== song.spotify_url));
    } else {
      setCart([...cart, song]);
    }
  };

  // 플레이리스트 클릭 핸들러
  const handlePlaylistClick = (playlist: Playlist) => {
    setSelectedPlaylist(playlist);
    setIsDetailOpen(true);
  };

  // 플레이리스트 저장 (장바구니에서 새 플레이리스트 생성)
  // 플레이리스트 저장 (장바구니에서 새 플레이리스트 생성)
const handleSavePlaylist = async (title: string, content: string) => {
  if (!user) return;
  
  try {
    // title, content만 전달 (userNo 제외)
    const createRes = await createPlaylist(title, content);
    if (!createRes.success || !createRes.data) {
      alert('플레이리스트 생성에 실패했습니다.');
      return;
    }
    
    const playlistNo = createRes.data.playlist_no;
    
    // 장바구니의 음악들을 플레이리스트에 추가
    for (const music of cart) {
      await addMusicToPlaylist(playlistNo, music.music_no);
    }
    
    // 장바구니 비우기
    setCart([]);
    setIsCartOpen(false);
    
    // 플레이리스트 목록 새로고침
    await fetchPlaylists(user.user_no);
    
    alert('플레이리스트가 저장되었습니다!');
  } catch (error) {
    console.error('플레이리스트 저장 실패:', error);
    alert('플레이리스트 저장에 실패했습니다.');
  }
};

  // 플레이리스트에서 음악 제거
  const handleRemoveMusic = async (musicNo: number) => {
    if (!selectedPlaylist) return;
    try {
      const res = await removeMusicFromPlaylist(selectedPlaylist.playlist_no, musicNo);
      if (res.success && user) {
        await fetchPlaylists(user.user_no);
        // 현재 열린 플레이리스트 업데이트
        const updated = playlists.find(p => p.playlist_no === selectedPlaylist.playlist_no);
        if (updated) setSelectedPlaylist(updated);
      }
    } catch (error) {
      console.error('음악 제거 실패:', error);
    }
  };

  // 플레이리스트 삭제
  const handleDeletePlaylist = async () => {
    if (!selectedPlaylist) return;
    const confirmed = window.confirm('정말로 이 플레이리스트를 삭제하시겠습니까?');
    if (!confirmed) return;
    
    try {
      const res = await deletePlaylist(selectedPlaylist.playlist_no);
      if (res.success && user) {
        await fetchPlaylists(user.user_no);
        setIsDetailOpen(false);
        setSelectedPlaylist(null);
        alert('플레이리스트가 삭제되었습니다.');
      }
    } catch (error) {
      console.error('플레이리스트 삭제 실패:', error);
      alert('플레이리스트 삭제에 실패했습니다.');
    }
  };

  // 인증 확인 중 로딩 화면
  if (isAuthChecking) {
    return (
      <div className="flex h-screen bg-black text-white items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleProfileUpdate = async (nickname: string) => {
    if (!user) return;

    const response = await updateUserProfile(user.user_no, nickname);
    if (response.success) {
      setUser(prev => prev ? { ...prev, nickname } : null);
      localStorage.setItem('nickname', nickname);
      alert('프로필이 수정되었습니다.');
    } else {
      throw new Error(response.message || '프로필 수정 실패');
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;

    const confirmed = window.confirm(
      '정말로 탈퇴하시겠습니까?\n모든 데이터가 삭제되며 복구할 수 없습니다.'
    );

    if (!confirmed) return;

    try {
      const response = await deleteAccount(user.user_no);
      if (response.success) {
        alert('회원탈퇴가 완료되었습니다.');
        logoutApi();
        setUser(null);
        setAuthView('login');
      } else {
        alert(response.message || '회원탈퇴에 실패했습니다.');
      }
    } catch (error) {
      console.error('회원탈퇴 실패:', error);
      alert('회원탈퇴에 실패했습니다.');
    }
  };

  // 로그인/회원가입 화면
  if (!user) {
    return (
      <>
        {authView === 'login' && (
          <Login
            onLoginSuccess={(userNo, nickname) => {
              setUser({
                user_no: userNo,
                role_no: 1,
                email: '',
                nickname: nickname,
                profile_url: null,
                created_at: new Date().toISOString()
              });
              setAuthView(null);
              fetchPlaylists(userNo);
            }}
            onSwitchToRegister={() => setAuthView('register')}
          />
        )}
        {authView === 'register' && (
          <Register
            onRegisterSuccess={() => setAuthView('login')}
            onSwitchToLogin={() => setAuthView('login')}
          />
        )}
      </>
    );
  }

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden">
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={(id, secret) => console.log('Saved Credentials')}
        initialClientId=""
        initialClientSecret=""
      />

      <ProfileEditModal
        isOpen={isProfileEditOpen}
        onClose={() => setIsProfileEditOpen(false)}
        currentNickname={user.nickname}
        onSave={handleProfileUpdate}
      />

      {/* Sidebar */}
      <aside className="w-64 bg-zinc-950 border-r border-zinc-800 flex flex-col z-20">
        <div className="p-6 flex items-center gap-2 text-primary">
          <MusicIcon className="w-8 h-8" />
          <span className="text-xl font-bold tracking-tight">Listify</span>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {[
            { id: 'home', icon: Home, label: '홈' },
            { id: 'search', icon: SearchIcon, label: '탐색' },
            { id: 'library', icon: Library, label: '라이브러리' },
            { id: 'profile', icon: UserIcon, label: '프로필' },
            { id: 'notices', icon: Bell, label: '공지사항' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setView(item.id as AppView);
                setIsDetailOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${view === item.id
                ? 'bg-zinc-900 text-primary font-bold shadow-inner'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
                }`}
            >
              <item.icon className="w-5 h-5" /> {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-zinc-800 space-y-2">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full flex items-center justify-between px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors text-sm border border-primary/20"
          >
            <span className="flex items-center gap-2 font-medium"><Plus className="w-4 h-4" /> 장바구니</span>
            <span className="bg-primary text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">{cart.length}</span>
          </button>
          <button onClick={() => setIsSettingsOpen(true)} className="w-full flex items-center gap-3 px-4 py-2 text-zinc-500 hover:text-white text-sm transition-colors">
            <Settings className="w-4 h-4" /> 설정
          </button>

          <button 
            onClick={handleDeleteAccount}
            className="w-full flex items-center gap-3 px-4 py-2 text-zinc-500 hover:text-orange-400 text-sm transition-colors"
          >
            <Trash2 className="w-4 h-4" /> 회원탈퇴
          </button>
          <button 
            onClick={() => {
              logoutApi();
              setUser(null);
              setAuthView('login');
            }} 
            className="w-full flex items-center gap-3 px-4 py-2 text-zinc-500 hover:text-red-400 text-sm transition-colors"
          >
            <LogOut className="w-4 h-4" /> 로그아웃
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-black relative overflow-hidden">
        <Header
          viewTitle={view === 'home' ? 'Home' : view === 'search' ? 'Search' : view === 'library' ? 'Library' : view === 'profile' ? 'Profile & Analytics' : 'Notices'}
          user={user}
        />

        <div className="flex-1 overflow-y-auto p-8 pb-32">
          {view === 'home' && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="bg-gradient-to-br from-primary/30 via-zinc-900 to-black p-10 rounded-3xl border border-white/5 shadow-2xl">
                <h1 className="text-5xl font-extrabold mb-4 tracking-tight">Welcome to Listify</h1>
                <p className="text-zinc-400 text-lg max-w-lg leading-relaxed">
                  당신만의 음악 장바구니를 채우고 완벽한 플레이리스트를 만들어보세요.
                </p>
                <button
                  onClick={() => setView('search')}
                  className="mt-6 bg-white text-black px-6 py-3 rounded-full font-bold hover:scale-105 transition-transform"
                >
                  음악 탐색하기
                </button>
              </div>

              <section>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold">인기 트랙</h3>
                  <button className="text-zinc-400 hover:text-white text-sm font-medium">전체 보기</button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                  {songs.slice(0, 10).map((song, i) => (
                    <div key={i} className="bg-zinc-900/40 p-4 rounded-xl border border-zinc-800/50 hover:bg-zinc-800/60 hover:border-zinc-700 transition-all group relative">
                      <div className="relative mb-3 aspect-square rounded-lg overflow-hidden">
                        <img src={song.album_image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        <button
                          onClick={() => toggleCart(song)}
                          className={`absolute bottom-2 right-2 p-2 rounded-full shadow-xl transition-all ${cart.some(c => c.spotify_url === song.spotify_url)
                            ? 'bg-primary text-black opacity-100'
                            : 'bg-black/60 text-white opacity-0 group-hover:opacity-100 hover:bg-white hover:text-black'
                            }`}
                        >
                          {cart.some(c => c.spotify_url === song.spotify_url) ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                        </button>
                      </div>
                      <p className="font-bold text-sm truncate">{song.track_name}</p>
                      <p className="text-xs text-zinc-500 truncate mt-1">{song.artist_name}</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {view === 'search' && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="max-w-2xl mx-auto">
                <form onSubmit={handleSearch} className="relative group">
                  <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${isSearching ? 'text-primary' : 'text-zinc-500 group-focus-within:text-primary'}`} />
                  <input
                    type="text"
                    placeholder="곡 제목, 아티스트 또는 앨범 검색"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-full py-4 pl-12 pr-4 text-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all shadow-xl"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {isSearching && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary animate-spin" />}
                </form>
              </div>

              {searchResults.length > 0 ? (
                <div className="space-y-4">
                  <h3 className="text-xl font-bold">검색 결과</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {searchResults.map((song, i) => (
                      <div key={i} className="flex items-center gap-4 bg-zinc-900/40 p-3 rounded-xl border border-zinc-800/50 hover:bg-zinc-800 transition-all group">
                        <img src={song.album_image_url} className="w-16 h-16 rounded-lg object-cover" />
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm truncate text-white">{song.track_name}</p>
                          <p className="text-xs text-zinc-400 truncate mt-0.5">{song.artist_name}</p>
                        </div>
                        <button
                          onClick={() => toggleCart(song)}
                          className={`p-2 rounded-full transition-all ${cart.some(c => c.spotify_url === song.spotify_url)
                            ? 'bg-primary/20 text-primary border border-primary/30'
                            : 'bg-zinc-800 text-zinc-400 opacity-0 group-hover:opacity-100 hover:text-white'
                            }`}
                        >
                          {cart.some(c => c.spotify_url === song.spotify_url) ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : !isSearching && searchQuery && (
                <div className="py-20 text-center text-zinc-500">
                  <SearchIcon className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p>검색 결과가 없습니다.</p>
                </div>
              )}
            </div>
          )}

          {view === 'library' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold">라이브러리</h2>
                <button
                  onClick={() => setView('search')}
                  className="bg-white text-black px-6 py-2 rounded-full text-sm font-bold hover:bg-zinc-200 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> 새 플레이리스트
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {playlists.length === 0 ? (
                  <div className="col-span-full py-32 text-center border-2 border-dashed border-zinc-800 rounded-3xl">
                    <MusicIcon className="w-16 h-16 mx-auto mb-4 text-zinc-700" />
                    <p className="text-zinc-500 text-lg">아직 저장된 플레이리스트가 없습니다.</p>
                    <p className="text-zinc-600 text-sm mt-2">좋아하는 곡을 찾아 장바구니에 담아보세요.</p>
                  </div>
                ) : (
                  playlists.map(p => <PlaylistCard key={p.playlist_no} playlist={p} onClick={handlePlaylistClick} />)
                )}
              </div>
            </div>
          )}

          {view === 'profile' && (
            <div className="space-y-10 animate-in fade-in duration-500">
              {/* Profile Card */}
              <div className="bg-zinc-900 rounded-3xl p-8 border border-zinc-800 flex flex-col md:flex-row items-center gap-8">
                <div className="w-32 h-32 rounded-full border-4 border-primary/20 overflow-hidden shadow-2xl">
                  <img src={user.profile_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.nickname}`} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                    <h2 className="text-4xl font-black">{user.nickname}</h2>
                    <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded w-fit mx-auto md:mx-0">PREMIUM</span>
                  </div>
                  <p className="text-zinc-400 mb-6">{user.email}</p>
                  <div className="flex flex-wrap justify-center md:justify-start gap-4">
                    <div className="bg-zinc-950 px-4 py-2 rounded-xl border border-zinc-800">
                      <p className="text-xs text-zinc-500">플레이리스트</p>
                      <p className="text-lg font-bold">{playlistCount}</p>
                    </div>
                    <div className="bg-zinc-950 px-4 py-2 rounded-xl border border-zinc-800">
                      <p className="text-xs text-zinc-500">누적 감상 시간</p>
                      <p className="text-lg font-bold">71시간</p>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setIsProfileEditOpen(true)}
                  className="bg-zinc-800 hover:bg-zinc-700 text-white p-3 rounded-full transition-colors self-start md:self-center"
                >
                  <Edit3 className="w-5 h-5" />
                </button>
              </div>

              {/* Analytics Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-zinc-900/50 p-6 rounded-3xl border border-zinc-800">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Plus className="w-4 h-4 text-primary" /> 선호 장르 분포
                  </h3>
                  <GenreDistribution data={MOCK_STATS.topGenres} />
                </div>
                <div className="bg-zinc-900/50 p-6 rounded-3xl border border-zinc-800">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" /> 주간 활동 패턴
                  </h3>
                  <WeeklyActivity data={MOCK_STATS.weeklyActivity} />
                </div>
                <div className="bg-zinc-900/50 p-6 rounded-3xl border border-zinc-800 lg:col-span-2">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <MusicIcon className="w-4 h-4 text-primary" /> 음악적 특성 분석
                  </h3>
                  <div className="max-w-xl mx-auto">
                    <AudioRadar data={MOCK_STATS.audioFeatures} />
                  </div>
                </div>
              </div>
            </div>
          )}
          {view === 'notices' && <NoticesPage />}

        </div>

        {/* Player Bar */}
        {currentSong && (
          <div className="h-24 bg-zinc-900/90 backdrop-blur-md border-t border-zinc-800 flex items-center px-8 fixed bottom-0 left-64 right-0 z-30 shadow-2xl">
            <div className="flex items-center gap-4 w-1/3">
              <img src={currentSong.album_image_url} className="w-14 h-14 rounded-lg shadow-lg" />
              <div className="truncate">
                <p className="font-bold text-sm truncate text-white">{currentSong.track_name}</p>
                <p className="text-xs text-zinc-400 truncate mt-1">{currentSong.artist_name}</p>
              </div>
              <button className="ml-2 text-zinc-500 hover:text-primary transition-colors">
                <Heart className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 flex flex-col items-center gap-2">
              <div className="flex items-center gap-6">
                <button onClick={() => setIsPlaying(!isPlaying)} className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-lg">
                  {isPlaying ? <Pause className="w-5 h-5 text-black" /> : <Play className="w-5 h-5 text-black ml-1" />}
                </button>
              </div>
              <div className="w-full max-w-md h-1 bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-primary w-1/3 shadow-[0_0_10px_rgba(29,185,84,0.5)]"></div>
              </div>
            </div>
            <div className="w-1/3 flex justify-end">
              <div className="flex items-center gap-4 text-zinc-400">
                <p className="text-xs font-mono">1:23 / 3:45</p>
              </div>
            </div>
          </div>
        )}

        <CartSidebar
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          items={cart}
          onRemove={(url) => setCart(cart.filter(c => c.spotify_url !== url))}
          onClear={() => setCart([])}
          onSavePlaylist={handleSavePlaylist}
        />

        <PlaylistDetail
          playlist={selectedPlaylist}
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          onRemoveMusic={handleRemoveMusic}
          onDeletePlaylist={handleDeletePlaylist}
          onEdit={() => {
            setIsEditMode(true);
            setIsCreateModalOpen(true);
          }}
        />

        <CreatePlaylistModal
          isOpen={isCreateModalOpen}
          onClose={() => {
            setIsCreateModalOpen(false);
            setIsEditMode(false);
          }}
          onSave={async (title, content) => {
            if (isEditMode && selectedPlaylist) {
              const res = await updatePlaylist(selectedPlaylist.playlist_no, title);
              if (res.success && user) {
                await fetchPlaylists(user.user_no);
                setIsCreateModalOpen(false);
                setIsEditMode(false);
                setIsDetailOpen(false);
              }
            } else {
              await handleSavePlaylist(title, content);
              setIsCreateModalOpen(false);
            }
          }}
          initialTitle={isEditMode ? selectedPlaylist?.title : ''}
          initialContent={isEditMode ? selectedPlaylist?.content || '' : ''}
          mode={isEditMode ? 'edit' : 'create'}
        />
      </main>
    </div>
  );
}

export default App;
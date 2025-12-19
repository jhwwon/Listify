import { API_URL } from '../constants';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  nickname: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    access_token: string;
    token_type: string;
    user_no: number;
    nickname: string;
  };
}

export interface VerifyResponse {
  success: boolean;
  message: string;
  data?: {
    user_no: number;
    role_no: number;
  };
}

// 회원가입
export const register = async (data: RegisterRequest): Promise<AuthResponse> => {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return await response.json();
};

// 로그인
export const login = async (data: LoginRequest): Promise<AuthResponse> => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return await response.json();
};

// 토큰 검증
export const verifyToken = async (token: string): Promise<VerifyResponse> => {
  const response = await fetch(`${API_URL}/auth/verify`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return await response.json();
};

// 로컬 스토리지에서 토큰 가져오기
export const getToken = (): string | null => {
  return localStorage.getItem('access_token');
};

// 로컬 스토리지에 토큰 저장
export const saveToken = (token: string): void => {
  localStorage.setItem('access_token', token);
};

// 로컬 스토리지에서 토큰 삭제
export const removeToken = (): void => {
  localStorage.removeItem('access_token');
};

// 로그아웃
export const logout = (): void => {
  removeToken();
  localStorage.removeItem('user_no');
  localStorage.removeItem('nickname');
};

import { API_URL } from '../constants';
import { getToken } from './authService';

export interface Notice {
  notice_no: number;
  user_no: number;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  nickname?: string;
}

export interface NoticeListResponse {
  success: boolean;
  message: string;
  data?: Notice[];
}

export interface NoticeDetailResponse {
  success: boolean;
  message: string;
  data?: Notice;
}

export interface NoticeCreateRequest {
  title: string;
  content: string;
}

export interface NoticeUpdateRequest {
  title: string;
  content: string;
}

// 공지사항 전체 목록 조회
export const getNoticeList = async (): Promise<NoticeListResponse> => {
  const token = getToken();
  const response = await fetch(`${API_URL}/notice`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  return await response.json();
};

// 공지사항 상세 조회
export const getNoticeDetail = async (noticeNo: number): Promise<NoticeDetailResponse> => {
  const token = getToken();
  const response = await fetch(`${API_URL}/notice/${noticeNo}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  return await response.json();
};

// 공지사항 생성 (ADMIN only)
export const createNotice = async (data: NoticeCreateRequest): Promise<NoticeDetailResponse> => {
  const token = getToken();
  const response = await fetch(`${API_URL}/notice`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return await response.json();
};

// 공지사항 수정 (ADMIN only)
export const updateNotice = async (noticeNo: number, data: NoticeUpdateRequest): Promise<NoticeDetailResponse> => {
  const token = getToken();
  const response = await fetch(`${API_URL}/notice/${noticeNo}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return await response.json();
};

// 공지사항 삭제 (ADMIN only)
export const deleteNotice = async (noticeNo: number): Promise<NoticeDetailResponse> => {
  const token = getToken();
  const response = await fetch(`${API_URL}/notice/${noticeNo}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  return await response.json();
};

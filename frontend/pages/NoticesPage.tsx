import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Edit, Trash2, X } from 'lucide-react';
import { getNoticeList, getNoticeDetail, createNotice, updateNotice, deleteNotice, Notice } from '../services/noticeService';
import { useAuth } from '../hooks/useAuth';

type ModalMode = 'view' | 'create' | 'edit' | null;

export const NoticesPage: React.FC = () => {
  const { user } = useAuth();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isAdmin = user?.role_no === 2;

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const response = await getNoticeList();
      if (response.success && response.data) {
        setNotices(response.data);
      } else {
        setError(response.message || '공지사항을 불러오는데 실패했습니다.');
      }
    } catch (err) {
      console.error('Notice fetch error:', err);
      setError('서버 연결에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleNoticeClick = async (notice: Notice) => {
    try {
      const response = await getNoticeDetail(notice.notice_no);
      if (response.success && response.data) {
        setSelectedNotice(response.data);
        setModalMode('view');
      }
    } catch (err) {
      console.error('Notice detail error:', err);
    }
  };

  const handleCreateClick = () => {
    setFormTitle('');
    setFormContent('');
    setModalMode('create');
  };

  const handleEditClick = (notice: Notice) => {
    setSelectedNotice(notice);
    setFormTitle(notice.title);
    setFormContent(notice.content);
    setModalMode('edit');
  };

  const handleSubmit = async () => {
    if (!formTitle.trim() || !formContent.trim()) {
      alert('제목과 내용을 모두 입력해주세요.');
      return;
    }

    try {
      setSubmitting(true);
      if (modalMode === 'create') {
        const response = await createNotice({ title: formTitle, content: formContent });
        if (response.success) {
          alert('공지사항이 생성되었습니다.');
          setModalMode(null);
          fetchNotices();
        } else {
          alert(response.message || '생성에 실패했습니다.');
        }
      } else if (modalMode === 'edit' && selectedNotice) {
        const response = await updateNotice(selectedNotice.notice_no, { title: formTitle, content: formContent });
        if (response.success) {
          alert('공지사항이 수정되었습니다.');
          setModalMode(null);
          fetchNotices();
        } else {
          alert(response.message || '수정에 실패했습니다.');
        }
      }
    } catch (err) {
      console.error('Submit error:', err);
      alert('오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (noticeNo: number) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      const response = await deleteNotice(noticeNo);
      if (response.success) {
        alert('공지사항이 삭제되었습니다.');
        setModalMode(null);
        fetchNotices();
      } else {
        alert(response.message || '삭제에 실패했습니다.');
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('오류가 발생했습니다.');
    }
  };

  const closeModal = () => {
    setModalMode(null);
    setSelectedNotice(null);
    setFormTitle('');
    setFormContent('');
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
        <h2 className="text-3xl font-black mb-8">공지사항</h2>
        <div className="text-center py-12 text-zinc-400">로딩 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
        <h2 className="text-3xl font-black mb-8">공지사항</h2>
        <div className="text-center py-12 text-red-400">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-black">공지사항</h2>
        {isAdmin && (
          <button
            onClick={handleCreateClick}
            className="flex items-center gap-2 bg-primary text-black px-4 py-2 rounded-lg font-bold hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-5 h-5" />
            작성하기
          </button>
        )}
      </div>

      <div className="space-y-4">
        {notices.length === 0 ? (
          <div className="text-center py-12 text-zinc-400">공지사항이 없습니다.</div>
        ) : (
          notices.map((notice) => (
            <div
              key={notice.notice_no}
              onClick={() => handleNoticeClick(notice)}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:bg-zinc-800/50 transition-colors cursor-pointer group"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors">{notice.title}</h3>
                <span className="flex items-center gap-1.5 text-xs text-zinc-500 font-mono">
                  <Calendar className="w-3 h-3" /> {new Date(notice.created_at).toLocaleDateString('ko-KR')}
                </span>
              </div>
              <p className="text-zinc-400 line-clamp-2 text-sm leading-relaxed">{notice.content}</p>
              <div className="mt-4 pt-4 border-t border-zinc-800 flex items-center text-xs text-zinc-500">
                <span className="bg-zinc-950 px-2 py-1 rounded border border-zinc-800">
                  {notice.nickname || '운영자'} 공지
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {modalMode && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-zinc-900 border-b border-zinc-800 p-6 flex justify-between items-center">
              <h3 className="text-2xl font-bold">
                {modalMode === 'view' && '공지사항 상세'}
                {modalMode === 'create' && '공지사항 작성'}
                {modalMode === 'edit' && '공지사항 수정'}
              </h3>
              <button onClick={closeModal} className="text-zinc-400 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {modalMode === 'view' && selectedNotice ? (
                <>
                  <div>
                    <h4 className="text-2xl font-bold mb-2">{selectedNotice.title}</h4>
                    <div className="flex items-center gap-4 text-sm text-zinc-400 mb-6">
                      <span>{selectedNotice.nickname || '운영자'}</span>
                      <span>•</span>
                      <span>작성일: {new Date(selectedNotice.created_at).toLocaleString('ko-KR')}</span>
                      <span>•</span>
                      <span>수정일: {new Date(selectedNotice.updated_at).toLocaleString('ko-KR')}</span>
                    </div>
                  </div>
                  <div className="prose prose-invert max-w-none">
                    <p className="text-zinc-300 whitespace-pre-wrap leading-relaxed">{selectedNotice.content}</p>
                  </div>
                  {isAdmin && (
                    <div className="flex gap-2 pt-4 border-t border-zinc-800">
                      <button
                        onClick={() => handleEditClick(selectedNotice)}
                        className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                        수정
                      </button>
                      <button
                        onClick={() => handleDelete(selectedNotice.notice_no)}
                        className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        삭제
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">제목</label>
                    <input
                      type="text"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
                      placeholder="제목을 입력하세요"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">내용</label>
                    <textarea
                      value={formContent}
                      onChange={(e) => setFormContent(e.target.value)}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 focus:outline-none focus:border-primary min-h-[300px] resize-y"
                      placeholder="내용을 입력하세요"
                    />
                  </div>
                  <div className="flex gap-2 pt-4">
                    <button
                      onClick={handleSubmit}
                      disabled={submitting}
                      className="flex-1 bg-primary text-black font-bold py-3 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? '처리 중...' : modalMode === 'create' ? '작성하기' : '수정하기'}
                    </button>
                    <button
                      onClick={closeModal}
                      disabled={submitting}
                      className="px-6 bg-zinc-800 hover:bg-zinc-700 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      취소
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

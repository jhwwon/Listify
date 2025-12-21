from model import notice as notice_model

# 공지사항 작성
def create_notice(user_no, title, content):
    try:
        notice_no = notice_model.insert_notice(user_no, title, content)
        return notice_no, None
    except Exception as e:
        return None, str(e)

# 공지사항 수정
def update_notice(notice_no, title, content):
    try:
        success = notice_model.update_notice(notice_no, title, content)
        if success:
            return True, "공지 수정 완료"
        return False, "공지 수정 실패"
    except Exception as e:
        return False, str(e)

# 공지사항 삭제
def delete_notice(notice_no):
    try:
        success = notice_model.delete_notice(notice_no)
        if success:
            return True, "공지 삭제 완료"
        return False, "공지 삭제 실패"
    except Exception as e:
        return False, str(e)

# 공지사항 리스트 조회
def get_notice_list():
    try:
        notices = notice_model.list_all_with_user()
        for n in notices:
            if n.get('created_at'):
                n['created_at'] = n['created_at'].isoformat() if hasattr(n['created_at'], 'isoformat') else str(n['created_at'])
            if n.get('updated_at'):
                n['updated_at'] = n['updated_at'].isoformat() if hasattr(n['updated_at'], 'isoformat') else str(n['updated_at'])
        return notices, None
    except Exception as e:
        return None, str(e)

# 공지사항 상세 조회
def get_notice_detail(notice_no):
    try:
        notice = notice_model.find_detail_with_user(notice_no)
        if not notice:
            return None, "존재하지 않는 공지"
        if notice.get('created_at'):
            notice['created_at'] = notice['created_at'].isoformat() if hasattr(notice['created_at'], 'isoformat') else str(notice['created_at'])
        if notice.get('updated_at'):
            notice['updated_at'] = notice['updated_at'].isoformat() if hasattr(notice['updated_at'], 'isoformat') else str(notice['updated_at'])
        return notice, None
    except Exception as e:
        return None, str(e)

# notice_no로 공지사항 조회
def find_notice_by_no(notice_no):
    try:
        notice = notice_model.find_by_notice_no(notice_no)
        return notice, None
    except Exception as e:
        return None, str(e)

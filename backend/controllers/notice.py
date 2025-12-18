from flask import request, jsonify
import os
from db import connect_to_mysql
from services import notice as notice_svc


def _get_user_role(user_no: int):
    """DB에서 사용자 역할 이름('ADMIN'/'USER') 조회"""
    conn = connect_to_mysql(
        host=os.getenv('DB_HOST', 'localhost'),
        port=int(os.getenv('DB_PORT', 3306)),
        user=os.getenv('DB_USER', 'root'),
        password=os.getenv('DB_PASSWORD', '1234'),
        database=os.getenv('DB_DATABASE', 'listify')
    )
    if not conn:
        return None, "DB 연결 실패"
    try:
        with conn.cursor() as cursor:
            sql = (
                "SELECT r.name AS role_name FROM user u "
                "JOIN role r ON u.role_no = r.role_no "
                "WHERE u.user_no = %s AND u.is_deleted = FALSE"
            )
            cursor.execute(sql, (user_no,))
            row = cursor.fetchone()
            if not row:
                return None, "존재하지 않는 사용자"
            return row.get('role_name'), None
    except Exception as e:
        return None, str(e)
    finally:
        conn.close()


def _require_admin_from_header():
    """헤더의 X-User-No로 ADMIN 권한 확인. (성공 시 user_no 반환)"""
    user_no = request.headers.get('X-User-No')
    if not user_no:
        return None, (jsonify({"success": False, "message": "인증 정보가 없습니다 (X-User-No)"}), 401)
    try:
        user_no = int(user_no)
    except ValueError:
        return None, (jsonify({"success": False, "message": "잘못된 사용자 번호"}), 400)

    role, err = _get_user_role(user_no)
    if err:
        # 사용자 없음 또는 DB 오류
        status = 404 if err == "존재하지 않는 사용자" else 500
        return None, (jsonify({"success": False, "message": err}), status)
    if role != 'ADMIN':
        return None, (jsonify({"success": False, "message": "권한이 없습니다 (ADMIN 전용)"}), 403)
    return user_no, None


# 공지사항 작성 (ADMIN만)
def create_notice():
    user_no, error_resp = _require_admin_from_header()
    if error_resp:
        return error_resp

    data = request.get_json(silent=True) or {}
    title = data.get('title')
    content = data.get('content')
    if not title or not content:
        return jsonify({"success": False, "message": "title, content 필드가 필요합니다."}), 400

    try:
        notice_no, error = notice_svc.create_notice(user_no, title, content)
        if error:
            return jsonify({"success": False, "message": error}), 400
        return jsonify({
            "success": True,
            "data": {
                "notice_no": notice_no,
                "user_no": user_no,
                "title": title,
                "content": content
            }
        }), 201
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500


# 공지사항 수정 (ADMIN만)
def update_notice(notice_no: int):
    user_no, error_resp = _require_admin_from_header()
    if error_resp:
        return error_resp

    data = request.get_json(silent=True) or {}
    title = data.get('title')
    content = data.get('content')
    if not title or not content:
        return jsonify({"success": False, "message": "title, content 필드가 필요합니다."}), 400

    try:
        # 존재 확인
        notice, error = notice_svc.find_notice_by_no(notice_no)
        if error or not notice:
            return jsonify({"success": False, "message": "존재하지 않는 공지입니다."}), 404

        success, message = notice_svc.update_notice(notice_no, title, content)
        if success:
            return jsonify({"success": True, "message": message}), 200
        return jsonify({"success": False, "message": message}), 400
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500


# 공지사항 삭제 (ADMIN만)
def delete_notice(notice_no: int):
    user_no, error_resp = _require_admin_from_header()
    if error_resp:
        return error_resp

    try:
        notice, error = notice_svc.find_notice_by_no(notice_no)
        if error or not notice:
            return jsonify({"success": False, "message": "존재하지 않는 공지입니다."}), 404

        success, message = notice_svc.delete_notice(notice_no)
        if success:
            return jsonify({"success": True, "message": message}), 200
        return jsonify({"success": False, "message": message}), 400
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500


# 공지사항 리스트 조회 (USER/ADMIN 모두)
def get_notice_list():
    try:
        notices, error = notice_svc.get_notice_list()
        if error:
            return jsonify({"success": False, "message": error}), 500
        return jsonify({"success": True, "data": notices}), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500


# 공지사항 상세 조회 (USER/ADMIN 모두)
def get_notice_detail(notice_no: int):
    try:
        notice, error = notice_svc.get_notice_detail(notice_no)
        if error:
            return jsonify({"success": False, "message": error}), 404
        return jsonify({"success": True, "data": notice}), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

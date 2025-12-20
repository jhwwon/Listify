from flask import request, jsonify
from services import notice as notice_svc
from middleware.auth_utils import require_admin


# 공지사항 작성 (ADMIN만)
def create_notice():
    user_no, error_resp = require_admin()
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
    user_no, error_resp = require_admin()
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
    user_no, error_resp = require_admin()
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

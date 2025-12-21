from flask import Blueprint, request, jsonify
from controllers import notice as notice_controller

notice_bp = Blueprint('notice', __name__, url_prefix='/notice')

# 공지사항 작성
@notice_bp.route('', methods=['POST', 'OPTIONS'])
def create_notice():
    if request.method == 'OPTIONS':
        return jsonify({"success": True}), 200
    return notice_controller.create_notice()

# 공지사항 수정
@notice_bp.route('/<int:notice_no>', methods=['PUT', 'OPTIONS'])
def update_notice(notice_no):
    if request.method == 'OPTIONS':
        return jsonify({"success": True}), 200
    return notice_controller.update_notice(notice_no)

# 공지사항 삭제
@notice_bp.route('/<int:notice_no>', methods=['DELETE', 'OPTIONS'])
def delete_notice(notice_no):
    if request.method == 'OPTIONS':
        return jsonify({"success": True}), 200
    return notice_controller.delete_notice(notice_no)

# 공지사항 리스트 조회
@notice_bp.route('', methods=['GET', 'OPTIONS'])
def get_notice_list():
    if request.method == 'OPTIONS':
        return jsonify({"success": True}), 200
    return notice_controller.get_notice_list()

# 공지사항 상세 조회
@notice_bp.route('/<int:notice_no>', methods=['GET', 'OPTIONS'])
def get_notice_detail(notice_no):
    if request.method == 'OPTIONS':
        return jsonify({"success": True}), 200
    return notice_controller.get_notice_detail(notice_no)

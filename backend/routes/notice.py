from flask import Blueprint
from controllers import notice as notice_controller

notice_bp = Blueprint('notice', __name__, url_prefix='/notice')

@notice_bp.route('', methods=['POST'])
def create_notice():
    """공지사항 작성"""
    return notice_controller.create_notice()

@notice_bp.route('/<int:notice_no>', methods=['PUT'])
def update_notice(notice_no):
    """공지사항 수정"""
    return notice_controller.update_notice(notice_no)

@notice_bp.route('/<int:notice_no>', methods=['DELETE'])
def delete_notice(notice_no):
    """공지사항 삭제"""
    return notice_controller.delete_notice(notice_no)

@notice_bp.route('', methods=['GET'])
def get_notice_list():
    """공지사항 리스트 조회"""
    return notice_controller.get_notice_list()

@notice_bp.route('/<int:notice_no>', methods=['GET'])
def get_notice_detail(notice_no):
    """공지사항 상세 조회"""
    return notice_controller.get_notice_detail(notice_no)

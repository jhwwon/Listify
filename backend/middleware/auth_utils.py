from flask import request, jsonify
from services import auth as auth_service


def get_user_from_token():
    """
    Authorization 헤더에서 JWT 토큰을 추출하고 검증

    Returns:
        tuple: (user_no, role_no, error_response)
        - 성공: (user_no, role_no, None)
        - 실패: (None, None, error_response)
    """
    auth_header = request.headers.get('Authorization')

    if not auth_header:
        return None, None, (jsonify({"success": False, "message": "Authorization 헤더가 없습니다."}), 401)

    try:
        # "Bearer <token>" 형식에서 토큰 추출
        token = auth_header.split(' ')[1]
    except IndexError:
        return None, None, (jsonify({"success": False, "message": "토큰 형식이 올바르지 않습니다."}), 401)

    # JWT 토큰 검증
    is_valid, result = auth_service.verify_jwt_token(token)

    if not is_valid:
        return None, None, (jsonify({"success": False, "message": result}), 401)

    return result['user_no'], result['role_no'], None


def require_auth():
    """
    인증된 사용자 요구

    Returns:
        tuple: (user_no, role_no, error_response)
        - 성공: (user_no, role_no, None)
        - 실패: (None, None, error_response)
    """
    return get_user_from_token()


def require_admin():
    """
    ADMIN 권한 요구

    Returns:
        tuple: (user_no, error_response)
        - 성공: (user_no, None)
        - 실패: (None, error_response)
    """
    user_no, role_no, error_resp = get_user_from_token()

    if error_resp:
        return None, error_resp

    # role_no 1 = 일반 사용자, 2 = ADMIN (DB role 테이블 확인 필요)
    # role 테이블의 name 컬럼에서 'ADMIN' 확인
    # 여기서는 간단히 role_no로 확인 (role_no = 2가 ADMIN이라고 가정)
    if role_no != 2:
        return None, (jsonify({"success": False, "message": "권한이 없습니다 (ADMIN 전용)"}), 403)

    return user_no, None


def require_self_or_admin(target_user_no):
    """
    본인 또는 ADMIN 권한 요구

    Args:
        target_user_no: 접근하려는 대상 사용자 번호

    Returns:
        tuple: (user_no, role_no, error_response)
        - 성공: (user_no, role_no, None)
        - 실패: (None, None, error_response)
    """
    user_no, role_no, error_resp = get_user_from_token()

    if error_resp:
        return None, None, error_resp

    # 본인이거나 ADMIN이면 허용
    if user_no != target_user_no and role_no != 2:
        return None, None, (jsonify({"success": False, "message": "본인 또는 관리자만 접근 가능합니다."}), 403)

    return user_no, role_no, None

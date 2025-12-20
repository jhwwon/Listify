from flask import request, jsonify
from services import playlist as playlist_svc
from middleware.auth_utils import require_auth


def _check_playlist_owner(playlist_no: int, user_no: int):
    """플레이리스트 소유자 확인"""
    playlist, error = playlist_svc.find_playlist_by_no(playlist_no)
    if error or not playlist:
        return False, "존재하지 않는 플레이리스트"
    if playlist.get('user_no') != user_no:
        return False, "권한이 없습니다 (본인의 플레이리스트만 수정/삭제 가능)"
    return True, None


# 플레이리스트 생성 (인증 필요)
def create_playlist():
    user_no, role_no, error_resp = require_auth()
    if error_resp:
        return error_resp

    data = request.get_json(silent=True) or {}
    title = data.get('title')
    content = data.get('content')

    if not title:
        return jsonify({"success": False, "message": "title 필드가 필요합니다."}), 400

    try:
        playlist_no, error = playlist_svc.create_playlist(user_no, title, content)
        if error:
            return jsonify({"success": False, "message": error}), 400
        return jsonify({
            "success": True,
            "data": {
                "playlist_no": playlist_no,
                "user_no": user_no,
                "title": title,
                "content": content
            }
        }), 201
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500


# 플레이리스트 수정 (본인만 가능)
def update_playlist(playlist_no: int):
    user_no, role_no, error_resp = require_auth()
    if error_resp:
        return error_resp

    # 소유자 확인
    is_owner, err = _check_playlist_owner(playlist_no, user_no)
    if not is_owner:
        status = 404 if err == "존재하지 않는 플레이리스트" else 403
        return jsonify({"success": False, "message": err}), status

    data = request.get_json(silent=True) or {}
    title = data.get('title')
    content = data.get('content')

    if not title:
        return jsonify({"success": False, "message": "title 필드가 필요합니다."}), 400

    try:
        success, message = playlist_svc.update_playlist(playlist_no, title, content)
        if success:
            return jsonify({"success": True, "message": message}), 200
        return jsonify({"success": False, "message": message}), 400
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500


# 플레이리스트 삭제 (본인만 가능)
def delete_playlist(playlist_no: int):
    user_no, role_no, error_resp = require_auth()
    if error_resp:
        return error_resp

    # 소유자 확인
    is_owner, err = _check_playlist_owner(playlist_no, user_no)
    if not is_owner:
        status = 404 if err == "존재하지 않는 플레이리스트" else 403
        return jsonify({"success": False, "message": err}), status

    try:
        success, message = playlist_svc.delete_playlist(playlist_no)
        if success:
            return jsonify({"success": True, "message": message}), 200
        return jsonify({"success": False, "message": message}), 400
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500


# 전체 플레이리스트 목록 조회
def get_playlist_list():
    try:
        playlists, error = playlist_svc.get_playlist_list()
        if error:
            return jsonify({"success": False, "message": error}), 500
        return jsonify({"success": True, "data": playlists}), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500


# 특정 유저의 플레이리스트 목록 조회
def get_user_playlist_list(user_no: int):
    try:
        playlists, error = playlist_svc.get_user_playlist_list(user_no)
        if error:
            return jsonify({"success": False, "message": error}), 500
        return jsonify({"success": True, "data": playlists}), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500


# 플레이리스트 상세 조회
def get_playlist_detail(playlist_no: int):
    try:
        playlist, error = playlist_svc.get_playlist_detail(playlist_no)
        if error:
            return jsonify({"success": False, "message": error}), 404
        return jsonify({"success": True, "data": playlist}), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

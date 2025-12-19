# -*- coding: utf-8 -*-
from flask import request, jsonify
from services import music_list as music_list_svc, playlist as playlist_svc
from middleware.auth_utils import require_auth


def _check_playlist_owner(playlist_no: int, user_no: int):
    """플레이리스트 소유자 확인"""
    playlist, error = playlist_svc.find_playlist_by_no(playlist_no)
    if error or not playlist:
        return False, "존재하지 않는 플레이리스트"
    if playlist.get('user_no') != user_no:
        return False, "권한이 없습니다 (본인의 플레이리스트만 수정 가능)"
    return True, None


# 플레이리스트에 음악 추가 (본인 플레이리스트만 가능)
def add_music(playlist_no: int):
    user_no, role_no, error_resp = require_auth()
    if error_resp:
        return error_resp

    # 소유자 확인
    is_owner, err = _check_playlist_owner(playlist_no, user_no)
    if not is_owner:
        status = 404 if err == "존재하지 않는 플레이리스트" else 403
        return jsonify({"success": False, "message": err}), status

    data = request.get_json(silent=True) or {}
    music_no = data.get('music_no')

    if not music_no:
        return jsonify({"success": False, "message": "music_no 필드가 필요합니다."}), 400

    try:
        success, message = music_list_svc.add_music_to_playlist(playlist_no, music_no)
        if success:
            return jsonify({
                "success": True,
                "message": message,
                "data": {
                    "playlist_no": playlist_no,
                    "music_no": music_no
                }
            }), 201
        return jsonify({"success": False, "message": message}), 400
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500


# 플레이리스트에서 음악 삭제 (본인 플레이리스트만 가능)
def remove_music(playlist_no: int, music_no: int):
    user_no, role_no, error_resp = require_auth()
    if error_resp:
        return error_resp

    # 소유자 확인
    is_owner, err = _check_playlist_owner(playlist_no, user_no)
    if not is_owner:
        status = 404 if err == "존재하지 않는 플레이리스트" else 403
        return jsonify({"success": False, "message": err}), status

    try:
        success, message = music_list_svc.remove_music_from_playlist(playlist_no, music_no)
        if success:
            return jsonify({"success": True, "message": message}), 200
        return jsonify({"success": False, "message": message}), 400
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500


# 플레이리스트의 모든 음악 삭제 (본인 플레이리스트만 가능)
def clear_playlist(playlist_no: int):
    user_no, role_no, error_resp = require_auth()
    if error_resp:
        return error_resp

    # 소유자 확인
    is_owner, err = _check_playlist_owner(playlist_no, user_no)
    if not is_owner:
        status = 404 if err == "존재하지 않는 플레이리스트" else 403
        return jsonify({"success": False, "message": err}), status

    try:
        success, message = music_list_svc.clear_playlist(playlist_no)
        if success:
            return jsonify({"success": True, "message": message}), 200
        return jsonify({"success": False, "message": message}), 400
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500


# 플레이리스트의 음악 목록 조회
def get_music_list(playlist_no: int):
    try:
        music_list, error = music_list_svc.get_playlist_music_list(playlist_no)
        if error:
            return jsonify({"success": False, "message": error}), 500
        return jsonify({
            "success": True,
            "data": {
                "playlist_no": playlist_no,
                "music_list": music_list,
                "count": len(music_list) if music_list else 0
            }
        }), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500


# 특정 음악이 포함된 플레이리스트 목록 조회
def get_playlists_by_music(music_no: int):
    try:
        playlists, error = music_list_svc.get_playlists_by_music(music_no)
        if error:
            return jsonify({"success": False, "message": error}), 500
        return jsonify({
            "success": True,
            "data": {
                "music_no": music_no,
                "playlists": playlists,
                "count": len(playlists) if playlists else 0
            }
        }), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

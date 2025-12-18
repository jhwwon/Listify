from flask import Flask, jsonify, request
from flask_smorest import Api, Blueprint
from flask.views import MethodView
from marshmallow import Schema, fields
from spotipy.oauth2 import SpotifyClientCredentials
import spotipy
import os
from dotenv import load_dotenv

load_dotenv()


app = Flask(__name__)

# ========== Swagger 설정 ==========
app.config["API_TITLE"] = "Listify Spotify API"
app.config["API_VERSION"] = "v1.0.0"
app.config["OPENAPI_VERSION"] = "3.0.2"
app.config["OPENAPI_URL_PREFIX"] = "/"
app.config["OPENAPI_SWAGGER_UI_PATH"] = "/swagger-ui"
app.config["OPENAPI_SWAGGER_UI_URL"] = "https://cdn.jsdelivr.net/npm/swagger-ui-dist/"

api = Api(app)

# ========== Spotify 인증 ==========
client_credentials_manager = SpotifyClientCredentials(
    client_id=os.getenv('SPOTIFY_CLIENT_ID'),
    client_secret=os.getenv('SPOTIFY_CLIENT_SECRET')
)
sp = spotipy.Spotify(client_credentials_manager=client_credentials_manager)

# ========== Schema 정의 ==========

class TrackSchema(Schema):
    """트랙 응답 스키마"""
    name = fields.Str()
    preview_url = fields.Str(allow_none=True)
    cover_art = fields.Str()
    album = fields.Str()
    duration_ms = fields.Int()
    popularity = fields.Int()
    spotify_url = fields.Str()

class ArtistTopTracksResponseSchema(Schema):
    """아티스트 인기곡 응답 스키마"""
    artist_id = fields.Str()
    tracks = fields.List(fields.Nested(TrackSchema))

class ArtistSchema(Schema):
    """아티스트 스키마"""
    artist_id = fields.Str()
    name = fields.Str()
    image = fields.Str(allow_none=True)
    followers = fields.Int()
    popularity = fields.Int()
    genres = fields.Str()
    spotify_url = fields.Str()

class ArtistSearchResponseSchema(Schema):
    """아티스트 검색 응답 스키마"""
    query = fields.Str()
    artists = fields.List(fields.Nested(ArtistSchema))

class TrackSearchSchema(Schema):
    """트랙 검색 스키마"""
    spotify_track_id = fields.Str()
    track_name = fields.Str()
    artist_name = fields.Str()
    album_name = fields.Str()
    album_image_url = fields.Str(allow_none=True)
    preview_url = fields.Str(allow_none=True)
    duration_ms = fields.Int()
    popularity = fields.Int()
    spotify_url = fields.Str()

class TrackSearchResponseSchema(Schema):
    """트랙 검색 응답 스키마"""
    query = fields.Str()
    tracks = fields.List(fields.Nested(TrackSearchSchema))

# ========== Query Parameter Schema (수정됨!) ⭐ ==========

class ArtistSearchQuerySchema(Schema):
    """아티스트 검색 쿼리 파라미터"""
    q = fields.Str(required=True)
    limit = fields.Int(load_default=10)  # missing → load_default

class TrackSearchQuerySchema(Schema):
    """트랙 검색 쿼리 파라미터"""
    q = fields.Str(required=True)
    limit = fields.Int(load_default=20)  # missing → load_default

class ErrorSchema(Schema):
    """에러 응답 스키마"""
    error = fields.Str()

# ========== Blueprint 생성 ==========

spotify_blp = Blueprint(
    "spotify",
    __name__,
    url_prefix="/api/spotify",
    description="Spotify API 검색 및 조회"
)

# ========== API 엔드포인트 ==========

@spotify_blp.route("/artist/<artist_id>/top-tracks")
class ArtistTopTracks(MethodView):
    @spotify_blp.response(200, ArtistTopTracksResponseSchema)
    @spotify_blp.alt_response(500, schema=ErrorSchema)
    def get(self, artist_id):
        """아티스트 인기곡 조회
        
        특정 아티스트의 인기 트랙 TOP 10을 조회합니다.
        
        예시 Artist ID:
        - Charlie Puth: 6VuMaDnrHyPL1p4EHjYLi7
        - BTS: 3Nrfpe0tUJi4K4DXYWgMUX
        - 아이유: 3HqSLMAZ3g3d5poNaI7GOU
        """
        try:
            results = sp.artist_top_tracks(artist_id, country='KR')
            
            tracks = []
            for track in results['tracks'][:10]:
                tracks.append({
                    'name': track['name'],
                    'preview_url': track['preview_url'],
                    'cover_art': track['album']['images'][0]['url'] if track['album']['images'] else None,
                    'album': track['album']['name'],
                    'duration_ms': track['duration_ms'],
                    'popularity': track['popularity'],
                    'spotify_url': track['external_urls']['spotify']
                })
            
            return {
                'artist_id': artist_id,
                'tracks': tracks
            }
        
        except Exception as e:
            return {'error': str(e)}, 500

@spotify_blp.route("/search/artists")
class SearchArtists(MethodView):
    @spotify_blp.arguments(ArtistSearchQuerySchema, location="query")
    @spotify_blp.response(200, ArtistSearchResponseSchema)
    @spotify_blp.alt_response(400, schema=ErrorSchema)
    @spotify_blp.alt_response(500, schema=ErrorSchema)
    def get(self, args):
        """아티스트 검색
        
        아티스트명으로 검색합니다.
        
        쿼리 파라미터:
        - q: 검색어 (필수)
        - limit: 결과 개수 (기본 10, 최대 50)
        """
        query = args['q']
        limit = args.get('limit', 10)
        
        if limit > 50:
            limit = 50
        
        try:
            results = sp.search(q=query, type='artist', limit=limit)
            
            artists = []
            for artist in results['artists']['items']:
                artists.append({
                    'artist_id': artist['id'],
                    'name': artist['name'],
                    'image': artist['images'][0]['url'] if artist['images'] else None,
                    'followers': artist['followers']['total'],
                    'popularity': artist['popularity'],
                    'genres': ', '.join(artist['genres']) if artist['genres'] else '장르 없음',
                    'spotify_url': artist['external_urls']['spotify']
                })
            
            return {
                'query': query,
                'artists': artists
            }
        
        except Exception as e:
            return {'error': str(e)}, 500

@spotify_blp.route("/search/tracks")
class SearchTracks(MethodView):
    @spotify_blp.arguments(TrackSearchQuerySchema, location="query")
    @spotify_blp.response(200, TrackSearchResponseSchema)
    @spotify_blp.alt_response(400, schema=ErrorSchema)
    @spotify_blp.alt_response(500, schema=ErrorSchema)
    def get(self, args):
        """음악 검색
        
        곡명, 아티스트명, 앨범명으로 음악을 검색합니다.
        
        쿼리 파라미터:
        - q: 검색어 (필수)
        - limit: 결과 개수 (기본 20, 최대 50)
        """
        query = args['q']
        limit = args.get('limit', 20)
        
        if limit > 50:
            limit = 50
        
        try:
            results = sp.search(q=query, type='track', limit=limit, market='KR')
            
            tracks = []
            for track in results['tracks']['items']:
                tracks.append({
                    'spotify_track_id': track['id'],
                    'track_name': track['name'],
                    'artist_name': ', '.join([artist['name'] for artist in track['artists']]),
                    'album_name': track['album']['name'],
                    'album_image_url': track['album']['images'][0]['url'] if track['album']['images'] else None,
                    'preview_url': track['preview_url'],
                    'duration_ms': track['duration_ms'],
                    'popularity': track['popularity'],
                    'spotify_url': track['external_urls']['spotify']
                })
            
            return {
                'query': query,
                'tracks': tracks
            }
        
        except Exception as e:
            return {'error': str(e)}, 500

# ========== Blueprint 등록 ==========
api.register_blueprint(spotify_blp)

# ========== 기본 라우트 ==========
@app.route('/')
def index():
    return {
        'message': 'Listify Spotify API',
        'version': 'v1.0.0',
        'swagger_ui': 'http://localhost:5000/swagger-ui',
        'endpoints': {
            'artist_top_tracks': '/api/spotify/artist/{artist_id}/top-tracks',
            'search_artists': '/api/spotify/search/artists?q=검색어',
            'search_tracks': '/api/spotify/search/tracks?q=검색어'
        }
    }

if __name__ == '__main__':
    app.run(host="127.0.0.1", port="5000", debug=True)
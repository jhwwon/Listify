
import { Music } from "../types";

const TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token";
const SEARCH_ENDPOINT = "https://api.spotify.com/v1/search";

export const getAccessToken = async (clientId: string, clientSecret: string) => {
  const basic = btoa(`${clientId}:${clientSecret}`);
  try {
    const response = await fetch(TOKEN_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Basic ${basic}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ grant_type: "client_credentials" }),
    });
    if (!response.ok) throw new Error("토큰 발급 실패");
    return await response.json();
  } catch (error) {
    console.error("Spotify Auth Error:", error);
    throw error;
  }
};

export const searchSpotifyTracks = async (query: string, token: string, limit: number = 100): Promise<Music[]> => {
  if (!query) return [];
  const batchSize = 50;
  const numBatches = Math.ceil(limit / batchSize);
  const allTracks: any[] = [];
  
  try {
    for (let i = 0; i < numBatches; i++) {
      const response = await fetch(`${SEARCH_ENDPOINT}?q=${encodeURIComponent(query)}&type=track&limit=${batchSize}&offset=${i * batchSize}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.tracks?.items) {
        allTracks.push(...data.tracks.items);
        if (data.tracks.items.length < batchSize) break;
      } else break;
    }
    return allTracks.slice(0, limit).map(mapSpotifyToMusic);
  } catch (error) {
    console.error("Spotify Search Error:", error);
    return [];
  }
};

export const getPopularTracks = async (token: string): Promise<Music[]> => {
  const query = `year:${new Date().getFullYear()}`;
  return await searchSpotifyTracks(query, token, 50);
};

const mapSpotifyToMusic = (track: any): Music => ({
  music_no: undefined,
  track_name: track.name,
  artist_name: track.artists.map((a: any) => a.name).join(", "),
  album_name: track.album.name,
  album_image_url: track.album.images[0]?.url || "",
  duration_ms: track.duration_ms,
  popularity: track.popularity || 0,
  spotify_url: track.external_urls?.spotify || "",
});

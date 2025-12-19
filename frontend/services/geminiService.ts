import { GoogleGenAI, Type } from "@google/genai";
import { Song } from "../types";

// Always initialize GoogleGenAI with a named parameter
const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

export const getAIRecommendations = async (
  currentSongs: Song[],
  userPrompt?: string
): Promise<Partial<Song>[]> => {
  const ai = getClient();
  if (!ai) {
    console.warn("Gemini API 키가 제공되지 않았습니다.");
    return [];
  }

  // Use gemini-3-flash-preview for basic text tasks
  const model = "gemini-3-flash-preview";
  
  // Construct context based on what user likes
  const likedContext = currentSongs.length > 0 
    ? `사용자가 좋아하는 음악: ${currentSongs.map(s => `${s.artist}의 ${s.title}`).join(", ")}.` 
    : "사용자는 새로운 음악을 찾고 있습니다.";
    
  const prompt = `
    ${likedContext}
    ${userPrompt ? `사용자 요청: ${userPrompt}` : "비슷한 느낌의 노래 5곡을 추천해줘."}
    
    결과는 반드시 JSON 배열 형식으로 반환해줘.
    각 객체는 'title' (곡 제목), 'artist' (아티스트), 'genre' (장르 - 한국어), 'mood' (분위기 - 한국어) 속성을 가져야 해.
    마크다운 포맷팅 없이 순수 JSON 문자열만 반환해.
  `;

  try {
    // Call generateContent directly through ai.models
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              artist: { type: Type.STRING },
              genre: { type: Type.STRING },
              mood: { type: Type.STRING }
            },
            propertyOrdering: ["title", "artist", "genre", "mood"]
          }
        }
      }
    });

    // Access the generated text using the .text property (not a method)
    const text = response.text;
    if (!text) return [];

    const data = JSON.parse(text);
    // map to partial song objects to display
    return data.map((item: any, index: number) => ({
      id: `ai-${Date.now()}-${index}`,
      title: item.title,
      artist: item.artist,
      album: "AI 추천",
      coverUrl: `https://picsum.photos/300/300?random=${index + 100}`,
      duration: "3:00",
      genre: item.genre,
      year: new Date().getFullYear(),
      mood: item.mood
    }));

  } catch (error) {
    console.error("Gemini API 오류:", error);
    return [];
  }
};

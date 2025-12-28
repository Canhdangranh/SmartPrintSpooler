import { GoogleGenAI } from "@google/genai";

export const analyzeDocument = async (text: string): Promise<string> => {
  if (!process.env.API_KEY) {
    return "API Key not configured. Cannot analyze.";
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Truncate text if it's too long to save tokens/costs for this demo
    const truncatedText = text.substring(0, 10000); 

    const prompt = `
      Bạn là trợ lý in ấn. Hãy phân tích nội dung văn bản dưới đây và đưa ra lời khuyên ngắn gọn (tối đa 3 gạch đầu dòng) về:
      1. Tóm tắt nội dung chính (1 câu).
      2. Cảnh báo nếu có thông tin nhạy cảm (SĐT, Email, CCCD).
      3. Gợi ý in ấn (ví dụ: in màu hay đen trắng dựa trên nội dung mô tả).
      
      Văn bản:
      ${truncatedText}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "Không thể phân tích nội dung.";
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "Lỗi khi gọi AI. Vui lòng thử lại sau.";
  }
};

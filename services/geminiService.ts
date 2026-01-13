
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const geminiService = {
  async generateProductDescription(productName: string, category: string): Promise<string> {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a mouth-watering, SEO-friendly description for "${productName}" in the "${category}" category. The target audience is food buyers in local Nigeria. Highlight freshness, organic sourcing from local farms (like Jos, Kano, or Kaduna), and culinary versatility in traditional dishes.`,
      config: {
        maxOutputTokens: 300,
        temperature: 0.7,
      },
    });
    return response.text || 'Fresh produce harvested daily for your kitchen.';
  },

  async suggestProducts(query: string, availableProducts: any[]): Promise<any[]> {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `User wants to cook: "${query}". Based on our inventory: ${JSON.stringify(availableProducts)}, return a list of the 3 most relevant ingredients as a JSON array of strings (IDs). Think about traditional local Nigerian recipes like Miyan Kuka, Tuwo, or Jollof.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      },
    });
    
    try {
      const ids = JSON.parse(response.text || '[]');
      return availableProducts.filter(p => ids.includes(p.id));
    } catch (e) {
      return [];
    }
  },

  async answerSupportQuestion(question: string, context: string): Promise<string> {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are the Kayan Miya Market Assistant. You are an expert in local Nigerian foodstuff, regional sourcing, and kitchen staples. Use this context: "${context}". Question: "${question}". Be helpful, professional, and emphasize freshness and reliability.`,
      config: {
        maxOutputTokens: 200,
        temperature: 0.5,
      }
    });
    return response.text || "Barkanku! I'm here to help you get the freshest ingredients for your kitchen.";
  }
};

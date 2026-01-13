
import { GoogleGenAI, Type } from "@google/genai";

// Initialization with environment key
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const geminiService = {
  /**
   * Generates production-ready product descriptions
   */
  async generateProductDescription(productName: string, category: string): Promise<string> {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Generate a mouth-watering, SEO-friendly description for "${productName}" in the "${category}" category. The target audience is food buyers in local Nigeria. Highlight freshness, organic sourcing from local farms (like Jos, Kano, or Kaduna), and culinary versatility in traditional dishes. Keep it under 150 words.`,
        config: {
          maxOutputTokens: 300,
          temperature: 0.7,
          systemInstruction: "You are a professional copywriter for Kayan Miya, a premium local Nigerian foodstuff market."
        },
      });
      return response.text || 'Freshly sourced produce, harvested daily for premium kitchen quality.';
    } catch (error) {
      console.error("Gemini Generation Error:", error);
      return 'Premium local produce sourced directly from the best farms, ensuring peak freshness for your traditional recipes.';
    }
  },

  /**
   * Suggests inventory items based on natural language cooking queries
   */
  async suggestProducts(query: string, availableProducts: any[]): Promise<any[]> {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `The user wants to cook: "${query}". Available inventory: ${JSON.stringify(availableProducts.map(p => ({id: p.id, name: p.name, cat: p.category})))}. Return a JSON array of up to 3 Product IDs that would be essential. Priority should be given to traditional local Nigerian staples.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
      });
      
      const ids = JSON.parse(response.text || '[]');
      return availableProducts.filter(p => ids.includes(p.id));
    } catch (e) {
      console.error("Gemini Suggestion Error:", e);
      return availableProducts.slice(0, 2); // Fallback to featured items
    }
  },

  /**
   * Handles customer support with a helpful local persona
   */
  async answerSupportQuestion(question: string, context: string): Promise<string> {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Customer Question: "${question}"`,
        config: {
          maxOutputTokens: 250,
          temperature: 0.5,
          systemInstruction: `You are the Kayan Miya Assistant. Context: ${context}. Use local Nigerian greetings like "Barkanku" or "Ekaabo". Be helpful, emphasize that we deliver within 24 hours, and that all produce is fresh from local farms. If asked about payments, mention we use Bani.africa for secure local transfers.`
        }
      });
      return response.text || "Barkanku! I'm here to help you secure the freshest local foodstuff for your family.";
    } catch (e) {
      return "Barkanku! I'm currently experiencing a high volume of requests, but please know we are committed to delivering your fresh foodstuff within 24 hours.";
    }
  }
};

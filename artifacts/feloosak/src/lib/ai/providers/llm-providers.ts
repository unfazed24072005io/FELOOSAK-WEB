// src/lib/ai/providers/llm-providers.ts
import OpenAI from 'openai';

// Initialize OpenAI with your API key
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY || process.env.OPENAI_API_KEY,
  dangerouslyAllowBrowser: true, // Only for development
});

export async function callAI(prompt: string): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { 
          role: 'system', 
          content: 'You are felosak AI, a financial assistant for businesses in Egypt and UAE. Provide helpful, concise financial advice. Use emojis appropriately. Keep responses to 2-3 sentences.'
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 500,
    });
    
    return completion.choices[0]?.message?.content || "I couldn't generate a response.";
  } catch (error) {
    console.error('OpenAI API error:', error);
    return fallbackResponse(prompt);
  }
}

function fallbackResponse(query: string): string {
  return "⚠️ AI service error. Please check your API key configuration. For now, I can still help with basic calculations based on your data!";
}
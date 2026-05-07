import { GoogleGenerativeAI } from '@google/generative-ai';

async function listModels() {
  const apiKey = process.env.GOOGLE_AI_KEY;
  if (!apiKey) return;
  
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    // There is no direct listModels on genAI in the recent SDKs sometimes, 
    // but we can try to fetch it or just try different names.
    
    const models = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro'];
    
    for (const modelName of models) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent('hi');
        console.log(`SUCCESS with ${modelName}`);
        return;
      } catch (e) {
        console.log(`FAILED with ${modelName}: ${e.message}`);
      }
    }
  } catch (error) {
    console.error(error);
  }
}

listModels();

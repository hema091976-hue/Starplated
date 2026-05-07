import { GoogleGenerativeAI } from '@google/generative-ai';

async function testGemini() {
  const apiKey = process.env.GOOGLE_AI_KEY;
  if (!apiKey) return;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

    const result = await model.generateContent('Hello, are you working? Respond with "Yes, I am working!" if you are.');
    const response = await result.response;
    const text = response.text();

    console.log('Response:', text);
    if (text.includes('Yes, I am working!')) {
      console.log('SUCCESS: AI is working!');
    } else {
      console.log('UNEXPECTED RESPONSE:', text);
    }
  } catch (error) {
    console.error('FAILURE:', error.message);
  }
}

testGemini();

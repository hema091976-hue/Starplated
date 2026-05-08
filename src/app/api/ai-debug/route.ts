import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const maxDuration = 30;

export async function GET() {
  try {
    const apiKey = process.env.GOOGLE_AI_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'GOOGLE_AI_KEY is missing from Vercel' }, { status: 500 });
    }

    const testModels = [
      'gemini-1.5-flash',
      'gemini-1.5-flash-latest',
      'gemini-1.5-pro',
      'gemini-2.0-flash-exp',
      'gemini-pro'
    ];

    const results: any[] = [];

    for (const modelName of testModels) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Reply with 'OK'");
        const text = result.response.text();
        results.push({ model: modelName, status: 'SUCCESS', response: text });
      } catch (err: any) {
        results.push({ model: modelName, status: 'FAILED', error: err.message });
      }
    }

    return NextResponse.json({ 
      success: true, 
      results,
      apiKeySnippet: `${apiKey.substring(0, 6)}...${apiKey.substring(apiKey.length - 4)}`,
      help: "If all FAILED, your API Key is likely invalid or the 'Generative Language API' is not enabled in your Google project."
    });

  } catch (outerError: any) {
    return NextResponse.json({ error: outerError.message }, { status: 500 });
  }
}

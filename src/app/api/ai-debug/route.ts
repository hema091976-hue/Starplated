import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const maxDuration = 30;

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { rating, restaurantId, sessionId } = await request.json();
    const apiKey = process.env.GOOGLE_AI_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'GOOGLE_AI_KEY is missing' }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    try {
      // 1. Attempt to list models to see what this key actually supports
      // This is for debugging the "404 Not Found" issue
      console.log('Listing models...');
      // Note: listModels is not on the genAI instance directly in some versions, 
      // but we can try to hit a known simple model.
      
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = "Reply with 'OK'";
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      
      return NextResponse.json({ 
        message: 'AI is working!', 
        debug: `Model: gemini-1.5-flash, Response: ${text}` 
      });

    } catch (err: any) {
      return NextResponse.json({ 
        error: `AI Debug Failed: ${err.message}`,
        suggestion: 'Please verify that your API Key is valid and has "Generative Language API" enabled in AI Studio.'
      }, { status: 503 });
    }

  } catch (outerError: any) {
    return NextResponse.json({ error: outerError.message }, { status: 500 });
  }
}

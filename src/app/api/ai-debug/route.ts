import { NextResponse } from 'next/server';

export const maxDuration = 30;

export async function GET() {
  try {
    const apiKey = process.env.GOOGLE_AI_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'GOOGLE_AI_KEY is missing from Vercel' }, { status: 500 });
    }

    // Try both v1 and v1beta to see which one responds
    const endpoints = ['v1', 'v1beta'];
    const results: any[] = [];

    for (const apiVersion of endpoints) {
      try {
        const url = `https://generativelanguage.googleapis.com/${apiVersion}/models?key=${apiKey}`;
        const response = await fetch(url);
        const data = await response.json();
        
        results.push({ 
          apiVersion, 
          status: response.status, 
          models: data.models?.map((m: any) => m.name) || [],
          error: data.error
        });
      } catch (err: any) {
        results.push({ apiVersion, status: 'FETCH_ERROR', error: err.message });
      }
    }

    return NextResponse.json({ 
      success: true, 
      results,
      apiKeySnippet: `${apiKey.substring(0, 6)}...${apiKey.substring(apiKey.length - 4)}`,
      instruction: "If 'models' is empty in both, go to AI Studio -> Settings -> API Key and ensure the project has 'Generative Language API' enabled."
    });

  } catch (outerError: any) {
    return NextResponse.json({ error: outerError.message }, { status: 500 });
  }
}
